export type BackNavigationState = {
  backTo: string
  backLabel: string
}

export type CustomerDetailNavigationState = BackNavigationState & {
  openReservation?: boolean
}

export const DEFAULT_BACK: BackNavigationState = {
  backTo: '/customers',
  backLabel: '顧客一覧へ',
}

export function backState(
  backTo: string,
  backLabel: string,
): BackNavigationState {
  return { backTo, backLabel }
}

export function parseBackNavigationState(
  state: unknown,
): BackNavigationState {
  if (
    state &&
    typeof state === 'object' &&
    'backTo' in state &&
    'backLabel' in state &&
    typeof (state as BackNavigationState).backTo === 'string' &&
    typeof (state as BackNavigationState).backLabel === 'string'
  ) {
    return state as BackNavigationState
  }
  return DEFAULT_BACK
}
