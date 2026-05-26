'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda',     label: 'Agenda',    icon: CalendarDays },
  { href: '/pacientes',  label: 'Pacientes', icon: Users },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/assessor',   label: 'Assessor',  icon: Bot },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-white/7">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] transition-colors',
                active ? 'text-action' : 'text-text-muted'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
              {href === '/assessor' && (
                <span className="absolute top-2 w-1.5 h-1.5 rounded-full bg-action" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
