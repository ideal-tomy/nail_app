import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  getServiceSupabase,
  methodNotAllowed,
  pushLineMessage,
  requireAuthUser,
} from '../_lib/lineServer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, 'POST')
  }

  try {
    await requireAuthUser(req)

    const { customerId, message } = (req.body ?? {}) as {
      customerId?: string
      message?: string
    }

    if (!customerId || !message?.trim()) {
      return res.status(400).json({ error: 'customerId と message が必要です' })
    }

    const supabase = getServiceSupabase()
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, name, line_user_id')
      .eq('id', customerId)
      .single()

    if (error || !customer) {
      return res.status(404).json({ error: '顧客が見つかりません' })
    }

    if (!customer.line_user_id) {
      return res.status(400).json({
        error: 'この顧客はLINE未連携です。line_user_id を登録してください',
      })
    }

    await pushLineMessage(customer.line_user_id, message.trim())

    await supabase.from('contact_logs').insert({
      customer_id: customer.id,
      channel: 'line_official',
      message: message.trim(),
    })

    return res.status(200).json({
      ok: true,
      customerId: customer.id,
      name: customer.name,
    })
  } catch (error) {
    console.error('[line/push]', error)
    const message = error instanceof Error ? error.message : 'Push error'
    const status = message.includes('認証') ? 401 : 500
    return res.status(status).json({ error: message })
  }
}
