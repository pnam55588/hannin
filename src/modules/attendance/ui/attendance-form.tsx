'use client'

import { useActionState } from 'react'
import { FormStatus, SubmitButton } from '@/components/form-kit'
import { saveAttendanceAction, type ActionState } from '@/modules/attendance/actions'

const empty: ActionState = { ok: false, error: null, message: null }

type Mark = {
  studentId: number
  studentName: string
  status: 'present' | 'absent' | null
}

/**
 * AD-3: một buổi được lưu trọn gói cho cả lớp. Học sinh chưa chọn thì để trống
 * và buổi đó chưa tính là đã điểm danh.
 */
export function AttendanceForm({
  classId,
  className,
  date,
  startTime,
  marks,
  complete,
}: {
  classId: number
  className: string
  date: string
  startTime: string
  marks: Mark[]
  complete: boolean
}) {
  const [state, action, pending] = useActionState(saveAttendanceAction, empty)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="startTime" value={startTime} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy">
          Lớp {className}{' '}
          <span className="font-normal text-muted">lúc {startTime.slice(0, 5)}</span>
        </h3>
        {complete ? (
          <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy">
            Đã điểm danh
          </span>
        ) : (
          <span className="rounded-full bg-coral-100 px-2 py-0.5 text-xs font-semibold text-coral-700">
            Chưa xong
          </span>
        )}
      </div>

      <table className="w-full text-sm">
        <tbody>
          {marks.map((mark) => (
            <tr key={mark.studentId} className="border-b border-line/70 last:border-0">
              <td className="px-1 py-2">{mark.studentName}</td>
              <td className="px-1 py-2 text-right">
                <label className="mr-3 inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name={`mark-${mark.studentId}`}
                    value="present"
                    defaultChecked={mark.status === 'present'}
                  />
                  Có mặt
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name={`mark-${mark.studentId}`}
                    value="absent"
                    defaultChecked={mark.status === 'absent'}
                  />
                  Vắng
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <FormStatus error={state.error} message={state.message} />
      <SubmitButton pending={pending}>Lưu điểm danh</SubmitButton>
    </form>
  )
}
