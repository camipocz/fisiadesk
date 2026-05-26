import { MessageCircle, CalendarPlus, CalendarX, CalendarCheck, CreditCard } from 'lucide-react'

const COMMANDS = [
  {
    icon: CalendarPlus,
    label: 'Agendar',
    example: '"agendar Joana na quarta, dia 27/5, às 18h30, fisio Luiza"',
    action: 'Cria sessão na agenda com valor padrão',
    color: '#22C98A',
  },
  {
    icon: CalendarX,
    label: 'Cancelar',
    example: '"cancelar Ricardo Lima de amanhã"',
    action: 'Marca sessão como cancelada (vermelho)',
    color: '#E53E3E',
  },
  {
    icon: CalendarCheck,
    label: 'Reagendar',
    example: '"reagendar Ana para segunda às 10h"',
    action: 'Remove slot vermelho, cria nova sessão em verde',
    color: '#F5A623',
  },
  {
    icon: CreditCard,
    label: 'Pagamento',
    example: '"pagamento Joana pago"',
    action: 'Atualiza status do pagamento para Pago',
    color: '#22C98A',
  },
]

export function CommandExamples() {
  return (
    <div className="space-y-3">
      {COMMANDS.map(({ icon: Icon, label, example, action, color }) => (
        <div
          key={label}
          className="flex items-start gap-3 p-4 rounded-btn bg-surface-2 border border-white/7"
        >
          <div
            className="w-8 h-8 rounded-btn flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={15} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-text-primary">{label}</span>
            </div>
            <p className="text-xs font-mono text-text-secondary bg-bg rounded px-2 py-1 mb-1">
              {example}
            </p>
            <p className="text-xs text-text-muted">{action}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
