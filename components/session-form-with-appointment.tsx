'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/types/database'

const TYPE_LABELS: Record<Appointment['type'], string> = {
  consulta: 'Consulta',
  avaliacao: 'Avaliação',
  devolutiva: 'Devolutiva',
  retorno: 'Retorno',
}

interface SessionFormWithAppointmentProps {
  patientId: string
  pendingAppointments: Appointment[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function SessionFormWithAppointment({
  patientId,
  pendingAppointments,
  onSuccess,
  onCancel,
}: SessionFormWithAppointmentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const [sessionDate, setSessionDate] = useState(today)
  const [complaint, setComplaint] = useState('')
  const [intervention, setIntervention] = useState('')
  const [observations, setObservations] = useState('')
  const [plan, setPlan] = useState('')
  const [appointmentId, setAppointmentId] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionDate) {
      toast.error('Informe a data da sessão')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      toast.error('Usuário não autenticado')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('clinical_notes').insert({
      psychologist_id: userData.user.id,
      patient_id: patientId,
      appointment_id: appointmentId || null,
      session_date: sessionDate,
      complaint: complaint || null,
      intervention: intervention || null,
      observations: observations || null,
      plan: plan || null,
    })

    if (error) {
      toast.error('Erro ao salvar sessão', { description: error.message })
      setLoading(false)
      return
    }

    // If appointment selected, mark it as realizado
    if (appointmentId) {
      const { error: aptError } = await supabase
        .from('appointments')
        .update({ status: 'realizado' })
        .eq('id', appointmentId)

      if (aptError) {
        toast.error('Sessão salva, mas erro ao atualizar consulta', {
          description: aptError.message,
        })
      } else {
        toast.success('Sessão registrada e consulta marcada como realizada!')
      }
    } else {
      toast.success('Sessão registrada com sucesso!')
    }

    router.refresh()
    onSuccess?.()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Link to appointment */}
      {pendingAppointments.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="appointment_id">
            Vincular a uma consulta{' '}
            <span className="text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <select
            id="appointment_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={appointmentId}
            onChange={(e) => {
              setAppointmentId(e.target.value)
              // Auto-fill date from appointment
              if (e.target.value) {
                const apt = pendingAppointments.find((a) => a.id === e.target.value)
                if (apt) {
                  setSessionDate(new Date(apt.scheduled_at).toISOString().slice(0, 10))
                }
              }
            }}
          >
            <option value="">Nenhuma (sessão avulsa)</option>
            {pendingAppointments.map((apt) => {
              const dt = new Date(apt.scheduled_at)
              return (
                <option key={apt.id} value={apt.id}>
                  {format(dt, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })} —{' '}
                  {TYPE_LABELS[apt.type]}
                </option>
              )
            })}
          </select>
          {appointmentId && (
            <p className="text-xs text-[#6BAE8E]">
              A consulta será marcada como &ldquo;Realizada&rdquo; ao salvar.
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="session_date">Data da sessão *</Label>
        <Input
          id="session_date"
          type="date"
          max={today}
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="complaint">Queixa</Label>
        <Textarea
          id="complaint"
          placeholder="Relato do paciente, queixas da sessão..."
          className="text-base resize-none min-h-[80px]"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="intervention">Intervenção</Label>
        <Textarea
          id="intervention"
          placeholder="Técnicas utilizadas, intervenções realizadas..."
          className="text-base resize-none min-h-[80px]"
          value={intervention}
          onChange={(e) => setIntervention(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          placeholder="Observações clínicas, comportamento, humor..."
          className="text-base resize-none min-h-[80px]"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="plan">Plano</Label>
        <Textarea
          id="plan"
          placeholder="Planejamento para próximas sessões, tarefas..."
          className="text-base resize-none min-h-[80px]"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar sessão
        </Button>
      </div>
    </form>
  )
}
