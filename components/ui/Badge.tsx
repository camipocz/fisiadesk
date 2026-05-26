import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'confirmed' | 'waiting' | 'cancelled' | 'assessor'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
        {
          'bg-white/7 text-text-secondary': variant === 'default',
          'bg-confirmed-dim text-confirmed': variant === 'confirmed',
          'bg-waiting-dim text-waiting': variant === 'waiting',
          'bg-cancelled-dim text-cancelled': variant === 'cancelled',
          'bg-action-dim text-action': variant === 'assessor',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
