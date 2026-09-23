import { readFileSync } from 'node:fs'
const base = 'https://hannin-theta.vercel.app'
const text = readFileSync('.secrets/owner.txt', 'utf8')
const email = /Email:\s*(\S+)/.exec(text)[1]
const password = /Mat khau:\s*(\S+)/.exec(text)[1]
const jar = []
const keep = (res) => { for (const c of res.headers.getSetCookie()) jar.push(c.split(';')[0]) }
const csrfRes = await fetch(base + '/api/auth/csrf')
keep(csrfRes)
const { csrfToken } = await csrfRes.json()
const login = await fetch(base + '/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: jar.join('; ') },
  body: new URLSearchParams({ email, password, csrfToken, callbackUrl: base + '/dashboard' }),
  redirect: 'manual',
})
keep(login)
console.log('dang nhap:', login.status)

const checks = [
  ['/dashboard', ['T\u1ed5ng quan']],
  ['/students', ['Minh Anh', 'Kh\u00e1nh Chi']],
  ['/classes', ['4A', '5B']],
  ['/attendance', ['\u0110i\u1ec3m danh']],
  ['/tuition', ['H\u1ecdc ph\u00ed']],
  ['/comments', ['Nh\u1eadn x\u00e9t']],
  ['/reports', ['B\u00e1o c\u00e1o']],
  ['/account', ['T\u00e0i kho\u1ea3n']],
]
for (const [path, markers] of checks) {
  const res = await fetch(base + path, { headers: { cookie: jar.join('; ') }, redirect: 'manual' })
  const html = await res.text()
  if (res.status !== 200) { console.log('  ' + path.padEnd(13) + res.status + '  <-- KHONG PHAI 200'); continue }
  const found = markers.map((m) => m + ':' + (html.includes(m) ? 'co' : 'KHONG'))
  const money = /\d\.\d{3}\.\d{3}/.test(html) ? 'co so tien dinh dang' : 'khong thay so tien'
  console.log('  ' + path.padEnd(13) + '200  ' + found.join(' ') + '  ' + money)
}
const student = await fetch(base + '/students/1', { headers: { cookie: jar.join('; ') } })
console.log('  /students/1  ' + student.status)