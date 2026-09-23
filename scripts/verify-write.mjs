import { readFileSync } from 'node:fs'
const base = process.env.BASE_URL ?? 'https://hannin-theta.vercel.app'
const text = readFileSync('.secrets/owner.txt', 'utf8')
const email = /Email:\s*(\S+)/.exec(text)[1]
const password = /Mat khau:\s*(\S+)/.exec(text)[1]
const jar = []
const keep = (r) => { for (const c of r.headers.getSetCookie()) jar.push(c.split(';')[0]) }
const cookie = () => jar.join('; ')
const csrf = await fetch(base + '/api/auth/csrf'); keep(csrf)
const { csrfToken } = await csrf.json()
const login = await fetch(base + '/api/auth/callback/credentials', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookie() }, body: new URLSearchParams({ email, password, csrfToken, callbackUrl: base + '/dashboard' }), redirect: 'manual' })
keep(login)
console.log('dang nhap:', login.status)

const className = 'ZZ Kiem thu ghi ' + String(Date.now()).slice(-5)
const page = await fetch(base + '/classes', { headers: { cookie: cookie() } })
const html = await page.text()
const at = html.indexOf('name="name"')
const formStart = html.lastIndexOf('<form', at)
const formHtml = html.slice(formStart, html.indexOf('</form>', at))
const hidden = [...formHtml.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\/>/g)]
  .map((m) => [m[1], (m[2] ?? '').replace(/&quot;/g, '"').replace(/&amp;/g, '&')])
console.log('truong an cua form:', hidden.map((h) => h[0]).join(', '))

const fd = new FormData()
for (const [n, v] of hidden) fd.set(n, v)
fd.set('name', className)
const res = await fetch(base + '/classes', { method: 'POST', headers: { cookie: cookie(), origin: base }, body: fd, redirect: 'manual' })
const body = await res.text()
console.log('gui form ->', res.status, '| location:', res.headers.get('location') ?? '(khong co)')
console.log('phan hoi:', body.slice(0, 120).replace(/\s+/g, ' '))

const check = await fetch(base + '/classes', { headers: { cookie: cookie() } })
const checkHtml = await check.text()
console.log('doc lai thay lop moi:', checkHtml.includes(className))
console.log(checkHtml.includes(className) ? 'KET QUA: ghi qua Server Action THANH CONG va doc lai duoc' : 'KET QUA: chua ghi duoc')
console.log('ten lop da thu:', className)