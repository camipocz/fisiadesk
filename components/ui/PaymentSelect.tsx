'use client'

import { useState } from 'react'
import { cn, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/utils'
import type { PaymentStatus } from '@/types'

interface PaymentSelectProps {
  value: PaymentStatus
  onUpdate: (value: PaymentStatus) => Promise<void>
}

export function PaymentSelect({ value, onUpdate }: PaymentSelectProps) {
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<PaymentStatus>(value)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as PaymentStatus
    setLoading(true)
    try {
      await onUpdate(newStatus)
      setCurrent(newStatus)
    } catch {
      // Mantém valor original em caso de erro
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center gap-1.5" style={{ width: '130px', flexShrink: 0 }}>
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: PAYMENT_STATUS_COLORS[current] }}
      />
      <select
        value={current}
        onChange={handleChange}
        disabled={loading}
        className={cn(
          'text-xs font-mono font-medium bg-transparent border-none outline-none cursor-pointer',
          'appearance-none flex-1 disabled:opacity-60'
        )}
        style={{ color: PAYMENT_STATUS_COLORS[current] }}
      >
        <option value="pago">Pago</option>
        <option value="pendente">Pendente</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
  )
}
