import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { classes, scheduleSlots, students } from '@/lib/db/schema'

export type ClassRow = {
  id: number
  name: string
  studentCount: number
}

/**
 * Đếm học sinh của lớp ngay trong TypeScript thay vì bằng `current_date` của
 * Postgres: giờ trên máy chủ Supabase là UTC, còn "hôm nay" của nghiệp vụ là giờ
 * Việt Nam (AD-13). Luật đếm cũng nằm ở đây chứ không nằm rải trong SQL.
 */
export async function selectClasses(today: string): Promise<ClassRow[]> {
  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      studentId: students.id,
      startedOn: students.startedOn,
      leftOn: students.leftOn,
    })
    .from(classes)
    .leftJoin(students, eq(students.classId, classes.id))
    .orderBy(asc(classes.name))

  const byId = new Map<number, ClassRow>()
  for (const row of rows) {
    let entry = byId.get(row.id)
    if (entry === undefined) {
      entry = { id: row.id, name: row.name, studentCount: 0 }
      byId.set(row.id, entry)
    }
    if (row.studentId === null) continue
    const enrolled =
      row.startedOn !== null &&
      row.startedOn <= today &&
      (row.leftOn === null || row.leftOn >= today)
    if (enrolled) entry.studentCount += 1
  }

  return [...byId.values()]
}

export async function selectClassById(id: number): Promise<{ id: number; name: string } | null> {
  const [row] = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(eq(classes.id, id))
    .limit(1)
  return row ?? null
}

export async function insertClass(name: string): Promise<{ id: number }> {
  const [row] = await db.insert(classes).values({ name }).returning({ id: classes.id })
  if (row === undefined) throw new Error('Không tạo được lớp')
  return row
}

export async function updateClassName(id: number, name: string): Promise<void> {
  await db.update(classes).set({ name }).where(eq(classes.id, id))
}

export type SlotRow = {
  id: number
  effectiveFrom: string
  weekday: number
  startTime: string
}

export async function selectSlots(classId: number): Promise<SlotRow[]> {
  return db
    .select({
      id: scheduleSlots.id,
      effectiveFrom: scheduleSlots.effectiveFrom,
      weekday: scheduleSlots.weekday,
      startTime: scheduleSlots.startTime,
    })
    .from(scheduleSlots)
    .where(eq(scheduleSlots.classId, classId))
    .orderBy(asc(scheduleSlots.effectiveFrom), asc(scheduleSlots.weekday), asc(scheduleSlots.startTime))
}

export async function selectAllSlots(): Promise<(SlotRow & { classId: number })[]> {
  return db
    .select({
      id: scheduleSlots.id,
      classId: scheduleSlots.classId,
      effectiveFrom: scheduleSlots.effectiveFrom,
      weekday: scheduleSlots.weekday,
      startTime: scheduleSlots.startTime,
    })
    .from(scheduleSlots)
    .orderBy(asc(scheduleSlots.classId), asc(scheduleSlots.effectiveFrom))
}

export async function insertSlots(
  classId: number,
  effectiveFrom: string,
  slots: readonly { weekday: number; startTime: string }[],
): Promise<void> {
  if (slots.length === 0) throw new Error('Lịch phải có ít nhất một buổi trong tuần')
  await db
    .insert(scheduleSlots)
    .values(slots.map((slot) => ({ classId, effectiveFrom, weekday: slot.weekday, startTime: slot.startTime })))
}
