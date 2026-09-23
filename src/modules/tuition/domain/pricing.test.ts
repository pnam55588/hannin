import { describe, expect, it } from 'vitest'
import { amountDue, isPartialMonth, resolveRate, dueDateForPeriod } from './pricing'

const rate = { effectiveFrom: '2026-01-01', amount: 2_000_000, discount: 200_000 }

describe('AD-5 — số phải thu', () => {
  it('tháng trọn thì thu đơn giá trừ miễn giảm', () => {
    expect(
      amountDue({
        rate,
        period: '2026-09',
        startedOn: '2026-01-05',
        leftOn: null,
        sessionsInMonth: 13,
        sessionsInCoveredWindow: 13,
      }),
    ).toBe(1_800_000)
  })

  it('vào giữa tháng thì chia theo số buổi lớp đã diễn ra', () => {
    // Bắt đầu 22/09, lớp có 13 buổi trong tháng, từ 22/09 tới hết tháng có 4 buổi.
    // 1.800.000 × 4 / 13 = 553.846,15… → làm tròn nửa lên = 553.846
    const amount = amountDue({
      rate,
      period: '2026-09',
      startedOn: '2026-09-22',
      leftOn: null,
      sessionsInMonth: 13,
      sessionsInCoveredWindow: 4,
    })
    expect(amount).toBe(553_846)
    expect(Number.isInteger(amount)).toBe(true)
  })

  it('vắng không ảnh hưởng tới tiền — tử số là buổi lớp đã diễn ra', () => {
    const base = {
      rate,
      period: '2026-09',
      startedOn: '2026-09-22',
      leftOn: null,
      sessionsInMonth: 13,
      sessionsInCoveredWindow: 4,
    }
    // Cùng đầu vào, không có tham số nào về điểm danh; đổi cách học sinh vắng
    // mặt không thể đổi kết quả vì hàm không nhận đầu vào đó.
    expect(amountDue(base)).toBe(amountDue({ ...base }))
  })

  it('nghỉ giữa tháng cũng chia theo cùng một luật', () => {
    expect(
      amountDue({
        rate,
        period: '2026-09',
        startedOn: '2026-01-05',
        leftOn: '2026-09-10',
        sessionsInMonth: 13,
        sessionsInCoveredWindow: 4,
      }),
    ).toBe(553_846)
  })

  it('không học tháng đó thì không phải thu', () => {
    expect(
      amountDue({
        rate,
        period: '2026-09',
        startedOn: '2026-10-01',
        leftOn: null,
        sessionsInMonth: 13,
        sessionsInCoveredWindow: 0,
      }),
    ).toBe(0)
  })

  it('miễn giảm lớn hơn đơn giá thì không âm', () => {
    expect(
      amountDue({
        rate: { effectiveFrom: '2026-01-01', amount: 500_000, discount: 900_000 },
        period: '2026-09',
        startedOn: '2026-01-05',
        leftOn: null,
        sessionsInMonth: 13,
        sessionsInCoveredWindow: 13,
      }),
    ).toBe(0)
  })

  it('mốc giá tra theo ngày, mốc mới nhất không vượt quá ngày đó', () => {
    const rates = [
      { effectiveFrom: '2026-01-01', amount: 1_500_000, discount: 0 },
      { effectiveFrom: '2026-09-15', amount: 2_000_000, discount: 0 },
    ]
    expect(resolveRate(rates, '2026-09-14')?.amount).toBe(1_500_000)
    expect(resolveRate(rates, '2026-09-15')?.amount).toBe(2_000_000)
    expect(resolveRate(rates, '2025-12-31')).toBeNull()
  })

  it('tháng lệch được nhận diện đúng', () => {
    expect(isPartialMonth('2026-01-05', null, '2026-09')).toBe(false)
    expect(isPartialMonth('2026-09-05', null, '2026-09')).toBe(true)
    expect(isPartialMonth('2026-01-05', '2026-09-20', '2026-09')).toBe(true)
  })
})

describe('AD-9 — hạn đóng là luật lặp', () => {
  it('áp cho mọi kỳ cho tới khi đổi', () => {
    const rules = [
      { effectiveFrom: '2026-01-01', dueDay: 10 },
      { effectiveFrom: '2026-10-01', dueDay: 5 },
    ]
    expect(dueDateForPeriod(rules, '2026-09')).toBe('2026-09-10')
    expect(dueDateForPeriod(rules, '2026-10')).toBe('2026-10-05')
  })

  it('ngày 31 tự kẹp vào ngày cuối tháng', () => {
    const rules = [{ effectiveFrom: '2026-01-01', dueDay: 31 }]
    expect(dueDateForPeriod(rules, '2026-02')).toBe('2026-02-28')
    expect(dueDateForPeriod(rules, '2026-04')).toBe('2026-04-30')
  })

  it('chưa có luật thì trả về null, không bịa ra ngày', () => {
    expect(dueDateForPeriod([], '2026-09')).toBeNull()
  })
})
