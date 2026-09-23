import { describe, expect, it } from 'vitest'
import { formatDate, formatPercentChange, formatVnd, roundHalfUp } from './index'

describe('AD-13 — định dạng', () => {
  it('tiền theo dạng Việt Nam', () => {
    expect(formatVnd(1_200_000)).toBe('1.200.000đ')
    expect(formatVnd(0)).toBe('0đ')
    expect(formatVnd(52_300_000)).toBe('52.300.000đ')
  })

  it('ngày kèm thứ, và 16/09/2026 phải là Thứ Tư', () => {
    // Ví dụ này từng sai một ngày trong spec: OCR đọc 'Thứ 3' nhưng ngày là Thứ Tư.
    expect(formatDate('2026-09-16')).toBe('Thứ Tư, 16/09/2026')
    expect(formatDate('2026-09-15')).toBe('Thứ Ba, 15/09/2026')
    expect(formatDate('2026-09-20')).toBe('Chủ Nhật, 20/09/2026')
  })
})

describe('AD-4 — phép làm tròn hiển thị', () => {
  it('làm tròn nửa lên', () => {
    expect(roundHalfUp(1, 2)).toBe(1)
    expect(roundHalfUp(3, 2)).toBe(2)
    expect(roundHalfUp(4, 3)).toBe(1)
    expect(roundHalfUp(5, 3)).toBe(2)
    expect(roundHalfUp(0, 0)).toBe(0)
  })

  it('phần trăm tính từ hai số nguyên', () => {
    expect(formatPercentChange(6_800_000, 6_071_428)).toBe('+12%')
    expect(formatPercentChange(100, 200)).toBe('-50%')
    expect(formatPercentChange(0, 0)).toBe('0%')
    expect(formatPercentChange(5, 0)).toBe('mới')
  })
})
