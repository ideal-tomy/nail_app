import { BroadcastComposer } from '../components/contact/BroadcastComposer'

export function BroadcastPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section>
        <h2 className="text-xl font-medium text-ink">一斉送信</h2>
        <p className="mt-1 text-sm leading-relaxed text-mauve">
          文面を作成し、LINEの共有画面で複数の宛先を選択して送信します。
        </p>
      </section>

      <BroadcastComposer />
    </div>
  )
}
