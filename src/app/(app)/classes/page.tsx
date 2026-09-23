import { Card, Cell, Empty, PageHeader, Row, Table } from '@/components/ui'
import { formatTime } from '@/lib/format'
import * as classesApi from '@/modules/classes/public'
import { ClassCreateForm, ScheduleForm } from '@/modules/classes/ui/class-forms'

export const dynamic = 'force-dynamic'

const WEEKDAY_LABEL = ['', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']

export default async function ClassesPage() {
  const classList = await classesApi.listClasses()
  const schedules = await Promise.all(
    classList.map(async (klass) => ({
      klass,
      slots: await classesApi.listScheduleSlots(klass.id),
    })),
  )

  return (
    <>
      <PageHeader
        title="Lịch học"
        subtitle="Lịch chỉ ghi thêm: đổi lịch là thêm mốc hiệu lực mới, buổi trong quá khứ không đổi"
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <Card title="Lịch các lớp">
              <Empty>Chưa có lớp nào. Thêm lớp ở cột bên phải.</Empty>
            </Card>
          ) : (
            schedules.map(({ klass, slots }) => (
              <Card
                key={klass.id}
                title={`Lớp ${klass.name}`}
                hint={`${klass.studentCount} học sinh đang học`}
              >
                {slots.length === 0 ? (
                  <Empty>Lớp chưa có lịch. Thêm mốc lịch đầu tiên ở cột bên phải.</Empty>
                ) : (
                  <Table head={['Hiệu lực từ', 'Thứ', 'Giờ học']}>
                    {slots.map((slot) => (
                      <Row key={slot.id}>
                        <Cell>{slot.effectiveFrom}</Cell>
                        <Cell>{WEEKDAY_LABEL[slot.weekday] ?? slot.weekday}</Cell>
                        <Cell>{formatTime(slot.startTime)}</Cell>
                      </Row>
                    ))}
                  </Table>
                )}
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <Card title="Thêm lớp">
            <ClassCreateForm />
          </Card>
          <Card
            title="Thêm mốc lịch"
            hint="Chọn ngày hiệu lực mới khi đổi giờ hoặc đổi thứ. Không sửa được mốc đã có."
          >
            {classList.length === 0 ? (
              <Empty>Chưa có lớp nào.</Empty>
            ) : (
              <ScheduleForm classes={classList} />
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
