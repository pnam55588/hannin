import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { classes, students } from '@/lib/db/schema'

export type StudentRow = {
  id: number
  fullName: string
  phone: string | null
  classId: number
  className: string
  startedOn: string
  leftOn: string | null
}

const selection = {
  id: students.id,
  fullName: students.fullName,
  phone: students.phone,
  classId: students.classId,
  className: classes.name,
  startedOn: students.startedOn,
  leftOn: students.leftOn,
}

export async function selectStudents(classId?: number): Promise<StudentRow[]> {
  const base = db.select(selection).from(students).innerJoin(classes, eq(classes.id, students.classId))
  const rows =
    classId === undefined
      ? await base.orderBy(asc(classes.name), asc(students.fullName))
      : await base.where(eq(students.classId, classId)).orderBy(asc(students.fullName))
  return rows
}

export async function selectStudentById(id: number): Promise<StudentRow | null> {
  const [row] = await db
    .select(selection)
    .from(students)
    .innerJoin(classes, eq(classes.id, students.classId))
    .where(eq(students.id, id))
    .limit(1)
  return row ?? null
}

export async function insertStudent(input: {
  fullName: string
  phone: string | null
  classId: number
  startedOn: string
}): Promise<{ id: number }> {
  const [row] = await db.insert(students).values(input).returning({ id: students.id })
  if (row === undefined) throw new Error('Không tạo được học sinh')
  return row
}

export async function updateStudentRow(
  id: number,
  input: { fullName: string; phone: string | null; classId: number; startedOn: string; leftOn: string | null },
): Promise<void> {
  await db.update(students).set(input).where(eq(students.id, id))
}

/**
 * AD-16: KHÔNG có xoá cứng học sinh. Kết thúc học là ghi ngày nghỉ, nhờ vậy
 * học phí và điểm danh của các tháng cũ vẫn tra được.
 */
export async function setLeftOn(id: number, leftOn: string | null): Promise<void> {
  await db.update(students).set({ leftOn }).where(eq(students.id, id))
}
