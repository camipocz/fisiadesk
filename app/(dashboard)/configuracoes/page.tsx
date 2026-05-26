import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProfileForm } from '@/components/configuracoes/ProfileForm'
import { HoursGrid } from '@/components/configuracoes/HoursGrid'
import { NotificationPrefs } from '@/components/configuracoes/NotificationPrefs'
import { User, Clock, Bell } from 'lucide-react'
import type { Profile, NotificationPreferences, AvailableHour } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: prefs }, { data: hours }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('notification_preferences').select('*').eq('user_id', user.id).single(),
    supabase.from('available_hours').select('*').eq('user_id', user.id),
  ])

  return (
    <div className="fade-in">
      <Header title="Configurações" subtitle="Perfil, horários e preferências do sistema" />

      <div className="space-y-4 max-w-3xl">
        {/* Perfil profissional */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <User size={13} className="text-action" />
                Perfil profissional
              </div>
            </CardTitle>
          </CardHeader>
          {profile ? (
            <ProfileForm profile={profile as Profile} />
          ) : (
            <p className="text-sm text-text-muted">Perfil não encontrado</p>
          )}
        </Card>

        {/* Horários disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-action" />
                Horários disponíveis
              </div>
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-text-muted mb-4">
            Clique para alternar disponibilidade. O Assessor Digital respeita esses horários ao agendar.
          </p>
          <HoursGrid
            initialHours={(hours ?? []) as AvailableHour[]}
            userId={user.id}
          />
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-action" />
                Notificações automáticas
              </div>
            </CardTitle>
          </CardHeader>
          {prefs ? (
            <NotificationPrefs prefs={prefs as NotificationPreferences} />
          ) : (
            <p className="text-sm text-text-muted">Preferências não encontradas</p>
          )}
        </Card>
      </div>
    </div>
  )
}
