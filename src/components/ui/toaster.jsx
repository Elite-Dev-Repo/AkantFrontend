import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToast } from './use-toast'
import { cn } from '@/lib/utils'

function ToastIcon({ variant }) {
  if (variant === 'destructive') return <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
  if (variant === 'success') return <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
  return <Info className="h-4 w-4 text-blue-500 shrink-0" />
}

export function Toaster() {
  const { toasts } = useToast()
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, open, onOpenChange }) => (
        <ToastPrimitive.Root
          key={id}
          open={open}
          onOpenChange={onOpenChange}
          className={cn(
            'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg transition-all',
            'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
            'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
            'data-[state=open]:slide-in-from-top-full',
            variant === 'destructive'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-ink-100 bg-white text-ink-900'
          )}
        >
          <ToastIcon variant={variant} />
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            {title && <ToastPrimitive.Title className="text-sm font-semibold">{title}</ToastPrimitive.Title>}
            {description && <ToastPrimitive.Description className="text-xs text-ink-500">{description}</ToastPrimitive.Description>}
          </div>
          <ToastPrimitive.Close className="shrink-0 rounded p-0.5 text-ink-400 hover:text-ink-700 transition-colors">
            <X className="h-3.5 w-3.5" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 p-0" />
    </ToastPrimitive.Provider>
  )
}
