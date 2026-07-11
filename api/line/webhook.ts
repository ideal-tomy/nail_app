import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * 疎通確認用の最小Webhook。
 * 署名検証・Supabase・プロフィール取得はすべて外しています。
 * LINE Developers の「検証」と、メッセージ送信のログ確認に使います。
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[LINE webhook]', {
    method: req.method,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'x-line-signature': req.headers['x-line-signature'],
      'user-agent': req.headers['user-agent'],
    },
  })

  return res.status(200).json({
    ok: true,
    method: req.method,
  })
}
