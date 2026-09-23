'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { addScheduleVersion, createClass, renameClass } from '@/modules/classes/public'

export type ActionState = { ok: boolean; error: string | null }

const classSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên lớp').max(40, 'Tên lớp quá dài'),
})

const slotSchema = z.object({
  weekday: z.coerce.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ không hợp lệ'),
})

const scheduleSchema = z.object({
  classId: z.coerce.number().int().positive(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hiệu lực không hợp lệ'),
  slots: z.array(slotSchema).min(1, 'Chọn ít nhất một buổi trong tuần'),
})

/** AD-11: mọi đột biến là Server Action; AD-10: mở đầu bằng requireUser. */
export async function createClassAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = classSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }
  try {
    await createClass(parsed.data.name)
  } catch {
    return { ok: false, error: 'Tên lớp này đã tồn tại' }
  }
  revalidatePath('/classes')
  revalidatePath('/students')
  return { ok: true, error: null }
}

export async function renameClassAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()
  const parsed = z
    .object({
      id: z.coerce.number().int().positive(),
      name: z.string().trim().min(1, 'Nhập tên lớp').max(40, 'Tên lớp quá dài'),
    })
    .safeParse({ id: formData.get('id'), name: formData.get('name') })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }
  try {
    await renameClass(parsed.data.id, parsed.data.name)
  } catch {
    return { ok: false, error: 'Tên lớp này đã tồn tại' }
  }
  revalidatePath('/classes')
  revalidatePath('/students')
  return { ok: true, error: null }
}

/**
 * AD-3: thêm một phiên bản lịch mới. Form gửi lên các cặp (thứ, giờ) đã chọn.
 * Định dạng trường: `slot-<weekday>` với giá trị là giờ, ví dụ `slot-2=09:30`.
 */
export async function addScheduleVersionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser()

  const slots: { weekday: number; startTime: string }[] = []
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('slot-') || typeof value !== 'string' || value.trim() === '') continue
    slots.push({ weekday: Number(key.slice(5)), startTime: value })
  }

  const parsed = scheduleSchema.safeParse({
    classId: formData.get('classId'),
    effectiveFrom: formData.get('effectiveFrom'),
    slots,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }

  try {
    await addScheduleVersion({
      classId: parsed.data.classId,
      effectiveFrom: parsed.data.effectiveFrom,
      slots: parsed.data.slots.map((slot) => ({
        weekday: slot.weekday,
        startTime: `${slot.startTime}:00`,
      })),
    })
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Không lưu được lịch' }
  }

  revalidatePath('/classes')
  revalidatePath('/attendance')
  revalidatePath('/dashboard')
  return { ok: true, error: null }
}
