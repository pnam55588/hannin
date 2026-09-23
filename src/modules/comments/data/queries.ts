import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { comments, students } from '@/lib/db/schema'

export type CommentQueryRow = {
  id: number
  studentId: number
  studentName: string
  period: string
  body: string
  updatedAt: Date
}

const selection = {
  id: comments.id,
  studentId: comments.studentId,
  studentName: students.fullName,
  period: comments.period,
  body: comments.body,
  updatedAt: comments.updatedAt,
}

export async function selectForPeriod(period: string): Promise<CommentQueryRow[]> {
  return db
    .select(selection)
    .from(comments)
    .innerJoin(students, eq(students.id, comments.studentId))
    .where(eq(comments.period, period))
    .orderBy(asc(students.fullName))
}

export async function selectForStudent(studentId: number): Promise<CommentQueryRow[]> {
  return db
    .select(selection)
    .from(comments)
    .innerJoin(students, eq(students.id, comments.studentId))
    .where(eq(comments.studentId, studentId))
    .orderBy(desc(comments.period))
}

export async function selectOne(
  studentId: number,
  period: string,
): Promise<CommentQueryRow | null> {
  const [row] = await db
    .select(selection)
    .from(comments)
    .innerJoin(students, eq(students.id, comments.studentId))
    .where(and(eq(comments.studentId, studentId), eq(comments.period, period)))
    .limit(1)
  return row ?? null
}

/** Nhận xét được phép sửa — đây là văn bản, không phải tiền (AD-6 chỉ áp cho sổ thu). */
export async function upsertComment(input: {
  studentId: number
  period: string
  body: string
}): Promise<void> {
  await db
    .insert(comments)
    .values(input)
    .onConflictDoUpdate({
      target: [comments.studentId, comments.period],
      set: { body: input.body, updatedAt: new Date() },
    })
}

export async function selectRecent(limit: number): Promise<CommentQueryRow[]> {
  return db
    .select(selection)
    .from(comments)
    .innerJoin(students, eq(students.id, comments.studentId))
    .orderBy(desc(comments.updatedAt))
    .limit(limit)
}
