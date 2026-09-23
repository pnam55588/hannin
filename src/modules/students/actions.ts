'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createStudent, setStudentLeftOn, updateStudent } from '@/modules/students/public'

export type ActionState = { ok: boolean; error: string | null }

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ, cần dạng YYYY-MM-DD')

const studentSchema = z.object({
  fullName: z.string().trim().min(1, 'Nhập tên học sinh').max(80, 'Tên quá dài'),
  phone: z.string().trim().max(20, 'Số điện thoại quá dài').nullable(),
  classId: z.coerce.number().int().positive('Chọn lớp'),
  startedOn: dateField,
  leftOn: dateField.nullable(),
})

function readForm(formData: FormData) {
  const phone = formData.get('phone')
  const leftOn = formData.get('leftOn')
  return {
    fullName: formData.get('fullName'),
    phone: typeof phone === 'string' && phone.trim() !== '' ? phone : null,
    classId: formData.get('classId'),
    startedOn: formData.get('startedOn'),
    leftOn: typeof leftOn === 'string' && leftOn.trim() !== '' ? leftOn : null,
  }
}

export async function createStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = studentSchema.safeParse(readForm(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }
  if (parsed.data.leftOn !== null && parsed.data.leftOn < parsed.data.startedOn) {
    return { ok: false, error: 'Ngày nghỉ phải sau ngày bắt đầu' }
  }

  try {
    await createStudent(parsed.data)
  } catch {
    return { ok: false, error: 'Không lưu được học sinh' }
  }
  revalidatePath('/students')
  revalidatePath('/dashboard')
  revalidatePath('/tuition')
  return { ok: true, error: null }
}

export async function updateStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = z
    .object({ id: z.coerce.number().int().positive() })
    .and(studentSchema)
    .safeParse({ ...readForm(formData), id: formData.get('id') })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }
  if (parsed.data.leftOn !== null && parsed.data.leftOn < parsed.data.startedOn) {
    return { ok: false, error: 'Ngày nghỉ phải sau ngày bắt đầu' }
  }

  try {
    await updateStudent(parsed.data)
  } catch {
    return { ok: false, error: 'Không lưu được thay đổi' }
  }
  revalidatePath('/students')
  revalidatePath(`/students/${parsed.data.id}`)
  revalidatePath('/tuition')
  return { ok: true, error: null }
}

/** AD-16: kết thúc học là ghi ngày nghỉ; dữ liệu tiền của các tháng cũ giữ nguyên. */
export async function endStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = z
    .object({
      id: z.coerce.number().int().positive(),
      leftOn: dateField,
    })
    .safeParse({ id: formData.get('id'), leftOn: formData.get('leftOn') })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }

  await setStudentLeftOn(parsed.data.id, parsed.data.leftOn)
  revalidatePath('/students')
  revalidatePath(`/students/${parsed.data.id}`)
  revalidatePath('/tuition')
  return { ok: true, error: null }
}

export async function reopenStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = z
    .object({ id: z.coerce.number().int().positive() })
    .safeParse({ id: formData.get('id') })

  if (!parsed.success) return { ok: false, error: 'Dữ liệu không hợp lệ' }

  await setStudentLeftOn(parsed.data.id, null)
  revalidatePath('/students')
  revalidatePath(`/students/${parsed.data.id}`)
  return { ok: true, error: null }
}
