import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haninn English Class',
  description: 'Quản lý lớp học Haninn — điểm danh, học phí, nhận xét',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
