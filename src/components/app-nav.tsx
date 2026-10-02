'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Brand } from '@/components/brand'

const NAV = [
  { href: '/dashboard', label: 'Tổng quan', icon: 'home' },
  { href: '/students', label: 'Học sinh', icon: 'people' },
  { href: '/classes', label: 'Lịch học', icon: 'calendar' },
  { href: '/attendance', label: 'Điểm danh', icon: 'check' },
  { href: '/tuition', label: 'Học phí & Thu nhập', icon: 'money' },
  { href: '/comments', label: 'Nhận xét', icon: 'message' },
  { href: '/reports', label: 'Báo cáo', icon: 'chart' },
] as const

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
    check: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 3 3 5-6"/></>,
    money: <><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h1m12 6h1"/></>,
    message: <><path d="M4 4h16v13H8l-4 3z"/><path d="M8 9h8m-8 4h6"/></>,
    chart: <><path d="M4 20V4m0 16h17M8 16v-4m5 4V7m5 9v-6"/></>,
  }
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export function AppNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return <nav aria-label="Điều hướng chính" className="space-y-1">{NAV.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
    return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl border-l-4 px-3 text-sm font-semibold transition ${active ? 'border-coral bg-coral-100 text-coral-700' : 'border-transparent text-navy hover:bg-coral-100'}`}>
      <NavIcon name={item.icon} />{item.label}</Link>
  })}</nav>
}

export function AppShell({ children, signOutAction }: { children: React.ReactNode; signOutAction: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  const pathname = usePathname()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panel.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); return }
      if (event.key !== 'Tab') return
      const items = [...(panel.current?.querySelectorAll<HTMLElement>('a, button') ?? [])]
      if (!items.length) return
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus() }
      if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [open])
  const menu = (close?: () => void) => <><div className="mb-5 rounded-xl bg-white p-3"><Brand compact /></div>
    <AppNav onNavigate={close} /><div className="mt-8 border-t border-line pt-4">
      <Link href="/account" onClick={close} className="flex min-h-11 items-center px-3 text-sm font-semibold text-navy">Tài khoản</Link>
      <form action={signOutAction}><button type="submit" className="min-h-11 px-3 text-sm font-semibold text-navy">Đăng xuất</button></form>
    </div></>
  return <div className="min-h-screen lg:flex">
    <aside className="hidden w-[248px] shrink-0 border-r border-line bg-sidebar p-4 lg:block">{menu()}</aside>
    <div className="min-w-0 flex-1">
      <header className="flex min-h-16 items-center gap-4 border-b border-line bg-sidebar px-4 lg:hidden">
        <button ref={trigger} type="button" aria-label="Mở menu" aria-expanded={open} onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-lg border border-line text-navy">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button><Image src="/favicon.png" alt="" aria-hidden="true" width={36} height={36} />
        <span className="min-w-0 text-sm font-bold text-navy">Haninn English Class</span>
      </header>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Đóng menu" onClick={() => { setOpen(false); trigger.current?.focus() }} className="absolute inset-0 w-full bg-navy/40" />
        <aside ref={panel} role="dialog" aria-modal="true" aria-label="Menu" className="relative h-full w-[min(320px,88vw)] overflow-y-auto bg-sidebar p-4 shadow-xl">
          <button type="button" aria-label="Đóng menu" onClick={() => { setOpen(false); trigger.current?.focus() }} className="mb-3 flex size-11 items-center justify-center rounded-lg border border-line text-navy"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l14 14M19 5 5 19" /></svg></button>
          {menu(() => { setOpen(false); trigger.current?.focus() })}</aside></div>}
      <main id="noi-dung" className="app-content">{children}</main>
    </div>
  </div>
}
