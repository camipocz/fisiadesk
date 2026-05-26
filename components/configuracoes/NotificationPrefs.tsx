'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'
import type { NotificationPreferences } from '@/types'

interface NotificationPrefsProps {
  prefs: NotificationPreferences
}

const PREF_ITEMS = [
  {
    key: 'session_reminder' as const,
    label: 'Lembrete 24h ao paciente',
    description: 'Notifica o paciente automaticamente 24h antes da sessão',
  },
  {
    key: 'daily_summary' as const,
    label: 'Resumo diário ao profissional',
    description: 'Envia a agenda do dia seguinte todo dia às 20h',
  },
  {
    key: 'cancellation_alert' as const,
    label: 'Aviso de cancelamento',
    description: 'Alerta imediato quando uma sessão é cancelada',
  },
  {
    key: 'new_appointment_alert' as const,
    label: 'Aviso de novo agendamento',
    description: 'Confirmação quando o assessor cria uma nova sessão',
  },
]

export function NotificationPrefs({ prefs }: NotificationPrefsProps) {
  const [values, setValues] = useState({
    session_reminder: prefs.session_reminder,
    daily_summary: prefs.daily_summary,
    cancellation_alert: prefs.cancellation_alert,
    new_appointment_alert: prefs.new_appointment_alert,
    daily_summary_time: prefs.daily_summary_time?.slice(0, 5) ?? '20:00',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    await supabase
      .from('notification_preferences')
      .update({
        ...values,
        daily_summary_time: `${values.daily_summary_time}:00`,
      })
      .eq('user_id', prefs.user_id)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5">
      {PREF_ITEMS.map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">{label}</p>
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          </div>
          <button
            role="switch"
            aria-checked={values[key]}
            onClick={() => setValues(v => ({ ...v, [key]: !v[key] }))}
            className="relative flex-shrink-0"
            style={{ width: '40px', height: '22px' }}
          >
            <div
              className="absolute inset-0 rounded-full transition-colors duration-200"
              style={{ backgroundColor: values[key] ? '#22C98A' : 'rgba(255,255,255,0.1)' }}
            />
            <div
              className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200"
              style={{ transform: values[key] ? 'translateX(20px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
      ))}

      {/* Horário do resumo */}
      <div className="pt-4 border-t border-white/7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Horário do resumo diário</p>
            <p className="text-xs text-text-muted mt-0.5">
              Hora de envio do resumo ao profissional
            </p>
          </div>
          <input
            type="time"
            value={values.daily_summary_time}
            onChange={e => setValues(v => ({ ...v, daily_summary_time: e.target.value }))}
            className="h-9 px-3 text-sm font-mono bg-surface-2 border border-white/7 rounded-btn text-text-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} loading={loading}>
          {saved ? <><Check size={14} /> Salvo!</> : 'Salvar preferências'}
        </Button>
        {saved && <span className="text-xs text-confirmed">Preferências atualizadas</span>}
      </div>
    </div>
  )
}
