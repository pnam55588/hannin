import { readFileSync } from 'node:fs'
const base = process.argv[2] ?? 'https://hannin-theta.vercel.app'
const text = readFileSync('.secrets/owner.txt', 'utf8')
const email = /Email:\s*(\S+)/.exec(text)[1]
const password = /Mat khau:\s*(\S+)/.exec(text)[1]
const jar = []
const keep = (res) => { for (const c of res.headers.getSetCookie()) jar.push(c.split(';')[0]) }
const csrfRes = await fetch(base + '/api/auth/csrf')
keep(csrfRes)
const { csrfToken } = await csrfRes.json()
console.log('csrf:', csrfRes.status, csrfToken ? 'co token' : 'KHONG co token')
const body = new URLSearchParams({ email, password, csrfToken, callbackUrl: base + '/dashboard' })
const login = await fetch(base + '/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: jar.join('; ') },
  body,
  redirect: 'manual',
})
keep(login)
console.log('dang nhap:', login.status, '->', login.headers.get('location'))
const dash = await fetch(base + '/dashboard', { headers: { cookie: jar.join('; ') }, redirect: 'manual' })
console.log('dashboard voi phien:', dash.status)
if (dash.status === 200) {
  const html = await dash.text()
  console.log('thay menu Tong quan:', html.includes('T\u1ed5ng quan'))
  console.log('thay chan diem danh:', html.includes('\u0110i\u1ec3m danh'))
}
const wrong = await fetch(base + '/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ email, password: password + 'x', csrfToken, callbackUrl: base + '/dashboard' }),
  redirect: 'manual',
})
console.log('mat khau sai:', wrong.status, '->', wrong.headers.get('location'))