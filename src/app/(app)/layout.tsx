import { currentUser, signOut } from '@/lib/auth'
import { AppShell } from '@/components/app-nav'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (user == null) redirect('/login')

  async function signOutAction() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }
  return <AppShell signOutAction={signOutAction}>{children}</AppShell>
}
