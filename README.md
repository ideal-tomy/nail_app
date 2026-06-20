# ネイルサロン顧客管理アプリ

個人ネイルサロン向けの顧客履歴・連絡推奨・LINE手動送信支援アプリです。

## 技術スタック

- React + Vite + TypeScript
- Tailwind CSS
- Supabase（Postgres / Storage / Auth）
- Vercel（ホスティング）

## ローカル開発

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.local` を作成し、以下を設定します。

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ALLOWED_EMAILS=nailluv.0212@icloud.com,ryojitomii@gmail.com
```

`seed:storage` スクリプトを使う場合のみ、追加で以下が必要です。

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase セットアップ

Supabase Dashboard → **SQL Editor** で、以下のマイグレーションを**順番に**実行してください。

1. `supabase/migrations/001_initial.sql` — 顧客・来店・画像・連絡履歴・RLS・Storage バケット
2. `supabase/migrations/002_reservations.sql` — 予約テーブル
3. `supabase/migrations/003_reservation_customer_ops.sql` — 予約キャンセル列・`booking_notes`

または Supabase CLI を使う場合:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### 4. 認証ユーザー（許可メール + パスワード）

ログインは **許可リストに登録されたメール + パスワード** のみ可能です（マジックリンクは使いません）。

1. **Supabase Dashboard → Authentication → Users → Add user** で以下を作成（パスワードを設定）
   - `nailluv.0212@icloud.com`
   - `ryojitomii@gmail.com`
2. **Authentication → Providers → Email** で **「Allow new users to sign up」を OFF** にする
3. 既存ユーザーにパスワードが無い場合は、Users 一覧から該当ユーザーを開き **Reset password** で設定

### 5. 開発サーバー起動

```bash
npm run dev
```

## 本番デプロイ（Vercel）

### 1. Vercel プロジェクト作成

GitHub リポジトリを Vercel にインポートするか、CLI でデプロイします。

```bash
npx vercel
npx vercel --prod
```

### 2. 環境変数（Vercel Dashboard → Settings → Environment Variables）

| 変数名 | 説明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase プロジェクト URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_ALLOWED_EMAILS` | ログイン許可メール（カンマ区切り） |

**Production / Preview / Development** すべてに設定してください。

CLI からデプロイする場合:

```bash
npm run deploy
```

初回は `npx vercel login` が必要です。GitHub 連携済みの場合は `main` への push で自動デプロイされます。

### 3. SPA ルーティング

`vercel.json` で全パスを `index.html` に rewrite しています。直リンク・リロードでも 404 になりません。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run seed:storage` | シード画像を Storage にアップロード |

## 主な機能

- **連絡推奨ダッシュボード** — 最終来店から14日以上・未連絡の顧客を画像付きで表示
- **顧客管理** — 登録・編集・検索・来店履歴・画像ギャラリー
- **来店登録** — デザインメモ + 完成画像（複数）アップロード
- **文面編集 + LINE送信** — `line.me/R/share` による手動送信
- **予約カレンダー** — 予約の追加・変更・キャンセル・来店記録への変換
- **一斉配信** — 文面の一括作成（LINE は手動送信）
- **来店分析** — 来店数・間隔・累計売上のサマリー

## 受け入れ基準（Phase 1）

- [x] スマホで顧客を登録し、来店と完成画像を保存できる
- [x] 顧客詳細で過去のデザインと画像を素早く見渡せる
- [x] 最終来店から14日以上経過し未連絡の顧客がダッシュボードに経過日数順で並ぶ
- [x] 文面を編集し「LINEで送る」で LINE が開く（スマホ実機で要確認）
- [x] 「連絡済みにする」でダッシュボードの推奨から外れる
- [x] 淡いピンク基調・モバイルファーストで表示

## 注意

- LINE 送信は **手動**（`line.me/R/share`）。Messaging API は使用しません。
- 画像は Supabase Storage の private バケット `nail-images` に保存し、署名付き URL で表示します。

詳細な仕様は [INSTRUCTIONS.md](./INSTRUCTIONS.md) を参照してください。
