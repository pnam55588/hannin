export function todayCounts(
  sessions: readonly { startTime: string; complete: boolean }[],
  time: string,
): { started: number; total: number; marked: number } {
  const started = sessions.filter((session) => session.startTime.slice(0, 5) <= time)
  return { started: started.length, total: sessions.length, marked: started.filter((session) => session.complete).length }
}
