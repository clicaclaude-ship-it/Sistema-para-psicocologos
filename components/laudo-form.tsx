'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/date-picker'
import { createClient } from '@/lib/supabase/client'
import type { Laudo, Patient, Psychologist } from '@/types/database'

interface LaudoFormProps {
  patientId: string
  patient: Patient
}

const TIPO_OPTIONS = [
  { value: 'neuropsicologica', label: 'Neuropsicológica' },
  { value: 'psicologica', label: 'Psicológica' },
  { value: 'psicopedagogica', label: 'Psicopedagógica' },
  { value: 'outro', label: 'Outro' },
]

const TIPO_LABELS: Record<string, string> = {
  neuropsicologica: 'LAUDO NEUROPSICOLÓGICO',
  psicologica: 'LAUDO PSICOLÓGICO',
  psicopedagogica: 'LAUDO PSICOPEDAGÓGICO',
  outro: 'LAUDO',
}

type LaudoForm = Omit<Laudo, 'id' | 'psychologist_id' | 'patient_id' | 'created_at' | 'updated_at'>

const EMPTY_FORM: LaudoForm = {
  avaliacao_tipo: 'neuropsicologica',
  data_inicio: null,
  data_fim: null,
  objetivo: null,
  historico_queixa: null,
  historico_desenvolvimento: null,
  historico_escolar: null,
  historico_familiar: null,
  historico_medico: null,
  comportamento_observado: null,
  testes_aplicados: null,
  resultados: null,
  hipotese_diagnostica: null,
  conclusao: null,
  recomendacoes: null,
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDateBR(date: string | null): string {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

export function LaudoFormComponent({ patientId, patient }: LaudoFormProps) {
  const [form, setForm] = useState<LaudoForm>(EMPTY_FORM)
  const [laudoId, setLaudoId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { setLoading(false); return }

      const [{ data: laudoData }, { data: psiData }] = await Promise.all([
        supabase
          .from('laudos')
          .select('*')
          .eq('patient_id', patientId)
          .eq('psychologist_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('psychologists')
          .select('*')
          .eq('id', userData.user.id)
          .single(),
      ])

      if (laudoData) {
        setLaudoId(laudoData.id)
        setForm({
          avaliacao_tipo: laudoData.avaliacao_tipo,
          data_inicio: laudoData.data_inicio,
          data_fim: laudoData.data_fim,
          objetivo: laudoData.objetivo,
          historico_queixa: laudoData.historico_queixa,
          historico_desenvolvimento: laudoData.historico_desenvolvimento,
          historico_escolar: laudoData.historico_escolar,
          historico_familiar: laudoData.historico_familiar,
          historico_medico: laudoData.historico_medico,
          comportamento_observado: laudoData.comportamento_observado,
          testes_aplicados: laudoData.testes_aplicados,
          resultados: laudoData.resultados,
          hipotese_diagnostica: laudoData.hipotese_diagnostica,
          conclusao: laudoData.conclusao,
          recomendacoes: laudoData.recomendacoes,
        })
      }
      if (psiData) setPsychologist(psiData as Psychologist)
      setLoading(false)
    }
    load()
  }, [patientId])

  async function saveLaudo() {
    setSaving(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setSaving(false); return }

    const payload = {
      psychologist_id: userData.user.id,
      patient_id: patientId,
      ...form,
      updated_at: new Date().toISOString(),
    }

    let error
    if (laudoId) {
      ({ error } = await supabase.from('laudos').update(payload).eq('id', laudoId))
    } else {
      const { data: inserted, error: err } = await supabase
        .from('laudos')
        .insert(payload)
        .select('id')
        .single()
      error = err
      if (inserted) setLaudoId(inserted.id)
    }

    if (error) {
      toast.error('Erro ao salvar laudo', { description: error.message })
    } else {
      toast.success('Laudo salvo com sucesso!')
    }
    setSaving(false)
  }

  function imprimirLaudo() {
    const age = calcAge(patient.birth_date)
    const tipoLabel = TIPO_LABELS[form.avaliacao_tipo ?? 'neuropsicologica'] ?? 'LAUDO'
    const hoje = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })

    const section = (title: string, content: string | null) => content
      ? `<div class="section"><h3>${title}</h3><p>${content.replace(/\n/g, '<br>')}</p></div>`
      : ''

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${tipoLabel}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; padding: 2cm; max-width: 21cm; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; }
  .header h2 { font-size: 13pt; font-weight: bold; }
  .header p { font-size: 11pt; }
  .title { text-align: center; font-size: 15pt; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px; }
  .patient-info { background: #f5f5f5; padding: 12px; border: 1px solid #ccc; margin-bottom: 20px; }
  .patient-info p { margin-bottom: 4px; }
  .section { margin-bottom: 18px; }
  .section h3 { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #999; padding-bottom: 3px; margin-bottom: 6px; letter-spacing: 0.5px; }
  .section p { font-size: 11pt; line-height: 1.6; text-align: justify; }
  .footer { margin-top: 40px; border-top: 1px solid #000; padding-top: 16px; }
  .footer .date { margin-bottom: 40px; }
  .signature-line { border-bottom: 1px solid #000; width: 300px; margin: 0 auto; }
  .signature-name { text-align: center; margin-top: 6px; font-size: 11pt; }
  @media print { body { padding: 1.5cm; } }
</style>
</head>
<body>
<div class="header">
  <h2>${psychologist?.full_name ?? ''}</h2>
  ${psychologist?.crp ? `<p>CRP ${psychologist.crp}</p>` : ''}
  ${psychologist?.clinic_name ? `<p>${psychologist.clinic_name}</p>` : ''}
</div>

<div class="title">${tipoLabel}</div>

<div class="patient-info">
  <p><strong>Paciente:</strong> ${patient.full_name}</p>
  ${age !== null ? `<p><strong>Idade:</strong> ${age} anos</p>` : ''}
  ${form.data_inicio ? `<p><strong>Período da avaliação:</strong> ${formatDateBR(form.data_inicio)}${form.data_fim ? ` a ${formatDateBR(form.data_fim)}` : ''}</p>` : ''}
</div>

${section('1. Objetivo da Avaliação', form.objetivo)}
${section('2. Queixa e Motivo do Encaminhamento', form.historico_queixa)}
${section('3. Histórico do Desenvolvimento', form.historico_desenvolvimento)}
${section('4. Histórico Escolar / Profissional', form.historico_escolar)}
${section('5. Histórico Familiar', form.historico_familiar)}
${section('6. Histórico Médico / Psiquiátrico', form.historico_medico)}
${section('7. Comportamento Durante a Avaliação', form.comportamento_observado)}
${section('8. Instrumentos Utilizados', form.testes_aplicados)}
${section('9. Resultados dos Testes', form.resultados)}
${section('10. Hipótese Diagnóstica / CID', form.hipotese_diagnostica)}
${section('11. Conclusão Clínica', form.conclusao)}
${section('12. Recomendações', form.recomendacoes)}

<div class="footer">
  <p class="date">${psychologist?.clinic_name ?? ''}, ${hoje}.</p>
  <div class="signature-line"></div>
  <div class="signature-name">
    ${psychologist?.full_name ?? ''}<br>
    ${psychologist?.crp ? `CRP ${psychologist.crp}` : ''}
  </div>
</div>
</body>
</html>`

    const win = window.open('', '_blank', 'width=900,height=800')
    if (!win) { toast.error('Bloqueio de pop-up detectado. Permita pop-ups para imprimir.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Identificação */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            1. Identificação da Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de avaliação</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={form.avaliacao_tipo ?? 'neuropsicologica'}
              onChange={(e) => setForm({ ...form, avaliacao_tipo: e.target.value })}
            >
              {TIPO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data de início da avaliação</Label>
              <DatePicker
                value={form.data_inicio ?? ''}
                onChange={(val) => setForm({ ...form, data_inicio: val || null })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de conclusão</Label>
              <DatePicker
                value={form.data_fim ?? ''}
                onChange={(val) => setForm({ ...form, data_fim: val || null })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Objetivo da avaliação</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Descreva o objetivo desta avaliação..."
              value={form.objetivo ?? ''}
              onChange={(e) => setForm({ ...form, objetivo: e.target.value || null })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Histórico */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            2. Histórico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Queixa e motivo do encaminhamento</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Descreva a queixa principal e motivo do encaminhamento..."
              value={form.historico_queixa ?? ''}
              onChange={(e) => setForm({ ...form, historico_queixa: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Histórico do desenvolvimento</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Gestação, parto, desenvolvimento neuropsicomotor..."
              value={form.historico_desenvolvimento ?? ''}
              onChange={(e) => setForm({ ...form, historico_desenvolvimento: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Histórico escolar / profissional</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Desempenho escolar, queixas de aprendizagem, histórico profissional..."
              value={form.historico_escolar ?? ''}
              onChange={(e) => setForm({ ...form, historico_escolar: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Histórico familiar</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Dinâmica familiar, histórico de transtornos na família..."
              value={form.historico_familiar ?? ''}
              onChange={(e) => setForm({ ...form, historico_familiar: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Histórico médico / psiquiátrico</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Diagnósticos anteriores, medicamentos, internações..."
              value={form.historico_medico ?? ''}
              onChange={(e) => setForm({ ...form, historico_medico: e.target.value || null })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Procedimentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            3. Procedimentos de Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Comportamento durante a avaliação</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Descreva o comportamento do paciente durante as sessões de avaliação..."
              value={form.comportamento_observado ?? ''}
              onChange={(e) => setForm({ ...form, comportamento_observado: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Instrumentos / testes utilizados</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Liste um instrumento por linha: WISC-V, Raven, Bender..."
              value={form.testes_aplicados ?? ''}
              onChange={(e) => setForm({ ...form, testes_aplicados: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Resultados dos testes</Label>
            <Textarea
              className="text-base resize-none min-h-[120px]"
              placeholder="Descreva os resultados obtidos em cada instrumento..."
              value={form.resultados ?? ''}
              onChange={(e) => setForm({ ...form, resultados: e.target.value || null })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Conclusão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            4. Conclusão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Hipótese diagnóstica / CID</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Ex: F90.0 – Transtorno de déficit de atenção e hiperatividade..."
              value={form.hipotese_diagnostica ?? ''}
              onChange={(e) => setForm({ ...form, hipotese_diagnostica: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Conclusão clínica</Label>
            <Textarea
              className="text-base resize-none min-h-[120px]"
              placeholder="Síntese interpretativa dos achados da avaliação..."
              value={form.conclusao ?? ''}
              onChange={(e) => setForm({ ...form, conclusao: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Recomendações</Label>
            <Textarea
              className="text-base resize-none min-h-[80px]"
              placeholder="Orientações terapêuticas, pedagógicas, encaminhamentos..."
              value={form.recomendacoes ?? ''}
              onChange={(e) => setForm({ ...form, recomendacoes: e.target.value || null })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={imprimirLaudo}
          type="button"
        >
          <Printer className="w-4 h-4" />
          Imprimir laudo
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={saveLaudo}
          disabled={saving}
          type="button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar laudo
        </Button>
      </div>
    </div>
  )
}
