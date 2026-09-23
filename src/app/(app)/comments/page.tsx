import Link from 'next/link'
import { Card, Empty, PageHeader } from '@/components/ui'
import { PeriodPicker } from '@/components/period-picker'
import { currentPeriod } from '@/lib/clock'
import { formatPeriod } from '@/lib/format'
import * as commentsApi from '@/modules/comments/public'
import * as studentsApi from '@/modules/students/public'
import { CommentForm } from '@/modules/comments/ui/comment-form'

export const dynamic = 'force-dynamic'

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period =
    params.period !== undefined && /^\d{4}-\d{2}$/.test(params.period)
      ? params.period
      : currentPeriod()

  const roster = await studentsApi.listStudents()
  const comments = await commentsApi.listCommentsForPeriod(period)
  const byStudent = new Map(comments.map((comment) => [comment.studentId, comment]))

  return (
    <>
      <PageHeader
        title="Nhận xét"
        subtitle={`Nhận xét của ${formatPeriod(period)} — mỗi em một nhận xét cho mỗi tháng`}
        actions={<PeriodPicker value={period} />}
      />

      {roster.length === 0 ? (
        <Card>
          <Empty>Chưa có học sinh nào.</Empty>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {roster.map((student) => {
            const comment = byStudent.get(student.id)
            return (
              <Card
                key={student.id}
                title={student.fullName}
                hint={`Lớp ${student.className} · ${student.statusLabel}`}
                actions={
                  <Link
                    href={`/students/${student.id}?period=${period}`}
                    className="text-xs font-semibold text-coral-700 hover:underline"
                  >
                    Hồ sơ
                  </Link>
                }
              >
                <CommentForm
                  studentId={student.id}
                  period={period}
                  body={comment?.body ?? ''}
                />
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
