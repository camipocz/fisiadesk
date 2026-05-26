export type SessionStatus = 'confirmado' | 'aguardando' | 'cancelado'
export type PaymentStatus = 'pago' | 'pendente' | 'cancelado'

export interface Profile {
  id: string
  full_name: string
  specialty: string
  default_session_value: number
  whatsapp_phone: string | null
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  user_id: string
  full_name: string
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  patient_id: string
  patient?: Patient
  date: string      // YYYY-MM-DD
  time: string      // HH:MM:SS
  type: string
  status: SessionStatus
  payment_status: PaymentStatus
  value: number
  via_assessor: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  session_reminder: boolean
  daily_summary: boolean
  cancellation_alert: boolean
  new_appointment_alert: boolean
  daily_summary_time: string
  created_at: string
  updated_at: string
}

export interface AvailableHour {
  id: string
  user_id: string
  day_of_week: number  // 0=Dom, 1=Seg ... 6=Sab
  hour: number
  enabled: boolean
}

export interface AssessorMessage {
  id: string
  user_id: string
  content: string
  response: string | null
  action: string | null
  success: boolean | null
  created_at: string
}

export interface DailySummary {
  id: string
  user_id: string
  content: string
  date: string
  sent_at: string
}

// Dashboard metrics
export interface DashboardMetrics {
  sessionsToday: number
  sessionsRemaining: number
  monthlyRevenue: number
  monthlyPending: number
  monthlyTotal: number
  activePatients: number
}
