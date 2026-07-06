import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getWeekRange, toDateKey } from '../../hooks/useReservations'
import type { ReservationWithCustomer } from '../../types/database'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

interface WeekScheduleStripProps {
  reservations: ReservationWithCustomer[]
}

export function WeekScheduleStrip({ reservations }: WeekScheduleStripProps) {
  const todayKey = toDateKey(new Date().toISOString())

  const weekDays = useMemo(() => {
    const range = getWeekRange()
    const start = new Date(range.start)
    const days: Array<{ dateKey: string; day: number; weekday: string }> = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const pad = (n: number) => String(n).padStart(2, '0')
      days.push({
        dateKey: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        day: d.getDate(),
        weekday: WEEKDAYS[d.getDay()],
      })
    }

    return days
  }, [])

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const reservation of reservations) {
      const key = toDateKey(reservation.start_at)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [reservations])

  return (
    <div className="rounded-3xl border border-petal/70 bg-blush/30 p-4">
      <p className="mb-3 text-xs font-medium text-mauve">今週</p>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(({ dateKey, day, weekday }) => {
          const count = countsByDate.get(dateKey) ?? 0
          const isToday = dateKey === todayKey

          return (
            <Link
              key={dateKey}
              to="/calendar"
              state={{ selectedDate: dateKey }}
              className={`flex flex-col items-center rounded-xl py-2 transition ${
                isToday
                  ? 'bg-plum text-porcelain ring-1 ring-plum/30'
                  : 'text-ink hover:bg-petal/50'
              }`}
            >
              <span className="text-[10px] text-current opacity-80">{weekday}</span>
              <span className="mt-0.5 text-sm font-medium">{day}</span>
              <span className="mt-1 flex h-3 items-end justify-center gap-0.5">
                {count > 0 &&
                  Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        isToday ? 'bg-porcelain' : 'bg-plum'
                      }`}
                    />
                  ))}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
