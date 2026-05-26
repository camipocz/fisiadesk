'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  Bot,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/agenda',         label: 'Agenda',           icon: CalendarDays },
  { href: '/pacientes',      label: 'Pacientes',        icon: Users },
  { href: '/financeiro',     label: 'Financeiro',       icon: Wallet },
  { href: '/assessor',       label: 'Assessor Digital', icon: Bot },
  { href: '/notificacoes',   label: 'Notificações',     icon: Bell },
  { href: '/configuracoes',  label: 'Configurações',    icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-surface border-r border-white/7 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/7">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-action-dim border border-action/20 flex items-center justify-center">
            <span className="text-action font-bold text-sm font-mono">F</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary">Fis.IA</span>
            <span className="text-sm font-semibold text-action"> Desk</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm transition-colors',
                active
                  ? 'bg-action-dim text-action font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{label}</span>
              {href === '/assessor' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-action pulse-green" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/7">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm text-text-muted hover:text-text-primary hover:bg-white/5 w-full transition-colors"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
