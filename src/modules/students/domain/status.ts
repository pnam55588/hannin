/**
 * Vòng đời học sinh.
 *
 * AD-16 nói trạng thái là tập giá trị đóng gồm chưa bắt đầu, đang học và đã nghỉ,
 * đi kèm mốc hiệu lực theo ngày. AD-7 cấm lưu số dẫn xuất, nên trạng thái KHÔNG
 * là một cột: nó suy ra từ hai mốc ngày, và hai mốc đó chính là hiệu lực.
 */

import { periodBounds } from '@/lib/clock'

export type StudentStatus = 'not_started' | 'active' | 'left'

export type StudentLifecycle = {
  startedOn: string
  leftOn: string | null
}

export function studentStatus(student: StudentLifecycle, today: string): StudentStatus {
  if (student.leftOn !== null && student.leftOn <= today) return 'left'
  if (student.startedOn > today) return 'not_started'
  return 'active'
}

export function isStudying(student: StudentLifecycle, today: string): boolean {
  return studentStatus(student, today) === 'active'
}

const STATUS_LABELS: Record<StudentStatus, string> = {
  not_started: 'Chưa bắt đầu',
  active: 'Đang học',
  left: 'Đã nghỉ',
}

export function studentStatusLabel(status: StudentStatus): string {
  return STATUS_LABELS[status]
}

/** Học sinh có thuộc lớp trong kỳ này không — dùng chung một luật với AD-5. */
export function isEnrolledInPeriod(
  student: StudentLifecycle,
  period: string,
): boolean {
  const { from, to } = periodBounds(period)
  if (student.startedOn > to) return false
  if (student.leftOn !== null && student.leftOn < from) return false
  return true
}
