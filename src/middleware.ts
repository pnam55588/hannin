import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

/**
 * AD-10: middleware chỉ làm một việc — chuyển người chưa đăng nhập về /login.
 * Nó chạy ở Edge nên cấu hình phải an toàn với Edge, xem `lib/auth/config.ts`.
 *
 * Ba ngoại lệ được kể tên, khớp AD-10 và AD-11:
 *   /api/auth/*   — Auth.js sở hữu, chính là route dùng để lấy phiên
 *   /api/jobs/*   — job sao lưu, xác thực bằng secret riêng
 *   /login        — trang công khai
 */
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/((?!api/auth|api/jobs|login|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
