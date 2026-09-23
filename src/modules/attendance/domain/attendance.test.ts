import { describe, expect, it } from 'vitest'
import {
  attendanceRatio,
  isSessionComplete,
  rowsOfSession,
  type AttendanceRow,
} from './attendance'

const session = { classId: 1, date: '2026-09-16', startTime: '08:00:00' }
const otherSession = { classId: 1, date: '2026-09-18', startTime: '08:00:00' }

const rows: AttendanceRow[] = [
  { studentId: 1, classId: 1, sessionDate: '2026-09-16', startTime: '08:00:00', status: 'present' },
  { studentId: 2, classId: 1, sessionDate: '2026-09-16', startTime: '08:00:00', status: 'absent' },
  { studentId: 1, classId: 1, sessionDate: '2026-09-18', startTime: '08:00:00', status: 'present' },
]

describe('AD-3 — hợp đồng điểm danh', () => {
  it('lọc đúng dòng của một buổi', () => {
    expect(rowsOfSession(rows, session).length).toBe(2)
    expect(rowsOfSession(rows, otherSession).length).toBe(1)
  })

  it('buổi đã điểm danh khi mọi học sinh đều có dòng, kể cả dòng Vắng', () => {
    expect(isSessionComplete(rows, session, [1, 2])).toBe(true)
    // Học sinh 3 chưa được ghi → buổi chưa xong.
    expect(isSessionComplete(rows, session, [1, 2, 3])).toBe(false)
    // Buổi 18/09 mới có một dòng.
    expect(isSessionComplete(rows, otherSession, [1, 2])).toBe(false)
  })

  it('lớp không có học sinh thì buổi không được coi là xong', () => {
    expect(isSessionComplete(rows, session, [])).toBe(false)
  })

  it('tỉ lệ đã điểm danh do hàm này quyết định, dùng chung cho mọi màn', () => {
    const ratio = attendanceRatio(rows, [session, otherSession], [1, 2])
    expect(ratio).toEqual({ complete: 1, total: 2 })
  })
})
