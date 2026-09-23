'use server'

import { AuthError } from 'next-auth'
import { z } from 'zod'
import { signIn } from '@/lib/auth'

export type LoginState = { error: string | null }

const schema = z.object({
  email: z.string().min(1, 'Nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Nhập mật khẩu'),
})

/** AD-11: đầu vào được kiểm bằng schema ở biên. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }

  try {
    await signIn('credentials', { ...parsed.data, redirectTo: '/dashboard' })
    return { error: null }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email hoặc mật khẩu không đúng' }
    }
    // Lỗi chuyển hướng của Next phải được ném tiếp, không được nuốt.
    throw error
  }
}
