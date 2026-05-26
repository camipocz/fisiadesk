import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { MessageLog } from '@/components/assessor/MessageLog'
import { CommandExamples } from '@/components/assessor/CommandExamples'
import { FlowDiagram } from '@/components/assessor/FlowDiagram'
import { Bot, Zap } from 'lucide-react'
import type { AssessorMessage } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AssessorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: messages } = await supabase
    .from('assessor_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const successCount = (messages ?? []).filter(m => m.success !== false).length
  const totalCount = (messages ?? []).length

  return (
    <div className="fade-in">
      <Header
        title="Assessor Digital"
        subtitle="Interpreta mensagens do WhatsApp e executa ações automaticamente"
      />

      {/* Status badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-action-dim border border-action/20">
          <span className="w-1.5 h-1.5 rounded-full bg-action pulse-green" />
          <span className="text-xs font-medium text-action">Assessor ativo</span>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-text-muted">
            {successCount}/{totalCount} comandos processados com sucesso
          </span>
        )}
      </div>

      {/* Fluxo de dados */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Zap size={13} className="text-action" />
              Fluxo de dados
            </div>
          </CardTitle>
        </CardHeader>
        <FlowDiagram />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Log de mensagens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Bot size={13} className="text-action" />
                  Histórico de comandos
                </div>
              </CardTitle>
              <span className="text-xs text-text-muted">{totalCount} mensagens</span>
            </CardHeader>
            <MessageLog messages={(messages ?? []) as AssessorMessage[]} />
          </Card>
        </div>

        {/* Comandos suportados */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Comandos reconhecidos</CardTitle>
            </CardHeader>
            <CommandExamples />

            {/* Exemplo de resposta */}
            <div className="mt-5 pt-5 border-t border-white/7">
              <p className="text-xs font-medium text-text-secondary mb-3">
                Exemplo de resposta
              </p>
              <div className="bg-surface-2 rounded-btn p-3 border border-white/7">
                <pre className="text-xs text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
{`Assessor confirma:
✅ Agendado! Joana Silva · 27/05 · 18h30 · Fisio · R$150
Lembrete programado para 26/05.`}
                </pre>
              </div>
              <p className="text-xs text-text-muted mt-2">
                O assessor responde somente ao profissional. O paciente não recebe respostas do assessor.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
