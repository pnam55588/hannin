/**
 * AD-2: mặt tiếp xúc duy nhất của module sổ thu.
 *
 * AD-6: sổ chỉ ghi thêm. KHÔNG có hàm xoá và KHÔNG có hàm sửa số tiền — ghi
 * nhầm thì gọi `recordAdjustment` để tạo một dòng điều chỉnh mới. Đây là lý do
 * module này cố tình không export gì giống `deletePayment`.
 *
 * AD-8: thu nhập là tiền THỰC NHẬN theo `paidOn`, do module này sở hữu. Con số
 * "đã thu của kỳ" là chuyện khác và thuộc module học phí.
 */

import { periodBounds, shiftPeriod } from '@/lib/clock'
import { incomeBetween as incomeBetweenRows, type PaymentRow } from '@/modules/payments/domain/ledger'
import { getStudent } from '@/modules/students/public'
import * as queries from '@/modules/payments/data/queries'

export type PaymentView = {
  id: number
  studentId: number
  studentName: string
  className: string
  period: string
  amount: number
  paidOn: string
  kind: 'payment' | 'adjustment'
  note: string | null
}

export async function listPayments(filter: queries.PaymentFilter = {}): Promise<PaymentView[]> {
  return queries.selectPayments(filter)
}

export async function paymentsForStudent(studentId: number): Promise<PaymentView[]> {
  return queries.selectPayments({ studentId })
}

/**
 * Ghi một lần thu. `classIdAtPayment` là mỏ neo lớp tại thời điểm thu (AD-16),
 * nhờ vậy báo cáo theo lớp vẫn đúng sau khi học sinh chuyển lớp hoặc nghỉ.
 */
export async function recordPayment(input: {
  studentId: number
  period: string
  amount: number
  paidOn: string
  note: string | null
}): Promise<void> {
  if (input.amount <= 0) throw new Error('Số tiền thu phải lớn hơn 0')
  const student = await getStudent(input.studentId)
  if (student === null) throw new Error('Không tìm thấy học sinh')
  await queries.insertPayment({
    studentId: input.studentId,
    period: input.period,
    amount: input.amount,
    paidOn: input.paidOn,
    classIdAtPayment: student.classId,
    kind: 'payment',
    note: input.note,
  })
}

/**
 * AD-6: điều chỉnh một dòng đã ghi bằng một dòng mới mang số âm.
 * Số dương bị từ chối để không ai lách thành ghi thêm tiền qua đường này.
 */
export async function recordAdjustment(input: {
  studentId: number
  period: string
  amount: number
  paidOn: string
  note: string | null
}): Promise<void> {
  if (input.amount >= 0) throw new Error('Số điều chỉnh phải là số âm')
  const student = await getStudent(input.studentId)
  if (student === null) throw new Error('Không tìm thấy học sinh')
  await queries.insertPayment({
    studentId: input.studentId,
    period: input.period,
    amount: input.amount,
    paidOn: input.paidOn,
    classIdAtPayment: student.classId,
    kind: 'adjustment',
    note: input.note,
  })
}

/** Số đã thu của từng học sinh trong một kỳ — dùng cho công nợ. */
export async function paidByStudentForPeriod(period: string): Promise<Map<number, number>> {
  return queries.selectPaidByStudentForPeriod(period)
}

/** AD-8: THU NHẬP trong một khoảng ngày thu. Hàm sở hữu chỉ số này. */
export async function incomeBetween(from: string, to: string): Promise<number> {
  return queries.selectIncomeTotal(from, to)
}

/** AD-8: THU NHẬP của một kỳ = tiền nhận được trong tháng đó, không phải tiền của tháng đó. */
export async function incomeInPeriod(period: string): Promise<number> {
  const { from, to } = periodBounds(period)
  return incomeBetween(from, to)
}

/** CAP-1: bốn tổng tiền theo ngày thu, đọc một lần cho mốc tháng/năm liền trước. */
export async function incomeComparisons(today: string): Promise<{
  month: number; previousMonth: number; year: number; previousYear: number
}> {
  const period = today.slice(0, 7)
  const previousPeriod = shiftPeriod(period, -1)
  const year = Number(today.slice(0, 4))
  const rows = await queries.selectIncomeRows(`${year - 1}-01-01`, today)
  const result = { month: 0, previousMonth: 0, year: 0, previousYear: 0 }
  for (const row of rows) {
    if (row.paidOn.startsWith(period)) result.month += row.amount
    if (row.paidOn.startsWith(previousPeriod)) result.previousMonth += row.amount
    if (row.paidOn.startsWith(String(year))) result.year += row.amount
    if (row.paidOn.startsWith(String(year - 1))) result.previousYear += row.amount
  }
  return result
}

/** Dùng cho kiểm thử và cho báo cáo trộn nhiều kỳ. */
export function sumIncomeRows(payments: readonly PaymentRow[], from: string, to: string): number {
  return incomeBetweenRows(payments, from, to)
}
