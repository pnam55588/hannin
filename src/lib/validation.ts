import { z } from 'zod'

/**
 * AD-4: tiền là số nguyên đồng, và đây là chỗ duy nhất quy đổi đầu vào của người
 * dùng thành số nguyên. Chủ lớp gõ "2.000.000", "2 000 000" hay "2000000" đều
 * nhận; chuỗi có ký tự lạ thì bị từ chối chứ không âm thầm cắt bớt.
 *
 * Không dùng `z.coerce.number()` trực tiếp: nó nhận cả "abc" thành NaN và cả
 * "1.5" thành số thực, tức là hai kiểu sai mà AD-4 cấm.
 */
export function integerMoney(options: { allowNegative?: boolean } = {}) {
  const pattern = options.allowNegative === true ? /^-?\d+$/ : /^\d+$/

  return z
    .string()
    .trim()
    .min(1, 'Nhập số tiền')
    .transform((value) => value.replace(/[.,\s]/g, ''))
    .refine((value) => pattern.test(value), 'Số tiền chỉ gồm chữ số')
    .transform((value) => Number(value))
    .refine((value) => Number.isSafeInteger(value), 'Số tiền không hợp lệ')
    .refine((value) => Math.abs(value) <= 1_000_000_000, 'Số tiền quá lớn')
}

/** Ngày dạng YYYY-MM-DD, dùng cho mọi trường ngày ở biên. */
export const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ, cần dạng YYYY-MM-DD')

/** Kỳ dạng YYYY-MM. */
export const periodField = z.string().regex(/^\d{4}-\d{2}$/, 'Kỳ không hợp lệ, cần dạng YYYY-MM')
