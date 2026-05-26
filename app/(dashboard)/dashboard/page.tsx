import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DayAgenda } from '@/components/dashboard/DayAgenda'
import { FinancialPanel } from '@/components/dashboard/FinancialPanel'
import { LastSummary } from '@/components/dashboard/LastSummary'
import { todayISO, currentMonthRange, formatTime } from '@/lib/utils'
import {
  CalendarDays,
  Wallet,
  Clock,
  Users,
} from 'lucide-react'
import type { Session } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = todayISO()
  const { start: monthStart, end: monthEnd } = currentMonthRange()
  const nowTime = new Date().toTimeString().slice(0, 8)

  // Sessões do dia
  const { data: todaySessions } = await supabase
    .from('sessions')
    .select('*, patient:patients(full_name, phone)')
    .eq('user_id', user.id)
    .eq('date', today)
    .neq('status', 'cancelado')
    .order('time')

  // Sessões do mês
  const { data: monthSessions } = await supabase
    .from('sessions')
    .select('value, payment_status, status')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .neq('status', 'cancelado')

  // Pacientes ativos do mês
  const { data: activePatients } = await supabase
    .from('sessions')
    .select('patient_id')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .neq('status', 'cancelado')

  // Último resumo
  const { data: lastSummary } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user.id)
    .order('sent_at', { ascending: false })
    .limit(1)
    .single()

  // Cálculos
  const sessions = (todaySessions ?? []) as Session[]
  const remaining = sessions.filter(s => s.time > nowTime).length

  const monthData = monthSessions ?? []
  const received = monthData
    .filter(s => s.payment_status === 'pago')
    .reduce((acc, s) => acc + (s.value ?? 0), 0)
  const pending = monthData
    .filter(s => s.payment_status === 'pendente')
    .reduce((acc, s) => acc + (s.value ?? 0), 0)
  const total = monthData.reduce((acc, s) => acc + (s.value ?? 0), 0)

  const uniquePatients = new Set(activePatients?.map(s => s.patient_id) ?? []).size

  const pendingPatients = monthData.filter(s => s.payment_status === 'pendente').length

  return (
    <div className="fade-in">
      <Header title="Dashboard" />

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Sessões hoje"
          value={sessions.length}
          subtitle={remaining > 0 ? `${remaining} restantes` : 'Todas realizadas'}
          icon={CalendarDays}
          iconColor="#22C98A"
        />
        <MetricCard
          title="Receita do mês"
          value={`R$ ${received.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          subtitle={`de R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} previsto`}
          icon={Wallet}
          iconColor="#22C98A"
          mono
        />
        <MetricCard
          title="Pendente"
          value={`R$ ${pending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          subtitle={`${pendingPatients} ${pendingPatients === 1 ? 'paciente em aberto' : 'pacientes em aberto'}`}
          icon={Clock}
          iconColor="#F5A623"
          mono
        />
        <MetricCard
          title="Pacientes ativos"
          value={uniquePatients}
          subtitle="no mês"
          icon={Users}
          iconColor="#8B8D93"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agenda do dia */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de hoje</CardTitle>
              <span className="text-xs text-text-muted">
                {sessions.length} {sessions.length === 1 ? 'sessão' : 'sessões'}
              </span>
            </CardHeader>
            <DayAgenda sessions={sessions} />
          </Card>
        </div>

        {/* Painel direito */}
        <div className="flex flex-col gap-4">
          {/* Financeiro do mês */}
          <Card>
            <CardHeader>
              <CardTitle>Financeiro do mês</CardTitle>
            </CardHeader>
            <FinancialPanel received={received} pending={pending} total={total} />
          </Card>

          {/* Último resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Último resumo enviado</CardTitle>
            </CardHeader>
            <LastSummary summary={lastSummary ?? null} />
          </Card>
        </div>
      </div>
    </div>
  )
}
