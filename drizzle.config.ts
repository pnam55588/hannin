import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

// AD-15: migration chạy có kiểm soát. Dùng DIRECT_URL khi có, vì migration
// cần một kết nối ổn định chứ không cần pooler.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!url) {
  throw new Error('Thiếu DIRECT_URL hoặc DATABASE_URL. Sao chép .env.example thành .env rồi điền.')
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
  strict: true,
  verbose: true,
})
