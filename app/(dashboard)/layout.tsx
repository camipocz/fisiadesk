import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/ensure-profile'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Garante que o perfil existe (fallback caso o trigger tenha falhado)
  await ensureProfile(user.id)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* ml-0 em mobile (sem sidebar), ml-[220px] em md+ */}
      <main className="flex-1 md:ml-[220px] min-h-screen p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
