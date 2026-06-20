import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

interface AppShellProps {
  children: ReactNode
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition sm:text-xs ${
    isActive ? 'text-plum font-medium' : 'text-mauve'
  }`

export function AppShell({ children }: AppShellProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col bg-porcelain">
      <header className="sticky top-0 z-20 border-b border-petal/70 bg-porcelain/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-mauve">ネイルサロン</p>
            <h1 className="text-lg font-medium text-ink">顧客管理</h1>
          </div>
          <Button variant="ghost" className="min-h-9 px-3 text-xs" onClick={handleSignOut}>
            ログアウト
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 pb-28">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 border-t border-petal/70 bg-porcelain/95 backdrop-blur">
        <div className="flex px-1">
          <NavLink to="/" end className={navLinkClass}>
            <span className="text-base sm:text-lg">✦</span>
            連絡
          </NavLink>
          <NavLink to="/customers" className={navLinkClass}>
            <span className="text-base sm:text-lg">♡</span>
            顧客
          </NavLink>
          <NavLink to="/visits" className={navLinkClass}>
            <span className="text-base sm:text-lg">◎</span>
            来店
          </NavLink>
          <NavLink to="/calendar" className={navLinkClass}>
            <span className="text-base sm:text-lg">◷</span>
            予約
          </NavLink>
          <NavLink to="/broadcast" className={navLinkClass}>
            <span className="text-base sm:text-lg">✉</span>
            配信
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
