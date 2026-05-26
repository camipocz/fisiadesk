import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { WeekView } from '@/components/agenda/WeekView'
import { getWeekDates } from '@/lib/utils'
import type { Session } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const week = getWeekDates(new Date())
  const start = week[0].toISOString().split('T')[0]
  const end = week[6].toISOString().split('T')[0]

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, patient:patients(full_name)')
    .eq('user_id', user.id)
    .gte('date', start)
    .lte('date', end)
    .order('time')

  return (
    <div className="fade-in">
      <Header title="Agenda" subtitle="Visualização semanal dos seus agendamentos" />
      <WeekView initialSessions={(sessions ?? []) as Session[]} />
    </div>
  )
}
