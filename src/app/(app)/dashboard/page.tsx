import Link from 'next/link'
import { Badge, Card, Cell, Empty, Notice, PageHeader, Row, Stat, Table } from '@/components/ui'
import { businessToday, currentPeriod } from '@/lib/clock'
import { formatDate, formatPeriod, formatRatio, formatTime, formatVnd } from '@/lib/format'
import * as attendanceApi from '@/modules/attendance/public'
import * as classesApi from '@/modules/classes/public'
import * as commentsApi from '@/modules/comments/public'
import * as paymentsApi from '@/modules/payments/public'
import * as studentsApi from '@/modules/students/public'
import * as tuitionApi from '@/modules/tuition/public'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = businessToday()
  const period = currentPeriod()

  // CAP-1: câu trả lời cho "hôm nay dạy gì" phải là thứ đầu tiên nhìn thấy.
  const sessions = await attendanceApi.sessionsForDate(today)
  const summary = await tuitionApi.billingSummary(period)
  const income = await paymentsApi.incomeInPeriod(period)
  const roster = await studentsApi.listStudents()
  const activeCount = roster.filter((student) => student.status === 'active').length
  const debtors = await tuitionApi.debtorsForPeriod(period)
  const overdue = debtors.filter(
    (debtor) => debtor.dueDate !== null && debtor.dueDate < today,
  )
  const recentComments = await commentsApi.recentComments(5)

  const classList = await classesApi.listClasses()
  let sessionsTotal = 0
  let sessionsMarked = 0
  for (const klass of classList) {
    const ratio = await attendanceApi.ratioForClassInPeriod(klass.id, period)
    sessionsTotal += ratio.total
    sessionsMarked += ratio.complete
  }

  return (
    <>
      <PageHeader
        title={`Tổng quan — ${formatDate(today)}`}
        subtitle={`Kỳ đang xem: ${formatPeriod(period)}`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Hôm nay học gì" className="lg:col-span-2">
          {sessions.length === 0 ? (
            <Empty>Hôm nay không có buổi học nào theo lịch.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {sessions.map((session) => (
                <li
                  key={`${session.classId}-${session.startTime}`}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {formatTime(session.startTime)} · Lớp {session.className}
                    </p>
                    <p className="text-xs text-muted">
                      {session.expectedCount} học sinh · {session.presentCount} có mặt
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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
                <li key={debtor.student.id} className="flex items-center justify-between text-sm">
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

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Học sinh đang học" value={String(activeCount)} hint={`${roster.length} hồ sơ`} />
        <Stat
          label="Phải thu kỳ này"
          value={formatVnd(summary.expected)}
          hint={`${summary.settledCount}/${summary.studentCount} em đã đóng đủ`}
        />
        <Stat
          label="Còn thiếu kỳ này"
          value={formatVnd(summary.outstanding)}
          tone={summary.outstanding > 0 ? 'coral' : 'navy'}
          hint={`${debtors.length} học sinh`}
        />
        <Stat
          label="Thu nhập thực nhận"
          value={formatVnd(income)}
          hint={`Tiền vào trong ${formatPeriod(period)}`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card
          title="Điểm danh trong kỳ"
          hint="Một buổi tính là xong khi mọi học sinh đều có dòng, kể cả dòng Vắng"
        >
          <p className="text-2xl font-bold text-navy">
            {formatRatio(sessionsMarked, sessionsTotal)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {sessionsTotal === 0
              ? 'Chưa có buổi nào trong kỳ này.'
              : `Còn ${Math.max(0, sessionsTotal - sessionsMarked)} buổi chưa điểm danh.`}
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
