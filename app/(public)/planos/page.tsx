'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CheckCircle, CreditCard, Loader2, Brain, Shield, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  'Prontuário eletrônico completo',
  'Agenda com sessões recorrentes',
  'Laudos neuropsicológicos e psicológicos',
  'Contratos terapêuticos com assinatura digital',
  'Lembretes por WhatsApp',
  'Mensagens de aniversário automáticas',
  'Armazenamento de documentos',
  'Dados protegidos pela LGPD',
  'Suporte por e-mail',
]

function PlanosContent() {
  const searchParams = useSearchParams()
  const cancelled = searchParams.get('pagamento') === 'cancelado'
  const [loading, setLoading] = useState(false)

  async function handleAssinar() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Erro ao iniciar pagamento', { description: data.error })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-12 px-4">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F7CAC] mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E2A38]">PsicoDoc</h1>
        </div>

        {cancelled && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 text-center">
            Pagamento cancelado. Você pode tentar novamente quando quiser.
          </div>
        )}

        {/* Plan card */}
        <Card className="shadow-md border-[#4F7CAC]/20">
          <CardContent className="pt-6 pb-6 space-y-6">
            <div className="text-center space-y-1">
              <Badge className="bg-[#4F7CAC] text-white mb-2">Plano Profissional</Badge>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-bold text-[#1E2A38]">R$&nbsp;97</span>
                <span className="text-muted-foreground mb-1">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cobrado mensalmente no cartão · Cancele quando quiser
              </p>
            </div>

            <div className="space-y-2.5">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#6BAE8E] shrink-0" />
                  <span className="text-sm text-[#1E2A38]">{f}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full gap-2 h-12 text-base"
              onClick={handleAssinar}
              disabled={loading}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CreditCard className="w-4 h-4" />}
              Assinar agora — R$ 97/mês
            </Button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Shield className="w-3.5 h-3.5" />
                Pagamento seguro via Stripe · Dados criptografados
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Zap className="w-3.5 h-3.5" />
                Acesso liberado imediatamente após o pagamento
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIX info */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-amber-800 text-center leading-relaxed">
              <strong>Prefere PIX?</strong> Entre em contato pelo e-mail de suporte.
              Com PIX, o pagamento é manual e o acesso precisa ser renovado todo mês.
              Se não houver confirmação até o vencimento, o acesso será suspenso automaticamente.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Dúvidas? Fale com o suporte · Seus dados nunca são apagados ao cancelar
        </p>
      </div>
    </div>
  )
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <PlanosContent />
    </Suspense>
  )
}
