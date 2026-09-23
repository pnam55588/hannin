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

const get = async (p) => (await fetch(base + p, { headers: { cookie: cookie() } })).text()
const attr = (tag, key) => { const m = new RegExp(key + '="([^"]*)"').exec(tag); return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : null }
const formAt = (html, marker) => {
  const at = html.indexOf(marker)
  if (at < 0) return null
  return html.slice(html.lastIndexOf('<form', at), html.indexOf('</form>', at))
}
const fill = (formHtml, overrides) => {
  const fd = new FormData()
  for (const tag of [...formHtml.matchAll(/<input\b[^>]*>/g)].map((t) => t[0])) {
    const n = attr(tag, 'name')
    if (n !== null) fd.set(n, attr(tag, 'value') ?? '')
  }
  for (const sel of formHtml.matchAll(/<select[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
    const opt = /<option[^>]*value="([^"]*)"/.exec(sel[2])
    if (opt) fd.set(sel[1], opt[1])
  }
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v)
  return fd
}

// --- CAP-5: ghi mot khoan thu (duong tien) ---
const t1 = await get('/tuition')
const payForm = formAt(t1, 'name="amount"')
console.log('tim thay form ghi khoan thu:', payForm !== null)
if (payForm !== null) {
  const fd = fill(payForm, { amount: '123000' })
  const res = await fetch(base + '/tuition', { method: 'POST', headers: { cookie: cookie(), origin: base }, body: fd, redirect: 'manual' })
  console.log('ghi khoan thu 123.000 ->', res.status)
  const t2 = await get('/tuition')
  console.log('doc lai thay so tien 123.000 tren /tuition:', t2.includes('123.000'))
}

// --- CAP-7: xuat Excel ---
const rp = await get('/reports')
const links = [...new Set([...rp.matchAll(/href="([^"]*api\/reports[^"]*)"/g)].map((x) => x[1].replace(/&amp;/g, '&')))]
console.log('link bao cao tren trang:', links.join(' | ') || '(khong thay)')
for (const l of links.slice(0, 3)) {
  const r = await fetch(l.startsWith('http') ? l : base + l, { headers: { cookie: cookie() } })
  const buf = new Uint8Array(await r.arrayBuffer())
  const zip = buf[0] === 0x50 && buf[1] === 0x4b
  console.log('  ' + l + ' -> ' + r.status + ' | ' + (r.headers.get('content-type') ?? '?') + ' | file xlsx that: ' + zip + ' | ' + buf.length + ' byte')
}