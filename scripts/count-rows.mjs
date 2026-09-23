import { readFileSync } from 'node:fs'
import postgres from 'postgres'
const env = readFileSync('.secrets/supabase.env', 'utf8')
const url = /DATABASE_URL=(\S+)/.exec(env)?.[1]
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} })
const tables = ['users','classes','schedule_slots','students','tuition_rates','due_date_rules','attendance','payments','comments']
for (const t of tables) {
  const rows = await sql.unsafe('select count(*)::int as n from ' + t)
  console.log('  ' + t.padEnd(16) + rows[0].n)
}
const sample = await sql.unsafe('select full_name, class_id, started_on, left_on from students order by id limit 3')
console.log('  vi du hoc sinh:', sample.map((r) => r.full_name).join(', '))
const periods = await sql.unsafe('select distinct period from payments order by period')
console.log('  ky co phieu thu:', periods.map((r) => r.period).join(', '))
await sql.end()