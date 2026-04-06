import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('*')
    .eq('id', user.id)
    .single()

  return <AppShell psychologist={psychologist}>{children}</AppShell>
}
