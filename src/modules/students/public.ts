/**
 * AD-2: mặt tiếp xúc duy nhất của module học sinh.
 * Module này KHÔNG biết gì về tiền và không biết gì về điểm danh — nhờ vậy nó
 * không tạo vòng import với module học phí (module học phí mới là bên cần nó).
 */

import { businessToday } from '@/lib/clock'
import {
  isEnrolledInPeriod,
  studentStatus,
  studentStatusLabel,
  type StudentStatus,
} from '@/modules/students/domain/status'
import * as queries from '@/modules/students/data/queries'

/**
 * Luật "học sinh có thuộc lớp trong kỳ này" thuộc module này vì nó là luật vòng
 * đời học sinh. Module học phí gọi qua đây thay vì tự định nghĩa lại — hai bản
 * sao của cùng một luật là cách chắc chắn nhất để hai màn hình lệch nhau.
 */
export { isEnrolledInPeriod }

export type StudentView = {
  id: number
  fullName: string
  phone: string | null
  classId: number
  className: string
  startedOn: string
  leftOn: string | null
  status: StudentStatus
  statusLabel: string
}

function toView(row: queries.StudentRow, today: string): StudentView {
  const lifecycle = { startedOn: row.startedOn, leftOn: row.leftOn }
  const status = studentStatus(lifecycle, today)
  return { ...row, status, statusLabel: studentStatusLabel(status) }
}

export async function listStudents(
  options: { classId?: number; today?: string } = {},
): Promise<StudentView[]> {
  const today = options.today ?? businessToday()
  const rows = await queries.selectStudents(options.classId)
  return rows.map((row) => toView(row, today))
}

export async function getStudent(id: number, today: string = businessToday()): Promise<StudentView | null> {
  const row = await queries.selectStudentById(id)
  return row === null ? null : toView(row, today)
}

/** Danh sách lớp của học sinh, dùng cho ô chọn lớp khi thêm và sửa. */
export async function studentsOfClass(classId: number, today?: string): Promise<StudentView[]> {
  return listStudents({ classId, ...(today === undefined ? {} : { today }) })
}

export async function createStudent(input: {
  fullName: string
  phone: string | null
  classId: number
  startedOn: string
}): Promise<{ id: number }> {
  return queries.insertStudent({
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() === '' ? null : input.phone,
    classId: input.classId,
    startedOn: input.startedOn,
  })
}

export async function updateStudent(input: {
  id: number
  fullName: string
  phone: string | null
  classId: number
  startedOn: string
  leftOn: string | null
}): Promise<void> {
  await queries.updateStudentRow(input.id, {
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() === '' ? null : input.phone,
    classId: input.classId,
    startedOn: input.startedOn,
    leftOn: input.leftOn,
  })
}

/** Ghi hoặc xoá ngày nghỉ. Không có xoá cứng (AD-16). */
export async function setStudentLeftOn(id: number, leftOn: string | null): Promise<void> {
  await queries.setLeftOn(id, leftOn)
}
