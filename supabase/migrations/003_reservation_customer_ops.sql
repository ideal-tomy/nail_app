-- 予約: キャンセル・変更の記録
alter table reservations
  add column if not exists cancel_reason text,
  add column if not exists canceled_at timestamptz,
  add column if not exists cancel_source text check (
    cancel_source is null or cancel_source in ('customer', 'salon', 'no_show')
  ),
  add column if not exists updated_at timestamptz default now();

alter table reservations drop constraint if exists reservations_status_check;
alter table reservations add constraint reservations_status_check
  check (status in ('booked', 'done', 'canceled', 'no_show'));

-- 顧客: 予約対応メモ（キャンセル傾向・確認事項など）
alter table customers
  add column if not exists booking_notes text;
