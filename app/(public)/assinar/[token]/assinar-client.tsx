'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { maskCPF } from '@/lib/utils'

interface AssinarClientProps {
  contractId: string
  title: string
  content: string
  patientName: string
  psychName: string
  psychCrp: string
  signedAt: string | null
  signedName: string | null
}

export function AssinarClient({
  contractId,
  title,
  content,
  patientName,
  signedAt,
  signedName,
}: AssinarClientProps) {
  const [name, setName] = useState(patientName)
  const [cpf, setCpf] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [done, setDone] = useState(!!signedAt)

  async function handleSign() {
    if (!name.trim()) { toast.error('Informe seu nome completo'); return }
    if (!agreed) { toast.error('Você precisa concordar com os termos para assinar'); return }

    setSigning(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('contracts')
      .update({
        signed_at: new Date().toISOString(),
        signed_name: name.trim(),
        signed_cpf: cpf || null,
      })
      .eq('id', contractId)
      .is('signed_at', null)

    if (error) {
      toast.error('Erro ao assinar o contrato', { description: error.message })
    } else {
      setDone(true)
      toast.success('Contrato assinado com sucesso!')
    }
    setSigning(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#6BAE8E]/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#6BAE8E]" />
            </div>
            <h1 className="text-xl font-bold text-[#1E2A38]">Contrato assinado!</h1>
            <p className="text-muted-foreground text-sm">
              {signedAt
                ? `Este contrato foi assinado por ${signedName ?? name} em ${new Date(signedAt).toLocaleDateString('pt-BR')}.`
                : `O contrato foi assinado com sucesso por ${name}.`}
            </p>
            <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              Assinatura digital registrada com data e hora
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#4F7CAC]" />
            <span className="text-sm font-medium text-[#4F7CAC]">Documento para assinatura digital</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E2A38]">{title}</h1>
        </div>

        {/* Contract content */}
        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-[#1E2A38] font-sans leading-relaxed">
              {content}
            </pre>
          </CardContent>
        </Card>

        {/* Signing form */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-[#1E2A38]">Assinar digitalmente</h2>

            <div className="space-y-1.5">
              <Label htmlFor="sign_name">Nome completo *</Label>
              <Input
                id="sign_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sign_cpf">CPF (opcional)</Label>
              <Input
                id="sign_cpf"
                value={cpf}
                onChange={(e) => setCpf(maskCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className="w-5 h-5 rounded border-2 border-muted-foreground peer-checked:border-[#4F7CAC] peer-checked:bg-[#4F7CAC] transition-colors flex items-center justify-center">
                  {agreed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                Li e concordo com todos os termos descritos neste contrato, e autorizo o uso dos meus dados para fins terapêuticos conforme a LGPD.
              </span>
            </label>

            <Button
              className="w-full"
              onClick={handleSign}
              disabled={signing || !agreed}
            >
              {signing
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <CheckCircle className="mr-2 h-4 w-4" />}
              Assinar digitalmente
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ao clicar em "Assinar digitalmente", a data, hora e seu nome serão registrados como prova de assinatura.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
