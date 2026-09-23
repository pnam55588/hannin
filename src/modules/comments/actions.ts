'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { saveComment } from '@/modules/comments/public'

export type ActionState = { ok: boolean; error: string | null; message: string | null }

const schema = z.object({
  studentId: z.coerce.number().int().positive(),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Kỳ không hợp lệ'),
  body: z.string().trim().max(2000, 'Nhận xét quá dài').nullable(),
})

export async function saveCommentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const body = formData.get('body')
  const parsed = schema.safeParse({
    studentId: formData.get('studentId'),
    period: formData.get('period'),
    body: typeof body === 'string' && body.trim() !== '' ? body : null,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', message: null }
  }
  if (parsed.data.body === null) {
    return { ok: false, error: 'Nhập nội dung nhận xét', message: null }
  }

  try {
    await saveComment({
      studentId: parsed.data.studentId,
      period: parsed.data.period,
      body: parsed.data.body,
    })
  } catch {
    return { ok: false, error: 'Không lưu được nhận xét', message: null }
  }

  revalidatePath('/comments')
  revalidatePath(`/students/${parsed.data.studentId}`)
  return { ok: true, error: null, message: 'Đã lưu nhận xét' }
}
