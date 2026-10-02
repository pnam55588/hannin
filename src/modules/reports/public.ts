import { formatDate, formatTime } from '@/lib/format'

/**
 * AD-12: mỗi chỉ số có đúng một hàm sở hữu. Module báo cáo KHÔNG tự tính lại gì
 * cả — nó chỉ gọi hàm sở hữu của module khác rồi trình bày. Nhờ vậy báo cáo và
 * màn hình không bao giờ lệch nhau.
 */

import { periodBounds } from '@/lib/clock'
import * as attendanceApi from '@/modules/attendance/public'
import * as classesApi from '@/modules/classes/public'
import * as paymentsApi from '@/modules/payments/public'
import * as tuitionApi from '@/modules/tuition/public'

export type ReportKind = 'income' | 'debt' | 'attendance' | 'students'

export type ReportColumn = {
  key: string
  header: string
  width: number
  /** Định dạng hiển thị trong Excel, ví dụ '#,##0' cho tiền. */
  format?: string
}

export type ReportTable = {
  kind: ReportKind
  title: string
  fileBase: string
  notes: string[]
  columns: ReportColumn[]
  rows: Record<string, string | number>[]
}

const MONEY = '#,##0'

/** Báo cáo thu nhập: tiền THỰC NHẬN theo tháng (AD-8), do module sổ thu sở hữu. */
async function incomeReport(fromPeriod: string, toPeriod: string): Promise<ReportTable> {
  const periods = monthsBetween(fromPeriod, toPeriod)
  const rows: Record<string, string | number>[] = []
  for (const period of periods) {
    const { from, to } = periodBounds(period)
    rows.push({
      period,
      from: formatDate(from),
      to: formatDate(to),
      income: await paymentsApi.incomeBetween(from, to),
    })
  }
  rows.push({
    period: 'Tổng',
    from: '',
    to: '',
    income: rows.reduce((sum, row) => sum + Number(row.income ?? 0), 0),
  })

  return {
    kind: 'income',
    title: 'Thu nhập theo tháng',
    fileBase: `thu-nhap-${fromPeriod}-${toPeriod}`,
    notes: [
      'Thu nhập là tiền thực nhận trong tháng, không phải tiền của tháng đó.',
      'Một khoản thu ngày 03/10 cho kỳ 9 nằm ở tháng 10.',
    ],
    columns: [
      { key: 'period', header: 'Kỳ', width: 12 },
      { key: 'from', header: 'Từ ngày', width: 22 },
      { key: 'to', header: 'Đến ngày', width: 22 },
      { key: 'income', header: 'Thu nhập', width: 18, format: MONEY },
    ],
    rows,
  }
}

/** Báo cáo công nợ của MỘT kỳ (AD-9), do module học phí sở hữu. */
async function debtReport(period: string): Promise<ReportTable> {
  const { debtors, summary } = await tuitionApi.billingForPeriod(period)

  const rows = debtors.map((debtor) => ({
    student: debtor.student.fullName,
    className: debtor.student.className,
    phone: debtor.student.phone ?? '',
    dueDate: debtor.dueDate === null ? 'Chưa đặt hạn' : formatDate(debtor.dueDate),
    due: debtor.due,
    paid: debtor.paid,
    outstanding: debtor.outstanding,
  }))

  return {
    kind: 'debt',
    title: `Công nợ ${period}`,
    fileBase: `cong-no-${period}`,
    notes: [
      `Tổng phải thu của kỳ: ${summary.expected}`,
      `Đã thu theo kỳ: ${summary.collected}`,
      `Còn thiếu: ${summary.outstanding}`,
      ...(summary.missingRateCount > 0
        ? [`Cảnh báo: ${summary.missingRateCount} học sinh chưa có mốc đơn giá nên chưa được tính vào tổng phải thu.`]
        : []),
    ],
    columns: [
      { key: 'student', header: 'Học sinh', width: 26 },
      { key: 'className', header: 'Lớp', width: 10 },
      { key: 'phone', header: 'Điện thoại', width: 16 },
      { key: 'dueDate', header: 'Hạn đóng', width: 22 },
      { key: 'due', header: 'Phải thu', width: 16, format: MONEY },
      { key: 'paid', header: 'Đã thu', width: 16, format: MONEY },
      { key: 'outstanding', header: 'Còn thiếu', width: 16, format: MONEY },
    ],
    rows,
  }
}

/** Báo cáo điểm danh của một kỳ, do module điểm danh sở hữu. */
async function attendanceReport(period: string): Promise<ReportTable> {
  const classList = await classesApi.listClasses()
  const stats = await attendanceApi.attendanceStatsForPeriod(period)
  const rows: Record<string, string | number>[] = []

  for (const klass of classList) {
    const ratio = stats.get(klass.id) ?? { complete: 0, total: 0, presentTotal: 0, markedTotal: 0 }
    rows.push({
      className: klass.name,
      sessions: ratio.total,
      marked: ratio.complete,
      rate: ratio.total === 0 ? '—' : `${Math.round((ratio.complete / ratio.total) * 100)}%`,
      presentTotal: ratio.presentTotal,
      markedTotal: ratio.markedTotal,
    })
  }

  return {
    kind: 'attendance',
    title: `Điểm danh ${period}`,
    fileBase: `diem-danh-${period}`,
    notes: [
      'Một buổi được tính là đã điểm danh khi mọi học sinh của lớp đều có dòng, kể cả dòng Vắng.',
      'Buổi đầu tiên và buổi cuối cùng trong kỳ: ' + describePeriod(period),
    ],
    columns: [
      { key: 'className', header: 'Lớp', width: 12 },
      { key: 'sessions', header: 'Số buổi', width: 12 },
      { key: 'marked', header: 'Đã điểm danh', width: 16 },
      { key: 'rate', header: 'Tỉ lệ', width: 10 },
      { key: 'presentTotal', header: 'Lượt có mặt', width: 16 },
      { key: 'markedTotal', header: 'Lượt đã ghi', width: 16 },
    ],
    rows,
  }
}

/** Danh sách học sinh, kèm đơn giá và hạn đóng hiện hành. */
async function studentsReport(period: string): Promise<ReportTable> {
  const charges = await tuitionApi.chargesForPeriod(period)
  const rows = charges.map((charge) => ({
    student: charge.student.fullName,
    className: charge.student.className,
    phone: charge.student.phone ?? '',
    status: charge.student.statusLabel,
    startedOn: formatDate(charge.student.startedOn),
    rate: charge.rate === null ? 'Chưa có đơn giá' : charge.rate.amount,
    discount: charge.rate === null ? 0 : charge.rate.discount,
    due: charge.rate === null ? '' : charge.due,
    dueDate: charge.dueDate === null ? 'Chưa đặt hạn' : formatDate(charge.dueDate),
  }))

  return {
    kind: 'students',
    title: `Học sinh kỳ ${period}`,
    fileBase: `hoc-sinh-${period}`,
    notes: [
      'Số phải thu của tháng lệch được chia theo số buổi lớp đã diễn ra trong phần tháng học sinh có mặt.',
      'Điểm danh không ảnh hưởng tới số phải thu.',
    ],
    columns: [
      { key: 'student', header: 'Học sinh', width: 26 },
      { key: 'className', header: 'Lớp', width: 10 },
      { key: 'phone', header: 'Điện thoại', width: 16 },
      { key: 'status', header: 'Trạng thái', width: 14 },
      { key: 'startedOn', header: 'Bắt đầu', width: 22 },
      { key: 'rate', header: 'Đơn giá', width: 16, format: MONEY },
      { key: 'discount', header: 'Miễn giảm', width: 14, format: MONEY },
      { key: 'due', header: 'Phải thu', width: 16, format: MONEY },
      { key: 'dueDate', header: 'Hạn đóng', width: 22 },
    ],
    rows,
  }
}

export async function buildReport(
  kind: ReportKind,
  params: { period: string; fromPeriod?: string; toPeriod?: string },
): Promise<ReportTable> {
  switch (kind) {
    case 'income':
      return incomeReport(params.fromPeriod ?? params.period, params.toPeriod ?? params.period)
    case 'debt':
      return debtReport(params.period)
    case 'attendance':
      return attendanceReport(params.period)
    case 'students':
      return studentsReport(params.period)
  }
}

export function reportLabel(kind: ReportKind): string {
  switch (kind) {
    case 'income':
      return 'Thu nhập theo tháng'
    case 'debt':
      return 'Công nợ'
    case 'attendance':
      return 'Điểm danh'
    case 'students':
      return 'Danh sách học sinh'
  }
}

export function isReportKind(value: string): value is ReportKind {
  return value === 'income' || value === 'debt' || value === 'attendance' || value === 'students'
}

/** Danh sách kỳ từ `from` tới `to`, dùng cho báo cáo thu nhập nhiều tháng. */
export function monthsBetween(fromPeriod: string, toPeriod: string): string[] {
  const periods: string[] = []
  let [year, month] = fromPeriod.split('-').map(Number) as [number, number]
  const [endYear, endMonth] = toPeriod.split('-').map(Number) as [number, number]
  while (year < endYear || (year === endYear && month <= endMonth)) {
    periods.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
    if (periods.length > 240) break
  }
  return periods
}

function describePeriod(period: string): string {
  const { from, to } = periodBounds(period)
  return `${formatDate(from)} — ${formatDate(to)}`
}

/** Nhãn giờ dùng trong báo cáo chi tiết buổi học. */
export function sessionLabel(date: string, startTime: string): string {
  return `${formatDate(date)} lúc ${formatTime(startTime)}`
}
