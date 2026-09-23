'use client'

import { useActionState } from 'react'
import { Field, FormStatus, SubmitButton } from '@/components/form-kit'
import { changePasswordAction, type ActionState } from './actions'

const empty: ActionState = { ok: false, error: null, message: null }

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, empty)

  return (
    <form action={action} className="space-y-3">
      <Field label="Mật khẩu hiện tại" name="currentPassword" type="password" required />
      <Field
        label="Mật khẩu mới"
        name="newPassword"
        type="password"
        required
        hint="Từ 8 ký tự trở lên."
      />
      <Field label="Nhập lại mật khẩu mới" name="confirmPassword" type="password" required />
      <FormStatus error={state.error} message={state.message} />
      <SubmitButton pending={pending}>Đổi mật khẩu</SubmitButton>
    </form>
  )
}
