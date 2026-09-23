import { readFileSync } from 'node:fs'
const base = 'https://hannin-theta.vercel.app'
const env = readFileSync('.secrets/supabase.env', 'utf8')
const secret = /CRON_SECRET=(\S+)/.exec(env)?.[1]
const noAuth = await fetch(base + '/api/jobs/backup')
console.log('khong co token:', noAuth.status, '(mong doi 401)')
const bad = await fetch(base + '/api/jobs/backup', { headers: { authorization: 'Bearer sai' } })
console.log('token sai:', bad.status, '(mong doi 401)')
const good = await fetch(base + '/api/jobs/backup', { headers: { authorization: 'Bearer ' + secret } })
const body = await good.text()
console.log('token dung:', good.status)
console.log('phan hoi:', body.slice(0, 200).replace(/\s+/g, ' '))
// Phai dung redirect: 'manual'. Neu de mac dinh, fetch se di theo trang /login va
// bao 200, trong khi thuc te middleware da chan - mot phep kiem chung sai kieu do
// lam nguoi doc tuong co lo hong du lieu.
const report = await fetch(base + '/api/reports/hoc-sinh', { redirect: 'manual' })
console.log('bao cao khi chua dang nhap:', report.status, '->', report.headers.get('location'), '(mong doi 307 ve /login)')
const withToken = await fetch(base + '/api/reports/hoc-sinh', {
  redirect: 'manual',
  headers: { authorization: 'Bearer ' + secret },
})
console.log('bao cao khi co token cron:', withToken.status, '(mong doi 307 - token cron khong mo duoc bao cao)')