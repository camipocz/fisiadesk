'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
        setSuccessMsg('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao autenticar'
      setError(msg === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-action-dim border border-action/20 mb-4">
            <span className="text-action font-bold text-2xl font-mono">F</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Fis.IA <span className="text-action">Desk</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Gestão inteligente para fisioterapeutas
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-white/7 rounded-card p-6 shadow-card">
          <h2 className="text-base font-semibold text-text-primary mb-5">
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>

          {successMsg ? (
            <div className="text-sm text-action bg-action-dim rounded-btn p-3 border border-action/20">
              {successMsg}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">E-mail</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="w-full h-9 pl-9 pr-3 text-sm bg-surface-2 border border-white/7 rounded-btn text-text-primary placeholder:text-text-muted"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-9 pl-9 pr-9 text-sm bg-surface-2 border border-white/7 rounded-btn text-text-primary placeholder:text-text-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-cancelled bg-cancelled-dim rounded-btn px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                {mode === 'login' ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>
          )}

          {!successMsg && (
            <p className="text-xs text-text-muted text-center mt-4">
              {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                className="text-action hover:underline"
              >
                {mode === 'login' ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
