import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Clock, CalendarCheck } from 'lucide-react'

interface FinancialSummaryProps {
  received: number
  pending: number
  total: number
  sessionCount: number
}

export function FinancialSummary({ received, pending, total, sessionCount }: FinancialSummaryProps) {
  const pct = total > 0 ? Math.round((received / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Recebido */}
      <div className="bg-surface border border-white/7 rounded-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-btn bg-confirmed-dim flex items-center justify-center">
            <TrendingUp size={13} className="text-confirmed" />
          </div>
          <span className="text-xs font-medium text-text-secondary">Total recebido</span>
        </div>
        <p className="text-2xl font-mono font-semibold text-confirmed">
          {formatCurrency(received)}
        </p>
        <p className="text-xs text-text-muted mt-1">{pct}% do previsto</p>
      </div>

      {/* Pendente */}
      <div className="bg-surface border border-white/7 rounded-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-btn bg-waiting-dim flex items-center justify-center">
            <Clock size={13} className="text-waiting" />
          </div>
          <span className="text-xs font-medium text-text-secondary">Total pendente</span>
        </div>
        <p className="text-2xl font-mono font-semibold text-waiting">
          {formatCurrency(pending)}
        </p>
        <p className="text-xs text-text-muted mt-1">
          {total > 0 ? Math.round((pending / total) * 100) : 0}% do previsto
        </p>
      </div>

      {/* Previsto */}
      <div className="bg-surface border border-white/7 rounded-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-btn bg-white/5 flex items-center justify-center">
            <CalendarCheck size={13} className="text-text-secondary" />
          </div>
          <span className="text-xs font-medium text-text-secondary">Total previsto</span>
        </div>
        <p className="text-2xl font-mono font-semibold text-text-primary">
          {formatCurrency(total)}
        </p>
        <p className="text-xs text-text-muted mt-1">
          {sessionCount} {sessionCount === 1 ? 'sessão' : 'sessões'} no mês
        </p>
      </div>
    </div>
  )
}
