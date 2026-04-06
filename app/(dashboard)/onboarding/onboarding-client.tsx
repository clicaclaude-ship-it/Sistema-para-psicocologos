'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, UserRound, Users, Calendar, ArrowRight, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileFormData } from '@/lib/validations/patient'
import { maskPhone } from '@/lib/utils'
import type { Psychologist } from '@/types/database'

interface OnboardingClientProps {
  psychologist: Psychologist | null
  userId: string
}

const steps = [
  {
    number: 1,
    title: 'Complete seu perfil',
    description: 'Adicione seus dados profissionais.',
    icon: UserRound,
  },
  {
    number: 2,
    title: 'Cadastre seu primeiro paciente',
    description: 'Comece a organizar seus atendimentos.',
    icon: Users,
  },
  {
    number: 3,
    title: 'Configure sua agenda',
    description: 'Gerencie seus horários de consulta.',
    icon: Calendar,
  },
]

export function OnboardingClient({ psychologist, userId }: OnboardingClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [profileSaved, setProfileSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: psychologist?.full_name ?? '',
      crp: psychologist?.crp ?? '',
      phone: psychologist?.phone ?? '',
      clinic_name: psychologist?.clinic_name ?? '',
    },
  })

  async function saveProfile(data: ProfileFormData) {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('psychologists')
      .update({
        full_name: data.full_name,
        crp: data.crp || null,
        phone: data.phone || null,
        clinic_name: data.clinic_name || null,
      })
      .eq('id', userId)

    if (error) {
      toast.error('Erro ao salvar perfil', { description: error.message })
    } else {
      toast.success('Perfil salvo com sucesso!')
      setProfileSaved(true)
      setCurrentStep(2)
    }
    setSaving(false)
  }

  const firstName = (psychologist?.full_name ?? 'Psicólogo').split(' ')[0]

  return (
    <div className="px-4 sm:px-6 py-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2A38] mb-2">
          Bem-vindo ao PsicoGest, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Vamos configurar seu consultório em 3 passos simples
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep > step.number
                    ? 'bg-[#6BAE8E] text-white'
                    : currentStep === step.number
                    ? 'bg-[#4F7CAC] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 sm:w-24 mx-2 transition-colors ${
                  currentStep > step.number + 1
                    ? 'bg-[#6BAE8E]'
                    : currentStep > step.number
                    ? 'bg-[#4F7CAC]'
                    : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Profile form */}
      {currentStep === 1 && (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#4F7CAC]/10 flex items-center justify-center">
                <UserRound className="w-5 h-5 text-[#4F7CAC]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1E2A38]">Complete seu perfil</h2>
                <p className="text-xs text-muted-foreground">Passo 1 de 3</p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(saveProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Nome completo *</Label>
                  <Input id="full_name" {...form.register('full_name')} />
                  {form.formState.errors.full_name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="crp">CRP</Label>
                  <Input id="crp" placeholder="06/123456" {...form.register('crp')} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    {...form.register('phone')}
                    onChange={(e) => form.setValue('phone', maskPhone(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="clinic_name">Nome do consultório</Label>
                  <Input
                    id="clinic_name"
                    placeholder="Consultório Psicológico..."
                    {...form.register('clinic_name')}
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full gap-2 bg-[#4F7CAC] hover:bg-[#3a6490]">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar e continuar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Add patient */}
      {currentStep === 2 && (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#4F7CAC]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#4F7CAC]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1E2A38]">Cadastre seu primeiro paciente</h2>
                <p className="text-xs text-muted-foreground">Passo 2 de 3</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione o primeiro paciente para começar a usar o prontuário eletrônico,
              registrar sessões e avaliações.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 gap-2 bg-[#4F7CAC] hover:bg-[#3a6490]"
              >
                <a href="/pacientes/novo">
                  <Users className="w-4 h-4" />
                  Adicionar paciente
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setCurrentStep(3)}
              >
                Fazer isso depois
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Agenda */}
      {currentStep === 3 && (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#4F7CAC]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#4F7CAC]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1E2A38]">Configure sua agenda</h2>
                <p className="text-xs text-muted-foreground">Passo 3 de 3</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sua agenda integrada está pronta para uso. Agende consultas, visualize por dia,
              semana ou mês e acompanhe tudo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 gap-2 bg-[#4F7CAC] hover:bg-[#3a6490]"
              >
                <a href="/agenda">
                  <Calendar className="w-4 h-4" />
                  Ir para agenda
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => router.push('/dashboard')}
              >
                Ir para o Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skip link */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
        >
          Pular para o dashboard
        </button>
      </div>
    </div>
  )
}
