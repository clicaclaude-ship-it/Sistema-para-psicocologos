'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Mail, Loader2, RefreshCw, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmarEmailPage() {
  const router = useRouter()
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    setResending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      toast.error('Não foi possível identificar o e-mail. Faça login novamente.')
      setResending(false)
      return
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error('Erro ao reenviar e-mail', { description: error.message })
    } else {
      setResent(true)
      toast.success('E-mail de confirmação reenviado!')
    }
    setResending(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleCheckConfirmed() {
    const supabase = createClient()
    // Force session refresh to check if email was confirmed
    await supabase.auth.refreshSession()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email_confirmed_at) {
      toast.success('E-mail confirmado! Redirecionando...')
      router.push('/dashboard')
      router.refresh()
    } else {
      toast.error('E-mail ainda não confirmado. Verifique sua caixa de entrada.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F7CAC] mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E2A38]">PsicoDoc</h1>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-8 pb-6 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#4F7CAC]/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#4F7CAC]" />
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-[#1E2A38]">Confirme seu e-mail</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Para acessar o sistema, você precisa confirmar seu endereço de e-mail.
                Verifique sua caixa de entrada (e a pasta de spam) e clique no link de confirmação.
              </p>
            </div>

            {resent && (
              <div className="bg-[#6BAE8E]/10 border border-[#6BAE8E]/30 rounded-lg p-3 text-sm text-center text-[#1E2A38]">
                ✅ E-mail reenviado! Verifique sua caixa de entrada.
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleCheckConfirmed}
              >
                Já confirmei meu e-mail
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleResend}
                disabled={resending || resent}
              >
                {resending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <RefreshCw className="w-4 h-4" />}
                {resent ? 'E-mail reenviado' : 'Reenviar e-mail de confirmação'}
              </Button>

              <Button
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sair e usar outra conta
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              O link de confirmação expira em 24 horas. Se não encontrar o e-mail, tente reenviar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
