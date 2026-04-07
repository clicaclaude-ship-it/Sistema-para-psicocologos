import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileSignature, Plus, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Contract, Patient } from '@/types/database'
import { CopiarLinkBtn } from './contratos-client'

export default async function ContratosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, patients(full_name)')
    .eq('psychologist_id', user.id)
    .order('created_at', { ascending: false })

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
          {contracts.map((c: Contract & { patients: Pick<Patient, 'full_name'> | null }) => {
            const signLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/assinar/${c.signature_token}`
            return (
              <Card key={c.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
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
                      {c.signed_at && ` · Assinado em ${formatDate(c.signed_at)}`}
                    </p>
                    {!c.signed_at && (
                      <p className="text-xs text-[#4F7CAC] mt-1 truncate">
                        Link: {signLink}
                      </p>
                    )}
                  </div>
                  {!c.signed_at && (
                    <CopiarLinkBtn link={signLink} />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
