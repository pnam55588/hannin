import type { NextAuthConfig } from 'next-auth'

/**
 * AD-10: phần cấu hình an toàn với Edge, dùng cho middleware.
 *
 * Middleware chạy ở Edge nên KHÔNG được chạm cơ sở dữ liệu — vì vậy file này
 * không import Drizzle và không khai provider. Provider nằm ở `lib/auth/index.ts`.
 * Phiên dùng chiến lược JWT, nên bảng user không phải nơi lưu phiên.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user)
    },
  },
} satisfies NextAuthConfig
