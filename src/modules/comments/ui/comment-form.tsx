'use client'

import { useActionState } from 'react'
import { FormStatus, SubmitButton, TextareaField } from '@/components/form-kit'
import { saveCommentAction, type ActionState } from '@/modules/comments/actions'

const empty: ActionState = { ok: false, error: null, message: null }

export function CommentForm({
  studentId,
  period,
  body,
}: {
  studentId: number
  period: string
  body: string
}) {
  const [state, action, pending] = useActionState(saveCommentAction, empty)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="period" value={period} />
      <TextareaField
        label={`Nhận xét tháng ${period}`}
        name="body"
        defaultValue={body}
        placeholder="Con tiến bộ ở phần nghe, cần luyện thêm từ vựng…"
      />
      <FormStatus error={state.error} message={state.message} />
      <SubmitButton pending={pending}>Lưu nhận xét</SubmitButton>
    </form>
  )
}
