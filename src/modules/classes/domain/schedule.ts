/**
 * AD-3: buổi học là hàm thuần của quy tắc lịch, không phải bản ghi được lưu.
 * Đây là nguồn duy nhất sinh ra buổi cho toàn hệ thống.
 */

import { eachDay, isoWeekday, periodBounds } from '@/lib/clock'

export type Slot = {
  /** ISO: 1 = Thứ Hai … 7 = Chủ Nhật */
  weekday: number
  /** 'HH:MM:SS' */
  startTime: string
}

/** Một phiên bản lịch: các khung giờ cùng hiệu lực từ một ngày. */
export type ScheduleVersion = {
  effectiveFrom: string
  slots: readonly Slot[]
}

export type Session = {
  classId: number
  date: string
  startTime: string
}

/**
 * Phiên bản lịch áp dụng cho một ngày là phiên bản có `effectiveFrom` lớn nhất
 * không vượt quá ngày đó. Trước mốc đầu tiên thì lớp chưa có lịch.
 */
export function versionAt(
  versions: readonly ScheduleVersion[],
  date: string,
): ScheduleVersion | null {
  let best: ScheduleVersion | null = null
  for (const version of versions) {
    if (version.effectiveFrom > date) continue
    if (best === null || version.effectiveFrom > best.effectiveFrom) best = version
  }
  return best
}

/** Sinh mọi buổi của một lớp trong khoảng ngày, đã sắp xếp theo thời gian. */
export function sessionsBetween(
  versions: readonly ScheduleVersion[],
  classId: number,
  from: string,
  to: string,
): Session[] {
  if (from > to) return []
  const sessions: Session[] = []
  for (const date of eachDay(from, to)) {
    const version = versionAt(versions, date)
    if (version === null) continue
    const weekday = isoWeekday(date)
    for (const slot of version.slots) {
      if (slot.weekday !== weekday) continue
      sessions.push({ classId, date, startTime: slot.startTime })
    }
  }
  return sessions.sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  )
}

export function sessionsInPeriod(
  versions: readonly ScheduleVersion[],
  classId: number,
  period: string,
): Session[] {
  const { from, to } = periodBounds(period)
  return sessionsBetween(versions, classId, from, to)
}

/** Khoá buổi: bộ ba bất biến của AD-3. */
export function sessionKey(session: Session): string {
  return `${session.classId}|${session.date}|${session.startTime}`
}

export function keyOf(classId: number, date: string, startTime: string): string {
  return `${classId}|${date}|${startTime}`
}

/**
 * AD-3: ghi điểm danh bắt buộc kiểm buổi có tồn tại. Bản ghi cho một buổi
 * không nằm trong lịch bị từ chối, nên buổi bù và ngày nghỉ lễ phải chờ
 * bảng ngoại lệ ở mục Deferred thay vì được ghi tự do.
 */
export function sessionExists(sessions: readonly Session[], key: string): boolean {
  return sessions.some((session) => sessionKey(session) === key)
}

/** Nhóm các buổi theo ngày, dùng cho màn lịch học và màn điểm danh. */
export function groupByDate(sessions: readonly Session[]): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>()
  for (const session of sessions) {
    const bucket = grouped.get(session.date)
    if (bucket === undefined) grouped.set(session.date, [session])
    else bucket.push(session)
  }
  return grouped
}
