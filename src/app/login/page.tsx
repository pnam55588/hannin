import { LoginForm } from './login-form'
import { Brand } from '@/components/brand'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-[18px] border border-line bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Brand />
          <p className="mt-3 text-sm text-muted">Đăng nhập để quản lý lớp học</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
