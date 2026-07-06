export const workNoteTemplates = [
  { label: 'フィルイン', text: 'ベース: フィルイン / 長さ: ' },
  { label: 'フルセット', text: 'ベース: フルセット / 長さ: ' },
  { label: 'オフのみ', text: 'オフのみ / ' },
  { label: '短め', text: '長さ: 短め / ' },
  { label: '長め', text: '長さ: 長め / ' },
] as const

export const designNoteTemplates = [
  { label: 'ワンカラー', text: 'ワンカラー（' },
  { label: 'フレンチ', text: 'フレンチ（' },
  { label: 'グラデ', text: 'グラデーション（' },
  { label: 'アート', text: 'アート（' },
] as const

export function appendTemplateText(current: string, templateText: string): string {
  const trimmed = current.trimEnd()
  if (!trimmed) return templateText
  if (trimmed.endsWith('/') || trimmed.endsWith('（')) {
    return `${trimmed}${templateText.trimStart()}`
  }
  return `${trimmed} ${templateText}`
}
