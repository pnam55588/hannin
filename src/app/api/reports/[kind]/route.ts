import { NextResponse } from 'next/server'
import { currentPeriod } from '@/lib/clock'
import { currentUser } from '@/lib/auth'
import { toXlsx } from '@/modules/reports/excel'
import { buildReport, isReportKind } from '@/modules/reports/public'

/**
 * AD-11: ngoại lệ 2 — xuất tệp không thể là Server Action vì phải trả về tệp nhị phân.
 * Vì là ngoại lệ nên nó tự kiểm phiên, không dựa vào middleware.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const user = await currentUser()
  if (user == null) return new NextResponse('Chưa đăng nhập', { status: 401 })

  const { kind } = await context.params
  if (!isReportKind(kind)) return new NextResponse('Loại báo cáo không hợp lệ', { status: 404 })

  const url = new URL(request.url)
  const period = url.searchParams.get('period') ?? currentPeriod()
  const fromPeriod = url.searchParams.get('fromPeriod') ?? period
  const toPeriod = url.searchParams.get('toPeriod') ?? period

  const table = await buildReport(kind, { period, fromPeriod, toPeriod })
  const buffer = await toXlsx(table)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${table.fileBase}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
