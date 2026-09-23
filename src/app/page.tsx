import { redirect } from 'next/navigation'

/** Trang gốc chỉ chuyển hướng; middleware lo phần chưa đăng nhập (AD-10). */
export default function HomePage() {
  redirect('/dashboard')
}
