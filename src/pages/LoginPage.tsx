import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getAllowedEmails } from '../lib/authAllowlist'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allowedEmails = getAllowedEmails()

  if (session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email.trim())
      setSent(true)
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : 'ログインリンクの送信に失敗しました',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center bg-porcelain px-6">
      <div className="rounded-3xl border border-petal/70 bg-blush/50 p-6 shadow-sm">
        <p className="text-sm text-mauve">ネイルサロン顧客管理</p>
        <h1 className="mt-2 text-2xl font-medium text-ink">ログイン</h1>
        <p className="mt-3 text-sm leading-relaxed text-mauve">
          登録済みのメールアドレスにマジックリンクを送信します。
          未登録のアドレスではログインできません。
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-petal/60 px-4 py-4 text-sm leading-relaxed text-ink">
            {email} 宛てにログインリンクを送信しました。メールをご確認ください。
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">メールアドレス</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="登録済みのメールアドレス"
                autoComplete="email"
              />
            </label>
            <p className="text-xs leading-relaxed text-mauve">
              ログイン可能: {allowedEmails.join(' / ')}
            </p>
            {error && <p className="text-sm text-plum">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '送信中...' : 'ログインリンクを送る'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
