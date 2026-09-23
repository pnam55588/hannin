'use client'

import { useActionState } from 'react'
import { Field, FormStatus, SelectField, SubmitButton } from '@/components/form-kit'
import { businessToday } from '@/lib/clock'
import {
  createStudentAction,
  endStudentAction,
  reopenStudentAction,
  updateStudentAction,
  type ActionState,
} from '@/modules/students/actions'

const empty: ActionState = { ok: false, error: null }

type ClassOption = { id: number; name: string }

export function StudentForm({
  classes,
  defaultClassId,
}: {
  classes: ClassOption[]
  defaultClassId?: number
}) {
  const [state, action, pending] = useActionState(createStudentAction, empty)
  const today = businessToday()

  return (
    <form action={action} className="space-y-3">
      <Field label="Tên học sinh" name="fullName" required placeholder="Nguyễn Minh Anh" />
      <Field label="Số điện thoại" name="phone" placeholder="09xx xxx xxx" />
      <SelectField
        label="Lớp"
        name="classId"
        required
        defaultValue={defaultClassId === undefined ? undefined : String(defaultClassId)}
        options={classes.map((klass) => ({ value: String(klass.id), label: klass.name }))}
      />
      <Field
        label="Bắt đầu học từ"
        name="startedOn"
        type="date"
        required
        defaultValue={today}
        hint="Dùng để chia học phí tháng lệch — tính từ ngày này."
      />
      <Field label="Ngày nghỉ (nếu đã nghỉ)" name="leftOn" type="date" />
      <FormStatus error={state.error} />
      <SubmitButton pending={pending}>Thêm học sinh</SubmitButton>
    </form>
  )
}

export function StudentEditForm({
  student,
  classes,
}: {
  student: {
    id: number
    fullName: string
    phone: string | null
    classId: number
    startedOn: string
    leftOn: string | null
  }
  classes: ClassOption[]
}) {
  const [state, action, pending] = useActionState(updateStudentAction, empty)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={student.id} />
      <Field label="Tên học sinh" name="fullName" defaultValue={student.fullName} required />
      <Field label="Số điện thoại" name="phone" defaultValue={student.phone ?? ''} />
      <SelectField
        label="Lớp"
        name="classId"
        required
        defaultValue={String(student.classId)}
        options={classes.map((klass) => ({ value: String(klass.id), label: klass.name }))}
      />
      <Field label="Bắt đầu học từ" name="startedOn" type="date" defaultValue={student.startedOn} required />
      <Field label="Ngày nghỉ" name="leftOn" type="date" defaultValue={student.leftOn ?? ''} />
      <FormStatus error={state.error} />
      <SubmitButton pending={pending}>Lưu thay đổi</SubmitButton>
    </form>
  )
}

/** AD-16: kết thúc học là ghi ngày nghỉ — không có nút xoá học sinh. */
export function EndStudentForm({ studentId, leftOn }: { studentId: number; leftOn: string | null }) {
  const [state, action, pending] = useActionState(endStudentAction, empty)
  const [reopenState, reopenAction, reopenPending] = useActionState(reopenStudentAction, empty)

  if (leftOn !== null) {
    return (
      <form action={reopenAction} className="space-y-3">
        <input type="hidden" name="id" value={studentId} />
        <p className="text-sm text-muted">
          Học sinh đã nghỉ từ {leftOn}. Dữ liệu học phí và điểm danh của các tháng cũ vẫn giữ nguyên.
        </p>
        <FormStatus error={reopenState.error} />
        <SubmitButton pending={reopenPending}>Cho học lại</SubmitButton>
      </form>
    )
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={studentId} />
      <Field
        label="Ngày nghỉ"
        name="leftOn"
        type="date"
        required
        defaultValue={businessToday()}
        hint="Học sinh sẽ tính là đã nghỉ từ ngày này. Không xoá dữ liệu."
      />
      <FormStatus error={state.error} />
      <SubmitButton pending={pending} tone="coral">
        Ghi nhận nghỉ học
      </SubmitButton>
    </form>
  )
}
