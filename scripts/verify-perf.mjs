import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'

const base = (process.env.HANINN_BASE_URL ?? 'https://hannin-theta.vercel.app').replace(/\/$/, '')
let email = process.env.HANINN_EMAIL
let password = process.env.HANINN_PASSWORD
if (!email || !password) {
  const secret = readFileSync('.secrets/owner.txt', 'utf8')
  email = /Email:\s*(\S+)/.exec(secret)?.[1]
  password = /Mat khau:\s*(\S+)/.exec(secret)?.[1]
}
if (!email || !password) throw new Error('Thiếu HANINN_EMAIL/HANINN_PASSWORD hoặc .secrets/owner.txt')

const jar = new Map()
function keep(response) {
  for (const header of response.headers.getSetCookie()) {
    const pair = header.split(';')[0]
    jar.set(pair.split('=')[0], pair)
  }
}
function cookie() { return [...jar.values()].join('; ') }

const csrf = await fetch(`${base}/api/auth/csrf`)
if (!csrf.ok) throw new Error(`Không lấy được CSRF: HTTP ${csrf.status}`)
keep(csrf)
const { csrfToken } = await csrf.json()
const login = await fetch(`${base}/api/auth/callback/credentials`, {
  method: 'POST', redirect: 'manual',
  headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookie() },
  body: new URLSearchParams({ email, password, csrfToken, callbackUrl: `${base}/dashboard` }),
})
keep(login)
if (!cookie().includes('authjs.session-token') && !cookie().includes('__Secure-authjs.session-token')) {
  throw new Error(`Đăng nhập thất bại: HTTP ${login.status}; kiểm tra thông tin chủ lớp`)
}

const routes = ['/dashboard', '/students', '/classes', '/attendance', '/tuition', '/comments', '/reports', '/account']
let failed = false
for (const path of routes) {
  const start = performance.now()
  const response = await fetch(`${base}${path}`, { headers: { cookie: cookie() }, redirect: 'manual' })
  const html = await response.text()
  const ms = Math.round(performance.now() - start)
  const budget = path === '/dashboard' ? 800 : 500
  const region = response.headers.get('x-vercel-id') ?? ''
  const ok = response.status === 200 && !html.includes('CredentialsSignin') && ms < budget && region.includes('hnd1')
  console.log(`${ok ? 'ĐẠT' : 'LỖI'} ${path}: ${ms}ms / <${budget}ms, HTTP ${response.status}, x-vercel-id=${region || 'thiếu'}`)
  if (!ok) failed = true
}
if (failed) process.exitCode = 1
