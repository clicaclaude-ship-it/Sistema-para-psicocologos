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
import { neuroEvalSchema, type NeuroEvalFormData } from '@/lib/validations/patient'

interface NeuroEvalFormProps {
  patientId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function NeuroEvalForm({ patientId, onSuccess, onCancel }: NeuroEvalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NeuroEvalFormData>({
    resolver: zodResolver(neuroEvalSchema),
    defaultValues: {
      applied_at: today,
    },
  })

  async function onSubmit(data: NeuroEvalFormData) {
    setLoading(true)
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      toast.error('Usuário não autenticado')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('neuro_evaluations').insert({
      psychologist_id: userData.user.id,
      patient_id: patientId,
      test_name: data.test_name,
      applied_at: data.applied_at,
      results: data.results || null,
      interpretation: data.interpretation || null,
    })

    if (error) {
      toast.error('Erro ao salvar avaliação', { description: error.message })
      setLoading(false)
      return
    }

    toast.success('Avaliação registrada com sucesso!')
    router.refresh()
    onSuccess?.()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="test_name">Nome do teste *</Label>
          <Input
            id="test_name"
            placeholder="Ex: WISC-V, WAIS-IV, Raven..."
            {...register('test_name')}
          />
          {errors.test_name && (
            <p className="text-sm text-destructive">{errors.test_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="applied_at">Data de aplicação *</Label>
          <Input
            id="applied_at"
            type="date"
            max={today}
            {...register('applied_at')}
          />
          {errors.applied_at && (
            <p className="text-sm text-destructive">{errors.applied_at.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="results">Resultados</Label>
        <Textarea
          id="results"
          placeholder="Pontuações, percentis, índices obtidos..."
          className="text-base resize-none min-h-[100px]"
          {...register('results')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="interpretation">Interpretação clínica</Label>
        <Textarea
          id="interpretation"
          placeholder="Análise dos resultados, conclusões clínicas..."
          className="text-base resize-none min-h-[120px]"
          {...register('interpretation')}
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
          Salvar avaliação
        </Button>
      </div>
    </form>
  )
}
