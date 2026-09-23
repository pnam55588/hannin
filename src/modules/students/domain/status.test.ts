import { describe, expect, it } from 'vitest'
import { studentStatus, studentStatusLabel, isEnrolledInPeriod } from './status'

const today = '2026-09-23'

describe('AD-16 — vòng đời học sinh', () => {
  it('trạng thái suy ra từ hai mốc ngày, không lưu thành cột', () => {
    expect(studentStatus({ startedOn: '2026-09-01', leftOn: null }, today)).toBe('active')
    expect(studentStatus({ startedOn: '2026-10-01', leftOn: null }, today)).toBe('not_started')
    expect(studentStatus({ startedOn: '2026-01-01', leftOn: '2026-09-01' }, today)).toBe('left')
  })

  it('ngày nghỉ trong tương lai thì vẫn đang học', () => {
    expect(studentStatus({ startedOn: '2026-01-01', leftOn: '2026-12-31' }, today)).toBe('active')
  })

  it('nhãn hiển thị đúng tiếng Việt, khớp cột Trạng thái trong ảnh khách gửi', () => {
    expect(studentStatusLabel('active')).toBe('Đang học')
    expect(studentStatusLabel('not_started')).toBe('Chưa bắt đầu')
    expect(studentStatusLabel('left')).toBe('Đã nghỉ')
  })

  it('thuộc lớp trong kỳ hay không dùng cùng luật với AD-5', () => {
    expect(isEnrolledInPeriod({ startedOn: '2026-01-01', leftOn: null }, '2026-09')).toBe(true)
    expect(isEnrolledInPeriod({ startedOn: '2026-10-01', leftOn: null }, '2026-09')).toBe(false)
    expect(isEnrolledInPeriod({ startedOn: '2026-01-01', leftOn: '2026-08-31' }, '2026-09')).toBe(
      false,
    )
  })
})
