-- ============================================================
-- Seed de dados de demonstração — Fis.IA Desk
-- Execute APÓS criar um usuário pelo app ou pelo painel Supabase.
-- Substitua 'USER_ID_AQUI' pelo UUID real do usuário.
-- ============================================================

-- Exemplo de uso:
-- \set uid 'cole-aqui-o-uuid-do-usuario'

-- UPDATE profiles SET
--   full_name = 'Luiza Santos',
--   specialty = 'Fisioterapeuta',
--   default_session_value = 150.00
-- WHERE id = :'uid';

-- INSERT INTO patients (user_id, full_name, phone, email) VALUES
--   (:'uid', 'Carlos Mendes',  '(11) 99100-2233', 'carlos@email.com'),
--   (:'uid', 'Mariana Costa',  '(11) 98877-1122', 'mariana@email.com'),
--   (:'uid', 'Ricardo Lima',   '(11) 97766-0011', 'ricardo@email.com'),
--   (:'uid', 'Joana Silva',    '(11) 96655-9900', 'joana@email.com'),
--   (:'uid', 'Ana Ferreira',   '(11) 95544-8899', 'ana@email.com');

-- Sessões de hoje (substitua a data)
-- INSERT INTO sessions (user_id, patient_id, date, time, type, status, payment_status, value, via_assessor)
-- SELECT
--   :'uid',
--   p.id,
--   CURRENT_DATE,
--   s.time,
--   s.type,
--   s.status,
--   s.payment_status,
--   150.00,
--   s.via_assessor
-- FROM (VALUES
--   ('Carlos Mendes',  '08:00:00', 'Fisio',     'confirmado', 'pago',     false),
--   ('Mariana Costa',  '09:30:00', 'Pilates',   'confirmado', 'pendente', false),
--   ('Ricardo Lima',   '14:00:00', 'Fisio',     'aguardando', 'pendente', false),
--   ('Joana Silva',    '18:30:00', 'Fisio',     'aguardando', 'pendente', true)
-- ) AS s(name, time, type, status, payment_status, via_assessor)
-- JOIN patients p ON p.full_name = s.name AND p.user_id = :'uid';

-- Resumo diário de exemplo
-- INSERT INTO daily_summaries (user_id, content, date, sent_at) VALUES (
--   :'uid',
--   E'Bom dia, Luiza! 👋\n\nSeus atendimentos de amanhã:\n08h · Carlos · Joelho\n09h30 · Mariana · Coluna\n14h · Ricardo · Ombro\n18h30 · Joana · Fisio\n\nTotal: 4 sessões · R$600',
--   CURRENT_DATE - 1,
--   NOW() - interval '10 hours'
-- );
