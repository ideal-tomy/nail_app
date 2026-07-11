import { supabase } from './supabase'

export async function pushOfficialLineMessage(
  customerId: string,
  message: string,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('ログインが必要です')
  }

  const res = await fetch('/api/line/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ customerId, message }),
  })

  const body = (await res.json().catch(() => ({}))) as { error?: string }

  if (!res.ok) {
    throw new Error(body.error || `送信に失敗しました (${res.status})`)
  }

  return body
}
