'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PatientModal } from './PatientModal'
import {
  formatDateTime,
  formatTime,
  SESSION_STATUS_LABELS,
} from '@/lib/utils'
import { Plus, Search, Phone, Mail, CalendarClock, Pencil, Users } from 'lucide-react'
import type { Patient, Session, SessionStatus } from '@/types'

interface PatientWithNext extends Patient {
  nextSession?: Pick<Session, 'date' | 'time' | 'status'> | null
}

interface PatientListProps {
  initialPatients: PatientWithNext[]
}

const STATUS_VARIANT: Record<SessionStatus, 'confirmed' | 'waiting' | 'cancelled'> = {
  confirmado: 'confirmed',
  aguardando: 'waiting',
  cancelado: 'cancelled',
}

export function PatientList({ initialPatients }: PatientListProps) {
  const [patients, setPatients] = useState<PatientWithNext[]>(initialPatients)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)

  const supabase = createClient()

  const reload = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]

    const { data: pts } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .order('full_name')

    if (!pts) return

    // Carrega próxima sessão de cada paciente
    const withNext: PatientWithNext[] = await Promise.all(
      pts.map(async (p) => {
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
    setPatients(withNext)
  }, [])

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone ?? '').includes(search) ||
    (p.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (p: Patient) => { setEditing(p); setModalOpen(true) }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full h-9 pl-9 pr-3 text-sm bg-surface border border-white/7 rounded-btn text-text-primary placeholder:text-text-muted"
          />
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus size={14} /> Novo paciente
        </Button>
      </div>

      {/* Contador */}
      <p className="text-xs text-text-muted mb-3">
        {filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}
      </p>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={32} className="text-text-muted mb-3" />
          <p className="text-sm text-text-muted">
            {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado ainda'}
          </p>
          {!search && (
            <Button size="sm" className="mt-4" onClick={openNew}>
              <Plus size={14} /> Cadastrar primeiro paciente
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div
              key={p.id}
              className="bg-surface border border-white/7 rounded-card px-5 py-4 flex items-center gap-4 hover:border-white/10 transition-colors group"
            >
              {/* Avatar inicial */}
              <div className="w-9 h-9 rounded-full bg-action-dim border border-action/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-action">
                  {p.full_name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{p.full_name}</p>
                <div className="flex items-center gap-4 mt-1">
                  {p.phone && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Phone size={11} /> {p.phone}
                    </span>
                  )}
                  {p.email && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Mail size={11} /> {p.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Próxima sessão */}
              <div className="flex-shrink-0 text-right min-w-[160px]">
                {p.nextSession ? (
                  <div>
                    <div className="flex items-center justify-end gap-1.5 mb-0.5">
                      <CalendarClock size={12} className="text-text-muted" />
                      <span className="text-xs font-mono text-text-secondary">
                        {formatDateTime(p.nextSession.date, p.nextSession.time)}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Badge variant={STATUS_VARIANT[p.nextSession.status as SessionStatus]}>
                        {SESSION_STATUS_LABELS[p.nextSession.status as SessionStatus]}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted">Sem sessão agendada</span>
                )}
              </div>

              {/* Editar */}
              <button
                onClick={() => openEdit(p)}
                className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                <Pencil size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <PatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patient={editing}
        onSaved={reload}
      />
    </div>
  )
}
