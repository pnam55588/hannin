export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`motion-safe:animate-pulse rounded-lg bg-navy-100 ${className}`} />
}

export function PageLoading({ title = 'Đang tải dữ liệu' }: { title?: string }) {
  return <div aria-label={title} role="status" className="space-y-6">
    <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 max-w-full" /></div>
    <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4 rounded-[18px] border border-line bg-surface p-5">
      <Skeleton className="h-5 w-36" />{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-11 w-full" />)}
    </div><div className="space-y-4 rounded-[18px] border border-line bg-surface p-5"><Skeleton className="h-5 w-36" />
      {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-11 w-full" />)}</div></div>
  </div>
}

export function DashboardLoading() {
  return <div role="status" aria-label="Đang tải tổng quan" className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="metric-grid">{Array.from({ length: 4 }, (_, index) =>
      <div key={index} className="space-y-3 rounded-[18px] border border-line bg-surface p-5">
        <Skeleton className="size-9 rounded-full" /><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-36 max-w-full" /><Skeleton className="h-4 w-24" />
      </div>)}</div>
    <PageLoading title="Đang tải lịch và công nợ" />
  </div>
}
