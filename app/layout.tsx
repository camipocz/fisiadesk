import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fis.IA Desk',
  description: 'Gestão inteligente para fisioterapeutas e educadores físicos',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
