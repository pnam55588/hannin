import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { dueDateRules, tuitionRates } from '@/lib/db/schema'

export type RateRow = {
  studentId: number
  effectiveFrom: string
  amount: number
  discount: number
}

export type DueRuleRow = {
  studentId: number
  effectiveFrom: string
  dueDay: number
}

export async function selectRates(studentId?: number): Promise<RateRow[]> {
  const base = db
    .select({
      studentId: tuitionRates.studentId,
      effectiveFrom: tuitionRates.effectiveFrom,
      amount: tuitionRates.amount,
      discount: tuitionRates.discount,
    })
    .from(tuitionRates)

  const rows =
    studentId === undefined
      ? await base.orderBy(asc(tuitionRates.studentId), asc(tuitionRates.effectiveFrom))
      : await base.where(eq(tuitionRates.studentId, studentId)).orderBy(asc(tuitionRates.effectiveFrom))
  return rows
}

export async function insertRate(input: {
  studentId: number
  effectiveFrom: string
  amount: number
  discount: number
}): Promise<void> {
  await db.insert(tuitionRates).values(input)
}

export async function selectDueRules(studentId?: number): Promise<DueRuleRow[]> {
  const base = db
    .select({
      studentId: dueDateRules.studentId,
      effectiveFrom: dueDateRules.effectiveFrom,
      dueDay: dueDateRules.dueDay,
    })
    .from(dueDateRules)

  const rows =
    studentId === undefined
      ? await base.orderBy(asc(dueDateRules.studentId), asc(dueDateRules.effectiveFrom))
      : await base.where(eq(dueDateRules.studentId, studentId)).orderBy(asc(dueDateRules.effectiveFrom))
  return rows
}

export async function insertDueRule(input: {
  studentId: number
  effectiveFrom: string
  dueDay: number
}): Promise<void> {
  await db.insert(dueDateRules).values(input)
}
