import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileSignature, Plus, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Contract, Patient } from '@/types/database'
import { CopiarLinkBtn, ComprovanteBtn, GerarPdfBtn } from './contratos-client'

export default async function ContratosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: contracts }, { data: psych }] = await Promise.all([
    supabase
      .from('contracts')
      .select('*, patients(full_name)')
      .eq('psychologist_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('psychologists')
      .select('full_name, crp, clinic_name')
      .eq('id', user.id)
      .single(),
  ])

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2A38]">Contratos Terapêuticos</h1>
          <p className="text-sm text-muted-foreground">Gerencie e envie contratos para assinatura digital</p>
        </div>
        <Button asChild>
          <Link href="/contratos/novo">
            <Plus className="w-4 h-4 mr-1" />
            Novo contrato
          </Link>
        </Button>
      </div>

      {!contracts || contracts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="font-medium">Nenhum contrato criado ainda.</p>
            <p className="text-sm mt-1">Crie um contrato terapêutico e envie o link para o paciente assinar.</p>
            <Button asChild className="mt-4">
              <Link href="/contratos/novo">Criar primeiro contrato</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((c: Contract & { patients: Pick<Patient, 'full_name'> | null }) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-[#1E2A38] truncate">{c.title}</p>
                    <Badge
                      variant="outline"
                      className={c.signed_at
                        ? 'border-[#6BAE8E] text-[#6BAE8E]'
                        : 'border-[#E8A838] text-[#E8A838]'}
                    >
                      {c.signed_at ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Assinado</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" />Aguardando assinatura</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {c.patients?.full_name ?? 'Paciente'} · Criado em {formatDate(c.created_at)}
                    {c.signed_at && ` · Assinado por ${c.signed_name ?? '—'} em ${formatDate(c.signed_at)}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {c.signed_at ? (
                    <>
                      <GerarPdfBtn data={{
                        title: c.title,
                        content: c.content,
                        signed_at: c.signed_at,
                        signed_name: c.signed_name,
                        signed_cpf: c.signed_cpf,
                        signed_ip: c.signed_ip,
                        content_hash: c.content_hash,
                        psychName: psych?.full_name ?? '',
                        psychCrp: psych?.crp ?? null,
                        psychClinic: psych?.clinic_name ?? null,
                        patientName: c.patients?.full_name ?? '',
                      }} />
                      <ComprovanteBtn contract={{
                        title: c.title,
                        signed_at: c.signed_at,
                        signed_name: c.signed_name,
                        signed_cpf: c.signed_cpf,
                        signed_ip: c.signed_ip,
                        content_hash: c.content_hash,
                        signed_user_agent: c.signed_user_agent,
                        created_at: c.created_at,
                        patients: c.patients,
                      }} />
                    </>
                  ) : (
                    <CopiarLinkBtn token={c.signature_token} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
