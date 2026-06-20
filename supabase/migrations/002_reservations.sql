-- 予約
create table reservations (
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

create index reservations_start_at_idx on reservations (start_at);
create index reservations_customer_id_idx on reservations (customer_id);
create index reservations_status_idx on reservations (status);

alter table reservations enable row level security;

create policy "auth full access" on reservations for all
  to authenticated using (true) with check (true);
