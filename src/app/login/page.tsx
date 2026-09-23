import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold tracking-tight text-navy">Haninn</p>
          <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-coral">
            LEARN · GROW · SUCCEED
          </p>
          <p className="mt-3 text-sm text-muted">Đăng nhập để quản lý lớp học</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
