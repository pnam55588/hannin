'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Nhãn tiếng Việt là bản dịch của tên module — xem bảng Conventions của spine. */
const NAV = [
  { href: '/dashboard', label: 'Tổng quan' },
  { href: '/students', label: 'Học sinh' },
  { href: '/classes', label: 'Lịch học' },
  { href: '/attendance', label: 'Điểm danh' },
  { href: '/tuition', label: 'Học phí & Thu nhập' },
  { href: '/comments', label: 'Nhận xét' },
  { href: '/reports', label: 'Báo cáo' },
] as const

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? 'block rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white'
                : 'block rounded-lg px-3 py-2 text-sm font-medium text-navy-100 transition hover:bg-navy-700 hover:text-white'
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
