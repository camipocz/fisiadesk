'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import type { Patient } from '@/types'

interface PatientModalProps {
  open: boolean
  onClose: () => void
  patient?: Patient | null
  onSaved: () => void
}

export function PatientModal({ open, onClose, patient, onSaved }: PatientModalProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const isEdit = !!patient

  useEffect(() => {
    if (open && patient) {
      setFullName(patient.full_name)
      setPhone(patient.phone ?? '')
      setEmail(patient.email ?? '')
    } else if (open && !patient) {
      setFullName('')
      setPhone('')
      setEmail('')
    }
    setError(null)
  }, [open, patient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('Nome completo é obrigatório'); return }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let err
    if (isEdit && patient) {
      ({ error: err } = await supabase
        .from('patients')
        .update({ full_name: fullName.trim(), phone: phone.trim() || null, email: email.trim() || null })
        .eq('id', patient.id))
    } else {
      ({ error: err } = await supabase
        .from('patients')
        .insert({ user_id: user.id, full_name: fullName.trim(), phone: phone.trim() || null, email: email.trim() || null }))
    }

    setLoading(false)
    if (err) { setError(err.message); return }
    onSaved()
    onClose()
  }

  const handleDelete = async () => {
    if (!patient) return
    if (!confirm(`Remover ${patient.full_name}? Esta ação não pode ser desfeita.`)) return
    setLoading(true)
    await supabase.from('patients').delete().eq('id', patient.id)
    setLoading(false)
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Paciente' : 'Novo Paciente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome completo"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Ana Silva"
          required
          autoFocus
        />
        <Input
          label="WhatsApp"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="(11) 99999-0000"
        />
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ana@email.com"
        />

        {error && (
          <p className="text-xs text-cancelled bg-cancelled-dim rounded-btn px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          {isEdit && (
            <Button variant="danger" type="button" onClick={handleDelete} loading={loading}>
              Excluir
            </Button>
          )}
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
