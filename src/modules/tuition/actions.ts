'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { dateField, integerMoney } from '@/lib/validation'
import { setDueDay, setRate } from '@/modules/tuition/public'

export type ActionState = { ok: boolean; error: string | null }

const rateSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  effectiveFrom: dateField,
  amount: integerMoney(),
  discount: integerMoney(),
})

/** AD-5: thêm mốc đơn giá mới, chỉ ghi thêm, kỳ cũ không đổi. */
export async function setRateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = rateSchema.safeParse({
    studentId: formData.get('studentId'),
    effectiveFrom: formData.get('effectiveFrom'),
    amount: formData.get('amount'),
    discount: formData.get('discount') ?? '0',
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }

  try {
    await setRate(parsed.data)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Không lưu được đơn giá' }
  }

  revalidatePath('/tuition')
  revalidatePath(`/students/${parsed.data.studentId}`)
  return { ok: true, error: null }
}

/** AD-9: đặt hạn đóng cho từng học sinh, giữ nguyên cho các tháng sau. */
export async function setDueDayAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = z
    .object({
      studentId: z.coerce.number().int().positive(),
      effectiveFrom: dateField,
      dueDay: z.coerce.number().int().min(1, 'Ngày từ 1 tới 31').max(31, 'Ngày từ 1 tới 31'),
    })
    .safeParse({
      studentId: formData.get('studentId'),
      effectiveFrom: formData.get('effectiveFrom'),
      dueDay: formData.get('dueDay'),
    })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }

  try {
    await setDueDay(parsed.data)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Không lưu được hạn đóng' }
  }

  revalidatePath('/tuition')
  revalidatePath(`/students/${parsed.data.studentId}`)
  return { ok: true, error: null }
}
