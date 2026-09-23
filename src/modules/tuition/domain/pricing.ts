/**
 * AD-5: số phải thu của một kỳ là hàm thuần.
 *
 * Hai luật quan trọng, cả hai đều là chỗ hai đơn vị có thể chọn lệch nếu không ghim:
 *  1. Tháng trọn thì thu đơn giá trừ miễn giảm. Tháng lệch thì chia theo số buổi
 *     LỚP ĐÃ DIỄN RA trong phần tháng học sinh có mặt — không theo số buổi em có mặt.
 *  2. Phép chia làm tròn nửa lên tới đồng và tính hoàn toàn bằng số nguyên.
 */

import { clampToMonth, periodBounds } from '@/lib/clock'
import { roundHalfUp } from '@/lib/format'

export type TuitionRate = {
  effectiveFrom: string
  amount: number
  discount: number
}

export type DueDateRule = {
  effectiveFrom: string
  dueDay: number
}

/** Mốc giá áp dụng cho một ngày: mốc mới nhất không vượt quá ngày đó. */
export function resolveRate(
  rates: readonly TuitionRate[],
  date: string,
): TuitionRate | null {
  let best: TuitionRate | null = null
  for (const rate of rates) {
    if (rate.effectiveFrom > date) continue
    if (best === null || rate.effectiveFrom > best.effectiveFrom) best = rate
  }
  return best
}

/** Số đơn giá thuần của một mốc, đã trừ miễn giảm, không bao giờ âm. */
export function netAmount(rate: TuitionRate): number {
  return Math.max(0, rate.amount - rate.discount)
}

/** AD-9: hạn đóng áp dụng cho một kỳ, suy từ luật lặp gần nhất. */
export function dueDateForPeriod(
  rules: readonly DueDateRule[],
  period: string,
): string | null {
  const { to } = periodBounds(period)
  let best: DueDateRule | null = null
  for (const rule of rules) {
    if (rule.effectiveFrom > to) continue
    if (best === null || rule.effectiveFrom > best.effectiveFrom) best = rule
  }
  if (best === null) return null
  return clampToMonth(period, best.dueDay)
}

/**
 * Phần tháng mà học sinh thực sự thuộc lớp, đã giao với kỳ. Trả về null nếu em
 * không học tháng đó.
 *
 * Luật "có thuộc lớp trong kỳ hay không" thuộc module học sinh, không phải module
 * này — ở đây chỉ tính khoảng ngày, và tầng gọi chỉ truyền vào những học sinh đã
 * qua cổng đó.
 */
export function coveredWindow(
  startedOn: string,
  leftOn: string | null,
  period: string,
): { from: string; to: string } | null {
  const bounds = periodBounds(period)
  if (startedOn > bounds.to) return null
  if (leftOn !== null && leftOn < bounds.from) return null
  const from = startedOn > bounds.from ? startedOn : bounds.from
  const to = leftOn !== null && leftOn < bounds.to ? leftOn : bounds.to
  return { from, to }
}

/**
 * Tháng lệch là tháng mà học sinh không có mặt từ buổi đầu tới buổi cuối
 * của lớp trong tháng đó.
 */
export function isPartialMonth(
  startedOn: string,
  leftOn: string | null,
  period: string,
): boolean {
  const { from, to } = periodBounds(period)
  if (startedOn > from) return true
  if (leftOn !== null && leftOn < to) return true
  return false
}

export type ChargeInput = {
  rate: TuitionRate
  period: string
  startedOn: string
  leftOn: string | null
  /** Tổng số buổi của lớp trong tháng. */
  sessionsInMonth: number
  /** Số buổi của lớp đã diễn ra trong phần tháng học sinh có mặt. */
  sessionsInCoveredWindow: number
}

/**
 * Số phải thu của một kỳ.
 *
 * Không bao giờ trả về 0 một cách âm thầm khi thiếu mốc giá: việc thiếu mốc là
 * lỗi dữ liệu và do tầng gọi xử lý bằng cách hiện trạng thái lỗi rõ ràng —
 * AD-5 cấm để học sinh biến mất khỏi danh sách nợ.
 */
export function amountDue(input: ChargeInput): number {
  const { rate, period, startedOn, leftOn, sessionsInMonth, sessionsInCoveredWindow } = input

  if (coveredWindow(startedOn, leftOn, period) === null) return 0

  const base = netAmount(rate)
  if (!isPartialMonth(startedOn, leftOn, period)) return base

  if (sessionsInMonth <= 0) return 0
  if (sessionsInCoveredWindow <= 0) return 0
  if (sessionsInCoveredWindow >= sessionsInMonth) return base

  return roundHalfUp(base * sessionsInCoveredWindow, sessionsInMonth)
}
