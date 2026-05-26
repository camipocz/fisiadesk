import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { NotificationToggles } from '@/components/configuracoes/NotificationToggles'
import { Bell, Clock, UserX, CalendarPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NOTIFICATION_TYPES = [
  {
    key: 'session_reminder' as const,
    label: 'Lembrete de sessão',
    description: '24h antes — enviado automaticamente ao paciente via WhatsApp',
    icon: Clock,
    iconColor: '#22C98A',
    recipient: 'Paciente',
  },
  {
    key: 'daily_summary' as const,
    label: 'Resumo diário',
    description: 'Enviado às 20h com os atendimentos do dia seguinte',
    icon: Bell,
    iconColor: '#F5A623',
    recipient: 'Profissional',
  },
  {
    key: 'cancellation_alert' as const,
    label: 'Aviso de cancelamento',
    description: 'Notificação imediata quando uma sessão é cancelada',
    icon: UserX,
    iconColor: '#E53E3E',
    recipient: 'Profissional',
  },
  {
    key: 'new_appointment_alert' as const,
    label: 'Novo agendamento',
    description: 'Notificação imediata quando o assessor cria uma sessão',
    icon: CalendarPlus,
    iconColor: '#22C98A',
    recipient: 'Profissional',
  },
]

export default async function NotificacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="fade-in">
      <Header
        title="Notificações"
        subtitle="Gerencie os alertas automáticos do sistema"
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Alertas automáticos</CardTitle>
            <span className="text-xs text-text-muted">
              Enviados via WhatsApp pelo Assessor Digital
            </span>
          </CardHeader>

          <div className="space-y-0">
            {NOTIFICATION_TYPES.map(({ key, label, description, icon: Icon, iconColor, recipient }, i) => (
              <div
                key={key}
                className={`flex items-center gap-4 py-4 ${
                  i < NOTIFICATION_TYPES.length - 1 ? 'border-b border-white/7' : ''
                }`}
              >
                {/* Ícone */}
                <div
                  className="w-9 h-9 rounded-btn flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${iconColor}18` }}
                >
                  <Icon size={15} style={{ color: iconColor }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-text-muted">
                      {recipient}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{description}</p>
                </div>

                {/* Toggle */}
                <NotificationToggles
                  prefKey={key}
                  initialValue={prefs?.[key] ?? true}
                  userId={user.id}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Horário do resumo diário */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Horário do resumo diário</CardTitle>
          </CardHeader>
          <div className="flex items-center gap-4">
            <Clock size={15} className="text-text-muted" />
            <p className="text-sm text-text-secondary flex-1">
              O resumo é enviado automaticamente todo dia às{' '}
              <span className="font-mono font-medium text-text-primary">
                {prefs?.daily_summary_time?.slice(0, 5) ?? '20:00'}
              </span>
            </p>
            <span className="text-xs text-text-muted">
              Configure em <span className="text-action">Configurações</span>
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
