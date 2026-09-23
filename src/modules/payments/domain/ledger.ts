/**
 * AD-6 và AD-8: sổ thu là nguồn duy nhất của "đã thu".
 *
 * Chỗ dễ lệch nhất, và là chỗ reviewer đối kháng dựng được hai hành vi trái nhau:
 * công nợ tính theo KỲ của khoản thu, còn thu nhập tính theo NGÀY THU. Một khoản
 * thu ngày 03/10 cho kỳ 9 làm giảm công nợ tháng 9 nhưng là thu nhập tháng 10.
 */

export type PaymentRow = {
  studentId: number
  /** 'YYYY-MM' — kỳ khoản tiền thuộc về, do người ghi chọn. */
  period: string
  /** Số nguyên đồng. Bản ghi điều chỉnh mang số âm. */
  amount: number
  /** 'YYYY-MM-DD' — ngày thực nhận. */
  paidOn: string
  kind: 'payment' | 'adjustment'
}

export type DueEntry = {
  studentId: number
  due: number
}

export type Debtor = {
  studentId: number
  due: number
  paid: number
  outstanding: number
  /** Hạn đóng của kỳ, null khi học sinh chưa có luật hạn đóng. */
  dueDate: string | null
}

/** Tổng đã thu của một học sinh trong một kỳ. */
export function sumForPeriod(
  payments: readonly PaymentRow[],
  studentId: number,
  period: string,
): number {
  let total = 0
  for (const payment of payments) {
    if (payment.studentId !== studentId) continue
    if (payment.period !== period) continue
    total += payment.amount
  }
  return total
}

/** Công nợ của một kỳ. Số âm nghĩa là đã thu vượt. */
export function outstanding(due: number, paid: number): number {
  return due - paid
}

export function isSettled(due: number, paid: number): boolean {
  return outstanding(due, paid) <= 0
}

/**
 * AD-8: thu nhập là tổng tiền thực nhận trong khoảng ngày thu.
 * Chỉ số này không quan tâm kỳ của khoản thu.
 */
export function incomeBetween(
  payments: readonly PaymentRow[],
  from: string,
  to: string,
): number {
  let total = 0
  for (const payment of payments) {
    if (payment.paidOn < from || payment.paidOn > to) continue
    total += payment.amount
  }
  return total
}

/**
 * Danh sách nợ của MỘT kỳ — không cộng dồn nhiều tháng (AD-9).
 * Chỉ gồm học sinh còn thiếu tiền; ai đã đóng đủ hoặc đóng vượt thì không xuất hiện.
 * `dueDates` là hạn đóng của từng học sinh trong kỳ này, do tầng gọi tra sẵn.
 */
export function debtorsForPeriod(
  payments: readonly PaymentRow[],
  period: string,
  dues: readonly DueEntry[],
  dueDates: ReadonlyMap<number, string | null> = new Map(),
): Debtor[] {
  const debtors: Debtor[] = []
  for (const entry of dues) {
    const paid = sumForPeriod(payments, entry.studentId, period)
    const remaining = outstanding(entry.due, paid)
    if (remaining <= 0) continue
    debtors.push({
      studentId: entry.studentId,
      due: entry.due,
      paid,
      outstanding: remaining,
      dueDate: dueDates.get(entry.studentId) ?? null,
    })
  }
  return debtors.sort((a, b) => b.outstanding - a.outstanding)
}

export function totalOutstanding(debtors: readonly Debtor[]): number {
  return debtors.reduce((sum, debtor) => sum + debtor.outstanding, 0)
}

/** Số học sinh đã đóng đủ trong kỳ, dùng cho chỉ số phụ trên màn công nợ. */
export function settledCount(
  payments: readonly PaymentRow[],
  period: string,
  dues: readonly DueEntry[],
): number {
  let settled = 0
  for (const entry of dues) {
    if (isSettled(entry.due, sumForPeriod(payments, entry.studentId, period))) settled += 1
  }
  return settled
}
