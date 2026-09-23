import { config } from 'dotenv'

config({ path: '.env.local' })
config()

import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from '../src/lib/db/schema'
import { hashPassword } from '../src/lib/auth/password'

/**
 * Tạo hoặc cập nhật tài khoản chủ lớp từ biến môi trường.
 *
 * Chạy được cả trên production vì chỉ đụng bảng users. Đây là bước bắt buộc sau
 * khi migration xong, nếu không thì không ai đăng nhập được.
 */
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
const email = process.env.OWNER_EMAIL
const password = process.env.OWNER_PASSWORD
const name = process.env.OWNER_NAME ?? 'Chủ lớp'

if (url === undefined || email === undefined || password === undefined || password === '') {
  console.error('Cần DATABASE_URL, OWNER_EMAIL và OWNER_PASSWORD.')
  process.exit(1)
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} })
const db = drizzle(client)

try {
  const passwordHash = await hashPassword(password)
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (existing === undefined) {
    await db.insert(users).values({ email, passwordHash, name })
    console.log(`Đã tạo tài khoản ${email}.`)
  } else {
    await db.update(users).set({ passwordHash, name }).where(eq(users.id, existing.id))
    console.log(`Đã cập nhật mật khẩu cho ${email}.`)
  }
} catch (error) {
  console.error('Không tạo được tài khoản:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
