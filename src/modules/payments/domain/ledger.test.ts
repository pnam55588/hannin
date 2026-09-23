import { describe, expect, it } from 'vitest'
import {
  debtorsForPeriod,
  incomeBetween,
  isSettled,
  outstanding,
  sumForPeriod,
  type PaymentRow,
} from './ledger'

const payments: PaymentRow[] = [
  // Kỳ 9 nhưng thu ngày 03/10 — đây đúng là ca mà reviewer đối kháng dựng ra.
  { studentId: 1, period: '2026-09', amount: 1_800_000, paidOn: '2026-10-03', kind: 'payment' },
  // Kỳ 10 thu trong tháng 10.
  { studentId: 1, period: '2026-10', amount: 1_800_000, paidOn: '2026-10-20', kind: 'payment' },
  // Học sinh 2 đóng một phần kỳ 9.
  { studentId: 2, period: '2026-09', amount: 500_000, paidOn: '2026-09-08', kind: 'payment' },
  // Ghi nhầm rồi điều chỉnh bằng bản ghi âm.
  { studentId: 3, period: '2026-09', amount: 100_000, paidOn: '2026-09-09', kind: 'payment' },
  { studentId: 3, period: '2026-09', amount: -100_000, paidOn: '2026-09-10', kind: 'adjustment' },
]

describe('AD-6 — sổ thu', () => {
  it('công nợ tính theo kỳ, không theo ngày thu', () => {
    // Học sinh 1 đã đóng đủ kỳ 9 dù tiền vào tháng 10.
    expect(sumForPeriod(payments, 1, '2026-09')).toBe(1_800_000)
    expect(isSettled(1_800_000, sumForPeriod(payments, 1, '2026-09'))).toBe(true)
  })

  it('thu một phần thì công nợ giảm đúng phần đã thu', () => {
    expect(outstanding(1_800_000, sumForPeriod(payments, 2, '2026-09'))).toBe(1_300_000)
  })

  it('bản ghi điều chỉnh trừ đúng số đã ghi nhầm', () => {
    expect(sumForPeriod(payments, 3, '2026-09')).toBe(0)
    expect(isSettled(0, sumForPeriod(payments, 3, '2026-09'))).toBe(true)
  })
})

describe('AD-8 — thu nhập theo ngày thu', () => {
  it('khoản thu kỳ 9 vào ngày 03/10 là thu nhập tháng 10', () => {
    expect(incomeBetween(payments, '2026-09-01', '2026-09-30')).toBe(500_000)
    expect(incomeBetween(payments, '2026-10-01', '2026-10-31')).toBe(3_600_000)
  })

  it('thu nhập và công nợ không được lẫn vào nhau', () => {
    const septemberIncome = incomeBetween(payments, '2026-09-01', '2026-09-30')
    const septemberPaidOnPeriod = payments
      .filter((p) => p.period === '2026-09')
      .reduce((sum, p) => sum + p.amount, 0)
    // Hai con số khác nhau — đây là điều AD-8 ghim để hai màn không lệch nhau.
    expect(septemberIncome).not.toBe(septemberPaidOnPeriod)
  })
})

describe('AD-9 — danh sách nợ của một kỳ', () => {
  it('chỉ gồm người còn thiếu, sắp theo số còn thiếu giảm dần', () => {
    const debtors = debtorsForPeriod(
      payments,
      '2026-09',
      [
        { studentId: 1, due: 1_800_000 },
        { studentId: 2, due: 1_800_000 },
        { studentId: 3, due: 0 },
      ],
      new Map([
        [1, '2026-09-10'],
        [2, '2026-09-10'],
      ]),
    )
    expect(debtors.map((d) => d.studentId)).toEqual([2])
    expect(debtors[0]?.outstanding).toBe(1_300_000)
    expect(debtors[0]?.dueDate).toBe('2026-09-10')
  })

  it('đóng vượt thì không nằm trong danh sách nợ', () => {
    const overpaid: PaymentRow[] = [
      { studentId: 1, period: '2026-09', amount: 2_500_000, paidOn: '2026-09-05', kind: 'payment' },
    ]
    expect(debtorsForPeriod(overpaid, '2026-09', [{ studentId: 1, due: 1_800_000 }])).toEqual([])
  })
})
