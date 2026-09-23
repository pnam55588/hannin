import ExcelJS from 'exceljs'
import type { ReportTable } from '@/modules/reports/public'

/**
 * AD-15: Excel là định dạng xuất DUY NHẤT. Không PDF, không in ấn.
 * Số tiền được ghi dưới dạng SỐ chứ không phải chuỗi, để chủ lớp còn cộng được.
 */
export async function toXlsx(table: ReportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Haninn'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(table.title.slice(0, 30))
  sheet.columns = table.columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }))

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D1F3D' },
  }
  headerRow.alignment = { vertical: 'middle' }

  for (const row of table.rows) sheet.addRow(row)

  for (const column of table.columns) {
    if (column.format === undefined) continue
    sheet.getColumn(column.key).numFmt = column.format
  }

  // Ghi chú về luật nghiệp vụ ngay trong file, để con số không bị hiểu sai
  // khi file rời khỏi phần mềm.
  if (table.notes.length > 0) {
    sheet.addRow([])
    for (const note of table.notes) {
      const row = sheet.addRow([note])
      row.font = { italic: true, size: 10, color: { argb: 'FF667085' } }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
