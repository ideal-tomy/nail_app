/**
 * ローカルから公式LINEへテスト送信（自分の userId のみ）
 *
 * 事前準備:
 *   .env.local に以下を設定
 *     LINE_CHANNEL_ACCESS_TOKEN=...
 *     LINE_TEST_USER_ID=Uxxxxxxxx   # 自分の LINE userId
 *
 * 実行:
 *   npm run line:test-push
 *   npm run line:test-push -- "任意の文面"
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const envPath = join(root, '.env.local')
  if (!existsSync(envPath)) {
    throw new Error('.env.local が見つかりません')
  }

  /** @type {Record<string, string>} */
  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return env
}

async function main() {
  const env = loadEnv()
  const token = env.LINE_CHANNEL_ACCESS_TOKEN
  const userId = env.LINE_TEST_USER_ID
  const message =
    process.argv.slice(2).join(' ') ||
    '【テスト】nail_app からの公式LINE送信テストです'

  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN を .env.local に設定してください')
  }
  if (!userId) {
    throw new Error(
      'LINE_TEST_USER_ID（自分の U...）を .env.local に設定してください',
    )
  }

  if (!/^U[0-9a-f]{32}$/i.test(userId.trim())) {
    throw new Error(
      `LINE_TEST_USER_ID が不正です: "${userId}"\n` +
        '正しい形式は U で始まる33文字（例: Ua1b2c3d4...）です。\n' +
        '公式アカウントの Basic ID（@xxxxx）や数字IDは使えません。\n' +
        '取得方法: LINE Developers → Messaging API → Webhookのイベントログ、または友だち追加後のWebhook受信。',
    )
  }

  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Push失敗: ${res.status} ${await res.text()}`)
  }

  console.log(`送信成功 → ${userId}`)
  console.log(message)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
