'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PaymentSelect } from '@/components/ui/PaymentSelect'
import { StatusSelect } from '@/components/ui/StatusSelect'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateShort, formatTime, SESSION_STATUS_LABELS, SESSION_STATUS_COLORS } from '@/lib/utils'
import { Bot, Wallet } from 'lucide-react'
import type { Session, PaymentStatus, SessionStatus } from '@/types'

interface SessionLedgerProps {
  sessions: Session[]
}

const STATUS_VARIANT: Record<SessionStatus, 'confirmed' | 'waiting' | 'cancelled'> = {
  confirmado: 'confirmed',
  aguardando: 'waiting',
  cancelado: 'cancelled',
}

export function SessionLedger({ sessions: initial }: SessionLedgerProps) {
  const [sessions, setSessions] = useState<Session[]>(initial)
  const supabase = createClient()

  const handlePaymentUpdate = async (sessionId: string, status: PaymentStatus) => {
    await supabase.from('sessions').update({ payment_status: status }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, payment_status: status } : s))
  }

  const handleStatusUpdate = async (sessionId: string, status: SessionStatus) => {
    await supabase.from('sessions').update({ status }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s))
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Wallet size={32} className="text-text-muted mb-3" />
        <p className="text-sm text-text-muted">Nenhum lançamento neste mês</p>
      </div>
    )
  }

  const sortOrder: PaymentStatus[] = ['pendente', 'pago', 'cancelado']
  const sorted = [...sessions].sort((a, b) => {
    const ai = sortOrder.indexOf(a.payment_status)
    const bi = sortOrder.indexOf(b.payment_status)
    if (ai !== bi) return ai - bi
    return a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  })

  return (
    <div>
      {/* ─── DESKTOP: tabela ─── */}
      <div className="hidden md:block">
        {/* Cabeçalho */}
        <div
          className="grid items-center px-4 py-2 text-xs font-medium text-text-muted border-b border-white/7 mb-1"
          style={{ gridTemplateColumns: '72px 1fr 72px 116px 140px 96px' }}
        >
          <span>Data</span>
          <span>Paciente</span>
          <span>Tipo</span>
          <span>Status</span>
          <span>Pagamento</span>
          <span className="text-right">Valor</span>
        </div>

        {/* Linhas */}
        <div className="space-y-0.5">
          {sorted.map(s => (
            <div
              key={s.id}
              className="grid items-center px-4 py-3 rounded-btn hover:bg-white/[0.02] transition-colors"
              style={{ gridTemplateColumns: '72px 1fr 72px 116px 140px 96px' }}
            >
              {/* Data + hora */}
              <div className="flex flex-col">
                <span className="text-xs font-mono text-text-secondary">{formatDateShort(s.date)}</span>
                <span className="text-xs font-mono text-text-muted">{formatTime(s.time)}</span>
              </div>

              {/* Paciente */}
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <span className="text-sm font-medium text-text-primary truncate">
                  {s.patient?.full_name ?? '—'}
                </span>
                {s.via_assessor && <Bot size={12} className="text-action flex-shrink-0" />}
              </div>

              {/* Tipo */}
              <span className="text-xs text-text-muted">{s.type}</span>

              {/* Status — dropdown */}
              <div>
                <StatusSelect
                  value={s.status}
                  onUpdate={status => handleStatusUpdate(s.id, status)}
                />
              </div>

              {/* Pagamento — dropdown */}
              <div>
                <PaymentSelect
                  value={s.payment_status}
                  onUpdate={status => handlePaymentUpdate(s.id, status)}
                />
              </div>

              {/* Valor */}
              <span
                className="text-sm font-mono font-medium text-right"
                style={{
                  color:
                    s.payment_status === 'pago' ? '#22C98A'
                    : s.payment_status === 'cancelado' ? '#E53E3E'
                    : '#F5A623',
                }}
              >
                {formatCurrency(s.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MOBILE: cards ─── */}
      <div className="md:hidden space-y-2 pt-1">
        {sorted.map(s => (
          <div
            key={s.id}
            className="rounded-btn border border-white/7 p-3"
            style={{
              borderLeftColor: SESSION_STATUS_COLORS[s.status],
              borderLeftWidth: 3,
            }}
          >
            {/* Linha 1: nome + valor */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-sm font-medium text-text-primary truncate">
                  {s.patient?.full_name ?? '—'}
                </span>
                {s.via_assessor && <Bot size={11} className="text-action flex-shrink-0" />}
              </div>
              <span
                className="text-sm font-mono font-semibold flex-shrink-0"
                style={{
                  color:
                    s.payment_status === 'pago' ? '#22C98A'
                    : s.payment_status === 'cancelado' ? '#E53E3E'
                    : '#F5A623',
                }}
              >
                {formatCurrency(s.value)}
              </span>
            </div>

            {/* Linha 2: data + tipo */}
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono mb-2">
              <span>{formatDateShort(s.date)}</span>
              <span>·</span>
              <span>{formatTime(s.time)}</span>
              <span>·</span>
              <span>{s.type}</span>
            </div>

            {/* Linha 3: dropdowns */}
            <div className="flex items-center gap-4">
              <StatusSelect
                value={s.status}
                onUpdate={status => handleStatusUpdate(s.id, status)}
              />
              <span className="text-text-muted/30 text-xs">|</span>
              <PaymentSelect
                value={s.payment_status}
                onUpdate={status => handlePaymentUpdate(s.id, status)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
