import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // AD-1: lõi domain thuần. Không bật thử nghiệm gì thêm cho tới khi cần.
  reactStrictMode: true,
  // exceljs là gói CommonJS, cần để Next biên dịch phía server thay vì đóng gói.
  serverExternalPackages: ['exceljs'],
}

export default nextConfig
