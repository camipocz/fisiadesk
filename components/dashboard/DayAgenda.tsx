'use client'

import { formatTime, formatCurrency, SESSION_STATUS_COLORS, SESSION_STATUS_BG } from '@/lib/utils'
import { PaymentSelect } from '@/components/ui/PaymentSelect'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { Session, PaymentStatus } from '@/types'
import { Bot, Calendar } from 'lucide-react'

interface DayAgendaProps {
  sessions: Session[]
}

export function DayAgenda({ sessions }: DayAgendaProps) {
  const supabase = createClient()

  const handlePaymentUpdate = async (sessionId: string, status: PaymentStatus) => {
    await supabase
      .from('sessions')
      .update({ payment_status: status })
      .eq('id', sessionId)
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Calendar size={28} className="text-text-muted mb-2" />
        <p className="text-sm text-text-muted">Nenhuma sessão hoje</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const statusColor = SESSION_STATUS_COLORS[session.status]
        const statusBg = SESSION_STATUS_BG[session.status]

        return (
          <div
            key={session.id}
            className="flex items-center gap-3 px-4 py-3 rounded-btn border border-white/7 hover:border-white/10 transition-colors"
            style={{ borderLeftColor: statusColor, borderLeftWidth: 2 }}
          >
            {/* Hora */}
            <span className="text-sm font-mono font-medium text-text-primary w-11 flex-shrink-0">
              {formatTime(session.time)}
            </span>

            {/* Paciente e tipo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary truncate">
                  {session.patient?.full_name ?? '—'}
                </span>
                {session.via_assessor && (
                  <Badge variant="assessor">
                    <Bot size={10} />
                    assessor
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-muted">{session.type}</p>
            </div>

            {/* Status */}
            <div
              className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
              style={{ color: statusColor, backgroundColor: statusBg }}
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </div>

            {/* Pagamento */}
            <PaymentSelect
              value={session.payment_status}
              onUpdate={(status) => handlePaymentUpdate(session.id, status)}
            />

            {/* Valor */}
            <span
              className="text-sm font-mono font-medium w-20 text-right flex-shrink-0"
              style={{
                color:
                  session.payment_status === 'pago'
                    ? '#22C98A'
                    : session.payment_status === 'cancelado'
                    ? '#E53E3E'
                    : '#F5A623',
              }}
            >
              {formatCurrency(session.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
