import { config } from 'dotenv'

config({ path: '.env.local' })
config()

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
  attendance,
  classes,
  comments,
  dueDateRules,
  payments,
  scheduleSlots,
  students,
  tuitionRates,
} from '../src/lib/db/schema'

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (url === undefined || url === '') {
  console.error('Thiếu DATABASE_URL (hoặc DIRECT_URL).')
  process.exit(1)
}

/**
 * Xoá sạch dữ liệu nghiệp vụ. KHÔNG đụng tới bảng users nên vẫn đăng nhập được.
 * Từ chối chạy trên production: đây là công cụ của máy phát triển.
 */
if (process.env.NODE_ENV === 'production' && process.env.FORCE_RESET !== '1') {
  console.error('Từ chối xoá dữ liệu khi NODE_ENV=production. Đặt FORCE_RESET=1 nếu thật sự muốn.')
  process.exit(1)
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} })
const db = drizzle(client)

try {
  // Thứ tự xoá đi ngược chiều khoá ngoại. Không dùng CASCADE để nếu có bảng
  // nào bị bỏ sót thì lỗi hiện ra ngay thay vì xoá lây.
  await db.delete(attendance)
  await db.delete(payments)
  await db.delete(comments)
  await db.delete(tuitionRates)
  await db.delete(dueDateRules)
  await db.delete(students)
  await db.delete(scheduleSlots)
  await db.delete(classes)
  console.log('Đã xoá dữ liệu nghiệp vụ. Bảng users giữ nguyên.')
} catch (error) {
  console.error('Xoá dữ liệu thất bại:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
