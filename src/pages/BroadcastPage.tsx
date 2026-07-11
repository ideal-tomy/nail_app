import { BroadcastComposer } from '../components/contact/BroadcastComposer'
import { LineFollowersPanel } from '../components/contact/LineFollowersPanel'

export function BroadcastPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section>
        <h2 className="text-xl font-medium text-ink">一斉送信</h2>
        <p className="mt-1 text-sm leading-relaxed text-mauve">
          公式LINEの友だち連携と、文面作成・手動共有ができます。
        </p>
      </section>

      <LineFollowersPanel />
      <BroadcastComposer />
    </div>
  )
}
