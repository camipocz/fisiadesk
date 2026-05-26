'use client'

import { useState, useCallback } from 'react'
import { format, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PaymentSelect } from '@/components/ui/PaymentSelect'
import { NewSessionModal } from './NewSessionModal'
import { createClient } from '@/lib/supabase/client'
import {
  getWeekDates,
  formatCurrency,
  SESSION_STATUS_COLORS,
  SESSION_STATUS_BG,
  SESSION_STATUS_LABELS,
  formatTime,
} from '@/lib/utils'
import type { Session, PaymentStatus } from '@/types'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6h às 22h

interface WeekViewProps {
  initialSessions: Session[]
}

export function WeekView({ initialSessions }: WeekViewProps) {
  const [weekRef, setWeekRef] = useState(new Date())
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const supabase = createClient()
  const weekDates = getWeekDates(weekRef)

  const reload = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const start = weekDates[0].toISOString().split('T')[0]
    const end = weekDates[6].toISOString().split('T')[0]
    const { data } = await supabase
      .from('sessions')
      .select('*, patient:patients(full_name)')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('time')
    setSessions((data ?? []) as Session[])
  }, [weekRef])

  const getSessionsForSlot = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions.filter(s => {
      const sessionHour = parseInt(s.time.split(':')[0])
      return s.date === dateStr && sessionHour === hour
    })
  }

  const handlePaymentUpdate = async (sessionId: string, status: PaymentStatus) => {
    await supabase
      .from('sessions')
      .update({ payment_status: status })
      .eq('id', sessionId)
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, payment_status: status } : s)
    )
  }

  const openNewSession = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0])
    setModalOpen(true)
  }

  return (
    <div>
      {/* Navegação da semana */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekRef(d => subWeeks(d, 1))}
            className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-white/5"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-text-primary px-2">
            {format(weekDates[0], "d 'de' MMM", { locale: ptBR })}
            {' — '}
            {format(weekDates[6], "d 'de' MMM 'de' yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setWeekRef(d => addWeeks(d, 1))}
            className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-white/5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <Button
          size="sm"
          onClick={() => { setSelectedDate(undefined); setModalOpen(true) }}
        >
          <Plus size={14} /> Novo agendamento
        </Button>
      </div>

      {/* Grade semanal */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header dos dias */}
          <div className="grid grid-cols-8 gap-px mb-px">
            <div className="w-12" /> {/* espaço das horas */}
            {weekDates.map((date, i) => {
              const isToday = isSameDay(date, new Date())
              return (
                <div
                  key={i}
                  className="flex flex-col items-center py-2 px-1 text-center"
                >
                  <span className="text-xs text-text-muted uppercase tracking-wide">
                    {format(date, 'EEE', { locale: ptBR })}
                  </span>
                  <span
                    className={`text-sm font-medium mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-action text-bg font-bold'
                        : 'text-text-primary'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Linhas de hora */}
          <div className="border border-white/7 rounded-card overflow-hidden">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 gap-px border-b border-white/5 last:border-b-0"
                style={{ minHeight: '56px' }}
              >
                {/* Label da hora */}
                <div className="flex items-start justify-end pr-3 pt-1.5">
                  <span className="text-xs font-mono text-text-muted">
                    {String(hour).padStart(2, '0')}h
                  </span>
                </div>

                {/* Slots por dia */}
                {weekDates.map((date, di) => {
                  const slotSessions = getSessionsForSlot(date, hour)
                  return (
                    <div
                      key={di}
                      className="relative p-1 min-h-[56px] border-l border-white/5 hover:bg-white/[0.02] cursor-pointer group"
                      onClick={() => openNewSession(date)}
                    >
                      {/* Botão de adicionar */}
                      {slotSessions.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={12} className="text-text-muted" />
                        </div>
                      )}

                      {/* Sessões no slot */}
                      {slotSessions.map(s => (
                        <div
                          key={s.id}
                          className="rounded p-1.5 mb-1 text-xs"
                          style={{
                            backgroundColor: SESSION_STATUS_BG[s.status],
                            borderLeft: `2px solid ${SESSION_STATUS_COLORS[s.status]}`,
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-text-primary truncate flex-1">
                              {s.patient?.full_name?.split(' ')[0] ?? '—'}
                            </span>
                            {s.via_assessor && (
                              <Bot size={9} className="text-action flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-0.5 gap-1">
                            <span
                              className="font-mono text-[10px]"
                              style={{ color: SESSION_STATUS_COLORS[s.status] }}
                            >
                              {SESSION_STATUS_LABELS[s.status]}
                            </span>
                            <PaymentSelect
                              value={s.payment_status}
                              onUpdate={status => handlePaymentUpdate(s.id, status)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-3">
        {[
          { label: 'Confirmado', color: '#22C98A' },
          { label: 'Aguardando', color: '#F5A623' },
          { label: 'Cancelado',  color: '#E53E3E' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <Bot size={12} className="text-action" />
          <span className="text-xs text-text-muted">Via assessor</span>
        </div>
      </div>

      <NewSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDate}
        onCreated={reload}
      />
    </div>
  )
}
