/**
 * AD-13: một đồng hồ nghiệp vụ duy nhất, cố định Asia/Ho_Chi_Minh.
 *
 * Vì sao phải có: máy dev chạy giờ Việt Nam còn runtime trên Vercel mặc định
 * là UTC, nên `new Date()` cho ra hai ngày khác nhau vào khoảng 00:00–07:00
 * giờ Việt Nam. Mọi chỗ cần "hôm nay", "tháng này", "kỳ hiện tại" phải đi qua
 * đây, và không nơi nào được gọi thẳng đồng hồ hệ thống.
 *
 * Ngày được biểu diễn bằng chuỗi 'YYYY-MM-DD' và kỳ bằng 'YYYY-MM' — không
 * dùng đối tượng Date ở tầng nghiệp vụ, nên không có bẫy múi giờ.
 */

export const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh'

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Ngày hôm nay theo giờ Việt Nam, dạng 'YYYY-MM-DD'. */
export function businessToday(now: Date = new Date()): string {
  return dateFormatter.format(now)
}

/** Kỳ của một ngày, dạng 'YYYY-MM'. */
export function periodOf(date: string): string {
  assertDate(date)
  return date.slice(0, 7)
}

/** Kỳ hiện tại theo giờ Việt Nam. */
export function currentPeriod(now: Date = new Date()): string {
  return periodOf(businessToday(now))
}

export function assertDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Ngày không hợp lệ: ${date}. Cần dạng YYYY-MM-DD.`)
  }
}

export function assertPeriod(period: string): void {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    throw new Error(`Kỳ không hợp lệ: ${period}. Cần dạng YYYY-MM.`)
  }
}

/** Số ngày của một tháng. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** Ngày đầu và ngày cuối của một kỳ. */
export function periodBounds(period: string): { from: string; to: string } {
  assertPeriod(period)
  const [yearText, monthText] = period.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const last = daysInMonth(year, month)
  return { from: `${period}-01`, to: `${period}-${String(last).padStart(2, '0')}` }
}

/** Thứ theo ISO: 1 = Thứ Hai … 7 = Chủ Nhật. */
export function isoWeekday(date: string): number {
  assertDate(date)
  const day = new Date(`${date}T00:00:00Z`).getUTCDay()
  return day === 0 ? 7 : day
}

/** Cộng trừ ngày trên chuỗi, không đụng tới múi giờ địa phương. */
export function addDays(date: string, days: number): string {
  assertDate(date)
  const shifted = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000
  return new Date(shifted).toISOString().slice(0, 10)
}

/** Danh sách ngày từ `from` tới `to`, bao gồm hai đầu. */
export function eachDay(from: string, to: string): string[] {
  assertDate(from)
  assertDate(to)
  const days: string[] = []
  let cursor = from
  while (cursor <= to) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return days
}

/**
 * Kẹp một ngày trong tháng vào ngày cuối tháng.
 * Dùng cho hạn đóng: đặt ngày 31 thì tháng Hai sẽ rơi vào 28 hoặc 29.
 */
export function clampToMonth(period: string, day: number): string {
  const { from } = periodBounds(period)
  const [yearText, monthText] = period.split('-')
  const last = daysInMonth(Number(yearText), Number(monthText))
  const clamped = Math.min(Math.max(day, 1), last)
  return `${from.slice(0, 8)}${String(clamped).padStart(2, '0')}`
}

/** Dịch một kỳ đi `delta` tháng, ví dụ ('2026-01', -1) → '2025-12'. */
export function shiftPeriod(period: string, delta: number): string {
  assertPeriod(period)
  const [yearText, monthText] = period.split('-')
  let year = Number(yearText)
  let month = Number(monthText) + delta
  while (month > 12) {
    month -= 12
    year += 1
  }
  while (month < 1) {
    month += 12
    year -= 1
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

/** `count` kỳ gần nhất tính tới kỳ hiện tại, cũ nhất đứng trước. */
export function recentPeriods(count: number, now: Date = new Date()): string[] {
  const current = currentPeriod(now)
  const periods: string[] = []
  for (let index = count - 1; index >= 0; index -= 1) {
    periods.push(shiftPeriod(current, -index))
  }
  return periods
}
