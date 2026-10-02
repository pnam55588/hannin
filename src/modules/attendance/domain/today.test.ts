import { expect, it } from 'vitest'
import { todayCounts } from './today'

it('chưa tới giờ thì không đếm buổi tương lai dù đã lưu điểm danh', () => {
  expect(todayCounts([{ startTime: '08:00:00', complete: true }], '07:45')).toEqual({ started: 0, total: 1, marked: 0 })
})
