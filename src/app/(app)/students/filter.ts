import type { StudentStatus } from '@/modules/students/public'

export type ListStatus = StudentStatus | 'all'
export function filterStudentList<T extends { status: StudentStatus; fullName: string; phone: string | null }>(
  roster: readonly T[], status: ListStatus, query: string,
): T[] {
  const normalized = query.trim().toLocaleLowerCase('vi')
  return roster.filter((student) =>
    (status === 'all' || student.status === status) &&
    (normalized === '' || student.fullName.toLocaleLowerCase('vi').includes(normalized) || (student.phone ?? '').includes(normalized)),
  )
}
