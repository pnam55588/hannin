import { readFileSync } from 'node:fs'
const base = 'https://hannin-theta.vercel.app'
const text = readFileSync('.secrets/owner.txt', 'utf8')
const email = /Email:\s*(\S+)/.exec(text)[1]
const password = /Mat khau:\s*(\S+)/.exec(text)[1]
const jar = []
const keep = (x) => { for (const c of x.headers.getSetCookie()) jar.push(c.split(';')[0]) }
const csrf = await fetch(base + '/api/auth/csrf'); keep(csrf)
const { csrfToken } = await csrf.json()
const login = await fetch(base + '/api/auth/callback/credentials', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: jar.join('; ') }, body: new URLSearchParams({ email, password, csrfToken, callbackUrl: base + '/dashboard' }), redirect: 'manual' })
keep(login)
for (const kind of ['students', 'income', 'debt', 'attendance']) {
  const res = await fetch(base + '/api/reports/' + kind + '?period=2026-09', { headers: { cookie: jar.join('; ') } })
  const buf = new Uint8Array(await res.arrayBuffer())
  const zip = buf[0] === 0x50 && buf[1] === 0x4b
  const name = (res.headers.get('content-disposition') ?? '').slice(0, 70)
  console.log('  ' + kind.padEnd(11) + res.status + ' | ' + (res.headers.get('content-type') ?? '?') + ' | xlsx that: ' + zip + ' | ' + buf.length + ' byte | ' + name)
}