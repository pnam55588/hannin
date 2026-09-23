/**
 * AD-2: đây là mặt tiếp xúc duy nhất của module lớp học.
 * Module khác chỉ được import file này, không được chạm vào data/ hay domain/.
 *
 * AD-3: module này SỞ HỮU hàm sinh buổi học. Mọi nơi cần biết "tháng này lớp có
 * bao nhiêu buổi" đều phải hỏi ở đây, không nơi nào tự đếm lại.
 */

import { businessToday } from '@/lib/clock'
import {
  groupByDate as groupSessionsByDate,
  sessionsBetween,
  sessionsInPeriod,
  type ScheduleVersion,
  type Session,
} from '@/modules/classes/domain/schedule'
import * as queries from '@/modules/classes/data/queries'

export type { Session } from '@/modules/classes/domain/schedule'

export type ClassView = {
  id: number
  name: string
  /** Số học sinh đang học tại hôm nay. */
  studentCount: number
}

export type ScheduleSlotView = {
  id: number
  effectiveFrom: string
  weekday: number
  startTime: string
}

export async function listClasses(today: string = businessToday()): Promise<ClassView[]> {
  return queries.selectClasses(today)
}

export async function getClass(id: number): Promise<{ id: number; name: string } | null> {
  return queries.selectClassById(id)
}

export async function createClass(name: string): Promise<{ id: number }> {
  return queries.insertClass(name.trim())
}

export async function renameClass(id: number, name: string): Promise<void> {
  await queries.updateClassName(id, name.trim())
}

export async function listScheduleSlots(classId: number): Promise<ScheduleSlotView[]> {
  return queries.selectSlots(classId)
}

/** Gom các dòng có cùng mốc hiệu lực thành một phiên bản lịch. */
export function toVersions(slots: readonly { effectiveFrom: string; weekday: number; startTime: string }[]): ScheduleVersion[] {
  const byDate = new Map<string, { weekday: number; startTime: string }[]>()
  for (const slot of slots) {
    const bucket = byDate.get(slot.effectiveFrom)
    const entry = { weekday: slot.weekday, startTime: slot.startTime }
    if (bucket === undefined) byDate.set(slot.effectiveFrom, [entry])
    else bucket.push(entry)
  }
  return [...byDate.entries()]
    .map(([effectiveFrom, versionSlots]) => ({ effectiveFrom, slots: versionSlots }))
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))
}

export async function scheduleVersions(classId: number): Promise<ScheduleVersion[]> {
  return toVersions(await queries.selectSlots(classId))
}

/**
 * AD-3: lịch chỉ ghi thêm. Đổi lịch là thêm một phiên bản mới có ngày hiệu lực
 * mới; phiên bản cũ giữ nguyên nên buổi trong quá khứ không bao giờ đổi.
 */
export async function addScheduleVersion(input: {
  classId: number
  effectiveFrom: string
  slots: readonly { weekday: number; startTime: string }[]
}): Promise<void> {
  const existing = await listScheduleSlots(input.classId)
  if (existing.some((slot) => slot.effectiveFrom === input.effectiveFrom)) {
    throw new Error(
      'Mốc hiệu lực này đã có lịch. Chọn ngày khác để thay đổi lịch, để lịch sử không bị ghi đè.',
    )
  }
  await queries.insertSlots(input.classId, input.effectiveFrom, input.slots)
}

/** Buổi của một lớp trong một khoảng ngày. */
export async function sessionsForClassBetween(
  classId: number,
  from: string,
  to: string,
): Promise<Session[]> {
  const versions = await scheduleVersions(classId)
  return sessionsBetween(versions, classId, from, to)
}

/** Buổi của một lớp trong một kỳ. */
export async function sessionsForClassInPeriod(
  classId: number,
  period: string,
): Promise<Session[]> {
  return sessionsInPeriod(await scheduleVersions(classId), classId, period)
}

/** Buổi của mọi lớp trong một kỳ — dùng cho điểm danh và báo cáo. */
export async function sessionsForPeriod(period: string): Promise<Session[]> {
  const all = await queries.selectAllSlots()
  const byClass = new Map<number, { effectiveFrom: string; weekday: number; startTime: string }[]>()
  for (const slot of all) {
    const bucket = byClass.get(slot.classId)
    if (bucket === undefined) byClass.set(slot.classId, [slot])
    else bucket.push(slot)
  }

  const sessions: Session[] = []
  for (const [classId, slots] of byClass) {
    sessions.push(...sessionsInPeriod(toVersions(slots), classId, period))
  }
  return sessions.sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  )
}

/** Buổi của mọi lớp trong một khoảng ngày. */
export async function sessionsForBetween(from: string, to: string): Promise<Session[]> {
  const all = await queries.selectAllSlots()
  const byClass = new Map<number, { effectiveFrom: string; weekday: number; startTime: string }[]>()
  for (const slot of all) {
    const bucket = byClass.get(slot.classId)
    if (bucket === undefined) byClass.set(slot.classId, [slot])
    else bucket.push(slot)
  }

  const sessions: Session[] = []
  for (const [classId, slots] of byClass) {
    sessions.push(...sessionsBetween(toVersions(slots), classId, from, to))
  }
  return sessions.sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  )
}

/**
 * AD-3: điểm danh bắt buộc kiểm buổi có tồn tại trong lịch. Nếu không có hàm
 * này, một bản ghi điểm danh cho ngày không có lớp vẫn ghi được và mọi báo cáo
 * phía sau sẽ lệch.
 */
export async function sessionExists(
  classId: number,
  date: string,
  startTime: string,
): Promise<boolean> {
  const sessions = await sessionsForClassBetween(classId, date, date)
  return sessions.some((session) => session.startTime === startTime)
}

export async function sessionsGroupedByDate(
  from: string,
  to: string,
): Promise<Map<string, Session[]>> {
  return groupSessionsByDate(await sessionsForBetween(from, to))
}
