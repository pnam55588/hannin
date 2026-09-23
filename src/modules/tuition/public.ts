/**
 * AD-2: mặt tiếp xúc duy nhất của module học phí. Module này là bên gọi ba
 * module khác, và chỉ gọi qua `public.ts` của họ.
 *
 * AD-5: mọi con số phải thu đều đi qua `chargesForPeriod`, và học sinh chưa có
 * mốc giá vẫn XUẤT HIỆN trong danh sách với trạng thái lỗi — không bao giờ bị
 * bỏ im lặng, vì như vậy là mất tiền mà không ai biết.
 *
 * AD-12: chỉ số "đã thu của kỳ" và "công nợ của kỳ" được sở hữu ở đây
 * (`billingSummary`). Chỉ số THU NHẬP theo tiền mặt thuộc module sổ thu.
 */

import { businessToday, periodBounds } from '@/lib/clock'
import { isEnrolledInPeriod, listStudents, type StudentView } from '@/modules/students/public'
import * as classesApi from '@/modules/classes/public'
import * as paymentsApi from '@/modules/payments/public'
import {
  amountDue,
  coveredWindow,
  dueDateForPeriod,
  resolveRate,
  type DueDateRule,
  type TuitionRate,
} from '@/modules/tuition/domain/pricing'
import * as queries from '@/modules/tuition/data/queries'

export type StudentCharge = {
  student: StudentView
  /** null nghĩa là chưa có mốc giá hiệu lực — phải hiện cảnh báo, không được coi là 0 đồng. */
  rate: TuitionRate | null
  dueDate: string | null
  sessionsInMonth: number
  sessionsInCoveredWindow: number
  due: number
}

export async function listRates(studentId: number): Promise<TuitionRate[]> {
  return queries.selectRates(studentId)
}

export async function listDueRules(studentId: number): Promise<DueDateRule[]> {
  return queries.selectDueRules(studentId)
}

/**
 * AD-5: đặt mốc đơn giá mới. Mốc cũ giữ nguyên nên tiền của các kỳ đã qua
 * không bao giờ đổi. Cùng một ngày thì bị từ chối (chỉ ghi thêm).
 */
export async function setRate(input: {
  studentId: number
  effectiveFrom: string
  amount: number
  discount: number
}): Promise<void> {
  if (!Number.isInteger(input.amount) || !Number.isInteger(input.discount)) {
    throw new Error('Số tiền phải là số nguyên đồng')
  }
  if (input.amount < 0 || input.discount < 0) {
    throw new Error('Số tiền và miễn giảm không được âm')
  }
  const existing = await queries.selectRates(input.studentId)
  if (existing.some((rate) => rate.effectiveFrom === input.effectiveFrom)) {
    throw new Error('Mốc hiệu lực này đã có đơn giá. Chọn ngày khác, để lịch sử không bị ghi đè.')
  }
  await queries.insertRate(input)
}

/** AD-9: hạn đóng là luật lặp có hiệu lực theo ngày; cũng chỉ ghi thêm. */
export async function setDueDay(input: {
  studentId: number
  effectiveFrom: string
  dueDay: number
}): Promise<void> {
  if (!Number.isInteger(input.dueDay) || input.dueDay < 1 || input.dueDay > 31) {
    throw new Error('Ngày đến hạn phải từ 1 tới 31')
  }
  const existing = await queries.selectDueRules(input.studentId)
  if (existing.some((rule) => rule.effectiveFrom === input.effectiveFrom)) {
    throw new Error('Mốc hiệu lực này đã có hạn đóng. Chọn ngày khác.')
  }
  await queries.insertDueRule(input)
}

/**
 * AD-5 + AD-12: hàm sở hữu duy nhất của số phải thu.
 * Mọi màn hình muốn biết "tháng này thu bao nhiêu" đều gọi hàm này.
 */
export async function chargesForPeriod(period: string): Promise<StudentCharge[]> {
  const roster = await listStudents()
  const enrolled = roster.filter((student) =>
    isEnrolledInPeriod({ startedOn: student.startedOn, leftOn: student.leftOn }, period),
  )
  if (enrolled.length === 0) return []

  const classIds = [...new Set(enrolled.map((student) => student.classId))]
  const sessionsByClass = new Map<number, { date: string }[]>()
  for (const classId of classIds) {
    sessionsByClass.set(classId, await classesApi.sessionsForClassInPeriod(classId, period))
  }

  const allRates = await queries.selectRates()
  const allRules = await queries.selectDueRules()
  const ratesByStudent = new Map<number, TuitionRate[]>()
  for (const rate of allRates) {
    const bucket = ratesByStudent.get(rate.studentId)
    if (bucket === undefined) ratesByStudent.set(rate.studentId, [rate])
    else bucket.push(rate)
  }
  const rulesByStudent = new Map<number, DueDateRule[]>()
  for (const rule of allRules) {
    const bucket = rulesByStudent.get(rule.studentId)
    if (bucket === undefined) rulesByStudent.set(rule.studentId, [rule])
    else bucket.push(rule)
  }

  const charges: StudentCharge[] = []
  for (const student of enrolled) {
    const monthSessions = sessionsByClass.get(student.classId) ?? []
    const covered = coveredWindow(student.startedOn, student.leftOn, period)
    const sessionsInCoveredWindow =
      covered === null
        ? 0
        : monthSessions.filter(
            (session) => session.date >= covered.from && session.date <= covered.to,
          ).length

    // Mốc giá tra tại ngày bắt đầu phần tháng mà học sinh thực sự học: học sinh
    // vào giữa tháng nhận đơn giá mới đặt cho em, học sinh cũ giữ đơn giá cũ
    // cho tới hết tháng đang xét.
    const rateDate = covered?.from ?? periodBounds(period).from
    const rate = resolveRate(ratesByStudent.get(student.id) ?? [], rateDate)
    const rules = rulesByStudent.get(student.id) ?? []

    charges.push({
      student,
      rate,
      dueDate: dueDateForPeriod(rules, period),
      sessionsInMonth: monthSessions.length,
      sessionsInCoveredWindow,
      due:
        rate === null
          ? 0
          : amountDue({
              rate,
              period,
              startedOn: student.startedOn,
              leftOn: student.leftOn,
              sessionsInMonth: monthSessions.length,
              sessionsInCoveredWindow,
            }),
    })
  }

  return charges.sort((a, b) => a.student.fullName.localeCompare(b.student.fullName, 'vi'))
}

export async function chargeForStudent(
  studentId: number,
  period: string,
): Promise<StudentCharge | null> {
  const charges = await chargesForPeriod(period)
  return charges.find((charge) => charge.student.id === studentId) ?? null
}

export type BillingSummary = {
  period: string
  /** Tổng phải thu của kỳ, chỉ tính các học sinh đã có mốc giá. */
  expected: number
  /** Đã thu tính theo KỲ — khác với thu nhập theo tiền mặt của module sổ thu. */
  collected: number
  outstanding: number
  studentCount: number
  settledCount: number
  /** Học sinh chưa có mốc giá: con số `expected` đang thiếu phần của họ. */
  missingRateCount: number
}

/** AD-12: hàm sở hữu chỉ số của màn học phí. */
export async function billingSummary(period: string): Promise<BillingSummary> {
  const charges = await chargesForPeriod(period)
  const paid = await paymentsApi.paidByStudentForPeriod(period)

  let expected = 0
  let collected = 0
  let settledCount = 0
  let missingRateCount = 0

  for (const charge of charges) {
    const alreadyPaid = paid.get(charge.student.id) ?? 0
    collected += alreadyPaid
    if (charge.rate === null) {
      missingRateCount += 1
      continue
    }
    expected += charge.due
    if (alreadyPaid >= charge.due) settledCount += 1
  }

  return {
    period,
    expected,
    collected,
    outstanding: expected - collected,
    studentCount: charges.length,
    settledCount,
    missingRateCount,
  }
}

export type DebtorRow = StudentCharge & { paid: number; outstanding: number }

/** Danh sách nợ của một kỳ — chỉ gồm người còn thiếu tiền. */
export async function debtorsForPeriod(period: string): Promise<DebtorRow[]> {
  const charges = await chargesForPeriod(period)
  const paid = await paymentsApi.paidByStudentForPeriod(period)

  const rows: DebtorRow[] = []
  for (const charge of charges) {
    const alreadyPaid = paid.get(charge.student.id) ?? 0
    const remaining = charge.due - alreadyPaid
    if (remaining > 0 && charge.rate !== null) {
      rows.push({ ...charge, paid: alreadyPaid, outstanding: remaining })
    }
  }
  return rows.sort((a, b) => b.outstanding - a.outstanding)
}

export function today(): string {
  return businessToday()
}
