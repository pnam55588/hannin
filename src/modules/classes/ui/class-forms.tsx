'use client'

import { useActionState, useState } from 'react'
import { Field, FormStatus, SubmitButton } from '@/components/form-kit'
import { businessToday } from '@/lib/clock'
import { addScheduleVersionAction, createClassAction, type ActionState } from '@/modules/classes/actions'

const empty: ActionState = { ok: false, error: null }

export function ClassCreateForm() {
  const [state, action, pending] = useActionState(createClassAction, empty)
  return (
    <form action={action} className="space-y-3">
      <Field label="Tên lớp" name="name" required placeholder="4A" />
      <FormStatus error={state.error} />
      <SubmitButton pending={pending}>Thêm lớp</SubmitButton>
    </form>
  )
}

const WEEKDAYS = [
  { value: 1, label: 'Thứ Hai' },
  { value: 2, label: 'Thứ Ba' },
  { value: 3, label: 'Thứ Tư' },
  { value: 4, label: 'Thứ Năm' },
  { value: 5, label: 'Thứ Sáu' },
  { value: 6, label: 'Thứ Bảy' },
  { value: 7, label: 'Chủ Nhật' },
]

/**
 * AD-3: lịch chỉ ghi thêm. Form này tạo một PHIÊN BẢN LỊCH mới có ngày hiệu lực,
 * nên buổi trong quá khứ không bao giờ bị đổi.
 */
export function ScheduleForm({ classes }: { classes: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(addScheduleVersionAction, empty)
  const [enabled, setEnabled] = useState<Record<number, boolean>>({ 1: true, 3: true, 5: true })

  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">Lớp</span>
        <select
          name="classId"
          required
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        >
          {classes.map((klass) => (
            <option key={klass.id} value={klass.id}>
              {klass.name}
            </option>
          ))}
        </select>
      </label>

      <Field
        label="Hiệu lực từ ngày"
        name="effectiveFrom"
        type="date"
        required
        defaultValue={businessToday()}
        hint="Lịch cũ trước ngày này được giữ nguyên."
      />

      <fieldset className="space-y-2">
        <legend className="mb-1 text-xs font-medium text-muted">Các buổi trong tuần</legend>
        {WEEKDAYS.map((day) => (
          <div key={day.value} className="flex items-center gap-2">
            <label className="flex w-28 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled[day.value] === true}
                onChange={(event) =>
                  setEnabled((prev) => ({ ...prev, [day.value]: event.target.checked }))
                }
              />
              {day.label}
            </label>
            <input
              type="time"
              name={`slot-${day.value}`}
              defaultValue="08:00"
              disabled={enabled[day.value] !== true}
              className="rounded-lg border border-line bg-surface px-2 py-1 text-sm disabled:opacity-40"
            />
          </div>
        ))}
      </fieldset>

      <FormStatus error={state.error} />
      <SubmitButton pending={pending}>Lưu lịch mới</SubmitButton>
    </form>
  )
}
