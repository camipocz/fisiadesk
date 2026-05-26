import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
        ) : (
          <p className="text-xs text-text-muted mt-0.5">{todayCap}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
