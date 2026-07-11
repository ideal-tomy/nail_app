import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  createCustomerFromFollower,
  linkFollowerToCustomer,
  useLineFollowers,
} from '../../hooks/useLineFollowers'
import { useCustomers } from '../../hooks/useCustomers'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { useToast } from '../ui/Toast'

export function LineFollowersPanel() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: followers = [], isLoading, error } = useLineFollowers({
    unlinkedOnly: true,
  })
  const { data: customers = [] } = useCustomers()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    Record<string, string>
  >({})

  const unlinkedCustomers = useMemo(
    () => customers.filter((c) => !c.line_user_id),
    [customers],
  )

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['line-followers'] })
    await queryClient.invalidateQueries({ queryKey: ['customers'] })
    await queryClient.invalidateQueries({ queryKey: ['customer'] })
  }

  const handleCreate = async (followerId: string) => {
    const follower = followers.find((f) => f.id === followerId)
    if (!follower) return

    setBusyId(followerId)
    try {
      const created = await createCustomerFromFollower(follower)
      await refresh()
      showToast(`顧客「${created.name}」を作成して連携しました`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setBusyId(null)
    }
  }

  const handleLink = async (followerId: string) => {
    const follower = followers.find((f) => f.id === followerId)
    const customerId = selectedCustomerId[followerId]
    if (!follower || !customerId) {
      showToast('紐づける顧客を選んでください')
      return
    }

    setBusyId(followerId)
    try {
      await linkFollowerToCustomer(
        follower.id,
        follower.line_user_id,
        customerId,
        follower.display_name,
      )
      await refresh()
      showToast('顧客にLINEを紐づけました')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '紐づけに失敗しました')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-ink">未連携の友だち</h3>
          <p className="mt-1 text-xs leading-relaxed text-mauve">
            公式LINEを友だち追加した人がここに表示されます。顧客に紐づけるか、新規顧客として登録してください。
          </p>
        </div>
        <Link to="/customers" className="text-xs text-plum hover:underline">
          顧客一覧
        </Link>
      </div>

      {isLoading && <p className="mt-4 text-sm text-mauve">読み込み中...</p>}

      {error && (
        <p className="mt-4 text-sm text-plum">
          {error instanceof Error
            ? error.message
            : '友だち一覧の取得に失敗しました（SQLマイグレーション未実行の可能性）'}
        </p>
      )}

      {!isLoading && !error && followers.length === 0 && (
        <div className="mt-4">
          <EmptyState
            title="未連携の友だちはいません"
            description="Webhook設定後に友だち追加・メッセージ送信するとここに表示されます。"
          />
        </div>
      )}

      <div className="mt-4 space-y-3">
        {followers.map((follower) => (
          <div
            key={follower.id}
            className="rounded-2xl border border-petal/70 bg-blush/40 p-3"
          >
            <div className="flex items-center gap-3">
              {follower.picture_url ? (
                <img
                  src={follower.picture_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-petal text-sm text-plum">
                  L
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">
                  {follower.display_name || '名前未取得'}
                </p>
                <p className="truncate font-mono text-[10px] text-mauve">
                  {follower.line_user_id}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <select
                value={selectedCustomerId[follower.id] ?? ''}
                onChange={(e) =>
                  setSelectedCustomerId((prev) => ({
                    ...prev,
                    [follower.id]: e.target.value,
                  }))
                }
                className="field-input text-sm"
              >
                <option value="">既存顧客に紐づけ...</option>
                {unlinkedCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-xs"
                  disabled={busyId === follower.id}
                  onClick={() => handleLink(follower.id)}
                >
                  紐づけ
                </Button>
                <Button
                  className="flex-1 text-xs"
                  disabled={busyId === follower.id}
                  onClick={() => handleCreate(follower.id)}
                >
                  新規顧客にする
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
