import { Card, Cell, Empty, Notice, PageHeader, Row, Stat, Table } from '@/components/ui'
import { PeriodPicker } from '@/components/period-picker'
import { currentPeriod } from '@/lib/clock'
import { formatDate, formatPeriod, formatVnd } from '@/lib/format'
import * as paymentsApi from '@/modules/payments/public'
import * as tuitionApi from '@/modules/tuition/public'
import { PaymentForm } from '@/modules/payments/ui/payment-forms'

export const dynamic = 'force-dynamic'

export default async function TuitionPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period =
    params.period !== undefined && /^\d{4}-\d{2}$/.test(params.period)
      ? params.period
      : currentPeriod()

  const [summary, debtors, income, recentPayments] = await Promise.all([
    tuitionApi.billingSummary(period),
    tuitionApi.debtorsForPeriod(period),
    paymentsApi.incomeInPeriod(period),
    paymentsApi.listPayments({ from: `${period}-01`, to: `${period}-31` }),
  ])

  return (
    <>
      <PageHeader
        title="Học phí & Thu nhập"
        subtitle={formatPeriod(period)}
        actions={<PeriodPicker value={period} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Phải thu của kỳ" value={formatVnd(summary.expected)} hint={`${summary.studentCount} học sinh`} />
        <Stat
          label="Đã thu theo kỳ"
          value={formatVnd(summary.collected)}
          hint={`${summary.settledCount} em đã đóng đủ`}
        />
        <Stat
          label="Còn thiếu"
          value={formatVnd(summary.outstanding)}
          tone={summary.outstanding > 0 ? 'coral' : 'navy'}
        />
        <Stat
          label="Thu nhập thực nhận"
          value={formatVnd(income)}
          hint="Tiền vào trong tháng này, khác với đã thu theo kỳ"
        />
      </div>

      {summary.missingRateCount > 0 && (
        <div className="mt-4">
          <Notice>
            {summary.missingRateCount} học sinh chưa có mốc đơn giá nên chưa được tính vào tổng phải
            thu. Mở hồ sơ học sinh để đặt đơn giá.
          </Notice>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card
          title="Còn thiếu tiền"
          hint="Chỉ tính trong kỳ đang xem, không cộng dồn các tháng trước"
        >
          {debtors.length === 0 ? (
            <Empty>Không còn ai thiếu tiền trong kỳ này.</Empty>
          ) : (
            <Table head={['Học sinh', 'Lớp', 'Hạn đóng', 'Phải thu', 'Đã thu', 'Còn thiếu', '']}>
              {debtors.map((debtor) => (
                <Row key={debtor.student.id}>
                  <Cell strong>{debtor.student.fullName}</Cell>
                  <Cell>{debtor.student.className}</Cell>
                  <Cell>
                    {debtor.dueDate === null ? (
                      <span className="text-coral-700">Chưa đặt hạn</span>
                    ) : (
                      formatDate(debtor.dueDate)
                    )}
                  </Cell>
                  <Cell align="right">{formatVnd(debtor.due)}</Cell>
                  <Cell align="right">{formatVnd(debtor.paid)}</Cell>
                  <Cell align="right" strong>
                    {formatVnd(debtor.outstanding)}
                  </Cell>
                  <Cell align="right">
                    <details className="text-left">
                      <summary className="cursor-pointer text-xs font-semibold text-coral-700">
                        Đánh dấu đã thu
                      </summary>
                      <div className="mt-3 w-64 rounded-lg border border-line bg-canvas p-3">
                        <PaymentForm
                          studentId={debtor.student.id}
                          period={period}
                          suggestedAmount={debtor.outstanding}
                        />
                      </div>
                    </details>
                  </Cell>
                </Row>
              ))}
            </Table>
          )}
        </Card>

        <Card
          title="Sổ thu trong tháng"
          hint="Ghi theo NGÀY THU. Một khoản thu kỳ trước trả trong tháng này vẫn nằm ở đây."
        >
          {recentPayments.length === 0 ? (
            <Empty>Chưa có khoản thu nào trong tháng.</Empty>
          ) : (
            <Table head={['Ngày', 'Học sinh', 'Kỳ', 'Số tiền']}>
              {recentPayments.map((payment) => (
                <Row key={payment.id}>
                  <Cell>{payment.paidOn.slice(8, 10)}/{payment.paidOn.slice(5, 7)}</Cell>
                  <Cell>{payment.studentName}</Cell>
                  <Cell>{payment.period}</Cell>
                  <Cell align="right" strong>
                    {formatVnd(payment.amount)}
                  </Cell>
                </Row>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </>
  )
}
