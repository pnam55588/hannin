'use client'

import { useActionState } from 'react'
import { Field, FormStatus, SubmitButton } from '@/components/form-kit'
import { businessToday } from '@/lib/clock'
import { recordAdjustmentAction, recordPaymentAction, type PaymentActionState } from '@/modules/payments/actions'

const empty: PaymentActionState = { ok: false, error: null, message: null }

/**
 * AD-9: "đánh dấu đã thu" ghi kỳ đang xem và ngày nghiệp vụ hôm nay, nhưng cả
 * hai trường đều sửa được — vì có phụ huynh đóng muộn, và kỳ của khoản tiền là
 * chuyện pháp lý chứ không suy ra được từ ngày thu.
 */
export function PaymentForm({
  studentId,
  period,
  suggestedAmount,
  today = businessToday(),
}: {
  studentId: number
  period: string
  suggestedAmount?: number
  today?: string
}) {
  const [state, action, pending] = useActionState(recordPaymentAction, empty)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="studentId" value={studentId} />
      <Field
        label="Kỳ"
        name="period"
        defaultValue={period}
        required
        hint="Kỳ mà khoản tiền này thuộc về, dạng YYYY-MM."
      />
      <Field
        label="Số tiền"
        name="amount"
        required
        defaultValue={suggestedAmount === undefined ? '' : String(suggestedAmount)}
        placeholder="1800000"
      />
      <Field label="Ngày thu" name="paidOn" type="date" defaultValue={today} required />
      <Field label="Ghi chú" name="note" placeholder="Phụ huynh chuyển khoản" />
      <FormStatus error={state.error} message={state.message} />
      <SubmitButton pending={pending}>Đánh dấu đã thu</SubmitButton>
    </form>
  )
}

/**
 * AD-6: sổ thu chỉ ghi thêm. Ghi nhầm thì tạo một dòng điều chỉnh mang số âm,
 * dòng cũ vẫn còn trong sổ.
 */
export function AdjustmentForm({ studentId, period }: { studentId: number; period: string }) {
  const [state, action, pending] = useActionState(recordAdjustmentAction, empty)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="studentId" value={studentId} />
      <Field label="Kỳ" name="period" defaultValue={period} required />
      <Field
        label="Số điều chỉnh"
        name="amount"
        required
        placeholder="-500000"
        hint="Phải là số âm. Dòng cũ không bị sửa và không bị xoá."
      />
      <Field label="Ngày ghi" name="paidOn" type="date" defaultValue={businessToday()} required />
      <Field label="Lý do" name="note" placeholder="Ghi nhầm số tiền" />
      <FormStatus error={state.error} message={state.message} />
      <SubmitButton pending={pending} tone="coral">
        Ghi điều chỉnh
      </SubmitButton>
    </form>
  )
}
