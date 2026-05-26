import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SessionStatus, PaymentStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd 'de' MMMM", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatTime(timeStr: string): string {
  // "HH:MM:SS" → "HH:MM"
  return timeStr?.slice(0, 5) ?? ''
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  try {
    return `${format(parseISO(dateStr), "dd/MM", { locale: ptBR })} · ${formatTime(timeStr)}`
  } catch {
    return `${dateStr} ${timeStr}`
  }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function currentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function getWeekDates(referenceDate: Date): Date[] {
  const day = referenceDate.getDay() // 0=Dom
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  confirmado: 'Confirmado',
  aguardando: 'Aguardando',
  cancelado: 'Cancelado',
}

export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  confirmado: '#22C98A',
  aguardando: '#F5A623',
  cancelado: '#E53E3E',
}

export const SESSION_STATUS_BG: Record<SessionStatus, string> = {
  confirmado: 'rgba(34,201,138,0.12)',
  aguardando: 'rgba(245,166,35,0.12)',
  cancelado: 'rgba(229,62,62,0.12)',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pago: '#22C98A',
  pendente: '#F5A623',
  cancelado: '#E53E3E',
}

export const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const DAY_LABELS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
