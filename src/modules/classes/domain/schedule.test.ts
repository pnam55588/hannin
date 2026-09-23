import { describe, expect, it } from 'vitest'
import { sessionsBetween, sessionsInPeriod, versionAt, type ScheduleVersion } from './schedule'

// Lịch lớp 4A: T2-T4-T6 lúc 08:00, từ 01/09/2026.
const v1: ScheduleVersion = {
  effectiveFrom: '2026-09-01',
  slots: [
    { weekday: 1, startTime: '08:00:00' },
    { weekday: 3, startTime: '08:00:00' },
    { weekday: 5, startTime: '08:00:00' },
  ],
}

describe('AD-3 — buổi suy ra từ lịch', () => {
  it('không có buổi trước mốc hiệu lực đầu tiên', () => {
    expect(sessionsBetween([v1], 1, '2026-08-01', '2026-08-31')).toEqual([])
    expect(versionAt([v1], '2026-08-31')).toBeNull()
  })

  it('sinh đúng các buổi theo thứ', () => {
    // Tuần 07/09 (T2) tới 13/09 (CN) có T2, T4, T6.
    const sessions = sessionsBetween([v1], 1, '2026-09-07', '2026-09-13')
    expect(sessions.map((s) => s.date)).toEqual(['2026-09-07', '2026-09-09', '2026-09-11'])
    expect(sessions.every((s) => s.startTime === '08:00:00')).toBe(true)
    expect(sessions.every((s) => s.classId === 1)).toBe(true)
  })

  it('sửa lịch là thêm phiên bản mới, quá khứ giữ nguyên', () => {
    // Từ 01/10 đổi sang T3-T5 lúc 09:30.
    const v2: ScheduleVersion = {
      effectiveFrom: '2026-10-01',
      slots: [
        { weekday: 2, startTime: '09:30:00' },
        { weekday: 4, startTime: '09:30:00' },
      ],
    }
    const versions = [v1, v2]

    // Ngày 30/09 vẫn theo lịch cũ.
    expect(versionAt(versions, '2026-09-30')).toBe(v1)
    // Ngày 01/10 theo lịch mới.
    expect(versionAt(versions, '2026-10-01')).toBe(v2)

    // Buổi của tháng 9 không đổi sau khi thêm phiên bản tháng 10.
    const sept = sessionsBetween(versions, 1, '2026-09-07', '2026-09-13')
    expect(sept.map((s) => s.date)).toEqual(['2026-09-07', '2026-09-09', '2026-09-11'])

    // Tháng 10 theo lịch mới: 06/10 là Thứ Ba, 08/10 là Thứ Năm.
    const oct = sessionsBetween(versions, 1, '2026-10-05', '2026-10-11')
    expect(oct.map((s) => s.date)).toEqual(['2026-10-06', '2026-10-08'])
    expect(oct.every((s) => s.startTime === '09:30:00')).toBe(true)
  })

  it('đếm được số buổi của một kỳ, dùng làm mẫu số cho AD-5', () => {
    const sessions = sessionsInPeriod([v1], 1, '2026-09')
    // Tháng 9/2026 có các ngày T2/T4/T6: đếm để làm mẫu số.
    expect(sessions.length).toBeGreaterThan(10)
    expect(sessions.every((s) => s.date.startsWith('2026-09'))).toBe(true)
  })

  it('khoảng ngày đảo ngược trả về rỗng thay vì lặp vô hạn', () => {
    expect(sessionsBetween([v1], 1, '2026-09-30', '2026-09-01')).toEqual([])
  })
})
