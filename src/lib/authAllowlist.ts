const DEFAULT_ALLOWED_EMAILS = [
  'nailluv.0212@icloud.com',
  'ryojitomii@gmail.com',
]

function parseAllowedEmails(): string[] {
  const fromEnv = import.meta.env.VITE_ALLOWED_EMAILS
  if (fromEnv?.trim()) {
    return fromEnv
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  }
  return DEFAULT_ALLOWED_EMAILS
}

export function getAllowedEmails(): readonly string[] {
  return parseAllowedEmails()
}

export function isEmailAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return getAllowedEmails().includes(normalized)
}

export function assertEmailAllowed(email: string): void {
  if (!isEmailAllowed(email)) {
    throw new Error(
      'このメールアドレスはログインが許可されていません。登録済みのアカウントのみ利用できます。',
    )
  }
}
