'use client'

import { useState } from 'react'
import { cn, SESSION_STATUS_LABELS, SESSION_STATUS_COLORS } from '@/lib/utils'
import type { SessionStatus } from '@/types'

interface StatusSelectProps {
  value: SessionStatus
  onUpdate: (value: SessionStatus) => Promise<void>
}

export function StatusSelect({ value, onUpdate }: StatusSelectProps) {
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<SessionStatus>(value)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as SessionStatus
    setLoading(true)
    try {
      await onUpdate(newStatus)
      setCurrent(newStatus)
    } catch {
      // mantém valor original em caso de erro
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: SESSION_STATUS_COLORS[current] }}
      />
      <select
        value={current}
        onChange={handleChange}
        disabled={loading}
        className={cn(
          'text-[10px] font-mono font-medium bg-transparent border-none outline-none cursor-pointer',
          'appearance-none disabled:opacity-60'
        )}
        style={{ color: SESSION_STATUS_COLORS[current] }}
      >
        <option value="confirmado">Confirmado</option>
        <option value="aguardando">Aguardando</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
  )
}
