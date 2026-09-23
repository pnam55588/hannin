import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  attendance,
  classes,
  comments,
  dueDateRules,
  payments,
  scheduleSlots,
  students,
  tuitionRates,
} from '@/lib/db/schema'

/**
 * AD-15: job sao lưu hằng ngày.
 *
 * Vì sao bắt buộc: gói Supabase miễn phí KHÔNG có sao lưu tự động. Mất dữ liệu
 * là mất thật, không có gì để khôi phục.
 *
 * Xác thực: bằng `CRON_SECRET` trong header `Authorization: Bearer …` (Vercel cron
 * tự gửi), KHÔNG bằng phiên người dùng — đây là ngoại lệ thứ ba của AD-10/AD-11.
 *
 * Nơi lưu: Supabase Storage qua REST API. Nếu chưa cấu hình Storage thì job trả
 * lỗi rõ ràng kèm hướng dẫn, chứ không im lặng coi như đã sao lưu xong — một job
 * sao lưu thất bại trong im lặng còn tệ hơn không có job nào.
 */
export const maxDuration = 60

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret === undefined || secret === '') {
    return NextResponse.json(
      { ok: false, error: 'Chưa đặt CRON_SECRET nên job sao lưu bị từ chối.' },
      { status: 503 },
    )
  }

  const header = request.headers.get('authorization') ?? ''
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Không có quyền' }, { status: 401 })
  }

  const dump = {
    takenAt: new Date().toISOString(),
    classes: await db.select().from(classes),
    students: await db.select().from(students),
    scheduleSlots: await db.select().from(scheduleSlots),
    attendance: await db.select().from(attendance),
    tuitionRates: await db.select().from(tuitionRates),
    dueDateRules: await db.select().from(dueDateRules),
    payments: await db.select().from(payments),
    comments: await db.select().from(comments),
  }

  const body = JSON.stringify(dump)
  const fileName = `haninn-${dump.takenAt.slice(0, 10)}.json`

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_BACKUP_BUCKET ?? 'backups'

  if (supabaseUrl === undefined || serviceKey === undefined) {
    // Không nuốt lỗi: trả cả nội dung dump để còn cứu được bằng tay.
    return NextResponse.json(
      {
        ok: false,
        error:
          'Chưa cấu hình SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY nên không tải bản sao lưu lên được.',
        hint: 'Tạo bucket riêng tư tên "backups" trong Supabase Storage, rồi đặt hai biến môi trường đó.',
        dump,
      },
      { status: 503 },
    )
  }

  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${bucket}/${fileName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body,
    },
  )

  if (!response.ok) {
    const detail = await response.text()
    return NextResponse.json(
      { ok: false, error: 'Tải bản sao lưu lên Storage thất bại', detail },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, file: fileName, bytes: body.length })
}
