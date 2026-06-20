-- 予約: キャンセル・変更の記録（再実行しても安全）
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
