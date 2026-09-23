'use client'

/** Thành phần nhập liệu dùng chung cho mọi form. Không chứa luật nghiệp vụ. */

export function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  required = false,
  hint,
  min,
  max,
  step,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string | number
  placeholder?: string
  required?: boolean
  hint?: string
  min?: string | number
  max?: string | number
  step?: string | number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
      />
      {hint !== undefined && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  required = false,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
  defaultValue?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function TextareaField({
  label,
  name,
  defaultValue,
  rows = 4,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  rows?: number
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
      />
    </label>
  )
}

export function SubmitButton({
  children,
  pending,
  tone = 'navy',
}: {
  children: React.ReactNode
  pending: boolean
  tone?: 'navy' | 'coral'
}) {
  const styles =
    tone === 'coral'
      ? 'bg-coral text-white hover:bg-coral-700'
      : 'bg-navy text-white hover:bg-navy-700'
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${styles}`}
    >
      {pending ? 'Đang lưu…' : children}
    </button>
  )
}

export function FormStatus({
  error,
  message,
}: {
  error: string | null
  message?: string | null
}) {
  if (error !== null) {
    return (
      <p role="alert" className="rounded-lg bg-coral-100 px-3 py-2 text-sm text-coral-700">
        {error}
      </p>
    )
  }
  if (message !== undefined && message !== null) {
    return (
      <p className="rounded-lg bg-navy-100 px-3 py-2 text-sm text-navy">{message}</p>
    )
  }
  return null
}
