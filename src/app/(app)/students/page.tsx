import Link from 'next/link'
import { Badge, Card, Cell, Empty, PageHeader, Row, Table } from '@/components/ui'
import { formatDate } from '@/lib/format'
import * as classesApi from '@/modules/classes/public'
import * as studentsApi from '@/modules/students/public'
import { StudentForm } from '@/modules/students/ui/student-forms'

export const dynamic = 'force-dynamic'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string }>
}) {
  const params = await searchParams
  const query = (params.q ?? '').trim().toLowerCase()
  const classFilter = params.classId === undefined ? undefined : Number(params.classId)

  const [roster, classList] = await Promise.all([
    studentsApi.listStudents(classFilter === undefined ? {} : { classId: classFilter }),
    classesApi.listClasses(),
  ])

  const filtered =
    query === ''
      ? roster
      : roster.filter(
          (student) =>
            student.fullName.toLowerCase().includes(query) ||
            (student.phone ?? '').includes(query),
        )

  return (
    <>
      <PageHeader
        title="Học sinh"
        subtitle={`${roster.length} hồ sơ, trong đó ${roster.filter((s) => s.status === 'active').length} đang học`}
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card
          title="Danh sách"
          actions={
            <form method="get" className="flex items-center gap-2">
              <input
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Tìm theo tên hoặc số điện thoại"
                className="w-56 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
              />
              <select
                name="classId"
                defaultValue={params.classId ?? ''}
                className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
              >
                <option value="">Tất cả lớp</option>
                {classList.map((klass) => (
                  <option key={klass.id} value={klass.id}>
                    {klass.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white"
              >
                Lọc
              </button>
            </form>
          }
        >
          <Table
            head={['Học sinh', 'Lớp', 'Điện thoại', 'Bắt đầu', 'Trạng thái', '']}
            empty="Không tìm thấy học sinh nào."
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
        </Card>

        <Card title="Thêm học sinh" hint="Bắt đầu học từ ngày nào thì chia học phí từ ngày đó">
          {classList.length === 0 ? (
            <Empty>Chưa có lớp nào. Tạo lớp ở mục Lịch học trước.</Empty>
          ) : (
            <StudentForm classes={classList} />
          )}
        </Card>
      </div>
    </>
  )
}
