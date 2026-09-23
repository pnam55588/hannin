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
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-navy">{title}</h1>
        {subtitle !== undefined && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions !== undefined && <div className="flex items-center gap-2">{actions}</div>}
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
    <section className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      {(title !== undefined || actions !== undefined) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title !== undefined && <h2 className="text-sm font-semibold text-navy">{title}</h2>}
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
}: {
  label: string
  value: string
  hint?: string
  tone?: 'navy' | 'coral' | 'muted'
}) {
  const color =
    tone === 'coral' ? 'text-coral-700' : tone === 'muted' ? 'text-muted' : 'text-navy'
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
      {hint !== undefined && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
            {head.map((label) => (
              <th key={label} className="px-3 py-2">
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
      ? 'bg-navy-100 text-navy'
      : tone === 'warn'
        ? 'bg-coral-100 text-coral-700'
        : tone === 'bad'
          ? 'bg-coral text-white'
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
