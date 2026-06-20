import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getAllowedEmails } from '../lib/authAllowlist'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      await signIn(email.trim(), password)
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : 'ログインに失敗しました',
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
          登録済みのメールアドレスとパスワードでログインします。
        </p>

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

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">パスワード</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="パスワード"
              autoComplete="current-password"
            />
          </label>

          <p className="text-xs leading-relaxed text-mauve">
            ログイン可能: {allowedEmails.join(' / ')}
          </p>

          {error && <p className="text-sm text-plum">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </div>
    </div>
  )
}
