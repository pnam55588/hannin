/**
 * AD-3: hợp đồng ghi và đọc điểm danh.
 *
 * "Buổi đã điểm danh" phải được định nghĩa một lần, nếu không màn Tổng quan và
 * màn Báo cáo sẽ đếm hai kiểu. Luật ở đây: một buổi được coi là đã điểm danh khi
 * có đủ dòng cho MỌI học sinh của lớp tại buổi đó — kể cả dòng Vắng.
 */

export type AttendanceStatus = 'present' | 'absent'

export type AttendanceRow = {
  studentId: number
  classId: number
  sessionDate: string
  startTime: string
  status: AttendanceStatus
}

export type SessionRef = {
  classId: number
  date: string
  startTime: string
}

export function rowsOfSession(
  rows: readonly AttendanceRow[],
  session: SessionRef,
): AttendanceRow[] {
  return rows.filter(
    (row) =>
      row.classId === session.classId &&
      row.sessionDate === session.date &&
      row.startTime === session.startTime,
  )
}

/** Buổi đã điểm danh khi mọi học sinh mong đợi đều có dòng. */
export function isSessionComplete(
  rows: readonly AttendanceRow[],
  session: SessionRef,
  expectedStudentIds: readonly number[],
): boolean {
  if (expectedStudentIds.length === 0) return false
  const present = new Set(rowsOfSession(rows, session).map((row) => row.studentId))
  return expectedStudentIds.every((studentId) => present.has(studentId))
}

export type AttendanceRatio = {
  complete: number
  total: number
}

/** Tỉ lệ buổi đã điểm danh trên tổng số buổi — tử và mẫu đều do đây quyết định. */
export function attendanceRatio(
  rows: readonly AttendanceRow[],
  sessions: readonly SessionRef[],
  expectedStudentIds: readonly number[],
): AttendanceRatio {
  let complete = 0
  for (const session of sessions) {
    if (isSessionComplete(rows, session, expectedStudentIds)) complete += 1
  }
  return { complete, total: sessions.length }
}

/** Số buổi học sinh có mặt trên tổng số buổi của em — cột đếm dạng 22/30. */
export function studentAttendance(
  rows: readonly AttendanceRow[],
  studentId: number,
): { present: number; total: number } {
  const mine = rows.filter((row) => row.studentId === studentId)
  return {
    present: mine.filter((row) => row.status === 'present').length,
    total: mine.length,
  }
}
