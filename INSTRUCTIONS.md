# ネイルサロン顧客管理アプリ — 実装指示書 (INSTRUCTIONS.md)

個人ネイルサロン向けの、顧客履歴 + 来店リマインド + LINE手動送信支援アプリ。
Cursor での実装を前提とした指示書。**Phase 1 を完成させることを最優先**とする。

---

## 0. このアプリの本質

自動配信システムではなく、**ネイリスト本人が見る「顧客履歴 + 連絡推奨ダッシュボード」**。
中心価値は次の2つ。

1. **前回のデザイン・完成画像をすぐに引き出せること**（顧客管理の核）
2. **誰に・いつ・どんな文面で連絡すべきかの判断を支援すること**（最終来店から2週間を目安にリマインド）

通知は「自動送信」ではなく、**アプリで文面を編集 → 確認 → LINEボタンで手動送信**する設計。

---

## 1. 技術スタック

- フロント: **React + Vite + TypeScript**
- スタイリング: **Tailwind CSS**（後述のデザイントークンを CSS 変数 + Tailwind で定義）
- バックエンド/DB/画像/認証: **Supabase**（Postgres + Storage + Auth）
- ホスティング: **Vercel**
- **モバイルファースト必須**（サロンでスマホ運用。LINE送信スキームがスマホ前提のため）

---

## 2. 全体方針

- 利用者は**ネイリスト本人ひとり**。複雑な権限管理は不要。Supabase Auth（メール/マジックリンク）でログインし、認証済みユーザーは全データにアクセス可能とする。
- 画像は customer の資産。Storage は**プライベートバケット + 署名付きURL**で表示する。
- 余計な機能を足さない。Phase 1 のスコープを厳守する。

---

## 3. データモデル（Supabase / SQL）

```sql
-- 顧客
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,            -- 電話・LINE表示名などのメモ（任意）
  preferences text,        -- 好み・季節の傾向メモ
  notes text,              -- 自由メモ
  created_at timestamptz default now()
);

-- 来店記録
create table visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  visit_date date not null,
  design_notes text,       -- デザイン内容
  work_notes text,         -- 施術メモ（使用カラー・長さ・パーツ等）
  price integer,           -- 任意
  created_at timestamptz default now()
);

-- 完成画像（1来店に複数可）
create table visit_images (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  storage_path text not null,   -- Supabase Storage のパス
  created_at timestamptz default now()
);

-- 連絡履歴（誰にいつ送ったか。連絡済み管理に使う）
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
```

### RLS

全テーブルで RLS を有効化し、`authenticated` ロールに全操作を許可するポリシーを付与する（単独運用のため）。

```sql
alter table customers enable row level security;
create policy "auth full access" on customers for all
  to authenticated using (true) with check (true);
-- visits / visit_images / contact_logs にも同様に付与
```

### Storage

- バケット名: `nail-images`（**private**）
- パス規約: `{customer_id}/{visit_id}/{uuid}.jpg`
- 表示時は `createSignedUrl` で署名付きURLを発行する。

---

## 4. 画面構成・機能（Phase 1）

### 4-1. ログイン
Supabase Auth（メール + マジックリンク）。本人のみ。

### 4-2. ホーム ＝ 連絡推奨ダッシュボード（最重要画面）
- `customer_status` を取得し、**連絡推奨**の顧客をカードで一覧表示。
- 連絡推奨の条件: `days_since >= 14` **かつ**（`last_contact` が null、または `last_contact::date < last_visit`）。
  → 前回来店から14日以上経過し、その来店以降まだ連絡していない人。
- 並び順: `days_since` の降順（経過日数が多い人＝優先度高を上に）。
- 各カードに表示するもの:
  - **前回の完成画像（サムネイル）を主役**として大きく
  - 顧客名 / 「○日経過」のやさしいインジケーター
  - 「文面作成」アクション → 文面編集モーダル（4-6）へ
- 空状態: 「今は連絡推奨の顧客はいません」を穏やかなコピーで表示。

### 4-3. 顧客一覧
- 全顧客を名前順／最終来店日順で一覧。検索（名前）あり。
- 「＋新規顧客」ボタン。
- 各行タップで顧客詳細へ。

### 4-4. 顧客詳細（履歴 + 画像ギャラリー）
- 顧客の基本情報（好み・季節メモ・自由メモ）を表示・編集。
- **来店履歴を新しい順に表示**。各来店ごとに:
  - 来店日 / デザイン内容 / 施術メモ / 完成画像のサムネイルグリッド
  - 画像タップで拡大表示
- 「過去デザインをすぐ確認できる」ことが目的なので、画像が一覧で気持ちよく見渡せるレイアウトにする。
- 「この顧客に連絡」ボタン → 文面編集モーダル（4-6）へ。
- 「＋来店を登録」ボタン → 来店登録（4-5）へ。

### 4-5. 来店登録
- 入力: 来店日（デフォルト今日）/ デザイン内容 / 施術メモ / 価格（任意）
- **完成画像のアップロード（複数可）**。スマホのカメラロールから選択 → 圧縮して Storage へ。
- 保存すると visits + visit_images を作成。

### 4-6. 文面編集 + LINE送信（リマインドの出口）
- 連絡推奨カード／顧客詳細から開くモーダル。
- 上部に**前回デザインの画像 + デザイン内容**を表示（文面を考える材料）。
- **編集可能なテキストエリア**にドラフト文面を初期表示。テンプレートから生成し、自由に編集可能。
  - テンプレート例（プレースホルダ `{name}` `{last_design}` を差し込み）:
    - 「{name}さん、こんにちは◎ 前回の{last_design}から2週間ほど経ちました。そろそろお直しのタイミングです🌸 ご都合いかがですか？」
    - 季節違いで2〜3パターン用意し、選んで使えるようにする。
  - 文面はあくまで**叩き台**。ネイリストが好みや季節を加味して編集する前提。
- ボタン:
  - **「LINEで送る」**（LINEブランドグリーン）→ LINE送信スキームを起動（詳細は §5）
  - **「文面をコピー」**（PC・フォールバック用）
  - **「連絡済みにする」**→ `contact_logs` に記録し、ダッシュボードの推奨リストから外す
- 送信は手動。アプリは「相手・タイミング・文面」を整えるところまでを担う。

---

## 5. LINE送信ボタンの実装仕様

LINE公式の URLスキームを使い、**文面を入力済みの状態で送信先選択画面を開く**。
API連携も顧客のLINE ID紐づけも不要。完全無料。

```ts
export function sendViaLine(message: string) {
  const url = `https://line.me/R/share?text=${encodeURIComponent(message)}`;
  // モバイル: LINEが開き、文面が入った状態で送信先（顧客）選択画面が表示される
  window.location.href = url;
}

export async function copyMessage(message: string) {
  await navigator.clipboard.writeText(message);
  // トーストで「文面をコピーしました」
}
```

### 重要な前提・注意

- **スマホ専用**。`line.me/R/share` 系スキームは PC では反応しないことが多い。PCでは「文面をコピー」を使う。
- 送信先（どの顧客に送るか）は**LINE側の選択画面で手動選択**する。アプリ側で特定相手に直接送ることはしない（ID紐づけを避けるため）。これにより個別LINE・公式アカウントのどちらからでも送れる。
- 改行を含む文面は環境により挙動が変わることがあるため、テンプレートは1〜2行を基本にし、長文化しない。

---

## 6. デザインガイド

淡いピンクを主役にしつつ、甘くなりすぎない上品なサロンの世界観。
甘さの中和に**くすみモーヴ**と**プラム**を効かせ、清潔感のある余白を多めに取る。

### カラートークン（CSS変数）

```css
:root {
  --porcelain: #FFFBFC;  /* ベース背景（ほんのりピンクの白） */
  --blush:     #FCEEF1;  /* カード・面のうっすらピンク */
  --petal:     #F8DCE3;  /* メインの淡いピンク（アクセント面・選択状態） */
  --mauve:     #C99CA8;  /* くすみモーヴ（罫線・サブ要素・経過インジケーター） */
  --plum:      #8E4D63;  /* プラム（主要ボタン・強調テキスト） */
  --ink:       #3A2E33;  /* 本文テキスト（温かみのある黒に近い色） */
  --line-green:#06C755;  /* LINE送信ボタン専用。ブランド認識のため緑を維持 */
}
```

- 主要アクション（保存・登録など）= `--plum`、面の強調・選択 = `--petal`。
- **「LINEで送る」ボタンだけは `--line-green`** にする。淡いピンクのUIの中で一目でLINE送信とわかる導線にするため、ここだけ意図的にブランドカラーを使う。
- 罫線・経過日数バッジなどの控えめな要素は `--mauve`。
- 影は濃くせず、柔らかく薄いものを使う。角丸は中〜大（やさしい印象）。

### タイポグラフィ

- 見出し: **Zen Maru Gothic**（Google Fonts / 丸ゴシック）。やわらかくサロンらしい。多用せず見出しに限定。
- 本文・UI: **Noto Sans JP**。可読性重視。
- 数字（経過日数など）は本文と同じ Noto Sans JP で問題ない。
- サイズスケールは明確に。見出しと本文のコントラストをはっきりつける。

### 署名的要素（このアプリの記憶に残る一点）

**連絡推奨ダッシュボードのカードで、前回の完成画像（＝ネイルの作品そのもの）を主役に据える**こと。
数字やテキストではなく「前回どんな仕上がりだったか」が一目で蘇る画像ファーストのカードを、このアプリの中心的な見え方にする。装飾は最小限にして、写真を引き立てる。

---

## 7. フェーズ分割

### Phase 1（今回作るスコープ）
- 顧客の登録・編集・一覧・検索
- 来店登録 + 完成画像アップロード（複数）
- 顧客詳細（履歴 + 画像ギャラリー）
- 連絡推奨ダッシュボード（14日 + 未連絡で判定）
- 文面編集 → LINE送信ボタン / コピー / 連絡済み記録
- モバイルファースト、Supabase Auth ログイン

### Phase 2（今回は実装しない。将来検討）
- LINE Messaging API による半自動プッシュ通知（要: LINEユーザーID紐づけ、配信通数の管理）
- Claude API による文面の自動パーソナライズ生成（前回デザイン・季節から文面提案）
- デザインのタグ付け・色/季節での絞り込み検索
- 簡易な売上集計

> Phase 2 の自動プッシュは無料枠（公式アカウント コミュニケーションプラン: 月200通）を消費し、ID紐づけの作り込みも必要。**Phase 1 を運用してから必要性を判断する**こと。

---

## 8. セットアップ・環境変数

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

推奨ディレクトリ構成（目安）:

```
src/
  lib/supabase.ts        # Supabaseクライアント
  lib/line.ts            # sendViaLine / copyMessage
  pages/                 # ダッシュボード / 顧客一覧 / 顧客詳細 / ログイン
  components/            # カード・モーダル・画像グリッド等
  hooks/                 # データ取得フック
```

---

## 9. 受け入れ基準（Phase 1 完了条件）

- [ ] スマホで顧客を登録し、来店と完成画像を保存できる
- [ ] 顧客詳細で過去のデザインと画像を素早く見渡せる
- [ ] 最終来店から14日以上経過し未連絡の顧客が、ダッシュボードに経過日数順で並ぶ
- [ ] 文面を編集し「LINEで送る」でLINEが開き、文面入りで送信先選択画面が出る
- [ ] 「連絡済みにする」でダッシュボードの推奨から外れる
- [ ] 淡いピンク基調・モバイルファーストで破綻なく表示される
