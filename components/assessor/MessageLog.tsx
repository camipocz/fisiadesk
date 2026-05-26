'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, XCircle, MessageCircle, Bot } from 'lucide-react'
import type { AssessorMessage } from '@/types'

interface MessageLogProps {
  messages: AssessorMessage[]
}

export function MessageLog({ messages }: MessageLogProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bot size={32} className="text-text-muted mb-3" />
        <p className="text-sm text-text-muted">Nenhuma mensagem processada ainda</p>
        <p className="text-xs text-text-muted mt-1">
          As mensagens enviadas ao Assessor via WhatsApp aparecerão aqui
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map(msg => (
        <div
          key={msg.id}
          className="p-4 rounded-card bg-surface-2 border border-white/7 space-y-2"
        >
          {/* Mensagem do profissional */}
          <div className="flex items-start gap-2">
            <MessageCircle size={13} className="text-text-muted mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-primary flex-1">{msg.content}</p>
            <span className="text-[10px] text-text-muted flex-shrink-0">
              {format(parseISO(msg.created_at), "dd/MM HH:mm", { locale: ptBR })}
            </span>
          </div>

          {/* Resposta do assessor */}
          {msg.response && (
            <div className="flex items-start gap-2 pl-4 border-l-2 border-action/20">
              <div className="flex items-center gap-1.5 mt-0.5">
                {msg.success !== false ? (
                  <CheckCircle2 size={13} className="text-confirmed flex-shrink-0" />
                ) : (
                  <XCircle size={13} className="text-cancelled flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-text-secondary flex-1 whitespace-pre-wrap">
                {msg.response}
              </p>
            </div>
          )}

          {/* Ação executada */}
          {msg.action && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-action-dim text-action">
                {msg.action}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
