import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormField({ label, error, hint, required, className, children }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
