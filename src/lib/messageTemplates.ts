export interface MessageTemplate {
  id: string
  label: string
  body: string
}

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'standard',
    label: '標準リマインド',
    body: '{name}さん、こんにちは◎ 前回の{last_design}から2週間ほど経ちました。そろそろお直しのタイミングです🌸 ご都合いかがですか？',
  },
  {
    id: 'spring',
    label: '春のご挨拶',
    body: '{name}さん、こんにちは🌸 前回の{last_design}から少し経ちました。春らしいデザインもおすすめです。ご都合いかがですか？',
  },
  {
    id: 'winter',
    label: '冬のご挨拶',
    body: '{name}さん、こんにちは❄️ 前回の{last_design}から2週間ほど経ちました。そろそろお直しのタイミングかもしれません。ご都合いかがですか？',
  },
]

export function buildMessage(
  template: MessageTemplate,
  name: string,
  lastDesign: string,
): string {
  return template.body
    .replaceAll('{name}', name)
    .replaceAll('{last_design}', lastDesign || 'デザイン')
}

export function isContactRecommended(
  daysSince: number | null,
  lastVisit: string | null,
  lastContact: string | null,
): boolean {
  if (daysSince === null || lastVisit === null || daysSince < 14) {
    return false
  }

  if (!lastContact) {
    return true
  }

  const contactDate = lastContact.slice(0, 10)
  return contactDate < lastVisit
}

export function formatDaysSince(days: number | null): string {
  if (days === null) return '来店なし'
  return `${days}日経過`
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${year}/${month}/${day}`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function nowLocalDatetimeValue(): string {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const broadcastTemplates: MessageTemplate[] = [
  {
    id: 'broadcast-holiday',
    label: '定休日のお知らせ',
    body: 'こんにちは◎ 来週○日は定休日となります。ご予約の際はお気をつけください🌸',
  },
  {
    id: 'broadcast-season',
    label: '季節のご案内',
    body: 'こんにちは🌸 新しい季節のデザインが入りました。ご都合の良い時にぜひお越しください。',
  },
  {
    id: 'broadcast-reminder',
    label: '予約枠のご案内',
    body: 'こんにちは◎ 来週の空き枠がございます。ご希望の方はお気軽にご連絡ください。',
  },
]

export function buildBroadcastMessage(template: MessageTemplate): string {
  return template.body
}

export function buildOffReminderMessage(name: string, lastDesign?: string | null): string {
  const design = lastDesign?.trim() || 'デザイン'
  return `${name}さん、こんにちは◎ 前回の${design}からそろそろ次回のオフ（付け替え）の時期ですよ！ご都合いかがですか？🌸`
}

export function buildReservationConfirmedMessage(
  name: string,
  startAt: string,
  durationMin?: number | null,
): string {
  const date = new Date(startAt)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const startHours = String(date.getHours()).padStart(2, '0')
  const startMinutes = String(date.getMinutes()).padStart(2, '0')

  let timeRange = `${startHours}:${startMinutes}〜`
  if (durationMin != null) {
    const endDate = new Date(date.getTime() + durationMin * 60 * 1000)
    const endHours = String(endDate.getHours()).padStart(2, '0')
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
    timeRange = `${startHours}:${startMinutes}〜${endHours}:${endMinutes}`
  }

  return `${name}さん、${month}月${day}日 ${timeRange} 予約を確定しました。お待ちしております🌸`
}

export function getSalonMapsUrl(): string | undefined {
  const url = import.meta.env.VITE_SALON_MAPS_URL?.trim()
  return url || undefined
}

export function buildDayBeforeReminderMessage(
  name: string,
  startAt: string,
  durationMin?: number | null,
  mapsUrl?: string,
): string {
  const date = new Date(startAt)
  const startHours = String(date.getHours()).padStart(2, '0')
  const startMinutes = String(date.getMinutes()).padStart(2, '0')

  let timeRange = `${startHours}:${startMinutes}`
  if (durationMin != null) {
    const endDate = new Date(date.getTime() + durationMin * 60 * 1000)
    const endHours = String(endDate.getHours()).padStart(2, '0')
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
    timeRange = `${startHours}:${startMinutes}〜${endHours}:${endMinutes}`
  }

  const resolvedMapsUrl = mapsUrl ?? getSalonMapsUrl()
  const mapsLine = resolvedMapsUrl
    ? `\n場所はこちら→ ${resolvedMapsUrl}`
    : ''

  return `${name}さん、明日${timeRange}からのご予約をお待ちしております🌸${mapsLine}\nご都合が変わった場合はお知らせください。`
}
