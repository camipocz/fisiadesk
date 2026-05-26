import { MessageCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DailySummary } from '@/types'

interface LastSummaryProps {
  summary: DailySummary | null
}

export function LastSummary({ summary }: LastSummaryProps) {
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageCircle size={28} className="text-text-muted mb-2" />
        <p className="text-sm text-text-muted">Nenhum resumo enviado ainda</p>
        <p className="text-xs text-text-muted mt-1">
          O resumo diário será enviado às 20h
        </p>
      </div>
    )
  }

  const sentAt = format(parseISO(summary.sent_at), "dd/MM 'às' HH:mm", { locale: ptBR })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <MessageCircle size={13} className="text-action" />
        <span>Enviado {sentAt}</span>
      </div>
      <div className="bg-surface-2 rounded-btn p-4 border border-white/7">
        <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
          {summary.content}
        </pre>
      </div>
    </div>
  )
}
