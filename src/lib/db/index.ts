import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const url = process.env.DATABASE_URL

if (!url) {
  throw new Error(
    'Thiếu DATABASE_URL. Sao chép .env.example thành .env rồi điền chuỗi kết nối.',
  )
}

// AD-15: dùng session pooler cổng 5432. `prepare: false` để an toàn nếu chuỗi
// kết nối bị đổi sang transaction pooler — không có prepared statement thì
// không vỡ. AD-7: đây là pool kết nối, không phải cache kết quả tính toán.
const globalForDb = globalThis as unknown as { __hanninSql?: ReturnType<typeof postgres> }

const sql =
  globalForDb.__hanninSql ??
  postgres(url, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__hanninSql = sql
}

export const db = drizzle(sql, { schema })
export { schema }
