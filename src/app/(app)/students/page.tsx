import Link from 'next/link'
import { Badge, Card, Cell, Empty, PageHeader, Row, Table } from '@/components/ui'
import { formatDate } from '@/lib/format'
import * as classesApi from '@/modules/classes/public'
import * as studentsApi from '@/modules/students/public'
import { StudentForm } from '@/modules/students/ui/student-forms'
import { filterStudentList, type ListStatus } from './filter'

export const dynamic = 'force-dynamic'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string; status?: string }>
}) {
  const params = await searchParams
  const query = params.q ?? ''
  const classFilter = params.classId === undefined ? undefined : Number(params.classId)
  const status: ListStatus = params.status === 'left' || params.status === 'not_started' || params.status === 'all' ? params.status : 'active'

  const [roster, classList] = await Promise.all([
    studentsApi.listStudents(classFilter === undefined ? {} : { classId: classFilter }),
    classesApi.listClasses(),
  ])

  const filtered = filterStudentList(roster, status, query)
  const hasCustomFilter = query.trim() !== '' || params.classId !== undefined || status !== 'active'

  return (
    <>
      <PageHeader
        title="Học sinh"
        subtitle={`${roster.length} hồ sơ, trong đó ${roster.filter((s) => s.status === 'active').length} đang học`}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Card className="min-w-0"
          title="Danh sách"
          actions={
            <form method="get" className="flex flex-wrap items-center gap-2">
              <input
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Tìm theo tên hoặc số điện thoại"
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm"
              />
              <select
                name="classId"
                defaultValue={params.classId ?? ''}
                className="min-h-11 rounded-lg border border-line bg-surface px-2 text-sm"
              >
                <option value="">Tất cả lớp</option>
                {classList.map((klass) => (
                  <option key={klass.id} value={klass.id}>
                    {klass.name}
                  </option>
                ))}
              </select>
              <select name="status" aria-label="Trạng thái học sinh" defaultValue={status}
                className="min-h-11 rounded-lg border border-line bg-surface px-2 text-sm">
                <option value="active">Đang học</option><option value="not_started">Chưa bắt đầu</option>
                <option value="left">Đã nghỉ</option><option value="all">Tất cả</option>
              </select>
              <button
                type="submit"
                className="min-h-11 rounded-lg bg-navy px-4 text-sm font-semibold text-white"
              >
                Lọc
              </button>
            </form>
          }
        >
          <Table
            head={['Học sinh', 'Lớp', 'Điện thoại', 'Bắt đầu', 'Trạng thái', '']}
            empty={hasCustomFilter ? 'Không có học sinh nào khớp bộ lọc này.' : 'Chưa có học sinh đang học.'}
          >
            {filtered.map((student) => (
              <Row key={student.id}>
                <Cell strong>
                  <Link href={`/students/${student.id}`} className="text-navy hover:underline">
                    {student.fullName}
                  </Link>
                </Cell>
                <Cell>{student.className}</Cell>
                <Cell>{student.phone ?? '—'}</Cell>
                <Cell>{formatDate(student.startedOn)}</Cell>
                <Cell>
                  <Badge
                    tone={
                      student.status === 'active' ? 'ok' : student.status === 'left' ? 'neutral' : 'warn'
                    }
                  >
                    {student.statusLabel}
                  </Badge>
                </Cell>
                <Cell align="right">
                  <Link
                    href={`/students/${student.id}`}
                    className="text-xs font-semibold text-coral-700 hover:underline"
                  >
                    Chi tiết
                  </Link>
                </Cell>
              </Row>
            ))}
          </Table>
          {filtered.length === 0 && <Link href={hasCustomFilter ? '/students' : '#them-hoc-sinh'} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-coral-700 hover:underline">
            {hasCustomFilter ? 'Xóa bộ lọc' : 'Thêm học sinh'}
          </Link>}
        </Card>

        <div id="them-hoc-sinh" className="min-w-0"><Card title="Thêm học sinh" hint="Bắt đầu học từ ngày nào thì chia học phí từ ngày đó">
          {classList.length === 0 ? (
            <Empty>Chưa có lớp nào. Tạo lớp ở mục Lịch học trước.</Empty>
          ) : (
            <StudentForm classes={classList} />
          )}
        </Card></div>
      </div>
    </>
  )
}
