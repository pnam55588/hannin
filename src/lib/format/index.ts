/**
 * AD-13: mọi hiển thị tiền và ngày đi qua đây. Cấm format trong component,
 * và cấm đối tượng Date ở tầng nghiệp vụ.
 */

import { isoWeekday } from '@/lib/clock'

const WEEKDAY_NAMES = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
})

/** 1200000 → '1.200.000đ' */
export function formatVnd(amount: number): string {
  return `${vndFormatter.format(Math.round(amount))}đ`
}

/** '2026-09-16' → 'Thứ Tư, 16/09/2026' */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${WEEKDAY_NAMES[isoWeekday(date) % 7]}, ${day}/${month}/${year}`
}

/** '2026-09-16' → '16/09/2026' */
export function formatShortDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

/** '2026-09' → 'tháng 9/2026' */
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-')
  return `tháng ${Number(month)}/${year}`
}

/** '08:00:00' → '08:00' */
export function formatTime(startTime: string): string {
  return startTime.slice(0, 5)
}

/**
 * AD-4: phần trăm là phép làm tròn HIỂN THỊ duy nhất được phép. Tính từ hai số
 * nguyên bằng số nguyên trước, rồi mới làm tròn — không dùng số thực.
 */
export function roundHalfUp(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  const sign = numerator < 0 !== denominator < 0 ? -1 : 1
  const n = Math.abs(numerator)
  const d = Math.abs(denominator)
  return sign * Math.floor((2 * n + d) / (2 * d))
}

/** Tỉ lệ phần trăm giữa hai số nguyên, ví dụ 6 và 50 → '+12%'. */
export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? '0%' : 'mới'
  const percent = roundHalfUp((current - previous) * 100, previous)
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent}%`
}

/** m/n đã điểm danh, ví dụ 4 và 5 → '4 / 5'. */
export function formatRatio(part: number, whole: number): string {
  return `${part} / ${whole}`
}
