import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export function getServiceSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL（または VITE_SUPABASE_URL）と SUPABASE_SERVICE_ROLE_KEY が必要です',
    )
  }

  return createClient(url, key)
}

export function getLineAccessToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN が未設定です')
  return token
}

export function getLineChannelSecret() {
  const secret = process.env.LINE_CHANNEL_SECRET
  if (!secret) throw new Error('LINE_CHANNEL_SECRET が未設定です')
  return secret
}

export function verifyLineSignature(body: string, signature: string | undefined) {
  if (!signature) return false
  const digest = crypto
    .createHmac('sha256', getLineChannelSecret())
    .update(body)
    .digest('base64')
  return digest === signature
}

export async function fetchLineProfile(userId: string) {
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${getLineAccessToken()}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LINE profile取得失敗: ${res.status} ${text}`)
  }

  return (await res.json()) as {
    userId: string
    displayName: string
    pictureUrl?: string
    statusMessage?: string
  }
}

export async function pushLineMessage(userId: string, text: string) {
  const testOnly = process.env.LINE_TEST_USER_ID
  if (testOnly && userId !== testOnly) {
    throw new Error(
      'テスト制限中です。LINE_TEST_USER_ID に一致する宛先のみ送信できます',
    )
  }

  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getLineAccessToken()}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text }],
    }),
  })

  if (!res.ok) {
    const textBody = await res.text()
    throw new Error(`LINE Push失敗: ${res.status} ${textBody}`)
  }
}

export async function requireAuthUser(req: VercelRequest) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    throw new Error('認証が必要です')
  }

  const jwt = auth.slice('Bearer '.length)
  const supabase = getServiceSupabase()
  const { data, error } = await supabase.auth.getUser(jwt)
  if (error || !data.user) {
    throw new Error('認証に失敗しました')
  }
  return data.user
}

export function readRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof req.body === 'string') {
      resolve(req.body)
      return
    }
    if (Buffer.isBuffer(req.body)) {
      resolve(req.body.toString('utf8'))
      return
    }
    if (req.body && typeof req.body === 'object') {
      resolve(JSON.stringify(req.body))
      return
    }

    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function methodNotAllowed(res: VercelResponse, allow: string) {
  res.setHeader('Allow', allow)
  return res.status(405).json({ error: 'Method Not Allowed' })
}
