import { cn } from '@/lib/utils'
import { Loader2, Inbox } from 'lucide-react'

// Skeleton ------------------------------------------------------------------
export function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton h-4 w-full', className)} {...props} />
}

export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white border border-ink-100">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

// Spinner -------------------------------------------------------------------
export function Spinner({ className }) {
  return <Loader2 className={cn('animate-spin text-brand-600', className)} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

// Badge ---------------------------------------------------------------------
export function Badge({ children, variant = 'gray', className }) {
  const variants = {
    green: 'badge-green',
    red: 'badge-red',
    amber: 'badge-amber',
    blue: 'badge-blue',
    gray: 'badge-gray',
  }
  return <span className={cn(variants[variant] || variants.gray, className)}>{children}</span>
}

// Empty State ---------------------------------------------------------------
export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="p-4 rounded-2xl bg-ink-50 mb-4">
        <Icon className="h-8 w-8 text-ink-300" />
      </div>
      <h3 className="text-base font-display font-semibold text-ink-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Error State ---------------------------------------------------------------
export function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-rose-50 mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-sm text-rose-600">{message}</p>
    </div>
  )
}

// Separator -----------------------------------------------------------------
export function Separator({ className }) {
  return <div className={cn('h-px bg-ink-100 w-full', className)} />
}
