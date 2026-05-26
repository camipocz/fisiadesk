/**
 * Garante que o profile do usuário existe no banco.
 * Chamado no layout do dashboard como fallback caso o trigger falhe.
 */
import { createClient } from '@/lib/supabase/server'

export async function ensureProfile(userId: string) {
  const supabase = await createClient()

  // Verifica se profile já existe
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existing) return // Já existe — nada a fazer

  // Cria profile
  await supabase.from('profiles').insert({
    id: userId,
    full_name: '',
    specialty: 'Fisioterapeuta',
    default_session_value: 150.00,
  })

  // Cria preferências de notificação
  await supabase.from('notification_preferences').insert({
    user_id: userId,
  })

  // Cria horários padrão: seg–sex, 8h–19h
  const hours = []
  for (let day = 1; day <= 5; day++) {
    for (let hour = 8; hour <= 19; hour++) {
      hours.push({ user_id: userId, day_of_week: day, hour, enabled: true })
    }
  }
  await supabase.from('available_hours').insert(hours)
}
