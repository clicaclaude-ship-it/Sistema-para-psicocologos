'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/date-picker'
import { createClient } from '@/lib/supabase/client'
import { patientSchema, type PatientFormData } from '@/lib/validations/patient'
import { maskCPF, maskPhone } from '@/lib/utils'

export default function NovoPackientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      lgpd_consent: false,
    },
  })

  const lgpdConsent = watch('lgpd_consent')

  function handleCPFChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskCPF(e.target.value)
    setValue('cpf', masked)
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskPhone(e.target.value)
    setValue('phone', masked)
  }

  async function onSubmit(data: PatientFormData) {
    setLoading(true)
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      toast.error('Usuário não autenticado')
      setLoading(false)
      return
    }

    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        psychologist_id: userData.user.id,
        full_name: data.full_name,
        birth_date: data.birth_date || null,
        cpf: data.cpf || null,
        phone: data.phone || null,
        guardian_name: data.guardian_name || null,
        main_complaint: data.main_complaint || null,
        brief_history: data.brief_history || null,
        status: 'acompanhamento',
        consent_signed_at: data.lgpd_consent ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao salvar paciente', { description: error.message })
      setLoading(false)
      return
    }

    toast.success('Paciente cadastrado com sucesso!')
    router.push(`/pacientes/${patient.id}`)
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/pacientes">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[#1E2A38]">Novo Paciente</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados do paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados pessoais */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nome completo *</Label>
              <Input
                id="full_name"
                placeholder="Nome completo do paciente"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Data de nascimento</Label>
                <DatePicker
                  value={watch('birth_date') ?? ''}
                  onChange={(val) => setValue('birth_date', val)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  {...register('cpf')}
                  onChange={handleCPFChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  {...register('phone')}
                  onChange={handlePhoneChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guardian_name">
                  Responsável legal{' '}
                  <span className="text-muted-foreground text-xs">(para menores)</span>
                </Label>
                <Input
                  id="guardian_name"
                  placeholder="Nome do responsável"
                  {...register('guardian_name')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações clínicas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações clínicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="main_complaint">Queixa principal</Label>
              <Textarea
                id="main_complaint"
                placeholder="Descreva a queixa principal do paciente..."
                className="text-base resize-none min-h-[80px]"
                {...register('main_complaint')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief_history">Histórico breve</Label>
              <Textarea
                id="brief_history"
                placeholder="Histórico clínico relevante, diagnósticos anteriores, medicamentos..."
                className="text-base resize-none min-h-[120px]"
                {...register('brief_history')}
              />
            </div>
          </CardContent>
        </Card>

        {/* LGPD */}
        <Card className="border-[#4F7CAC]/20">
          <CardContent className="pt-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={lgpdConsent}
                  onChange={(e) => setValue('lgpd_consent', e.target.checked)}
                />
                <div className="w-5 h-5 rounded border-2 border-muted-foreground peer-checked:border-[#4F7CAC] peer-checked:bg-[#4F7CAC] transition-colors flex items-center justify-center">
                  {lgpdConsent && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-[#1E2A38]">Consentimento LGPD *</span>
                <br />
                Declaro que obtive o consentimento do paciente para armazenamento de
                dados conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
                e que as informações serão utilizadas exclusivamente para fins terapêuticos.
              </span>
            </label>
            {errors.lgpd_consent && (
              <p className="text-sm text-destructive mt-2 ml-8">
                {errors.lgpd_consent.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" className="sm:flex-1" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar paciente
          </Button>
        </div>
      </form>
    </div>
  )
}
