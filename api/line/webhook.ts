import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  fetchLineProfile,
  getServiceSupabase,
  methodNotAllowed,
  readRawBody,
  verifyLineSignature,
} from '../_lib/lineServer'

interface LineEvent {
  type: string
  timestamp?: number
  source?: { type?: string; userId?: string }
  replyToken?: string
  message?: { type?: string; text?: string }
}

interface LineWebhookBody {
  events?: LineEvent[]
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).send('ok')
  }

  if (req.method !== 'POST') {
    return methodNotAllowed(res, 'GET, POST')
  }

  try {
    const rawBody = await readRawBody(req)
    const signature = req.headers['x-line-signature']
    const signatureValue = Array.isArray(signature) ? signature[0] : signature

    if (!verifyLineSignature(rawBody, signatureValue)) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const body = JSON.parse(rawBody || '{}') as LineWebhookBody
    const events = body.events ?? []
    const supabase = getServiceSupabase()

    for (const event of events) {
      const userId = event.source?.userId
      if (!userId) continue

      if (event.type === 'follow' || event.type === 'message') {
        let profile: Awaited<ReturnType<typeof fetchLineProfile>> | null = null
        try {
          profile = await fetchLineProfile(userId)
        } catch {
          // ブロック直後などは profile 取得に失敗することがある
        }

        const now = new Date().toISOString()
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('line_user_id', userId)
          .maybeSingle()

        const { data: existingFollower } = await supabase
          .from('line_followers')
          .select('id, followed_at, customer_id')
          .eq('line_user_id', userId)
          .maybeSingle()

        const payload = {
          line_user_id: userId,
          display_name: profile?.displayName ?? null,
          picture_url: profile?.pictureUrl ?? null,
          status_message: profile?.statusMessage ?? null,
          followed_at:
            event.type === 'follow'
              ? now
              : (existingFollower?.followed_at ?? now),
          unfollowed_at: null,
          customer_id:
            existingCustomer?.id ?? existingFollower?.customer_id ?? null,
          linked_at: existingCustomer?.id
            ? (existingFollower?.customer_id ? undefined : now)
            : existingFollower?.customer_id
              ? undefined
              : null,
          raw_event: event,
          updated_at: now,
        }

        // linked_at を undefined のまま upsert しないよう整理
        const cleanPayload = Object.fromEntries(
          Object.entries(payload).filter(([, value]) => value !== undefined),
        )

        if (existingCustomer?.id && !existingFollower?.customer_id) {
          cleanPayload.linked_at = now
        }

        await supabase.from('line_followers').upsert(cleanPayload, {
          onConflict: 'line_user_id',
        })

        if (profile?.displayName && existingCustomer?.id) {
          await supabase
            .from('customers')
            .update({ line_display_name: profile.displayName })
            .eq('id', existingCustomer.id)
        }
      }

      if (event.type === 'unfollow') {
        const now = new Date().toISOString()
        await supabase
          .from('line_followers')
          .update({
            unfollowed_at: now,
            updated_at: now,
            raw_event: event,
          })
          .eq('line_user_id', userId)
      }
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[line/webhook]', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Webhook error',
    })
  }
}
