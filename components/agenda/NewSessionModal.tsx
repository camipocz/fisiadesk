'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createClient } from '@/lib/supabase/client'
import type { Patient } from '@/types'

interface NewSessionModalProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
  onCreated: () => void
}

export function NewSessionModal({ open, onClose, defaultDate, onCreated }: NewSessionModalProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState('')
  const [date, setDate] = useState(defaultDate ?? '')
  const [time, setTime] = useState('')
  const [type, setType] = useState('Fisio')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('aguardando')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setDate(defaultDate ?? '')
      fetchPatients()
    }
  }, [open, defaultDate])

  const fetchPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .order('full_name')
    setPatients(data ?? [])

    // Valor padrão do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('default_session_value')
      .eq('id', user.id)
      .single()
    if (profile) setValue(String(profile.default_session_value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !date || !time) {
      setError('Preencha paciente, data e horário')
      return
    }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from('sessions').insert({
      user_id: user.id,
      patient_id: patientId,
      date,
      time: `${time}:00`,
      type,
      value: parseFloat(value) || 150,
      status,
      payment_status: 'pendente',
      via_assessor: false,
    })

    setLoading(false)
    if (err) { setError(err.message); return }

    onCreated()
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setPatientId('')
    setDate('')
    setTime('')
    setType('Fisio')
    setValue('')
    setStatus('aguardando')
    setError(null)
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Agendamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paciente */}
        <Select
          label="Paciente"
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
        >
          <option value="">Selecionar paciente...</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </Select>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <Input
            label="Horário"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
          />
        </div>

        {/* Tipo e Valor */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option>Fisio</option>
            <option>Pilates</option>
            <option>Avaliação</option>
            <option>Consulta</option>
            <option>Outro</option>
          </Select>
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="150,00"
          />
        </div>

        {/* Status */}
        <Select
          label="Status"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="aguardando">Aguardando confirmação</option>
          <option value="confirmado">Confirmado</option>
        </Select>

        {error && (
          <p className="text-xs text-cancelled bg-cancelled-dim rounded-btn px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button className="flex-1" type="submit" loading={loading}>
            Agendar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
