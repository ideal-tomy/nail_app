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
