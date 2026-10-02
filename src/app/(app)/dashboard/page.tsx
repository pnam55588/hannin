import Link from 'next/link'
import { Badge, Card, Cell, Empty, Notice, PageHeader, Row, Stat, Table } from '@/components/ui'
import { businessToday, currentPeriod } from '@/lib/clock'
import { formatDate, formatPercentChange, formatPeriod, formatRatio, formatTime, formatVnd } from '@/lib/format'
import * as attendanceApi from '@/modules/attendance/public'
import * as commentsApi from '@/modules/comments/public'
import * as paymentsApi from '@/modules/payments/public'
import * as tuitionApi from '@/modules/tuition/public'

export const dynamic = 'force-dynamic'

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export default async function DashboardPage() {
  const now = new Date()
  const today = businessToday(now)
  const period = currentPeriod(now)

  // CAP-1: câu trả lời cho "hôm nay dạy gì" phải là thứ đầu tiên nhìn thấy.
  const [sessions, billing, income, recentComments] = await Promise.all([
    attendanceApi.sessionsForDate(today),
    tuitionApi.billingForPeriod(period),
    paymentsApi.incomeComparisons(today),
    commentsApi.recentComments(5),
  ])
  const { summary, debtors } = billing
  const overdue = debtors.filter(
    (debtor) => debtor.dueDate !== null && debtor.dueDate < today,
  )

  const counts = attendanceApi.todayCounts(sessions, clock.format(now))

  return (
    <>
      <PageHeader
        title="Chào bạn!"
        subtitle={`Chúc một ngày làm việc thật hiệu quả! · ${formatDate(today)}`}
        actions={<Link href="/students#them-hoc-sinh" className="action-accent">+ Thêm học sinh</Link>}
      />

      <div className="metric-grid mb-6">
        <Stat label="Thu nhập tháng này" value={formatVnd(income.month)} hint={`${income.previousMonth === 0 ? 'Mới' : formatPercentChange(income.month, income.previousMonth)} so với tháng trước`} tone="mint" icon="income" />
        <Stat label="Thu nhập năm nay" value={formatVnd(income.year)} hint={`${income.previousYear === 0 ? 'Mới' : formatPercentChange(income.year, income.previousYear)} so với năm trước`} tone="butter" icon="income" />
        <Stat label="Buổi học hôm nay" value={formatRatio(counts.started, counts.total)} hint={<Link href={`/classes?period=${period}`}>Xem lịch tháng</Link>} tone="lavender" icon="calendar" />
        <Stat label="Đã điểm danh hôm nay" value={formatRatio(counts.marked, counts.started)} hint={<>{counts.started === 0 ? 'Chưa tới giờ học · ' : ''}<Link href={`/attendance?date=${today}`}>Điểm danh</Link></>} tone="coral" icon="attendance" />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card title="Lịch học hôm nay">
          {sessions.length === 0 ? (
            <Empty>Hôm nay không có buổi học nào theo lịch.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {sessions.map((session) => (
                <li
                  key={`${session.classId}-${session.startTime}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {formatTime(session.startTime)} · Lớp {session.className}
                    </p>
                    <p className="text-xs text-muted">
                      {session.expectedCount} học sinh · {session.presentCount} có mặt
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {session.complete ? (
                      <Badge tone="ok">Đã điểm danh</Badge>
                    ) : (
                      <Badge tone="warn">Chưa điểm danh</Badge>
                    )}
                    <Link
                      href={`/attendance?date=${today}`}
                      className="text-sm font-semibold text-coral-700 hover:underline"
                    >
                      Điểm danh
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Nhắc hạn đóng" hint="Học sinh quá hạn mà còn thiếu tiền">
          {overdue.length === 0 ? (
            <Empty>Không có ai quá hạn.</Empty>
          ) : (
            <ul className="space-y-2">
              {overdue.slice(0, 6).map((debtor) => (
                <li key={debtor.student.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link
                    href={`/students/${debtor.student.id}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {debtor.student.fullName}
                  </Link>
                  <span className="text-coral-700">
                    thiếu {formatVnd(debtor.outstanding)} · hạn {debtor.dueDate?.slice(8, 10)}/
                    {debtor.dueDate?.slice(5, 7)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Stat label="Phải thu kỳ này" value={formatVnd(summary.expected)} hint={`${summary.settledCount}/${summary.studentCount} em đã đóng đủ`} />
        <Stat label="Còn thiếu kỳ này" value={formatVnd(summary.outstanding)} hint={`${debtors.length} học sinh`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card
          title="Điểm danh hôm nay"
          hint="Một buổi tính là xong khi mọi học sinh đều có dòng, kể cả dòng Vắng"
        >
          <p className="text-2xl font-bold text-navy">
            {formatRatio(counts.marked, counts.started)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {counts.started === 0
              ? 'Chưa tới giờ học.'
              : `Còn ${counts.started - counts.marked} buổi chưa điểm danh hôm nay.`}
          </p>
          {summary.missingRateCount > 0 && (
            <div className="mt-3">
              <Notice>
                {summary.missingRateCount} học sinh chưa có mốc đơn giá nên chưa được tính vào tổng
                phải thu. Vào Học phí để đặt đơn giá.
              </Notice>
            </div>
          )}
        </Card>

        <Card title="Nhận xét vừa cập nhật">
          {recentComments.length === 0 ? (
            <Empty>Chưa có nhận xét nào.</Empty>
          ) : (
            <Table head={['Học sinh', 'Kỳ', 'Nhận xét']}>
              {recentComments.map((comment) => (
                <Row key={comment.id}>
                  <Cell>
                    <Link href={`/students/${comment.studentId}`} className="text-navy hover:underline">
                      {comment.studentName}
                    </Link>
                  </Cell>
                  <Cell>{formatPeriod(comment.period)}</Cell>
                  <Cell>
                    {comment.body.length > 60 ? `${comment.body.slice(0, 60)}…` : comment.body}
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
