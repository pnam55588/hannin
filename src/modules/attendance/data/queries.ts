import { and, asc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'

export type AttendanceQueryRow = {
  studentId: number
  classId: number
  sessionDate: string
  startTime: string
  status: 'present' | 'absent'
}

const selection = {
  studentId: attendance.studentId,
  classId: attendance.classId,
  sessionDate: attendance.sessionDate,
  startTime: attendance.startTime,
  status: attendance.status,
}

export async function selectBetween(from: string, to: string): Promise<AttendanceQueryRow[]> {
  return db
    .select(selection)
    .from(attendance)
    .where(and(gte(attendance.sessionDate, from), lte(attendance.sessionDate, to)))
    .orderBy(asc(attendance.sessionDate), asc(attendance.startTime))
}

export async function selectForClassBetween(
  classId: number,
  from: string,
  to: string,
): Promise<AttendanceQueryRow[]> {
  return db
    .select(selection)
    .from(attendance)
    .where(
      and(
        eq(attendance.classId, classId),
        gte(attendance.sessionDate, from),
        lte(attendance.sessionDate, to),
      ),
    )
    .orderBy(asc(attendance.sessionDate), asc(attendance.startTime))
}

export async function selectForStudentBetween(
  studentId: number,
  from: string,
  to: string,
): Promise<AttendanceQueryRow[]> {
  return db
    .select(selection)
    .from(attendance)
    .where(
      and(
        eq(attendance.studentId, studentId),
        gte(attendance.sessionDate, from),
        lte(attendance.sessionDate, to),
      ),
    )
    .orderBy(asc(attendance.sessionDate), asc(attendance.startTime))
}

/**
 * Lưu điểm danh là thao tác lặp lại được: chủ lớp có thể mở lại buổi và sửa.
 * Điểm danh không phải tiền nên được phép ghi đè — khác hẳn sổ thu (AD-6).
 */
export async function upsertAttendance(rows: readonly AttendanceQueryRow[]): Promise<void> {
  if (rows.length === 0) return
  await db
    .insert(attendance)
    .values([...rows])
    .onConflictDoUpdate({
      target: [attendance.studentId, attendance.classId, attendance.sessionDate, attendance.startTime],
      set: { status: sql`excluded.status` },
    })
}
