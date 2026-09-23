import { notFound } from 'next/navigation'
import { Badge, Card, Cell, Empty, Notice, PageHeader, Row, Stat, Table } from '@/components/ui'
import { currentPeriod, periodBounds } from '@/lib/clock'
import { formatDate, formatPeriod, formatVnd } from '@/lib/format'
import * as attendanceApi from '@/modules/attendance/public'
import * as classesApi from '@/modules/classes/public'
import * as commentsApi from '@/modules/comments/public'
import * as paymentsApi from '@/modules/payments/public'
import * as studentsApi from '@/modules/students/public'
import * as tuitionApi from '@/modules/tuition/public'
import { EndStudentForm, StudentEditForm } from '@/modules/students/ui/student-forms'
import { CommentForm } from '@/modules/comments/ui/comment-form'
import { DueDayForm, RateForm } from '@/modules/tuition/ui/rate-forms'

export const dynamic = 'force-dynamic'

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ period?: string }>
}) {
  const { id } = await params
  const studentId = Number(id)
  if (!Number.isInteger(studentId) || studentId <= 0) notFound()

  const student = await studentsApi.getStudent(studentId)
  if (student === null) notFound()

  const query = await searchParams
  const period = query.period ?? currentPeriod()
  const { from, to } = periodBounds(period)

  const [classList, rates, dueRules, charge, history, attendanceRows, comment] =
    await Promise.all([
      classesApi.listClasses(),
      tuitionApi.listRates(studentId),
      tuitionApi.listDueRules(studentId),
      tuitionApi.chargeForStudent(studentId, period),
      paymentsApi.paymentsForStudent(studentId),
      attendanceApi.recentAttendanceForStudent(studentId, from, to),
      commentsApi.getComment(studentId, period),
    ])

  const present = attendanceRows.filter((row) => row.status === 'present').length
  const paidTotal = history.reduce((sum, item) => sum + item.amount, 0)

  return (
    <>
      <PageHeader
        title={student.fullName}
        subtitle={`Lớp ${student.className} · bắt đầu ${formatDate(student.startedOn)}${
          student.leftOn === null ? '' : ` · nghỉ từ ${formatDate(student.leftOn)}`
        }`}
        actions={
          <Badge tone={student.status === 'active' ? 'ok' : student.status === 'left' ? 'neutral' : 'warn'}>
            {student.statusLabel}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={`Phải thu ${formatPeriod(period)}`}
          value={charge === null || charge.rate === null ? 'Chưa có đơn giá' : formatVnd(charge.due)}
          tone={charge !== null && charge.rate === null ? 'coral' : 'navy'}
          hint={
            charge === null
              ? undefined
              : `${charge.sessionsInCoveredWindow}/${charge.sessionsInMonth} buổi của lớp trong phần tháng em học`
          }
        />
        <Stat
          label="Hạn đóng kỳ này"
          value={charge?.dueDate === null || charge?.dueDate === undefined ? 'Chưa đặt' : formatDate(charge.dueDate)}
        />
        <Stat label="Đã thu lũy kế" value={formatVnd(paidTotal)} hint={`${history.length} lần ghi`} />
        <Stat
          label={`Điểm danh ${formatPeriod(period)}`}
          value={`${present} / ${attendanceRows.length}`}
          hint="Điểm danh không ảnh hưởng tới học phí"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Thông tin và lớp">
          <StudentEditForm student={student} classes={classList} />
        </Card>

        <div className="space-y-4">
          <Card
            title="Đơn giá và miễn giảm"
            hint="Mốc cũ giữ nguyên, nên tiền của các kỳ đã qua không bao giờ đổi"
          >
            {rates.length === 0 ? (
              <Notice>Chưa có mốc đơn giá nào. Học sinh này chưa được tính vào tổng phải thu.</Notice>
            ) : (
              <Table head={['Hiệu lực từ', 'Đơn giá', 'Miễn giảm', 'Thực thu']}>
                {rates.map((rate) => (
                  <Row key={rate.effectiveFrom}>
                    <Cell>{formatDate(rate.effectiveFrom)}</Cell>
                    <Cell align="right">{formatVnd(rate.amount)}</Cell>
                    <Cell align="right">{formatVnd(rate.discount)}</Cell>
                    <Cell align="right" strong>
                      {formatVnd(Math.max(0, rate.amount - rate.discount))}
                    </Cell>
                  </Row>
                ))}
              </Table>
            )}
            <div className="mt-4 border-t border-line pt-4">
              <RateForm studentId={studentId} />
            </div>
          </Card>

          <Card
            title="Hạn đóng"
            hint="Luật lặp, giữ nguyên cho các tháng sau. Hạn đóng KHÔNG phải ngày phát sinh doanh thu."
          >
            {dueRules.length > 0 && (
              <p className="mb-3 text-sm text-muted">
                Hiện tại: ngày {dueRules[dueRules.length - 1]?.dueDay} hằng tháng.
              </p>
            )}
            <DueDayForm studentId={studentId} />
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Sổ thu" hint="Chỉ ghi thêm. Ghi nhầm thì vào Học phí để tạo dòng điều chỉnh.">
          {history.length === 0 ? (
            <Empty>Chưa ghi khoản thu nào.</Empty>
          ) : (
            <Table head={['Ngày thu', 'Kỳ', 'Số tiền', 'Loại', 'Ghi chú']}>
              {history.map((payment) => (
                <Row key={payment.id}>
                  <Cell>{formatDate(payment.paidOn)}</Cell>
                  <Cell>{formatPeriod(payment.period)}</Cell>
                  <Cell align="right" strong>
                    {formatVnd(payment.amount)}
                  </Cell>
                  <Cell>{payment.kind === 'payment' ? 'Thu' : 'Điều chỉnh'}</Cell>
                  <Cell>{payment.note ?? '—'}</Cell>
                </Row>
              ))}
            </Table>
          )}
        </Card>

        <Card title={`Điểm danh ${formatPeriod(period)}`}>
          {attendanceRows.length === 0 ? (
            <Empty>Chưa có buổi nào được điểm danh trong kỳ này.</Empty>
          ) : (
            <Table head={['Ngày', 'Giờ', 'Trạng thái']}>
              {attendanceRows.map((row) => (
                <Row key={`${row.sessionDate}-${row.startTime}`}>
                  <Cell>{formatDate(row.sessionDate)}</Cell>
                  <Cell>{row.startTime.slice(0, 5)}</Cell>
                  <Cell>
                    {row.status === 'present' ? (
                      <Badge tone="ok">Có mặt</Badge>
                    ) : (
                      <Badge tone="warn">Vắng</Badge>
                    )}
                  </Cell>
                </Row>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title="Nhận xét">
          <CommentForm
            studentId={studentId}
            period={period}
            body={comment?.body ?? ''}
          />
        </Card>

        <Card title="Nghỉ học" hint="Không xoá dữ liệu; chỉ ghi mốc ngày nghỉ">
          <EndStudentForm studentId={studentId} leftOn={student.leftOn} />
          <p className="mt-3 text-xs text-muted">
            Kỳ đang xem để tính học phí: {formatPeriod(period)}. Từ {formatDate(from)} tới{' '}
            {formatDate(to)}.
          </p>
        </Card>
      </div>
    </>
  )
}
