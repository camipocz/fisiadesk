'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { AvailableHour } from '@/types'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7h às 22h

interface HoursGridProps {
  initialHours: AvailableHour[]
  userId: string
}

export function HoursGrid({ initialHours, userId }: HoursGridProps) {
  const [hours, setHours] = useState<AvailableHour[]>(initialHours)
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  const isEnabled = (day: number, hour: number) =>
    hours.find(h => h.day_of_week === day && h.hour === hour)?.enabled ?? false

  const toggle = async (day: number, hour: number) => {
    const key = `${day}-${hour}`
    setSaving(key)
    const current = isEnabled(day, hour)
    const existing = hours.find(h => h.day_of_week === day && h.hour === hour)

    if (existing) {
      await supabase
        .from('available_hours')
        .update({ enabled: !current })
        .eq('id', existing.id)
      setHours(prev =>
        prev.map(h => h.id === existing.id ? { ...h, enabled: !current } : h)
      )
    } else {
      const { data } = await supabase
        .from('available_hours')
        .insert({ user_id: userId, day_of_week: day, hour, enabled: true })
        .select()
        .single()
      if (data) setHours(prev => [...prev, data])
    }
    setSaving(null)
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header */}
        <div className="grid mb-2" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
          <div />
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-text-muted py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grade */}
        <div className="space-y-1">
          {HOURS.map(hour => (
            <div
              key={hour}
              className="grid items-center"
              style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}
            >
              {/* Label da hora */}
              <span className="text-xs font-mono text-text-muted text-right pr-3">
                {String(hour).padStart(2, '0')}h
              </span>

              {/* Células por dia */}
              {DAYS.map((_, day) => {
                const enabled = isEnabled(day, hour)
                const isSaving = saving === `${day}-${hour}`
                return (
                  <button
                    key={day}
                    onClick={() => toggle(day, hour)}
                    disabled={isSaving}
                    className={cn(
                      'mx-0.5 h-7 rounded transition-all duration-150',
                      enabled
                        ? 'bg-action-dim border border-action/30 hover:bg-action/20'
                        : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]',
                      isSaving && 'opacity-50'
                    )}
                    title={`${DAYS[day]} ${hour}h — ${enabled ? 'Disponível' : 'Fechado'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-action-dim border border-action/30" />
            <span className="text-xs text-text-muted">Disponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white/[0.03] border border-white/5" />
            <span className="text-xs text-text-muted">Fechado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
