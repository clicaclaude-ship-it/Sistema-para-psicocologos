import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConfiguracoesClient } from './configuracoes-client'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E2A38]">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e conta</p>
      </div>

      <ConfiguracoesClient psychologist={psychologist} userEmail={user.email ?? ''} userId={user.id} />
    </div>
  )
}
