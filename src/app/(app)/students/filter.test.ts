import { expect, it } from 'vitest'
import { filterStudentList } from './filter'

it('ẩn học sinh đã nghỉ theo mặc định và cho xem lại bằng bộ lọc', () => {
  const roster = [
    { status: 'active' as const, fullName: 'An', phone: null },
    { status: 'left' as const, fullName: 'Bình', phone: null, leftOn: '2026-09-10' },
  ]
  expect(filterStudentList(roster, 'active', '')).toEqual([roster[0]])
  expect(filterStudentList(roster, 'left', '')).toEqual([roster[1]])
  expect(filterStudentList(roster, 'all', '')).toEqual(roster)
})
