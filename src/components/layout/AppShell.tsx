import { NavLink, useLocation, useMatch, useNavigate } from 'react-router-dom'
import type { MouseEvent, ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCustomer } from '../../hooks/useCustomers'
import { useVisits } from '../../hooks/useVisits'
import { sendOffReminderViaLine } from '../../lib/line'
import { Button } from '../ui/Button'

interface AppShellProps {
  children: ReactNode
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[11px] transition sm:text-xs ${
    isActive ? 'text-plum font-medium' : 'text-mauve'
  }`

const pageTitles: Record<string, string> = {
  '/': '連絡推奨',
  '/customers': '顧客一覧',
  '/visits': '来店分析',
  '/calendar': '予約カレンダー',
  '/broadcast': '一斉配信',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/customers/')) {
    return '顧客詳細'
  }
  return pageTitles[pathname] ?? '顧客管理'
}

export function AppShell({ children }: AppShellProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const customerMatch = useMatch('/customers/:id')
  const customerId = customerMatch?.params.id
  const { data: customer } = useCustomer(customerId)
  const { data: visits = [] } = useVisits(customerId)

  const pageTitle = getPageTitle(location.pathname)
  const isOnCustomerDetail = Boolean(customerId && customer)
  const latestDesign = visits[0]?.design_notes

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleQuickLine = () => {
    if (!customer) return
    sendOffReminderViaLine(customer.name, latestDesign)
  }

  const handleNavClick = (
    event: MouseEvent,
    path: string,
    isLineAction: boolean,
  ) => {
    if (isOnCustomerDetail && isLineAction) {
      event.preventDefault()
      handleQuickLine()
    } else if (location.pathname === path) {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col bg-porcelain">
      <header className="sticky top-0 z-20 border-b border-petal/70 bg-porcelain/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-mauve">ネイルサロン</p>
            <h1 className="text-lg font-medium text-ink">{pageTitle}</h1>
          </div>
          <Button variant="ghost" className="min-h-9 px-3 text-xs" onClick={handleSignOut}>
            ログアウト
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 pb-28">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 border-t border-petal/70 bg-porcelain/95 backdrop-blur">
        <div className="flex px-1">
          <NavLink
            to="/"
            end
            className={navLinkClass}
            onClick={(event) => handleNavClick(event, '/', true)}
          >
            <span className="text-base sm:text-lg">✦</span>
            連絡
          </NavLink>
          <NavLink
            to="/customers"
            className={navLinkClass}
            onClick={(event) => handleNavClick(event, '/customers', false)}
          >
            <span className="text-base sm:text-lg">♡</span>
            顧客
          </NavLink>
          <NavLink
            to="/visits"
            className={navLinkClass}
            onClick={(event) => handleNavClick(event, '/visits', false)}
          >
            <span className="text-base sm:text-lg">◎</span>
            来店
          </NavLink>
          <NavLink
            to="/calendar"
            className={navLinkClass}
            onClick={(event) => handleNavClick(event, '/calendar', false)}
          >
            <span className="text-base sm:text-lg">◷</span>
            予約
          </NavLink>
          <NavLink
            to="/broadcast"
            className={navLinkClass}
            onClick={(event) => handleNavClick(event, '/broadcast', true)}
          >
            <span className="text-base sm:text-lg">✉</span>
            配信
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
