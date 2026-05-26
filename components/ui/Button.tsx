'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-btn transition-all',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          {
            // Primary
            'bg-action text-bg hover:bg-action/90 active:scale-[0.98]':
              variant === 'primary',
            // Secondary
            'bg-surface-2 text-text-primary border border-white/7 hover:bg-white/5 active:scale-[0.98]':
              variant === 'secondary',
            // Ghost
            'text-text-secondary hover:text-text-primary hover:bg-white/5':
              variant === 'ghost',
            // Danger
            'bg-cancelled/10 text-cancelled border border-cancelled/20 hover:bg-cancelled/20':
              variant === 'danger',
            // Sizes
            'text-xs px-3 py-1.5 h-7': size === 'sm',
            'text-sm px-4 py-2 h-9': size === 'md',
            'text-base px-5 py-2.5 h-11': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
