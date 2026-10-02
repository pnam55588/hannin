/**
 * Thành phần trình bày dùng chung. Không chứa luật nghiệp vụ và không tự tính
 * con số nào — mọi con số do module sở hữu truyền vào (AD-12).
 */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="mb-6 flex min-w-0 flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold text-navy">{title}</h1>
        {subtitle !== undefined && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function Card({
  title,
  hint,
  actions,
  children,
  className = '',
}: {
  title?: string
  hint?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 rounded-[18px] border border-line bg-surface p-5 shadow-sm ${className}`}>
      {(title !== undefined || actions !== undefined) && (
        <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div>
            {title !== undefined && <h2 className="text-base font-bold text-navy">{title}</h2>}
            {hint !== undefined && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'navy',
  icon,
}: {
  label: string
  value: string
  hint?: React.ReactNode
  tone?: 'navy' | 'coral' | 'muted' | 'mint' | 'butter' | 'lavender'
  icon?: 'income' | 'calendar' | 'attendance'
}) {
  const background = { navy: 'bg-surface', coral: 'bg-coral-100', muted: 'bg-surface', mint: 'bg-mint-tint', butter: 'bg-butter-tint', lavender: 'bg-lavender-tint' }[tone]
  const iconShape = icon === 'income'
    ? <><path d="M4 20V4m0 16h16M8 16v-5m5 5V7m5 9v-8" /></>
    : icon === 'calendar'
      ? <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></>
      : <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="m7 13 3 3 6-7" /></>
  return (
    <div className={`min-w-0 rounded-[18px] border border-line px-5 py-4 ${background}`}>
      {icon && <span aria-hidden="true" className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-white text-navy"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconShape}</svg></span>}
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-navy lg:text-lg xl:text-2xl">{value}</p>
      {hint !== undefined && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  )
}

export function Table({
  head,
  children,
  empty,
}: {
  head: string[]
  children: React.ReactNode
  empty?: string
}) {
  const hasRows = Array.isArray(children) ? children.length > 0 : children !== null
  return (
    <div className="table-viewport" role="region" aria-label="Bảng dữ liệu, kéo ngang để xem thêm cột" tabIndex={0}>
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
            {head.map((label) => (
              <th key={label} scope="col" className="px-3 py-2">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!hasRows && empty !== undefined && (
        <p className="px-3 py-6 text-center text-sm text-muted">{empty}</p>
      )}
    </div>
  )
}

export function Row({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-line/70 last:border-0">{children}</tr>
}

export function Cell({
  children,
  align = 'left',
  strong = false,
}: {
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
  strong?: boolean
}) {
  const alignment = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <td className={`px-3 py-2 align-middle ${alignment} ${strong ? 'font-semibold' : ''}`}>
      {children}
    </td>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'ok' | 'warn' | 'bad'
}) {
  const styles =
    tone === 'ok'
      ? 'bg-success-tint text-success-ink'
      : tone === 'warn'
        ? 'bg-butter-tint text-navy'
        : tone === 'bad'
          ? 'bg-coral-100 text-coral-700'
          : 'bg-canvas text-muted'
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  )
}

export function Notice({
  tone = 'warn',
  children,
}: {
  tone?: 'warn' | 'ok' | 'info'
  children: React.ReactNode
}) {
  const styles =
    tone === 'ok'
      ? 'border-navy-100 bg-navy-100/60 text-navy'
      : tone === 'info'
        ? 'border-line bg-canvas text-muted'
        : 'border-coral-100 bg-coral-100/70 text-coral-700'
  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{children}</div>
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-6 text-center text-sm text-muted">{children}</p>
}
