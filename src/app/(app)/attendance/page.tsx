import { Card, Empty, Notice, PageHeader } from '@/components/ui'
import { DatePicker } from '@/components/period-picker'
import { businessToday } from '@/lib/clock'
import { formatDate } from '@/lib/format'
import * as attendanceApi from '@/modules/attendance/public'
import { AttendanceForm } from '@/modules/attendance/ui/attendance-form'

export const dynamic = 'force-dynamic'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const date =
    params.date !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : businessToday()

  const sessions = await attendanceApi.sessionsForDate(date)

  return (
    <>
      <PageHeader
        title="Điểm danh"
        subtitle={formatDate(date)}
        actions={<DatePicker value={date} />}
      />

      {sessions.length === 0 ? (
        <Card title="Buổi học trong ngày">
          <Empty>Ngày này không có buổi học nào theo lịch của bất kỳ lớp nào.</Empty>
          <div className="mt-3">
            <Notice tone="info">
              Nếu đúng là có dạy, kiểm tra lại lịch ở mục Lịch học. Hệ thống chỉ cho điểm danh buổi
              có thật trong lịch, để báo cáo về sau không bị lệch.
            </Notice>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sessions.map((session) => (
            <Card key={`${session.classId}-${session.startTime}`}>
              {session.marks.length === 0 ? (
                <Empty>Lớp {session.className} chưa có học sinh nào.</Empty>
              ) : (
                <AttendanceForm
                  classId={session.classId}
                  className={session.className}
                  date={session.date}
                  startTime={session.startTime}
                  marks={session.marks}
                  complete={session.complete}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
