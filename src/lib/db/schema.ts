import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// Bảng được khai một lần ở đây, không rải theo module: mỗi bảng chỉ có một
// định nghĩa, và các khoá ngoại cần tham chiếu chéo nên tách ra sẽ sinh vòng
// import. Mỗi module vẫn sở hữu truy vấn và luật của mình trong data/.

/** AD: trạng thái điểm danh là tập giá trị đóng. */
export const attendanceStatus = pgEnum('attendance_status', ['present', 'absent'])

/** AD-6: sổ thu chỉ ghi thêm; sửa sai bằng bản ghi điều chỉnh. */
export const paymentKind = pgEnum('payment_kind', ['payment', 'adjustment'])

/** AD-10: đúng một tài khoản chủ lớp. */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * AD-3: quy tắc lịch của lớp, có hiệu lực theo ngày và chỉ ghi thêm.
 * Các dòng cùng một `effectiveFrom` hợp thành một phiên bản lịch; phiên bản
 * áp dụng cho một ngày là phiên bản có `effectiveFrom` lớn nhất không vượt quá ngày đó.
 * `weekday` theo ISO: 1 = Thứ Hai … 7 = Chủ Nhật.
 */
export const scheduleSlots = pgTable(
  'schedule_slots',
  {
    id: serial('id').primaryKey(),
    classId: integer('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'restrict' }),
    effectiveFrom: date('effective_from', { mode: 'string' }).notNull(),
    weekday: integer('weekday').notNull(),
    startTime: time('start_time').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('schedule_slots_version_unique').on(
      t.classId,
      t.effectiveFrom,
      t.weekday,
      t.startTime,
    ),
  ],
)

/**
 * AD-16: mỗi học sinh có đúng một lớp, khoá ngoại bắt buộc, không có bảng enrollment.
 * Trạng thái học sinh KHÔNG lưu thành cột — nó suy ra từ `startedOn` và `leftOn`
 * theo AD-7 (không lưu số dẫn xuất).
 */
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  classId: integer('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'restrict' }),
  startedOn: date('started_on', { mode: 'string' }).notNull(),
  leftOn: date('left_on', { mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * AD-3: không có bảng buổi. Khoá buổi là bộ ba class_id, session_date, start_time,
 * và `classId` ở đây là lớp tại thời điểm điểm danh (AD-16).
 */
export const attendance = pgTable(
  'attendance',
  {
    id: serial('id').primaryKey(),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'restrict' }),
    classId: integer('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'restrict' }),
    sessionDate: date('session_date', { mode: 'string' }).notNull(),
    startTime: time('start_time').notNull(),
    status: attendanceStatus('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('attendance_session_unique').on(t.studentId, t.classId, t.sessionDate, t.startTime),
  ],
)

/** AD-5: đơn giá và miễn giảm theo mốc hiệu lực; chỉ ghi thêm, cấm sửa mốc cũ. */
export const tuitionRates = pgTable(
  'tuition_rates',
  {
    id: serial('id').primaryKey(),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'restrict' }),
    effectiveFrom: date('effective_from', { mode: 'string' }).notNull(),
    amount: integer('amount').notNull(),
    discount: integer('discount').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('tuition_rates_version_unique').on(t.studentId, t.effectiveFrom)],
)

/**
 * AD-9: hạn đóng là luật lặp của từng học sinh, có hiệu lực theo ngày,
 * KHÔNG lưu trên từng kỳ. `dueDay` từ 1 tới 31, tự kẹp vào ngày cuối tháng.
 */
export const dueDateRules = pgTable(
  'due_date_rules',
  {
    id: serial('id').primaryKey(),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'restrict' }),
    effectiveFrom: date('effective_from', { mode: 'string' }).notNull(),
    dueDay: integer('due_day').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('due_date_rules_version_unique').on(t.studentId, t.effectiveFrom)],
)

/**
 * AD-6 + AD-8: mỗi lần thu là một dòng; `period` là kỳ khoản tiền thuộc về
 * (dữ liệu đầu vào, không suy từ `paidOn`); thu nhập tính theo `paidOn`.
 * `classIdAtPayment` là mỏ neo lịch sử cho báo cáo theo lớp (AD-16).
 */
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'restrict' }),
  period: text('period').notNull(),
  amount: integer('amount').notNull(),
  paidOn: date('paid_on', { mode: 'string' }).notNull(),
  classIdAtPayment: integer('class_id_at_payment')
    .notNull()
    .references(() => classes.id, { onDelete: 'restrict' }),
  kind: paymentKind('kind').notNull().default('payment'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const comments = pgTable(
  'comments',
  {
    id: serial('id').primaryKey(),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'restrict' }),
    period: text('period').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('comments_period_unique').on(t.studentId, t.period)],
)
