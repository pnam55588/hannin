import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { authConfig } from './config'
import { hashPassword, verifyPassword } from './password'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/**
 * AD-10: Auth.js với credentials và bảng user là cơ chế xác thực DUY NHẤT.
 * Không có vai trò, không có phân quyền, không có cơ chế thứ hai.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const [owner] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1)

        if (owner === undefined) return null

        const ok = await verifyPassword(parsed.data.password, owner.passwordHash)
        if (!ok) return null

        return { id: String(owner.id), email: owner.email, name: owner.name }
      },
    }),
  ],
})

/**
 * AD-10: cửa kiểm phiên duy nhất, gọi ở đầu mọi Server Action.
 * Không có requireRole, không có kiểm tra phân quyền — chỉ có đăng nhập hoặc không.
 */
export async function requireUser() {
  const session = await auth()
  if (session?.user == null) redirect('/login')
  return session.user
}

export async function currentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * AD-10: đổi mật khẩu là việc duy nhất người dùng làm được với tài khoản của
 * mình. Bắt buộc nhập mật khẩu hiện tại — nếu không, một phiên bị bỏ quên trên
 * máy chung là đủ để chiếm tài khoản.
 */
export async function changeOwnPassword(input: {
  email: string
  currentPassword: string
  newPassword: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const [owner] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)

  if (owner === undefined) return { ok: false, error: 'Không tìm thấy tài khoản' }

  const matches = await verifyPassword(input.currentPassword, owner.passwordHash)
  if (!matches) return { ok: false, error: 'Mật khẩu hiện tại không đúng' }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(input.newPassword) })
    .where(eq(users.id, owner.id))

  return { ok: true }
}
