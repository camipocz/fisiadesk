'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-text-primary">{label}</p>}
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
      )}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex w-10 h-5.5 rounded-full transition-colors duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0',
          checked ? 'bg-action' : 'bg-white/10'
        )}
        style={{ minWidth: '40px', height: '22px' }}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow',
            'transition-transform duration-200',
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
