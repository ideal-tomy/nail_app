import { Link, useLocation } from 'react-router-dom'
import { DEFAULT_BACK, parseBackNavigationState } from '../../lib/navigationState'

export function BackLink() {
  const location = useLocation()
  const { backTo, backLabel } = parseBackNavigationState(location.state)

  return (
    <Link
      to={backTo}
      className="inline-block text-sm text-mauve hover:text-plum"
    >
      ← {backLabel}
    </Link>
  )
}

export function getDefaultBackLabel(): string {
  return DEFAULT_BACK.backLabel
}
