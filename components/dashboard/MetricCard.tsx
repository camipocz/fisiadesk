import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: { value: string; positive?: boolean }
  mono?: boolean
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = '#22C98A',
  trend,
  mono = false,
}: MetricCardProps) {
  return (
    <div className="bg-surface border border-white/7 rounded-card p-5 shadow-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-secondary">{title}</p>
        <div
          className="w-8 h-8 rounded-btn flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon size={15} style={{ color: iconColor }} />
        </div>
      </div>

      <p
        className={cn(
          'text-2xl font-semibold text-text-primary leading-none',
          mono && 'font-mono'
        )}
      >
        {value}
      </p>

      {subtitle && (
        <p className="text-xs text-text-muted mt-1.5">{subtitle}</p>
      )}

      {trend && (
        <div className="mt-2">
          <span
            className={cn(
              'text-xs font-medium',
              trend.positive ? 'text-confirmed' : 'text-cancelled'
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  )
}
