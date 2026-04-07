'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  User,
  Shield,
  Plus,
  ChevronDown,
  ChevronUp,
  Brain,
  FileText,
  ClipboardList,
  Edit,
  Loader2,
  Save,
  X,
  CalendarDays,
} from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SessionForm } from '@/components/session-form'
import { NeuroEvalForm } from '@/components/neuro-eval-form'
import { DocumentUpload } from '@/components/document-upload'
import { LaudoFormComponent as LaudoForm } from '@/components/laudo-form'
import { calcAge, formatDate, maskCPF, maskPhone } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Appointment, Patient, ClinicalNote, NeuroEvaluation, Document } from '@/types/database'

const TYPE_LABELS: Record<Appointment['type'], string> = {
  consulta: 'Consulta',
  avaliacao: 'Avaliação',
  devolutiva: 'Devolutiva',
  retorno: 'Retorno',
}

const TYPE_COLORS: Record<Appointment['type'], string> = {
  consulta: '#4F7CAC',
  avaliacao: '#7B68C8',
  devolutiva: '#6BAE8E',
  retorno: '#E8A838',
}

const STATUS_LABELS: Record<Appointment['status'], string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  falta: 'Falta',
}

interface PatientRecordProps {
  patient: Patient
  clinicalNotes: ClinicalNote[]
  neuroEvals: NeuroEvaluation[]
  documents: Document[]
}

export function PatientRecord({
  patient,
  clinicalNotes,
  neuroEvals,
  documents,
}: PatientRecordProps) {
  const router = useRouter()
  const age = calcAge(patient.birth_date)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showNeuroForm, setShowNeuroForm] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [expandedEvals, setExpandedEvals] = useState<Set<string>>(new Set())
  const [editingPatient, setEditingPatient] = useState(false)
  const [savingPatient, setSavingPatient] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingApts, setLoadingApts] = useState(true)
  const [editData, setEditData] = useState({
    full_name: patient.full_name,
    birth_date: patient.birth_date ?? '',
    cpf: patient.cpf ?? '',
    phone: patient.phone ?? '',
    guardian_name: patient.guardian_name ?? '',
    main_complaint: patient.main_complaint ?? '',
    brief_history: patient.brief_history ?? '',
    status: patient.status,
  })

  useEffect(() => {
    async function loadAppointments() {
      const supabase = createClient()
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .order('scheduled_at', { ascending: false })
        .limit(5)
      setAppointments(data ?? [])
      setLoadingApts(false)
    }
    loadAppointments()
  }, [patient.id])

  function toggleNote(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleEval(id: string) {
    setExpandedEvals((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function savePatient() {
    setSavingPatient(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('patients')
      .update({
        full_name: editData.full_name,
        birth_date: editData.birth_date || null,
        cpf: editData.cpf || null,
        phone: editData.phone || null,
        guardian_name: editData.guardian_name || null,
        main_complaint: editData.main_complaint || null,
        brief_history: editData.brief_history || null,
        status: editData.status,
      })
      .eq('id', patient.id)

    if (error) {
      toast.error('Erro ao atualizar paciente', { description: error.message })
    } else {
      toast.success('Dados atualizados!')
      setEditingPatient(false)
      router.refresh()
    }
    setSavingPatient(false)
  }

  return (
    <div>
      {/* Patient header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#4F7CAC]/10 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-[#4F7CAC]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#1E2A38]">{patient.full_name}</h2>
              <Badge
                variant="outline"
                className={
                  patient.status === 'acompanhamento'
                    ? 'border-[#6BAE8E] text-[#6BAE8E]'
                    : patient.status === 'avaliacao'
                    ? 'border-[#7B68C8] text-[#7B68C8]'
                    : 'border-[#64748B] text-[#64748B]'
                }
              >
                {patient.status === 'acompanhamento' ? 'Acompanhamento' : patient.status === 'avaliacao' ? 'Em Avaliação' : 'Alta/Desligado'}
              </Badge>
              {patient.consent_signed_at && (
                <Badge
                  variant="outline"
                  className="border-[#4F7CAC] text-[#4F7CAC] gap-1"
                >
                  <Shield className="w-3 h-3" />
                  LGPD
                </Badge>
              )}
            </div>
            {age !== null && (
              <p className="text-sm text-muted-foreground">{age} anos</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingPatient(true)}
          className="gap-1.5 w-fit"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar dados
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados">
        <div className="overflow-x-auto mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
          <TabsList className="flex min-w-max w-full sm:grid sm:grid-cols-5">
            <TabsTrigger value="dados" className="text-xs sm:text-sm gap-1.5 flex-shrink-0">
              <User className="w-3.5 h-3.5 hidden sm:block" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="text-xs sm:text-sm gap-1.5 flex-shrink-0">
              <ClipboardList className="w-3.5 h-3.5 hidden sm:block" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="avaliacao" className="text-xs sm:text-sm gap-1.5 flex-shrink-0">
              <Brain className="w-3.5 h-3.5 hidden sm:block" />
              Avaliação
            </TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs sm:text-sm gap-1.5 flex-shrink-0">
              <FileText className="w-3.5 h-3.5 hidden sm:block" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="laudo" className="text-xs sm:text-sm gap-1.5 flex-shrink-0">
              <CalendarDays className="w-3.5 h-3.5 hidden sm:block" />
              Laudo
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1 — Dados Gerais */}
        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Data de nascimento" value={formatDate(patient.birth_date)} />
              <InfoField
                label="CPF"
                value={patient.cpf ? maskCPF(patient.cpf.replace(/\D/g, '').padEnd(11, '0').slice(0, 11)) : '-'}
              />
              <InfoField label="Telefone" value={patient.phone ?? '-'} />
              <InfoField label="Responsável legal" value={patient.guardian_name ?? '-'} />
              <InfoField
                label="Consentimento LGPD"
                value={
                  patient.consent_signed_at
                    ? `Obtido em ${formatDate(patient.consent_signed_at)}`
                    : 'Não registrado'
                }
              />
              <InfoField label="Cadastrado em" value={formatDate(patient.created_at)} />
            </CardContent>
          </Card>

          {patient.main_complaint && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Queixa principal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed">{patient.main_complaint}</p>
              </CardContent>
            </Card>
          )}

          {patient.brief_history && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Histórico breve
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {patient.brief_history}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#4F7CAC]" />
                Últimas consultas
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-[#4F7CAC] h-8 text-xs">
                <Link href="/agenda">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nova consulta
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingApts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <CalendarDays className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                  Nenhuma consulta agendada.{' '}
                  <Link href="/agenda" className="text-[#4F7CAC] hover:underline">
                    Agendar consulta
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {appointments.map((apt) => {
                    const dateTime = new Date(apt.scheduled_at)
                    const color = TYPE_COLORS[apt.type]
                    return (
                      <Link
                        key={apt.id}
                        href="/agenda"
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div
                          className="w-1 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E2A38]">
                            {TYPE_LABELS[apt.type]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dateTime.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            às{' '}
                            {dateTime.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs"
                          style={{
                            borderColor:
                              apt.status === 'realizado'
                                ? '#6BAE8E'
                                : apt.status === 'cancelado'
                                ? '#D95555'
                                : apt.status === 'confirmado'
                                ? '#4F7CAC'
                                : '#E8A838',
                            color:
                              apt.status === 'realizado'
                                ? '#6BAE8E'
                                : apt.status === 'cancelado'
                                ? '#D95555'
                                : apt.status === 'confirmado'
                                ? '#4F7CAC'
                                : '#E8A838',
                          }}
                        >
                          {STATUS_LABELS[apt.status]}
                        </Badge>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2 — Evolução Clínica */}
        <TabsContent value="evolucao" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {clinicalNotes.length} sessão{clinicalNotes.length !== 1 ? 'ões' : ''} registrada{clinicalNotes.length !== 1 ? 's' : ''}
            </p>
            <Button
              size="sm"
              onClick={() => setShowSessionForm(true)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova sessão
            </Button>
          </div>

          {clinicalNotes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-25" />
                Nenhuma sessão registrada ainda.
                <br />
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="text-[#4F7CAC] hover:underline mt-1 inline-block"
                >
                  Registrar primeira sessão
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clinicalNotes.map((note) => {
                const expanded = expandedNotes.has(note.id)
                return (
                  <Card key={note.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleNote(note.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Sessão — {formatDate(note.session_date)}
                        </p>
                        {!expanded && note.complaint && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                            {note.complaint.slice(0, 80)}
                          </p>
                        )}
                      </div>
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <NoteField label="Queixa" value={note.complaint} />
                        <NoteField label="Intervenção" value={note.intervention} />
                        <NoteField label="Observações" value={note.observations} />
                        <NoteField label="Plano" value={note.plan} />
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3 — Avaliação Neuropsicológica */}
        <TabsContent value="avaliacao" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {neuroEvals.length} {neuroEvals.length === 1 ? 'avaliação registrada' : 'avaliações registradas'}
            </p>
            <Button
              size="sm"
              onClick={() => setShowNeuroForm(true)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar avaliação
            </Button>
          </div>

          {neuroEvals.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-25" />
                Nenhuma avaliação registrada.
                <br />
                <button
                  onClick={() => setShowNeuroForm(true)}
                  className="text-[#4F7CAC] hover:underline mt-1 inline-block"
                >
                  Adicionar avaliação
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {neuroEvals.map((ev) => {
                const expanded = expandedEvals.has(ev.id)
                return (
                  <Card key={ev.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleEval(ev.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{ev.test_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Aplicado em {formatDate(ev.applied_at)}
                        </p>
                      </div>
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <NoteField label="Resultados" value={ev.results} />
                        <NoteField label="Interpretação clínica" value={ev.interpretation} />
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 4 — Documentos */}
        <TabsContent value="documentos">
          <DocumentUpload patientId={patient.id} documents={documents} />
        </TabsContent>

        {/* Tab 5 — Laudo */}
        <TabsContent value="laudo">
          <LaudoForm patientId={patient.id} patient={patient} />
        </TabsContent>
      </Tabs>

      {/* Session form dialog */}
      <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova sessão</DialogTitle>
          </DialogHeader>
          <SessionForm
            patientId={patient.id}
            onSuccess={() => setShowSessionForm(false)}
            onCancel={() => setShowSessionForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Neuro eval form dialog */}
      <Dialog open={showNeuroForm} onOpenChange={setShowNeuroForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova avaliação neuropsicológica</DialogTitle>
          </DialogHeader>
          <NeuroEvalForm
            patientId={patient.id}
            onSuccess={() => setShowNeuroForm(false)}
            onCancel={() => setShowNeuroForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit patient dialog */}
      <Dialog open={editingPatient} onOpenChange={setEditingPatient}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar dados do paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome completo *</Label>
              <Input
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={editData.birth_date}
                  onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>CPF</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={editData.cpf}
                  maxLength={14}
                  onChange={(e) =>
                    setEditData({ ...editData, cpf: maskCPF(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={editData.phone}
                  maxLength={15}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: maskPhone(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      status: e.target.value as Patient['status'],
                    })
                  }
                >
                  <option value="acompanhamento">Acompanhamento</option>
                  <option value="avaliacao">Em Avaliação</option>
                  <option value="alta">Alta/Desligado</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Responsável legal</Label>
              <Input
                value={editData.guardian_name}
                onChange={(e) =>
                  setEditData({ ...editData, guardian_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Queixa principal</Label>
              <Textarea
                className="text-base resize-none min-h-[72px]"
                value={editData.main_complaint}
                onChange={(e) =>
                  setEditData({ ...editData, main_complaint: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Histórico breve</Label>
              <Textarea
                className="text-base resize-none min-h-[100px]"
                value={editData.brief_history}
                onChange={(e) =>
                  setEditData({ ...editData, brief_history: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingPatient(false)}
                disabled={savingPatient}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={savePatient}
                disabled={savingPatient}
              >
                {savingPatient ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  )
}

function NoteField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  )
}
