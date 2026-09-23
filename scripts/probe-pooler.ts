import { config } from 'dotenv'
config({ path: '.secrets/supabase.env' })
import postgres from 'postgres'

const raw = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (raw === undefined) { console.error('khong co chuoi ket noi'); process.exit(1) }
const u = new URL(raw)
const user = decodeURIComponent(u.username)
const password = decodeURIComponent(u.password)
const database = u.pathname.replace('/', '') || 'postgres'
const ref = user.includes('.') ? user.split('.')[1] : ''

console.log('PROJECT_REF trong file:', process.env.SUPABASE_PROJECT_REF ?? '(khong co)')
console.log('REGION trong file     :', process.env.SUPABASE_REGION ?? '(khong co)')
console.log('User trong chuoi      :', user)
console.log('Host trong chuoi      :', u.hostname, 'port', u.port)
console.log('Ref tach ra           :', ref)
console.log('--- do cac vung pooler ---')

const regions = ['ap-southeast-1','ap-northeast-1','ap-northeast-2','ap-south-1','ap-southeast-2','us-east-1','us-east-2','us-west-1','us-west-2','eu-central-1','eu-west-1','eu-west-2','eu-west-3','ca-central-1','sa-east-1']
const hosts = []
for (const r of regions) {
  hosts.push('aws-0-' + r + '.pooler.supabase.com')
  hosts.push('aws-1-' + r + '.pooler.supabase.com')
}
hosts.push('db.' + ref + '.supabase.co')

let found = 0
for (const host of hosts) {
  const client = postgres({ host: host, port: 5432, username: user, password: password, database: database, max: 1, connect_timeout: 6, prepare: false, onnotice: function () {} })
  try {
    await client.unsafe('select 1 as ok')
    console.log('  OK        ' + host)
    found++
  } catch (e) {
    const cause = e && e.cause ? e.cause : e
    const detail = String(cause && cause.message ? cause.message : cause)
    if (detail.indexOf('tenant/user') !== -1 && detail.indexOf('not found') !== -1) {
      // im lang: vung nay khong co tenant
    } else {
      console.log('  KHAC      ' + host + ' -> ' + detail.slice(0, 140))
    }
  } finally {
    try { await client.end({ timeout: 1 }) } catch (e) {}
  }
}
console.log('--- xong. So host tra loi OK: ' + found + ' ---')