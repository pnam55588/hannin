import { config } from 'dotenv'

config({ path: '.env.local' })
config()

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
  attendance,
  classes,
  comments,
  dueDateRules,
  payments,
  scheduleSlots,
  students,
  tuitionRates,
} from '../src/lib/db/schema'
import { addDays, businessToday, currentPeriod, periodBounds, shiftPeriod } from '../src/lib/clock'
import { sessionsBetween, type ScheduleVersion } from '../src/modules/classes/domain/schedule'

/**
 * Dữ liệu mẫu để chạy thử. KHÔNG chạy trên production: dữ liệu thật của lớp mà
 * lẫn dữ liệu mẫu thì không gỡ ra được nữa.
 */
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (url === undefined || url === '') {
  console.error('Thiếu DATABASE_URL (hoặc DIRECT_URL).')
  process.exit(1)
}
if (process.env.NODE_ENV === 'production') {
  console.error('Từ chối tạo dữ liệu mẫu khi NODE_ENV=production.')
  process.exit(1)
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} })
const db = drizzle(client)

const today = businessToday()
const thisPeriod = currentPeriod()
const lastPeriod = shiftPeriod(thisPeriod, -1)

/** Ngày bắt đầu lịch: đầu tháng trước, để có dữ liệu của hai kỳ. */
const scheduleStart = periodBounds(lastPeriod).from

try {
  // Bắt đầu từ sạch để chạy lại nhiều lần vẫn ra cùng kết quả.
  await db.delete(attendance)
  await db.delete(payments)
  await db.delete(comments)
  await db.delete(tuitionRates)
  await db.delete(dueDateRules)
  await db.delete(students)
  await db.delete(scheduleSlots)
  await db.delete(classes)

  const [fourA] = await db
    .insert(classes)
    .values({ name: '4A' })
    .returning({ id: classes.id })
  const [fiveB] = await db
    .insert(classes)
    .values({ name: '5B' })
    .returning({ id: classes.id })

  if (fourA === undefined || fiveB === undefined) throw new Error('Không tạo được lớp')

  // Lớp 4A: Thứ Hai, Tư, Sáu lúc 08:00.
  await db.insert(scheduleSlots).values([
    { classId: fourA.id, effectiveFrom: scheduleStart, weekday: 1, startTime: '08:00:00' },
    { classId: fourA.id, effectiveFrom: scheduleStart, weekday: 3, startTime: '08:00:00' },
    { classId: fourA.id, effectiveFrom: scheduleStart, weekday: 5, startTime: '08:00:00' },
  ])

  // Lớp 5B: Thứ Ba, Năm lúc 17:30, và từ đầu tháng này đổi thành 18:00.
  // Đây là ca kiểm chứng cho AD-3: buổi của tháng trước phải giữ giờ cũ.
  await db.insert(scheduleSlots).values([
    { classId: fiveB.id, effectiveFrom: scheduleStart, weekday: 2, startTime: '17:30:00' },
    { classId: fiveB.id, effectiveFrom: scheduleStart, weekday: 4, startTime: '17:30:00' },
    { classId: fiveB.id, effectiveFrom: periodBounds(thisPeriod).from, weekday: 2, startTime: '18:00:00' },
    { classId: fiveB.id, effectiveFrom: periodBounds(thisPeriod).from, weekday: 4, startTime: '18:00:00' },
  ])

  const roster = [
    { fullName: 'Nguyễn Minh Anh', classId: fourA.id, phone: '0901234567', startedOn: scheduleStart },
    { fullName: 'Trần Gia Bảo', classId: fourA.id, phone: '0902345678', startedOn: scheduleStart },
    { fullName: 'Lê Khánh Chi', classId: fourA.id, phone: '0903456789', startedOn: scheduleStart },
    { fullName: 'Phạm Đức Duy', classId: fourA.id, phone: '0904567890', startedOn: scheduleStart },
    { fullName: 'Hoàng Thảo Linh', classId: fourA.id, phone: '0905678901', startedOn: addDays(scheduleStart, 15) },
    { fullName: 'Vũ Nhật Minh', classId: fourA.id, phone: '0906789012', startedOn: addDays(scheduleStart, 20) },
    { fullName: 'Đặng Bảo Ngọc', classId: fourA.id, phone: '0907890123', startedOn: addDays(scheduleStart, 40) },
    { fullName: 'Bùi Tuấn Phong', classId: fourA.id, phone: '0908901234', startedOn: addDays(scheduleStart, 50) },
    { fullName: 'Ngô Hà My', classId: fiveB.id, phone: '0909012345', startedOn: scheduleStart },
    { fullName: 'Đỗ Quang Huy', classId: fiveB.id, phone: '0910123456', startedOn: scheduleStart },
    { fullName: 'Phan Mai Phương', classId: fiveB.id, phone: '0911234567', startedOn: scheduleStart },
    { fullName: 'Trịnh Anh Khoa', classId: fiveB.id, phone: '0912345678', startedOn: addDays(scheduleStart, 25) },
    {
      fullName: 'Lý Thanh Trúc',
      classId: fiveB.id,
      phone: '0913456789',
      startedOn: scheduleStart,
      leftOn: addDays(scheduleStart, 60),
    },
  ]

  const inserted = await db.insert(students).values(roster).returning({
    id: students.id,
    fullName: students.fullName,
    classId: students.classId,
    startedOn: students.startedOn,
    leftOn: students.leftOn,
  })

  // Đơn giá: mọi em đều có mốc, riêng hai chị em được miễn giảm nhiều hơn.
  await db.insert(tuitionRates).values(
    inserted.map((student) => ({
      studentId: student.id,
      effectiveFrom: student.startedOn,
      amount: student.classId === fourA.id ? 2_000_000 : 2_400_000,
      discount: student.fullName === 'Nguyễn Minh Anh' ? 300_000 : 0,
    })),
  )

  await db.insert(dueDateRules).values(
    inserted.map((student) => ({
      studentId: student.id,
      effectiveFrom: student.startedOn,
      dueDay: student.classId === fourA.id ? 10 : 15,
    })),
  )

  // Sinh buổi bằng chính hàm nghiệp vụ, không tự đếm lại trong script.
  const versionsByClass = new Map<number, ScheduleVersion[]>()
  const slotRows = await db.select().from(scheduleSlots)
  for (const slot of slotRows) {
    const list = versionsByClass.get(slot.classId) ?? []
    const version = list.find((item) => item.effectiveFrom === slot.effectiveFrom)
    const entry = { weekday: slot.weekday, startTime: slot.startTime }
    if (version === undefined) {
      list.push({ effectiveFrom: slot.effectiveFrom, slots: [entry] })
    } else {
      ;(version.slots as { weekday: number; startTime: string }[]).push(entry)
    }
    versionsByClass.set(slot.classId, list)
  }

  const attendanceRows: {
    studentId: number
    classId: number
    sessionDate: string
    startTime: string
    status: 'present' | 'absent'
  }[] = []

  let seed = 7
  const nextRandom = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }

  for (const [classId, versions] of versionsByClass) {
    // Chỉ điểm danh tới hôm nay: buổi tương lai chưa diễn ra thì chưa ghi.
    const sessions = sessionsBetween(versions, classId, scheduleStart, today)
    for (const session of sessions) {
      for (const student of inserted) {
        if (student.classId !== classId) continue
        if (student.startedOn > session.date) continue
        if (student.leftOn !== null && student.leftOn < session.date) continue
        attendanceRows.push({
          studentId: student.id,
          classId,
          sessionDate: session.date,
          startTime: session.startTime,
          status: nextRandom() < 0.92 ? 'present' : 'absent',
        })
      }
    }
  }

  await db.insert(attendance).values(attendanceRows)

  // Thu: kỳ trước đóng đủ, kỳ này ba em còn thiếu để màn công nợ có dữ liệu.
  const paymentRows: {
    studentId: number
    period: string
    amount: number
    paidOn: string
    classIdAtPayment: number
    kind: 'payment'
    note: string | null
  }[] = []

  for (const student of inserted) {
    const amount = student.classId === fourA.id ? 2_000_000 : 2_400_000
    const discount = student.fullName === 'Nguyễn Minh Anh' ? 300_000 : 0
    if (student.startedOn > periodBounds(lastPeriod).to) continue
    paymentRows.push({
      studentId: student.id,
      period: lastPeriod,
      amount: amount - discount,
      paidOn: `${lastPeriod}-08`,
      classIdAtPayment: student.classId,
      kind: 'payment',
      note: null,
    })
  }

  const currentCharges = inserted.filter((student) => student.leftOn === null)
  currentCharges.forEach((student, index) => {
    const amount = student.classId === fourA.id ? 2_000_000 : 2_400_000
    const discount = student.fullName === 'Nguyễn Minh Anh' ? 300_000 : 0
    // Ba em cuối chưa đóng gì; ba em kế đóng một phần; còn lại đóng đủ.
    const partial = index % 5 === 3
    const unpaid = index % 5 === 4
    if (unpaid) return
    paymentRows.push({
      studentId: student.id,
      period: thisPeriod,
      amount: partial ? Math.round((amount - discount) / 2) : amount - discount,
      paidOn: `${thisPeriod}-${String(5 + (index % 20)).padStart(2, '0')}`,
      classIdAtPayment: student.classId,
      kind: 'payment',
      note: partial ? 'Phụ huynh đóng một nửa' : null,
    })
  })

  await db.insert(payments).values(paymentRows)

  await db.insert(comments).values([
    {
      studentId: inserted[0]!.id,
      period: lastPeriod,
      body: 'Con tiếp thu nhanh, phát âm tốt. Cần luyện thêm phần viết câu.',
    },
    {
      studentId: inserted[0]!.id,
      period: thisPeriod,
      body: 'Con tiến bộ rõ ở phần nghe. Đã dùng được thì hiện tại đơn.',
    },
    {
      studentId: inserted[1]!.id,
      period: thisPeriod,
      body: 'Con còn nhút nhát khi nói. Cô sẽ gọi nhiều hơn để con quen.',
    },
  ])

  console.log(
    `Đã tạo dữ liệu mẫu: ${inserted.length} học sinh, ${attendanceRows.length} dòng điểm danh, ${paymentRows.length} khoản thu.`,
  )
  console.log(`Kỳ đang xem: ${thisPeriod}. Kỳ trước: ${lastPeriod}. Hôm nay: ${today}.`)
} catch (error) {
  console.error('Tạo dữ liệu mẫu thất bại:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
