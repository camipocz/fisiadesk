'use client'

import { useState, useCallback } from 'react'
import { format, addWeeks, subWeeks, addDays, subDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Bot,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PaymentSelect } from '@/components/ui/PaymentSelect'
import { StatusSelect } from '@/components/ui/StatusSelect'
import { NewSessionModal } from './NewSessionModal'
import { createClient } from '@/lib/supabase/client'
import {
  getWeekDates,
  SESSION_STATUS_COLORS,
  SESSION_STATUS_BG,
  formatTime,
} from '@/lib/utils'
import type { Session, PaymentStatus, SessionStatus } from '@/types'

// Slots de 30 em 30 minutos: 06:00 → 22:00
const SLOTS = Array.from({ length: 33 }, (_, i) => ({
  hour: Math.floor(i / 2) + 6,
  minute: (i % 2) * 30,
}))

interface WeekViewProps {
  initialSessions: Session[]
}

export function WeekView({ initialSessions }: WeekViewProps) {
  const [weekRef, setWeekRef] = useState(new Date())
  const [dayRef, setDayRef] = useState(new Date())
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>()

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

  const getSessionsForSlot = (date: Date, hour: number, minute: number) => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions.filter(s => {
      const [sessionHour, sessionMinute] = s.time.split(':').map(Number)
      return s.date === dateStr && sessionHour === hour && sessionMinute === minute
    })
  }

  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions
      .filter(s => s.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const handlePaymentUpdate = async (sessionId: string, status: PaymentStatus) => {
    await supabase.from('sessions').update({ payment_status: status }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, payment_status: status } : s))
  }

  const handleStatusUpdate = async (sessionId: string, status: SessionStatus) => {
    await supabase.from('sessions').update({ status }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s))
  }

  const openNewSession = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0])
    setModalOpen(true)
  }

  return (
    <div>
      {/* ────────────────────────────────────────────
          MOBILE: visualização por dia
      ──────────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Navegação de dia */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDayRef(d => subDays(d, 1))}
              className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-white/5"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-text-primary px-2 capitalize">
              {format(dayRef, "EEE, d 'de' MMM", { locale: ptBR })}
            </span>
            <button
              onClick={() => setDayRef(d => addDays(d, 1))}
              className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-white/5"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectedDate(dayRef.toISOString().split('T')[0])
              setModalOpen(true)
            }}
          >
            <Plus size={14} /> Novo
          </Button>
        </div>

        {/* Lista de sessões do dia */}
        <div className="space-y-2">
          {getSessionsForDay(dayRef).length === 0 ? (
            <div className="border border-white/7 rounded-card p-8 text-center">
              <Calendar size={24} className="text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">Nenhuma sessão neste dia</p>
              <button
                onClick={() => openNewSession(dayRef)}
                className="mt-3 text-xs text-action hover:underline"
              >
                + Adicionar sessão
              </button>
            </div>
          ) : (
            getSessionsForDay(dayRef).map(s => (
              <div
                key={s.id}
                className="border border-white/7 rounded-card p-3"
                style={{
                  borderLeftColor: SESSION_STATUS_COLORS[s.status],
                  borderLeftWidth: 3,
                  backgroundColor: SESSION_STATUS_BG[s.status],
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Hora + nome */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-text-muted mb-0.5">
                      {formatTime(s.time)}
                    </p>
                    <p className="font-medium text-text-primary text-sm truncate flex items-center gap-1">
                      {s.patient?.full_name ?? '—'}
                      {s.via_assessor && (
                        <Bot size={11} className="text-action flex-shrink-0" />
                      )}
                    </p>
                  </div>
                  {/* Dropdowns */}
                  <div className="flex flex-col items-end gap-2">
                    <StatusSelect
                      value={s.status}
                      onUpdate={status => handleStatusUpdate(s.id, status)}
                    />
                    <PaymentSelect
                      value={s.payment_status}
                      onUpdate={status => handlePaymentUpdate(s.id, status)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────
          TABLET / DESKTOP: visualização semanal
      ──────────────────────────────────────────── */}
      <div className="hidden md:block">
        {/* Navegação de semana */}
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
          <div className="min-w-[640px]">
            {/* Header dos dias */}
            <div className="grid grid-cols-8 gap-px mb-px">
              <div className="w-14" />
              {weekDates.map((date, i) => {
                const isToday = isSameDay(date, new Date())
                return (
                  <div key={i} className="flex flex-col items-center py-2 px-1 text-center">
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

            {/* Slots de 30 min */}
            <div className="border border-white/7 rounded-card overflow-hidden">
              {SLOTS.map(({ hour, minute }) => {
                const isHalfHour = minute === 30
                return (
                  <div
                    key={`${hour}-${minute}`}
                    className={`grid grid-cols-8 gap-px last:border-b-0 ${
                      isHalfHour
                        ? 'border-b border-dashed border-white/[0.03]'
                        : 'border-b border-white/5'
                    }`}
                    style={{ minHeight: '32px' }}
                  >
                    {/* Label do horário */}
                    <div className="flex items-start justify-end pr-2 pt-1 w-14">
                      <span className={`text-[10px] font-mono ${isHalfHour ? 'text-text-muted/40' : 'text-text-muted'}`}>
                        {`${String(hour).padStart(2, '0')}:${isHalfHour ? '30' : '00'}`}
                      </span>
                    </div>

                    {/* Células por dia */}
                    {weekDates.map((date, di) => {
                      const slotSessions = getSessionsForSlot(date, hour, minute)
                      return (
                        <div
                          key={di}
                          className="relative p-0.5 min-h-[32px] border-l border-white/5 hover:bg-white/[0.02] cursor-pointer group"
                          onClick={() => openNewSession(date)}
                        >
                          {slotSessions.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus size={10} className="text-text-muted" />
                            </div>
                          )}

                          {slotSessions.map(s => (
                            <div
                              key={s.id}
                              className="rounded p-1 mb-0.5 text-xs overflow-hidden"
                              style={{
                                backgroundColor: SESSION_STATUS_BG[s.status],
                                borderLeft: `2px solid ${SESSION_STATUS_COLORS[s.status]}`,
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              {/* Linha 1: nome + ícone assessor */}
                              <div className="flex items-center gap-0.5 mb-0.5">
                                <span className="font-medium text-text-primary truncate flex-1 text-[11px]">
                                  {s.patient?.full_name?.split(' ')[0] ?? '—'}
                                </span>
                                {s.via_assessor && (
                                  <Bot size={8} className="text-action flex-shrink-0" />
                                )}
                              </div>
                              {/* Linha 2: status */}
                              <StatusSelect
                                value={s.status}
                                onUpdate={status => handleStatusUpdate(s.id, status)}
                              />
                              {/* Linha 3: pagamento */}
                              <PaymentSelect
                                value={s.payment_status}
                                onUpdate={status => handlePaymentUpdate(s.id, status)}
                              />
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
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
