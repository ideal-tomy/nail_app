-- 顧客
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  preferences text,
  notes text,
  created_at timestamptz default now()
);

-- 来店記録
create table visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  visit_date date not null,
  design_notes text,
  work_notes text,
  price integer,
  created_at timestamptz default now()
);

-- 完成画像（1来店に複数可）
create table visit_images (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz default now()
);

-- 連絡履歴
create table contact_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  sent_at timestamptz default now(),
  channel text default 'line',
  message text
);

-- 連絡推奨判定用ビュー
create view customer_status as
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

-- RLS
alter table customers enable row level security;
alter table visits enable row level security;
alter table visit_images enable row level security;
alter table contact_logs enable row level security;

create policy "auth full access" on customers for all
  to authenticated using (true) with check (true);

create policy "auth full access" on visits for all
  to authenticated using (true) with check (true);

create policy "auth full access" on visit_images for all
  to authenticated using (true) with check (true);

create policy "auth full access" on contact_logs for all
  to authenticated using (true) with check (true);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('nail-images', 'nail-images', false)
on conflict (id) do nothing;

create policy "auth read nail-images" on storage.objects for select
  to authenticated using (bucket_id = 'nail-images');

create policy "auth insert nail-images" on storage.objects for insert
  to authenticated with check (bucket_id = 'nail-images');

create policy "auth update nail-images" on storage.objects for update
  to authenticated using (bucket_id = 'nail-images');

create policy "auth delete nail-images" on storage.objects for delete
  to authenticated using (bucket_id = 'nail-images');
