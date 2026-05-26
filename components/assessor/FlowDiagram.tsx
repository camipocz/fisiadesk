import { ArrowRight, Smartphone, Webhook, Cpu, Database, MessageSquare } from 'lucide-react'

const STEPS = [
  { icon: Smartphone,       label: 'WhatsApp',        desc: 'Profissional envia mensagem',        color: '#22C98A' },
  { icon: Webhook,          label: 'Evolution API',   desc: 'Captura e dispara webhook',          color: '#F5A623' },
  { icon: Cpu,              label: 'N8N + Claude',    desc: 'Interpreta a intenção',              color: '#8B8D93' },
  { icon: Database,         label: 'Supabase',        desc: 'Grava a ação no banco',             color: '#3ECF8E' },
  { icon: MessageSquare,      label: 'Confirmação',   desc: 'Responde ao profissional',           color: '#22C98A' },
]

export function FlowDiagram() {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-1 min-w-max">
        {STEPS.map(({ icon: Icon, label, desc, color }, i) => (
          <div key={label} className="flex items-start gap-1">
            <div className="flex flex-col items-center gap-2 w-28">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-text-primary">{label}</p>
                <p className="text-[10px] text-text-muted leading-tight mt-0.5">{desc}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight size={14} className="text-text-muted mt-3 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
