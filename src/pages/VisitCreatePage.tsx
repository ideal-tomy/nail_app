import { Link, useParams } from 'react-router-dom'
import { useCustomer } from '../hooks/useCustomers'
import { VisitForm } from '../components/visits/VisitForm'

export function VisitCreatePage() {
  const { id } = useParams<{ id: string }>()
  const { data: customer, isLoading } = useCustomer(id)

  if (isLoading) {
    return <p className="text-sm text-mauve">読み込み中...</p>
  }

  if (!customer || !id) {
    return <p className="text-sm text-plum">顧客が見つかりません</p>
  }

  return (
    <div className="space-y-5">
      <Link
        to={`/customers/${id}`}
        className="inline-block text-sm text-mauve hover:text-plum"
      >
        ← {customer.name} の詳細へ
      </Link>

      <section>
        <h2 className="text-xl font-medium text-ink">来店を登録</h2>
        <p className="mt-1 text-sm text-mauve">{customer.name} さん</p>
      </section>

      <VisitForm customerId={id} />
    </div>
  )
}
