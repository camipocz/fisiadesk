import { cn } from '@/lib/utils'
import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-text-secondary">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            'h-9 px-3 text-sm bg-surface-2 border border-white/7 rounded-btn',
            'text-text-primary',
            'transition-colors appearance-none cursor-pointer',
            error && 'border-cancelled',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-cancelled">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
