import { config } from 'dotenv'

config({ path: '.env.local' })
config()

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

/**
 * AD-15: migration chạy trên cùng một engine ở máy và trên production.
 * Trên Supabase phải dùng DIRECT_URL (cổng 5432) — transaction pooler không
 * chạy được migration vì cần phiên ổn định.
 */
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (url === undefined || url === '') {
  console.error('Thiếu DATABASE_URL (hoặc DIRECT_URL). Điền vào .env.local trước.')
  process.exit(1)
}

/**
 * In ra đích kết nối nhưng KHÔNG in mật khẩu. Cổng 5432 là session pooler (chạy
 * được DDL và transaction), cổng 6543 là transaction pooler (không chạy được
 * migration). Nhìn cổng là biết ngay có cắm nhầm chuỗi không.
 */
function describeTarget(raw: string): string {
  try {
    const parsed = new URL(raw)
    const role = parsed.username.split('.')[0] ?? ''
    return `${parsed.hostname}:${parsed.port} · role ${role} · db ${parsed.pathname.replace('/', '')}`
  } catch {
    return '(không đọc được chuỗi kết nối)'
  }
}

console.log(`Đích migration: ${describeTarget(url)}`)

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} })

try {
  await migrate(drizzle(client), { migrationsFolder: 'drizzle' })
  console.log('Đã áp dụng migration.')
} catch (error) {
  // postgres.js giấu lỗi thật của Postgres trong `cause`; nếu chỉ in `message`
  // thì chỉ thấy "Failed query" mà không biết vì sao.
  const cause = (error as { cause?: unknown }).cause
  console.error('Migration thất bại:', error instanceof Error ? error.message : error)
  if (cause !== undefined) console.error('Nguyên nhân gốc:', cause)
  if (error instanceof Error && error.stack !== undefined) console.error(error.stack)
  process.exitCode = 1
} finally {
  await client.end()
}
