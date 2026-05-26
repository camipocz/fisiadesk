'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Check } from 'lucide-react'
import type { Profile } from '@/types'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [specialty, setSpecialty] = useState(profile.specialty ?? '')
  const [defaultValue, setDefaultValue] = useState(String(profile.default_session_value))
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp_phone ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('Nome é obrigatório'); return }
    setLoading(true)
    setError(null)

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        specialty: specialty.trim() || 'Fisioterapeuta',
        default_session_value: parseFloat(defaultValue) || 150,
        whatsapp_phone: whatsapp.trim() || null,
      })
      .eq('id', profile.id)

    setLoading(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nome completo"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Luiza Santos"
          required
        />
        <Input
          label="Especialidade"
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
          placeholder="Fisioterapeuta"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Valor padrão por sessão (R$)"
          type="number"
          step="0.01"
          min="0"
          value={defaultValue}
          onChange={e => setDefaultValue(e.target.value)}
          placeholder="150.00"
        />
        <Input
          label="WhatsApp (número do Assessor)"
          type="tel"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value)}
          placeholder="+55 11 99999-0000"
        />
      </div>

      {error && (
        <p className="text-xs text-cancelled bg-cancelled-dim rounded-btn px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>
          {saved ? (
            <>
              <Check size={14} /> Salvo!
            </>
          ) : 'Salvar alterações'}
        </Button>
        {saved && (
          <span className="text-xs text-confirmed">Perfil atualizado com sucesso</span>
        )}
      </div>
    </form>
  )
}
