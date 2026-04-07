import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin flag using service role (bypasses RLS)
  const admin = createAdminClient()
  const { data: psych } = await admin
    .from('psychologists')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!psych?.is_admin) redirect('/dashboard')

  return <>{children}</>
}
