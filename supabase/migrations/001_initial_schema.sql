-- ============================================================
-- Fis.IA Desk — Schema Inicial MVP v1.0
-- ============================================================

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Perfil do profissional (1:1 com auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL DEFAULT '',
  specialty      TEXT DEFAULT 'Fisioterapeuta',
  default_session_value DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  whatsapp_phone TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: patients
-- Cadastro de pacientes do profissional
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id ON patients(user_id);

-- ============================================================
-- TABELA: sessions
-- Sessões / agendamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  time           TIME NOT NULL,
  type           TEXT NOT NULL DEFAULT 'Fisio',
  status         TEXT NOT NULL DEFAULT 'aguardando'
                   CHECK (status IN ('confirmado', 'aguardando', 'cancelado')),
  payment_status TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (payment_status IN ('pago', 'pendente', 'cancelado')),
  value          DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  via_assessor   BOOLEAN NOT NULL DEFAULT FALSE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX idx_sessions_date       ON sessions(date);
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);

-- ============================================================
-- TABELA: notification_preferences
-- Preferências de notificação do profissional
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  session_reminder       BOOLEAN NOT NULL DEFAULT TRUE,
  daily_summary          BOOLEAN NOT NULL DEFAULT TRUE,
  cancellation_alert     BOOLEAN NOT NULL DEFAULT TRUE,
  new_appointment_alert  BOOLEAN NOT NULL DEFAULT TRUE,
  daily_summary_time     TIME NOT NULL DEFAULT '20:00',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: available_hours
-- Horários disponíveis por dia da semana
-- ============================================================
CREATE TABLE IF NOT EXISTS available_hours (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Segunda...
  hour         INT NOT NULL CHECK (hour BETWEEN 0 AND 23),
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(user_id, day_of_week, hour)
);

CREATE INDEX idx_available_hours_user_id ON available_hours(user_id);

-- ============================================================
-- TABELA: assessor_messages
-- Log das mensagens enviadas ao Assessor Digital
-- ============================================================
CREATE TABLE IF NOT EXISTS assessor_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  response   TEXT,
  action     TEXT,
  success    BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessor_messages_user_id ON assessor_messages(user_id);

-- ============================================================
-- TABELA: daily_summaries
-- Resumos diários enviados ao profissional
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_summaries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  date       DATE NOT NULL,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_summaries_user_id ON daily_summaries(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Cada profissional acessa apenas seus próprios dados
-- ============================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients                ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_hours         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessor_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries         ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: leitura própria"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: inserção própria"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: atualização própria" ON profiles FOR UPDATE USING (auth.uid() = id);

-- patients
CREATE POLICY "patients: leitura própria"   ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "patients: inserção própria"  ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "patients: atualização própria" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "patients: exclusão própria"  ON patients FOR DELETE USING (auth.uid() = user_id);

-- sessions
CREATE POLICY "sessions: leitura própria"   ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions: inserção própria"  ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions: atualização própria" ON sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sessions: exclusão própria"  ON sessions FOR DELETE USING (auth.uid() = user_id);

-- notification_preferences
CREATE POLICY "notif_prefs: leitura própria"   ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_prefs: inserção própria"  ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_prefs: atualização própria" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- available_hours
CREATE POLICY "avail_hours: leitura própria"   ON available_hours FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "avail_hours: inserção própria"  ON available_hours FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "avail_hours: atualização própria" ON available_hours FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "avail_hours: exclusão própria"  ON available_hours FOR DELETE USING (auth.uid() = user_id);

-- assessor_messages
CREATE POLICY "assessor: leitura própria"   ON assessor_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "assessor: inserção própria"  ON assessor_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_summaries
CREATE POLICY "summaries: leitura própria"  ON daily_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "summaries: inserção própria" ON daily_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: cria profile e preferências ao registrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);

  -- Horários padrão: seg-sex das 8h às 19h
  INSERT INTO available_hours (user_id, day_of_week, hour, enabled)
  SELECT NEW.id, d, h, TRUE
  FROM generate_series(1, 5) AS d,  -- 1=Seg a 5=Sex
       generate_series(8, 19) AS h;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
