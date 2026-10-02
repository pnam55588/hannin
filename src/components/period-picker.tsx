'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { recentPeriods, shiftPeriod } from '@/lib/clock'
import { formatPeriod } from '@/lib/format'

/** Bộ chọn kỳ dùng chung: đổi kỳ là đổi tham số trên địa chỉ, không có trạng thái riêng. */
export function PeriodPicker({
  value,
  paramName = 'period',
  label = 'Kỳ',
}: {
  value: string
  paramName?: string
  label?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function go(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramName, next)
    router.push(`${pathname}?${params.toString()}`)
  }

  const options = recentPeriods(18)
  if (!options.includes(value)) options.push(value)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted">{label}</span>
      <button
        type="button"
        onClick={() => go(shiftPeriod(value, -1))}
        className="min-h-11 min-w-11 rounded-lg border border-line bg-surface px-2 text-sm hover:border-navy"
        aria-label="Kỳ trước"
      >
        ‹
      </button>
      <select
        value={value}
        onChange={(event) => go(event.target.value)}
        className="min-h-11 rounded-lg border border-line bg-surface px-2 text-sm"
      >
        {options.map((period) => (
          <option key={period} value={period}>
            {formatPeriod(period)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => go(shiftPeriod(value, 1))}
        className="min-h-11 min-w-11 rounded-lg border border-line bg-surface px-2 text-sm hover:border-navy"
        aria-label="Kỳ sau"
      >
        ›
      </button>
    </div>
  )
}

/** Bộ chọn ngày, cùng cách làm với bộ chọn kỳ. */
export function DatePicker({
  value,
  paramName = 'date',
  label = 'Ngày',
}: {
  value: string
  paramName?: string
  label?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set(paramName, event.target.value)
          router.push(`${pathname}?${params.toString()}`)
        }}
        className="min-h-11 rounded-lg border border-line bg-surface px-2 text-sm"
      />
    </div>
  )
}
