'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Patient } from '@/types/database'

const TEMPLATE_PADRAO = `CONTRATO TERAPÊUTICO

Eu, {{nome_paciente}}, portador(a) dos documentos de identificação apresentados, declaro que estou ciente e de acordo com os termos do atendimento psicológico conduzido pelo(a) psicólogo(a) {{nome_psicologo}}, inscrito(a) no CRP sob o número {{crp}}.

1. SERVIÇO PRESTADO
O atendimento psicológico será realizado de acordo com o Código de Ética Profissional do Psicólogo e demais normas do Conselho Federal de Psicologia (CFP).

2. SIGILO PROFISSIONAL
Todas as informações compartilhadas durante as sessões são confidenciais, salvo nas situações previstas em lei ou nas normas do CFP.

3. CANCELAMENTO DE SESSÕES
O cancelamento de sessões deve ser comunicado com antecedência mínima de 24 horas. A ausência sem comunicação prévia poderá resultar na cobrança da sessão.

4. HONORÁRIOS
Os valores das sessões e as formas de pagamento serão acordados entre as partes e poderão ser revisados mediante comunicação prévia.

5. PROTEÇÃO DE DADOS (LGPD)
Os dados pessoais do paciente serão tratados em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), sendo utilizados exclusivamente para fins terapêuticos.

Data: {{data}}

Ao assinar este documento digitalmente, confirmo que li, compreendi e concordo com todos os termos acima.`

export default function NovoContratoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Pick<Patient, 'id' | 'full_name'>[]>([])
  const [patientId, setPatientId] = useState('')
  const [title, setTitle] = useState('Contrato Terapêutico')
  const [content, setContent] = useState(TEMPLATE_PADRAO)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const [{ data: pts }, { data: psych }] = await Promise.all([
        supabase
          .from('patients')
          .select('id, full_name')
          .eq('psychologist_id', userData.user.id)
          .in('status', ['acompanhamento', 'avaliacao'])
          .order('full_name'),
        supabase
          .from('psychologists')
          .select('full_name, crp')
          .eq('id', userData.user.id)
          .single(),
      ])

      setPatients(pts ?? [])

      // Pre-fill psychologist vars in template
      if (psych) {
        const today = new Date().toLocaleDateString('pt-BR')
        setContent((c) =>
          c
            .replace(/\{\{nome_psicologo\}\}/g, psych.full_name)
            .replace(/\{\{crp\}\}/g, psych.crp ?? 'não informado')
            .replace(/\{\{data\}\}/g, today)
        )
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!patientId) { toast.error('Selecione um paciente'); return }
    if (!content.trim()) { toast.error('O conteúdo do contrato não pode estar vazio'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setLoading(false); return }

    const { error } = await supabase.from('contracts').insert({
      psychologist_id: userData.user.id,
      patient_id: patientId,
      title,
      content,
    })

    if (error) {
      toast.error('Erro ao criar contrato', { description: error.message })
    } else {
      toast.success('Contrato criado! Copie o link para enviar ao paciente.')
      router.push('/contratos')
    }
    setLoading(false)
  }

  const selectedPatient = patients.find((p) => p.id === patientId)

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/contratos"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[#1E2A38]">Novo Contrato Terapêutico</h1>
          <p className="text-sm text-muted-foreground">Edite o contrato e envie o link para o paciente assinar</p>
        </div>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Informações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Paciente *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value)
                    const p = patients.find((pt) => pt.id === e.target.value)
                    if (p) setContent((c) => c.replace(/\{\{nome_paciente\}\}/g, p.full_name))
                  }}
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Título do contrato</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conteúdo do Contrato</CardTitle>
            <p className="text-xs text-muted-foreground">
              Variáveis: <code className="bg-muted px-1 rounded">{'{{nome_paciente}}'}</code> <code className="bg-muted px-1 rounded">{'{{nome_psicologo}}'}</code> <code className="bg-muted px-1 rounded">{'{{crp}}'}</code> <code className="bg-muted px-1 rounded">{'{{data}}'}</code>
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base min-h-[400px] font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <Button variant="outline" className="sm:flex-1" onClick={() => router.back()}>Cancelar</Button>
          <Button className="sm:flex-1" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar contrato
          </Button>
        </div>
      </div>
    </div>
  )
}
