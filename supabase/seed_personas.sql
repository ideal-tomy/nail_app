-- ペルソナ顧客 + 来店 + 画像パス（local/ = public/images を参照）
-- Supabase SQL Editor で実行してください

insert into customers (id, name, contact, preferences, notes) values
  ('11111111-1111-1111-1111-111111111111', '山田 花子', 'LINE: はなこ', 'パステル・フラワー系が好き', '春は桜ネイルを提案しやすい'),
  ('22222222-2222-2222-2222-222222222222', '佐藤 美咲', '090-xxxx', 'シンプル・オフィス向け', '長さは短め固定'),
  ('33333333-3333-3333-3333-333333333333', '田中 ゆい', 'LINE: yui', 'キラキラ・パーツ多め', ''),
  ('44444444-4444-4444-4444-444444444444', '鈴木 あかり', '公式LINE', 'ベージュ・ヌーディ', '連絡済みパターンの確認用'),
  ('55555555-5555-5555-5555-555555555555', '伊藤 さくら', 'LINE: sakura', '春カラー・フラワー', '新規ペルソナ')
on conflict (id) do update set
  name = excluded.name,
  contact = excluded.contact,
  preferences = excluded.preferences,
  notes = excluded.notes;

insert into visits (id, customer_id, visit_date, design_notes, work_notes, price) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   current_date - 20, 'くすみピンクのワンカラー', 'カラー: OPI Barefoot', 7500),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   current_date - 16, 'ナチュラルフレンチ', '短め・オフィス仕上げ', 6800),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333',
   current_date - 7, 'ミラーネイル＋パーツ', 'シルバー＋ストーン', 9800),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444',
   current_date - 18, 'ベージュグラデ', 'ヌーディトーン', 8200),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555',
   current_date - 22, '桜アート＋パール', '春限定デザイン', 9000)
on conflict (id) do update set
  visit_date = excluded.visit_date,
  design_notes = excluded.design_notes,
  work_notes = excluded.work_notes,
  price = excluded.price;

insert into contact_logs (customer_id, sent_at, channel, message)
select
  '44444444-4444-4444-4444-444444444444',
  current_date - 5,
  'line',
  'あかりさん、こんにちは◎ 前回のベージュグラデから…'
where not exists (
  select 1 from contact_logs
  where customer_id = '44444444-4444-4444-4444-444444444444'
);

-- 画像を当てはめ（既存の seed 画像は削除してから再登録）
delete from visit_images
where visit_id in (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

insert into visit_images (visit_id, storage_path) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'local/nail01.jpg'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'local/nail02.jpg'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'local/nail03.jpg'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'local/nail04.jpg'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'local/nail05.jpg');
