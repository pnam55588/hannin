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
const report = await fetch(base + '/api/reports/hoc-sinh', { headers: { authorization: 'Bearer ' + secret } })
console.log('bao cao khi chua dang nhap:', report.status, '(mong doi 401 hoac 307)')