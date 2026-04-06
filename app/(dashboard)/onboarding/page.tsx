import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingClient } from './onboarding-client'

export const metadata = {
  title: 'Bem-vindo ao PsicoGest',
}

export default async function OnboardingPage() {
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
    <OnboardingClient psychologist={psychologist} userId={user.id} />
  )
}
