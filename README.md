# Fis.IA Desk

Sistema SaaS de gestão para fisioterapeutas e educadores físicos autônomos. MVP v1.0.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| IA | Claude API (Sonnet) |
| Automação | N8N + Evolution API |
| Deploy | Vercel |

## Módulos

- **Dashboard** — Métricas do dia/mês, agenda, painel financeiro e último resumo enviado
- **Agenda** — Visualização semanal com status por cores e pagamento inline
- **Pacientes** — Cadastro com próxima sessão e status atual
- **Financeiro** — Lançamentos mensais com controle de pagamentos
- **Assessor Digital** — Log de comandos via WhatsApp e fluxo de dados
- **Notificações** — Toggles para lembretes, resumo diário e alertas
- **Configurações** — Perfil, grade de horários e preferências

## Setup

### 1. Clone e instale dependências

```bash
git clone <repo>
cd fisiadesk
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 3. Configure o banco de dados

No painel do Supabase → SQL Editor, execute em ordem:

1. `supabase/migrations/001_initial_schema.sql` — Cria todas as tabelas, RLS e triggers
2. `supabase/migrations/002_seed_demo.sql` — Dados de demonstração (opcional)

### 4. Rode localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Design

| Elemento | Valor |
|----------|-------|
| Tema | Dark mode |
| Background | `#0E0F11` |
| Cor de ação | `#22C98A` |
| Tipografia | DM Sans + DM Mono |
| Bordas | 1px rgba branco 7% |

## Assessor Digital — Fluxo

```
WhatsApp → Evolution API → N8N → Claude API → Supabase → Resposta WhatsApp
```

Comandos suportados:
- **Agendar**: `"agendar Joana na quarta, dia 27/5, às 18h30"`
- **Cancelar**: `"cancelar Ricardo Lima de amanhã"`
- **Reagendar**: `"reagendar Ana para segunda às 10h"`
- **Pagamento**: `"pagamento Joana pago"`

## Deploy (Vercel)

```bash
npx vercel --prod
```

Adicione as variáveis de ambiente no painel da Vercel.

## Roadmap

- v2.0 — Multi-profissional e clínicas
- v3.0 — Portal do paciente + pagamento online
- v4.0 — Prontuário e análise de padrões com IA
