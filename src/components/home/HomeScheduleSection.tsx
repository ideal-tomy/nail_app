import { Link } from 'react-router-dom'
import {
  useTodayReservations,
  useWeekReservations,
} from '../../hooks/useReservations'
import { TodayReservationTimeline } from '../reservations/TodayReservationTimeline'
import { WeekScheduleStrip } from '../reservations/WeekScheduleStrip'
import { TomorrowReminderSection } from './TomorrowReminderSection'

export function HomeScheduleSection() {
  const { data: todayReservations = [], isLoading: todayLoading } =
    useTodayReservations()
  const { data: weekReservations = [], isLoading: weekLoading } = useWeekReservations()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-medium text-ink">予約</h2>
        <p className="mt-1 text-sm leading-relaxed text-mauve">
          今週の予約状況と、今日のスケジュールを確認できます。
        </p>
      </div>

      {weekLoading ? (
        <p className="text-sm text-mauve">読み込み中...</p>
      ) : (
        <WeekScheduleStrip reservations={weekReservations} />
      )}

      <TomorrowReminderSection />

      <div>
        <h3 className="mb-3 text-base font-medium text-ink">今日の予定</h3>
        <TodayReservationTimeline
          reservations={todayReservations}
          isLoading={todayLoading}
        />
      </div>

      <Link
        to="/calendar"
        className="inline-block text-sm text-plum hover:text-ink"
      >
        カレンダーで見る →
      </Link>
    </section>
  )
}
