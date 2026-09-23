'use server'

import { z } from 'zod'
import { changeOwnPassword, requireUser } from '@/lib/auth'

export type ActionState = { ok: boolean; error: string | null; message: string | null }

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải từ 8 ký tự')
      .max(72, 'Mật khẩu quá dài'),
    confirmPassword: z.string().min(1, 'Nhập lại mật khẩu mới'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Hai lần nhập mật khẩu mới không khớp',
  })

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const parsed = schema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', message: null }
  }
  if (user.email == null) {
    return { ok: false, error: 'Phiên đăng nhập không hợp lệ', message: null }
  }

  const result = await changeOwnPassword({
    email: user.email,
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.newPassword,
  })

  if (!result.ok) return { ok: false, error: result.error, message: null }
  return { ok: true, error: null, message: 'Đã đổi mật khẩu' }
}
