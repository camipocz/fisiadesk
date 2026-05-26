import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { FinancialSummary } from '@/components/financeiro/FinancialSummary'
import { SessionLedger } from '@/components/financeiro/SessionLedger'
import { currentMonthRange } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Session } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FinanceiroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { start, end } = currentMonthRange()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, patient:patients(full_name)')
    .eq('user_id', user.id)
    .gte('date', start)
    .lte('date', end)
    .neq('status', 'cancelado')
    .order('date')
    .order('time')

  const data = (sessions ?? []) as Session[]

  const received = data
    .filter(s => s.payment_status === 'pago')
    .reduce((acc, s) => acc + s.value, 0)
  const pending = data
    .filter(s => s.payment_status === 'pendente')
    .reduce((acc, s) => acc + s.value, 0)
  const total = data.reduce((acc, s) => acc + s.value, 0)

  const monthLabel = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })
  const monthCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <div className="fade-in">
      <Header title="Financeiro" subtitle={monthCap} />

      <FinancialSummary
        received={received}
        pending={pending}
        total={total}
        sessionCount={data.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos do mês</CardTitle>
          <span className="text-xs text-text-muted">{data.length} sessões</span>
        </CardHeader>
        <SessionLedger sessions={data} />
      </Card>
    </div>
  )
}
