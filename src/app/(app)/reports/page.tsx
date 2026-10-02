import { Card, Cell, Empty, PageHeader, Row, Table } from '@/components/ui'
import { currentPeriod } from '@/lib/clock'
import { formatPeriod, formatVnd } from '@/lib/format'
import * as tuitionApi from '@/modules/tuition/public'

export const dynamic = 'force-dynamic'

const REPORTS = [
  {
    kind: 'debt',
    title: 'Công nợ',
    description: 'Ai còn thiếu tiền trong kỳ, còn bao nhiêu, hạn đóng ngày nào.',
  },
  {
    kind: 'students',
    title: 'Danh sách học sinh',
    description: 'Danh sách kèm đơn giá, miễn giảm, số phải thu và hạn đóng của kỳ.',
  },
  {
    kind: 'attendance',
    title: 'Điểm danh',
    description: 'Số buổi, số buổi đã điểm danh, tỉ lệ và lượt có mặt theo từng lớp.',
  },
  {
    kind: 'income',
    title: 'Thu nhập theo tháng',
    description: 'Tiền thực nhận từng tháng. Nhập thêm kỳ kết thúc để xuất nhiều tháng một lần.',
  },
] as const

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; toPeriod?: string }>
}) {
  const params = await searchParams
  const period =
    params.period !== undefined && /^\d{4}-\d{2}$/.test(params.period)
      ? params.period
      : currentPeriod()
  const toPeriod =
    params.toPeriod !== undefined && /^\d{4}-\d{2}$/.test(params.toPeriod)
      ? params.toPeriod
      : period

  const { summary, debtors } = await tuitionApi.billingForPeriod(period)

  return (
    <>
      <PageHeader
        title="Báo cáo"
        subtitle="Tất cả báo cáo xuất ra Excel. Số tiền là số thật để còn cộng được trong Excel."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.kind} title={report.title} hint={report.description}>
            <form
              method="get"
              action={`/api/reports/${report.kind}`}
              className="flex flex-wrap items-end gap-2"
            >
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Kỳ</span>
                <input
                  name="period"
                  defaultValue={params.period ?? period}
                  placeholder="2026-09"
                  className="w-28 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
                />
              </label>

              {report.kind === 'income' && (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">Tới kỳ</span>
                  <input
                    name="toPeriod"
                    defaultValue={toPeriod}
                    placeholder="2026-12"
                    className="w-28 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
                  />
                </label>
              )}

              <button
                type="submit"
                className="rounded-lg bg-navy px-4 py-1.5 text-sm font-semibold text-white"
              >
                Tải Excel
              </button>
            </form>
          </Card>
        ))}
      </div>

      <Card
        title={`Xem trước — công nợ ${formatPeriod(period)}`}
        className="mt-4"
        hint={`Phải thu ${formatVnd(summary.expected)} · còn thiếu ${formatVnd(summary.outstanding)}`}
      >
        {debtors.length === 0 ? (
          <Empty>Không còn ai thiếu tiền trong kỳ này.</Empty>
        ) : (
          <Table head={['Học sinh', 'Lớp', 'Còn thiếu']}>
            {debtors.map((debtor) => (
              <Row key={debtor.student.id}>
                <Cell>{debtor.student.fullName}</Cell>
                <Cell>{debtor.student.className}</Cell>
                <Cell align="right" strong>
                  {formatVnd(debtor.outstanding)}
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Card>
    </>
  )
}
