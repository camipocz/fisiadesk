'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PaymentSelect } from '@/components/ui/PaymentSelect'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateShort, formatTime, SESSION_STATUS_LABELS } from '@/lib/utils'
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
    await supabase
      .from('sessions')
      .update({ payment_status: status })
      .eq('id', sessionId)
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, payment_status: status } : s)
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Wallet size={32} className="text-text-muted mb-3" />
        <p className="text-sm text-text-muted">Nenhum lançamento neste mês</p>
      </div>
    )
  }

  // Agrupa por status de pagamento para filtro visual
  const sortOrder: PaymentStatus[] = ['pendente', 'pago', 'cancelado']
  const sorted = [...sessions].sort((a, b) => {
    const ai = sortOrder.indexOf(a.payment_status)
    const bi = sortOrder.indexOf(b.payment_status)
    if (ai !== bi) return ai - bi
    return a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  })

  return (
    <div>
      {/* Header da tabela */}
      <div className="grid gap-4 px-4 py-2 text-xs font-medium text-text-muted border-b border-white/7 mb-1"
        style={{ gridTemplateColumns: '80px 1fr 90px 60px 130px 100px' }}
      >
        <span>Data</span>
        <span>Paciente</span>
        <span>Tipo</span>
        <span>Status</span>
        <span>Pagamento</span>
        <span className="text-right">Valor</span>
      </div>

      {/* Linhas */}
      <div className="space-y-1">
        {sorted.map(s => (
          <div
            key={s.id}
            className="grid items-center gap-4 px-4 py-3 rounded-btn hover:bg-white/[0.02] transition-colors"
            style={{ gridTemplateColumns: '80px 1fr 90px 60px 130px 100px' }}
          >
            {/* Data + hora */}
            <div>
              <span className="text-xs font-mono text-text-secondary">
                {formatDateShort(s.date)}
              </span>
              <span className="text-xs font-mono text-text-muted block">
                {formatTime(s.time)}
              </span>
            </div>

            {/* Paciente */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-text-primary truncate">
                {s.patient?.full_name ?? '—'}
              </span>
              {s.via_assessor && (
                <Bot size={12} className="text-action flex-shrink-0" />
              )}
            </div>

            {/* Tipo */}
            <span className="text-xs text-text-muted">{s.type}</span>

            {/* Status da sessão */}
            <Badge variant={STATUS_VARIANT[s.status]}>
              {SESSION_STATUS_LABELS[s.status]}
            </Badge>

            {/* Pagamento */}
            <PaymentSelect
              value={s.payment_status}
              onUpdate={status => handlePaymentUpdate(s.id, status)}
            />

            {/* Valor */}
            <span
              className="text-sm font-mono font-medium text-right"
              style={{
                color:
                  s.payment_status === 'pago'
                    ? '#22C98A'
                    : s.payment_status === 'cancelado'
                    ? '#E53E3E'
                    : '#F5A623',
              }}
            >
              {formatCurrency(s.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
