import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * 疎通確認用Webhook。
 * POSTで来た events[].source.userId をログに大きく出します。
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[LINE webhook] method=', req.method)

  if (req.method === 'POST') {
    const body = req.body as { events?: Array<{ type?: string; source?: { userId?: string } }> }
    const events = body?.events ?? []

    console.log('[LINE webhook] eventCount=', events.length)
    console.log('[LINE webhook] body=', JSON.stringify(body))

    for (const event of events) {
      const userId = event?.source?.userId
      if (userId) {
        // ログで探しやすいように明示
        console.log('[LINE USER ID]', userId)
      } else {
        console.log('[LINE webhook] event without userId', event?.type)
      }
    }
  }

  return res.status(200).json({
    ok: true,
    method: req.method,
  })
}
