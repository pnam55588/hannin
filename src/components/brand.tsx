import Image from 'next/image'

/** Lockup trích từ board logo gốc do khách cung cấp. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand-lockup">
    <Image src="/haninn-lockup.png" alt="Haninn English Class" width={compact ? 120 : 180}
      height={compact ? 104 : 157} priority className="h-auto max-w-full" />
  </div>
}
