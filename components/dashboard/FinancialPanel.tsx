import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Clock, CalendarCheck } from 'lucide-react'

interface FinancialPanelProps {
  received: number
  pending: number
  total: number
}

export function FinancialPanel({ received, pending, total }: FinancialPanelProps) {
  const receivedPct = total > 0 ? (received / total) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Barra de progresso */}
      <div>
        <div className="flex justify-between text-xs text-text-muted mb-2">
          <span>Recebido</span>
          <span>{receivedPct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-action rounded-full transition-all duration-500"
            style={{ width: `${receivedPct}%` }}
          />
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp size={12} className="text-confirmed mr-1" />
            <span className="text-xs text-text-muted">Recebido</span>
          </div>
          <p className="text-sm font-mono font-semibold text-confirmed">
            {formatCurrency(received)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock size={12} className="text-waiting mr-1" />
            <span className="text-xs text-text-muted">Pendente</span>
          </div>
          <p className="text-sm font-mono font-semibold text-waiting">
            {formatCurrency(pending)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CalendarCheck size={12} className="text-text-muted mr-1" />
            <span className="text-xs text-text-muted">Previsto</span>
          </div>
          <p className="text-sm font-mono font-semibold text-text-primary">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  )
}
