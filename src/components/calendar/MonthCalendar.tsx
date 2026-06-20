import { useMemo } from 'react'
import { toDateKey } from '../../hooks/useReservations'
import type { ReservationWithCustomer } from '../../types/database'

interface MonthCalendarProps {
  year: number
  month: number
  reservations: ReservationWithCustomer[]
  selectedDate: string | null
  onSelectDate: (dateKey: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function MonthCalendar({
  year,
  month,
  reservations,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const countsByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const reservation of reservations) {
      if (reservation.status === 'canceled' || reservation.status === 'no_show') continue
      const key = toDateKey(reservation.start_at)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [reservations])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: Array<{ dateKey: string; day: number; inMonth: boolean }> = []

    for (let i = 0; i < startPad; i++) {
      const d = new Date(year, month, -startPad + i + 1)
      const pad = (n: number) => String(n).padStart(2, '0')
      days.push({
        dateKey: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        day: d.getDate(),
        inMonth: false,
      })
    }

    for (let day = 1; day <= totalDays; day++) {
      const pad = (n: number) => String(n).padStart(2, '0')
      days.push({
        dateKey: `${year}-${pad(month + 1)}-${pad(day)}`,
        day,
        inMonth: true,
      })
    }

    while (days.length % 7 !== 0) {
      const nextDay = days.length - startPad - totalDays + 1
      const d = new Date(year, month + 1, nextDay)
      const pad = (n: number) => String(n).padStart(2, '0')
      days.push({
        dateKey: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        day: d.getDate(),
        inMonth: false,
      })
    }

    return days
  }, [year, month])

  const todayKey = toDateKey(new Date().toISOString())

  return (
    <div className="rounded-3xl border border-petal/70 bg-blush/30 p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-xl px-3 py-2 text-sm text-mauve hover:bg-petal/50"
        >
          ←
        </button>
        <h3 className="text-lg font-medium text-ink">
          {year}年{month + 1}月
        </h3>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-xl px-3 py-2 text-sm text-mauve hover:bg-petal/50"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-mauve">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendarDays.map(({ dateKey, day, inMonth }) => {
          const count = countsByDate.get(dateKey) ?? 0
          const isSelected = selectedDate === dateKey
          const isToday = todayKey === dateKey

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition ${
                !inMonth
                  ? 'text-mauve/40'
                  : isSelected
                    ? 'bg-plum text-porcelain'
                    : isToday
                      ? 'bg-petal text-plum ring-1 ring-mauve/30'
                      : 'text-ink hover:bg-petal/50'
              }`}
            >
              <span>{day}</span>
              {count > 0 && inMonth && (
                <span
                  className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                    isSelected ? 'bg-porcelain' : 'bg-plum'
                  }`}
                  aria-label={`${count}件の予約`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
