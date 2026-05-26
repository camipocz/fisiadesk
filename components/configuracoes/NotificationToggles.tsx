'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NotificationTogglesProps {
  prefKey: 'session_reminder' | 'daily_summary' | 'cancellation_alert' | 'new_appointment_alert'
  initialValue: boolean
  userId: string
}

export function NotificationToggles({ prefKey, initialValue, userId }: NotificationTogglesProps) {
  const [enabled, setEnabled] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const toggle = async () => {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    await supabase
      .from('notification_preferences')
      .update({ [prefKey]: next })
      .eq('user_id', userId)
    setSaving(false)
  }

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
      disabled={saving}
      className="relative flex-shrink-0 disabled:opacity-60"
      style={{ width: '40px', height: '22px' }}
    >
      <div
        className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{ backgroundColor: enabled ? '#22C98A' : 'rgba(255,255,255,0.1)' }}
      />
      <div
        className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  )
}
