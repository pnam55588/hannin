/**
 * AD-2: mặt tiếp xúc duy nhất của module nhận xét.
 * Nhận xét gắn với (học sinh, kỳ) nên mỗi tháng mỗi em có đúng một nhận xét,
 * và nhận xét cũ không bị thay thế khi sang tháng mới.
 */

import * as queries from '@/modules/comments/data/queries'

export type CommentView = {
  id: number
  studentId: number
  studentName: string
  period: string
  body: string
  updatedAt: Date
}

export async function listCommentsForPeriod(period: string): Promise<CommentView[]> {
  return queries.selectForPeriod(period)
}

export async function commentsForStudent(studentId: number): Promise<CommentView[]> {
  return queries.selectForStudent(studentId)
}

export async function getComment(
  studentId: number,
  period: string,
): Promise<CommentView | null> {
  return queries.selectOne(studentId, period)
}

export async function saveComment(input: {
  studentId: number
  period: string
  body: string
}): Promise<void> {
  await queries.upsertComment({ ...input, body: input.body.trim() })
}

export async function recentComments(limit = 5): Promise<CommentView[]> {
  return queries.selectRecent(limit)
}
