export function sendViaLine(message: string) {
  // line.me/R/share: 文面を入力済みで共有画面を開く。複数宛先はLINE側で手動選択
  const url = `https://line.me/R/share?text=${encodeURIComponent(message)}`
  window.location.href = url
}

export async function copyMessage(message: string) {
  await navigator.clipboard.writeText(message)
}
