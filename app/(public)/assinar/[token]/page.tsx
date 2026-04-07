import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AssinarClient } from './assinar-client'

export default async function AssinarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: contract } = await supabase
    .from('contracts')
    .select('*, psychologists(full_name, crp, clinic_name), patients(full_name)')
    .eq('signature_token', token)
    .single()

  if (!contract) notFound()

  const psych = contract.psychologists as { full_name: string; crp: string | null; clinic_name: string | null } | null
  const patient = contract.patients as { full_name: string } | null

  // Fill variables in content
  const content = (contract.content as string)
    .replace(/\{\{nome_paciente\}\}/g, patient?.full_name ?? '')
    .replace(/\{\{nome_psicologo\}\}/g, psych?.full_name ?? '')
    .replace(/\{\{crp\}\}/g, psych?.crp ?? '')
    .replace(/\{\{data\}\}/g, new Date(contract.created_at as string).toLocaleDateString('pt-BR'))

  return (
    <AssinarClient
      contractId={contract.id as string}
      title={contract.title as string}
      content={content}
      patientName={patient?.full_name ?? ''}
      psychName={psych?.full_name ?? ''}
      psychCrp={psych?.crp ?? ''}
      signedAt={contract.signed_at as string | null}
      signedName={contract.signed_name as string | null}
    />
  )
}
