-- LINE Messaging API 連携用
-- Supabase SQL Editor で実行してください

alter table customers
  add column if not exists line_user_id text,
  add column if not exists line_display_name text;

create unique index if not exists customers_line_user_id_uidx
  on customers (line_user_id)
  where line_user_id is not null;

-- 公式LINEを友だち追加した人（未紐づけ含む）
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
