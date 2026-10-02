/**
 * AD-2: mặt tiếp xúc duy nhất của module điểm danh.
 *
 * AD-3: điểm danh là thứ duy nhất được ghi cho một buổi, và chỉ ghi được khi
 * buổi đó CÓ THẬT trong lịch. Hàm `saveSession` từ chối mọi bản ghi cho ngày
 * không có lớp, nhờ vậy mọi báo cáo phía sau không thể lệch vì dữ liệu mồ côi.
 *
 * Điểm danh KHÔNG ảnh hưởng tới học phí. Không có hàm nào ở đây được gọi từ
 * module học phí, và điều đó là cố ý.
 */

import { periodBounds } from '@/lib/clock'
import * as classesApi from '@/modules/classes/public'
import { listStudents } from '@/modules/students/public'
import {
  isSessionComplete,
  rowsOfSession,
  type AttendanceRatio,
  type AttendanceRow,
  type AttendanceStatus,
} from '@/modules/attendance/domain/attendance'
import * as queries from '@/modules/attendance/data/queries'
import { todayCounts } from '@/modules/attendance/domain/today'

export { todayCounts }

export type SessionAttendance = {
  classId: number
  className: string
  date: string
  startTime: string
  marks: { studentId: number; studentName: string; status: AttendanceStatus | null }[]
  complete: boolean
  presentCount: number
  expectedCount: number
}

/** Học sinh được mong đợi có mặt trong một buổi: đã vào lớp tính tới ngày đó. */
async function expectedStudents(classId: number, date: string) {
  const roster = await listStudents({ classId })
  return roster.filter(
    (student) =>
      student.startedOn <= date && (student.leftOn === null || student.leftOn >= date),
  )
}

export async function saveSession(input: {
  classId: number
  date: string
  startTime: string
  marks: readonly { studentId: number; status: AttendanceStatus }[]
}): Promise<void> {
  // AD-3: cổng kiểm buổi có tồn tại. Không có bước này thì dữ liệu rác lọt vào.
  const exists = await classesApi.sessionExists(input.classId, input.date, input.startTime)
  if (!exists) {
    throw new Error(
      'Ngày này lớp không có buổi học theo lịch. Kiểm tra lại lịch hoặc chọn buổi khác.',
    )
  }
  if (input.marks.length === 0) throw new Error('Chưa chọn học sinh nào để điểm danh')

  const expected = await expectedStudents(input.classId, input.date)
  const allowed = new Set(expected.map((student) => student.id))
  const unknown = input.marks.filter((mark) => !allowed.has(mark.studentId))
  if (unknown.length > 0) {
    throw new Error('Có học sinh không thuộc lớp này ở thời điểm của buổi học')
  }

  await queries.upsertAttendance(
    input.marks.map((mark) => ({
      studentId: mark.studentId,
      classId: input.classId,
      sessionDate: input.date,
      startTime: input.startTime,
      status: mark.status,
    })),
  )
}

/** Bảng điểm danh đầy đủ của một lớp trong một kỳ. */
export async function attendanceForClassInPeriod(
  classId: number,
  period: string,
): Promise<SessionAttendance[]> {
  const { from, to } = periodBounds(period)
  const sessions = await classesApi.sessionsForClassBetween(classId, from, to)
  const rows = await queries.selectForClassBetween(classId, from, to)
  const klass = await classesApi.getClass(classId)
  const className = klass?.name ?? ''

  const roster = await listStudents({ classId })
  const results: SessionAttendance[] = []

  for (const session of sessions) {
    const expected = roster.filter(
      (student) =>
        student.startedOn <= session.date &&
        (student.leftOn === null || student.leftOn >= session.date),
    )
    const sessionRows = rowsOfSession(rows, session)
    const byStudent = new Map(sessionRows.map((row) => [row.studentId, row.status]))

    results.push({
      classId,
      className,
      date: session.date,
      startTime: session.startTime,
      marks: expected.map((student) => ({
        studentId: student.id,
        studentName: student.fullName,
        status: byStudent.get(student.id) ?? null,
      })),
      complete: isSessionComplete(sessionRows, session, expected.map((s) => s.id)),
      presentCount: sessionRows.filter((row) => row.status === 'present').length,
      expectedCount: expected.length,
    })
  }

  return results
}

/** Các buổi của mọi lớp trong một ngày — màn điểm danh theo ngày. */
export async function sessionsForDate(date: string): Promise<SessionAttendance[]> {
  const sessions = await classesApi.sessionsForBetween(date, date)
  const rows = await queries.selectBetween(date, date)
  const classList = await classesApi.listClasses()
  const students = await listStudents()
  const nameById = new Map(classList.map((klass) => [klass.id, klass.name]))

  const results: SessionAttendance[] = []
  for (const session of sessions) {
    const roster = students.filter((student) => student.classId === session.classId &&
      student.startedOn <= date && (student.leftOn === null || student.leftOn >= date))
    const sessionRows = rowsOfSession(rows, session)
    const byStudent = new Map(sessionRows.map((row) => [row.studentId, row.status]))
    results.push({
      classId: session.classId,
      className: nameById.get(session.classId) ?? '',
      date,
      startTime: session.startTime,
      marks: roster.map((student) => ({
        studentId: student.id,
        studentName: student.fullName,
        status: byStudent.get(student.id) ?? null,
      })),
      complete: isSessionComplete(sessionRows, session, roster.map((s) => s.id)),
      presentCount: sessionRows.filter((row) => row.status === 'present').length,
      expectedCount: roster.length,
    })
  }
  return results
}

/** AD-12/17: tỉ lệ của mọi lớp trong kỳ từ một lần đọc lịch, sổ điểm danh và danh sách học sinh. */
export async function attendanceStatsForPeriod(period: string): Promise<Map<number, AttendanceRatio & { presentTotal: number; markedTotal: number }>> {
  const { from, to } = periodBounds(period)
  const sessions = await classesApi.sessionsForPeriod(period)
  const rows = await queries.selectBetween(from, to)
  const students = await listStudents()
  const result = new Map<number, AttendanceRatio & { presentTotal: number; markedTotal: number }>()
  for (const session of sessions) {
    const ratio = result.get(session.classId) ?? { complete: 0, total: 0, presentTotal: 0, markedTotal: 0 }
    ratio.total += 1
    const expectedIds = students.filter((student) => student.classId === session.classId &&
      student.startedOn <= session.date &&
      (student.leftOn === null || student.leftOn >= session.date)).map((student) => student.id)
    const sessionRows = rowsOfSession(rows, session)
    if (isSessionComplete(sessionRows, session, expectedIds)) ratio.complete += 1
    const expected = new Set(expectedIds)
    ratio.markedTotal += sessionRows.filter((row) => expected.has(row.studentId)).length
    ratio.presentTotal += sessionRows.filter((row) => expected.has(row.studentId) && row.status === 'present').length
    result.set(session.classId, ratio)
  }
  return result
}

export async function ratiosForPeriod(period: string): Promise<Map<number, AttendanceRatio>> {
  return attendanceStatsForPeriod(period)
}

/** AD-12: chỉ số "đã điểm danh bao nhiêu buổi" do hàm này sở hữu. */
export async function ratioForClassInPeriod(
  classId: number,
  period: string,
): Promise<AttendanceRatio> {
  return (await ratiosForPeriod(period)).get(classId) ?? { complete: 0, total: 0 }
}

/** Số buổi học sinh có mặt trên tổng số buổi đã điểm danh của em. */
export async function attendanceForStudentInPeriod(
  studentId: number,
  period: string,
): Promise<{ present: number; total: number }> {
  const { from, to } = periodBounds(period)
  const rows = await queries.selectForStudentBetween(studentId, from, to)
  return {
    present: rows.filter((row) => row.status === 'present').length,
    total: rows.length,
  }
}

/** Lịch sử điểm danh gần đây của một học sinh, dùng ở trang chi tiết. */
export async function recentAttendanceForStudent(
  studentId: number,
  from: string,
  to: string,
): Promise<AttendanceRow[]> {
  return queries.selectForStudentBetween(studentId, from, to)
}
