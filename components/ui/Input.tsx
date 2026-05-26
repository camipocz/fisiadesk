import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-text-secondary">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'h-9 px-3 text-sm bg-surface-2 border border-white/7 rounded-btn',
            'text-text-primary placeholder:text-text-muted',
            'transition-colors',
            error && 'border-cancelled',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-cancelled">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
