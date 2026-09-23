'use client'

import { useActionState } from 'react'
import { Field, FormStatus, SubmitButton } from '@/components/form-kit'
import { businessToday } from '@/lib/clock'
import { setDueDayAction, setRateAction, type ActionState } from '@/modules/tuition/actions'

const empty: ActionState = { ok: false, error: null }

/** AD-5: thêm mốc đơn giá mới; mốc cũ giữ nguyên nên tiền kỳ cũ không đổi. */
export function RateForm({ studentId }: { studentId: number }) {
  const [state, action, pending] = useActionState(setRateAction, empty)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="studentId" value={studentId} />
      <Field
        label="Hiệu lực từ ngày"
        name="effectiveFrom"
        type="date"
        required
        defaultValue={businessToday()}
      />
      <Field label="Đơn giá (đồng)" name="amount" required placeholder="2000000" />
      <Field label="Miễn giảm (đồng)" name="discount" defaultValue="0" />
      <FormStatus error={state.error} />
      <SubmitButton pending={pending}>Thêm mốc đơn giá</SubmitButton>
    </form>
  )
}

/** AD-9: hạn đóng là luật lặp theo từng học sinh, giữ nguyên cho các tháng sau. */
export function DueDayForm({ studentId }: { studentId: number }) {
  const [state, action, pending] = useActionState(setDueDayAction, empty)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="studentId" value={studentId} />
      <Field
        label="Hiệu lực từ ngày"
        name="effectiveFrom"
        type="date"
        required
        defaultValue={businessToday()}
      />
      <Field
        label="Đến hạn vào ngày"
        name="dueDay"
        type="number"
        min={1}
        max={31}
        required
        defaultValue={10}
        hint="Ngày trong tháng, từ 1 tới 31. Tháng ngắn sẽ tự lùi về ngày cuối tháng."
      />
      <FormStatus error={state.error} />
      <SubmitButton pending={pending}>Lưu hạn đóng</SubmitButton>
    </form>
  )
}
