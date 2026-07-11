-- 全マイグレーションを順に実行するための結合スクリプト
-- Supabase Dashboard → SQL Editor で実行してください。
-- 既に一部適用済みの場合は、該当ファイルのみ個別実行してください。

-- === 001_initial.sql ===

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  preferences text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  visit_date date not null,
  design_notes text,
  work_notes text,
  price integer,
  created_at timestamptz default now()
);

create table if not exists visit_images (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz default now()
);

create table if not exists contact_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  sent_at timestamptz default now(),
  channel text default 'line',
  message text
);

create or replace view customer_status as
select
  c.id,
  c.name,
  v.last_visit,
  (current_date - v.last_visit) as days_since,
  cl.last_contact
from customers c
left join lateral (
  select max(visit_date) as last_visit
  from visits where customer_id = c.id
) v on true
left join lateral (
  select max(sent_at) as last_contact
  from contact_logs where customer_id = c.id
) cl on true;

alter table customers enable row level security;
alter table visits enable row level security;
alter table visit_images enable row level security;
alter table contact_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth full access' and tablename = 'customers'
  ) then
    create policy "auth full access" on customers for all
      to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth full access' and tablename = 'visits'
  ) then
    create policy "auth full access" on visits for all
      to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth full access' and tablename = 'visit_images'
  ) then
    create policy "auth full access" on visit_images for all
      to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth full access' and tablename = 'contact_logs'
  ) then
    create policy "auth full access" on contact_logs for all
      to authenticated using (true) with check (true);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('nail-images', 'nail-images', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth read nail-images'
  ) then
    create policy "auth read nail-images" on storage.objects for select
      to authenticated using (bucket_id = 'nail-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth insert nail-images'
  ) then
    create policy "auth insert nail-images" on storage.objects for insert
      to authenticated with check (bucket_id = 'nail-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth update nail-images'
  ) then
    create policy "auth update nail-images" on storage.objects for update
      to authenticated using (bucket_id = 'nail-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth delete nail-images'
  ) then
    create policy "auth delete nail-images" on storage.objects for delete
      to authenticated using (bucket_id = 'nail-images');
  end if;
end $$;

-- === 002_reservations.sql ===

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  start_at timestamptz not null,
  duration_min integer,
  menu text,
  notes text,
  status text not null default 'booked' check (status in ('booked', 'done', 'canceled')),
  visit_id uuid references visits(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists reservations_start_at_idx on reservations (start_at);
create index if not exists reservations_customer_id_idx on reservations (customer_id);
create index if not exists reservations_status_idx on reservations (status);

alter table reservations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'auth full access' and tablename = 'reservations'
  ) then
    create policy "auth full access" on reservations for all
      to authenticated using (true) with check (true);
  end if;
end $$;

-- === 003_reservation_customer_ops.sql ===

alter table reservations
  add column if not exists cancel_reason text,
  add column if not exists canceled_at timestamptz,
  add column if not exists cancel_source text,
  add column if not exists updated_at timestamptz default now();

alter table customers
  add column if not exists booking_notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reservations_cancel_source_check'
  ) then
    alter table reservations add constraint reservations_cancel_source_check
      check (cancel_source is null or cancel_source in ('customer', 'salon', 'no_show'));
  end if;
end $$;

alter table reservations drop constraint if exists reservations_status_check;
alter table reservations add constraint reservations_status_check
  check (status in ('booked', 'done', 'canceled', 'no_show'));

-- === 004_line_integration.sql ===

alter table customers
  add column if not exists line_user_id text,
  add column if not exists line_display_name text;

create unique index if not exists customers_line_user_id_uidx
  on customers (line_user_id)
  where line_user_id is not null;

create table if not exists line_followers (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null unique,
  display_name text,
  picture_url text,
  status_message text,
  followed_at timestamptz default now(),
  unfollowed_at timestamptz,
  customer_id uuid references customers(id) on delete set null,
  linked_at timestamptz,
  raw_event jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists line_followers_customer_id_idx
  on line_followers (customer_id);

create index if not exists line_followers_unlinked_idx
  on line_followers (followed_at desc)
  where customer_id is null and unfollowed_at is null;

alter table line_followers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'auth full access' and tablename = 'line_followers'
  ) then
    create policy "auth full access" on line_followers for all
      to authenticated using (true) with check (true);
  end if;
end $$;
