import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { PatientList } from '@/components/pacientes/PatientList'
import type { Patient, Session } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PatientWithNext extends Patient {
  nextSession?: Pick<Session, 'date' | 'time' | 'status'> | null
}

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .order('full_name')

  // Próxima sessão de cada paciente
  const withNext: PatientWithNext[] = await Promise.all(
    (patients ?? []).map(async (p) => {
      const { data: s } = await supabase
        .from('sessions')
        .select('date, time, status')
        .eq('patient_id', p.id)
        .gte('date', today)
        .neq('status', 'cancelado')
        .order('date')
        .order('time')
        .limit(1)
        .single()
      return { ...p, nextSession: s ?? null }
    })
  )

  return (
    <div className="fade-in">
      <Header
        title="Pacientes"
        subtitle={`${withNext.length} ${withNext.length === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}`}
      />
      <PatientList initialPatients={withNext} />
    </div>
  )
}
