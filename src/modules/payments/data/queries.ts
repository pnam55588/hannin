import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { classes, payments, students } from '@/lib/db/schema'

export type PaymentQueryRow = {
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

const selection = {
  id: payments.id,
  studentId: payments.studentId,
  studentName: students.fullName,
  className: classes.name,
  period: payments.period,
  amount: payments.amount,
  paidOn: payments.paidOn,
  kind: payments.kind,
  note: payments.note,
}

export type PaymentFilter = {
  studentId?: number
  period?: string
  from?: string
  to?: string
}

function conditions(filter: PaymentFilter) {
  const parts = []
  if (filter.studentId !== undefined) parts.push(eq(payments.studentId, filter.studentId))
  if (filter.period !== undefined) parts.push(eq(payments.period, filter.period))
  if (filter.from !== undefined) parts.push(gte(payments.paidOn, filter.from))
  if (filter.to !== undefined) parts.push(lte(payments.paidOn, filter.to))
  return parts.length === 0 ? undefined : and(...parts)
}

export async function selectPayments(filter: PaymentFilter): Promise<PaymentQueryRow[]> {
  return db
    .select(selection)
    .from(payments)
    .innerJoin(students, eq(students.id, payments.studentId))
    .innerJoin(classes, eq(classes.id, payments.classIdAtPayment))
    .where(conditions(filter))
    .orderBy(desc(payments.paidOn), desc(payments.id))
}

export async function insertPayment(input: {
  studentId: number
  period: string
  amount: number
  paidOn: string
  classIdAtPayment: number
  kind: 'payment' | 'adjustment'
  note: string | null
}): Promise<void> {
  await db.insert(payments).values(input)
}

/** AD-4: tổng tiền là số nguyên; cộng ở tầng cơ sở dữ liệu với bigint rồi ép về số. */
export async function selectPaidByStudentForPeriod(period: string): Promise<Map<number, number>> {
  const rows = await db
    .select({
      studentId: payments.studentId,
      total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(eq(payments.period, period))
    .groupBy(payments.studentId)

  const map = new Map<number, number>()
  for (const row of rows) map.set(row.studentId, Number(row.total))
  return map
}

export async function selectIncomeTotal(from: string, to: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(and(gte(payments.paidOn, from), lte(payments.paidOn, to)))
  return Number(row?.total ?? 0)
}
