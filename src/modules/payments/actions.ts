'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { businessToday } from '@/lib/clock'
import { dateField, integerMoney, periodField } from '@/lib/validation'
import { recordAdjustment, recordPayment } from '@/modules/payments/public'

export type ActionState = { ok: boolean; error: string | null }

export type PaymentActionState = { ok: boolean; error: string | null; message: string | null }

const paymentAmount = integerMoney().refine(
  (value) => value > 0,
  'Số tiền thu phải lớn hơn 0',
)

const adjustmentAmount = integerMoney({ allowNegative: true }).refine(
  (value) => value < 0,
  'Số điều chỉnh phải là số âm',
)

const paymentSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  period: periodField,
  amount: paymentAmount,
  paidOn: dateField,
  note: z.string().trim().max(200, 'Ghi chú quá dài').nullable(),
})

const adjustmentSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  period: periodField,
  amount: adjustmentAmount,
  paidOn: dateField,
  note: z.string().trim().max(200, 'Ghi chú quá dài').nullable(),
})

function readForm(formData: FormData) {
  const note = formData.get('note')
  return {
    studentId: formData.get('studentId'),
    period: formData.get('period'),
    amount: formData.get('amount'),
    paidOn: formData.get('paidOn') ?? businessToday(),
    note: typeof note === 'string' && note.trim() !== '' ? note : null,
  }
}

/**
 * AD-9: nút "đánh dấu đã thu" ghi kỳ đang xem và ngày nghiệp vụ hôm nay.
 * Người dùng vẫn sửa được cả hai trường trước khi gửi.
 */
export async function recordPaymentAction(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  await requireUser()
  const parsed = paymentSchema.safeParse(readForm(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', message: null }
  }

  try {
    await recordPayment(parsed.data)
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Không ghi được khoản thu',
      message: null,
    }
  }

  revalidatePath('/tuition')
  revalidatePath('/dashboard')
  revalidatePath('/reports')
  revalidatePath(`/students/${parsed.data.studentId}`)
  return { ok: true, error: null, message: 'Đã ghi khoản thu' }
}

/** AD-6: sửa sai bằng dòng điều chỉnh mới, không sửa và không xoá dòng cũ. */
export async function recordAdjustmentAction(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  await requireUser()
  const parsed = adjustmentSchema.safeParse(readForm(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', message: null }
  }

  try {
    await recordAdjustment(parsed.data)
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Không ghi được điều chỉnh',
      message: null,
    }
  }

  revalidatePath('/tuition')
  revalidatePath('/dashboard')
  revalidatePath('/reports')
  return { ok: true, error: null, message: 'Đã ghi điều chỉnh' }
}
