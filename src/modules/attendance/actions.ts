'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { saveSession } from '@/modules/attendance/public'

export type ActionState = { ok: boolean; error: string | null; message: string | null }

const schema = z.object({
  classId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Giờ không hợp lệ'),
})

/**
 * AD-11: điểm danh là một Server Action. Trường `mark-<studentId>` mang giá trị
 * `present` hoặc `absent`; học sinh không được chọn thì bị bỏ qua (chưa điểm danh).
 */
export async function saveAttendanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()

  const parsed = schema.safeParse({
    classId: formData.get('classId'),
    date: formData.get('date'),
    startTime: formData.get('startTime'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', message: null }
  }

  const marks: { studentId: number; status: 'present' | 'absent' }[] = []
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('mark-') || typeof value !== 'string') continue
    if (value !== 'present' && value !== 'absent') continue
    marks.push({ studentId: Number(key.slice(5)), status: value })
  }

  try {
    await saveSession({
      classId: parsed.data.classId,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      marks,
    })
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Không lưu được điểm danh',
      message: null,
    }
  }

  revalidatePath('/attendance')
  revalidatePath('/dashboard')
  revalidatePath('/reports')
  return { ok: true, error: null, message: 'Đã lưu điểm danh' }
}
