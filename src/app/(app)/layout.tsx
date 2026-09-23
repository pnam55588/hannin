import { currentUser, signOut } from '@/lib/auth'
import { AppNav } from '@/components/app-nav'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (user == null) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col justify-between bg-navy-700 px-3 py-5">
        <div>
          <div className="mb-6 px-3">
            <p className="text-lg font-bold text-white">Haninn</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-coral">
              ENGLISH CLASS
            </p>
          </div>
          <AppNav />
        </div>

        <div className="space-y-2 px-3">
          <a href="/account" className="block text-xs text-navy-100 hover:text-white">
            Tài khoản
          </a>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button type="submit" className="text-xs text-navy-100 hover:text-white">
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto px-8 py-6">{children}</main>
    </div>
  )
}
