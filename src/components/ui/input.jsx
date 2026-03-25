import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm',
        'placeholder:text-ink-400 text-ink-900',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-150',
        error && 'border-rose-400 focus:ring-rose-400 focus:border-rose-400',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
