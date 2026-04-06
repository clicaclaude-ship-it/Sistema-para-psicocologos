'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { clinicalNoteSchema, type ClinicalNoteFormData } from '@/lib/validations/patient'

interface SessionFormProps {
  patientId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function SessionForm({ patientId, onSuccess, onCancel }: SessionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicalNoteFormData>({
    resolver: zodResolver(clinicalNoteSchema),
    defaultValues: {
      session_date: today,
    },
  })

  async function onSubmit(data: ClinicalNoteFormData) {
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
      session_date: data.session_date,
      complaint: data.complaint || null,
      intervention: data.intervention || null,
      observations: data.observations || null,
      plan: data.plan || null,
    })

    if (error) {
      toast.error('Erro ao salvar sessão', { description: error.message })
      setLoading(false)
      return
    }

    toast.success('Sessão registrada com sucesso!')
    router.refresh()
    onSuccess?.()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="session_date">Data da sessão *</Label>
        <Input
          id="session_date"
          type="date"
          max={today}
          {...register('session_date')}
        />
        {errors.session_date && (
          <p className="text-sm text-destructive">{errors.session_date.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="complaint">Queixa</Label>
        <Textarea
          id="complaint"
          placeholder="Relato do paciente, queixas da sessão..."
          className="text-base resize-none min-h-[80px]"
          {...register('complaint')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="intervention">Intervenção</Label>
        <Textarea
          id="intervention"
          placeholder="Técnicas utilizadas, intervenções realizadas..."
          className="text-base resize-none min-h-[80px]"
          {...register('intervention')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          placeholder="Observações clínicas, comportamento, humor..."
          className="text-base resize-none min-h-[80px]"
          {...register('observations')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="plan">Plano</Label>
        <Textarea
          id="plan"
          placeholder="Planejamento para próximas sessões, tarefas..."
          className="text-base resize-none min-h-[80px]"
          {...register('plan')}
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
