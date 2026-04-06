'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Brain, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { cadastroSchema, type CadastroFormData } from '@/lib/validations/auth'

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
  })

  async function onSubmit(data: CadastroFormData) {
    setLoading(true)
    const supabase = createClient()

    const { error, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          crp: data.crp ?? '',
        },
      },
    })

    if (error) {
      toast.error('Erro ao criar conta', { description: error.message })
      setLoading(false)
      return
    }

    // If email confirmation is required
    if (authData.user && !authData.session) {
      setEmailSent(true)
      setLoading(false)
      return
    }

    toast.success('Conta criada com sucesso!')
    router.push('/dashboard')
    router.refresh()
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F7CAC] mb-3">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E2A38]">PsicoDoc</h1>
          </div>
          <Card className="shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Verifique seu e-mail</h2>
                <p className="text-muted-foreground text-sm">
                  Enviamos um link de confirmação para o seu e-mail. Clique
                  no link para ativar sua conta e acessar o sistema.
                </p>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Ir para o login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F7CAC] mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E2A38]">PsicoDoc</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Criar sua conta</CardTitle>
            <CardDescription>
              Comece gratuitamente — sem cartão de crédito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input
                  id="full_name"
                  placeholder="Dr(a). Ana Silva"
                  autoComplete="name"
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="crp">
                  CRP <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="crp"
                  placeholder="06/123456"
                  {...register('crp')}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm_password">Confirmar senha *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('confirm_password')}
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>

              <Alert className="border-[#4F7CAC]/20 bg-[#4F7CAC]/5">
                <AlertDescription className="text-xs text-muted-foreground">
                  Ao criar uma conta, você concorda com nossa política de privacidade
                  e com o armazenamento seguro dos dados conforme a LGPD.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar conta
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-[#4F7CAC] font-medium hover:underline"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
