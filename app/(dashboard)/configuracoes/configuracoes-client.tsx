'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Save, AlertTriangle, KeyRound, User } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileFormData } from '@/lib/validations/patient'
import { maskPhone } from '@/lib/utils'
import type { Psychologist } from '@/types/database'

const changePasswordSchema = z
  .object({
    new_password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'As senhas não conferem',
    path: ['confirm_password'],
  })

interface ConfiguracoesClientProps {
  psychologist: Psychologist | null
  userEmail: string
  userId: string
}

export function ConfiguracoesClient({
  psychologist,
  userEmail,
  userId,
}: ConfiguracoesClientProps) {
  const router = useRouter()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: psychologist?.full_name ?? '',
      crp: psychologist?.crp ?? '',
      phone: psychologist?.phone ?? '',
      clinic_name: psychologist?.clinic_name ?? '',
    },
  })

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function saveProfile(data: ProfileFormData) {
    setSavingProfile(true)
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
      toast.success('Perfil atualizado com sucesso!')
      router.refresh()
    }
    setSavingProfile(false)
  }

  async function changePassword(data: z.infer<typeof changePasswordSchema>) {
    setSavingPassword(true)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: data.new_password,
    })

    if (error) {
      toast.error('Erro ao alterar senha', { description: error.message })
    } else {
      toast.success('Senha alterada com sucesso!')
      passwordForm.reset()
    }
    setSavingPassword(false)
  }

  async function deleteAccount() {
    if (deleteConfirmText !== 'EXCLUIR') return
    setDeleting(true)
    const supabase = createClient()

    // Delete all patient data first (cascade will handle it via RLS + DB)
    const { error } = await supabase.rpc('delete_my_account')

    if (error) {
      // If RPC doesn't exist, just sign out
      await supabase.auth.signOut()
      toast.error('Para excluir a conta permanentemente, entre em contato com o suporte.')
    } else {
      toast.success('Conta excluída.')
    }

    router.push('/login')
    setDeleting(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-[#4F7CAC]" />
            Perfil profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input id="full_name" {...profileForm.register('full_name')} />
                {profileForm.formState.errors.full_name && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="crp">CRP</Label>
                <Input id="crp" placeholder="06/123456" {...profileForm.register('crp')} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  {...profileForm.register('phone')}
                  onChange={(e) =>
                    profileForm.setValue('phone', maskPhone(e.target.value))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="clinic_name">Nome do consultório</Label>
                <Input
                  id="clinic_name"
                  placeholder="Consultório Psicológico..."
                  {...profileForm.register('clinic_name')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input value={userEmail} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Para alterar o e-mail, use a seção de segurança abaixo.
              </p>
            </div>

            <Button type="submit" disabled={savingProfile} className="gap-2">
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar perfil
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#4F7CAC]" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_password">Nova senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register('new_password')}
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register('confirm_password')}
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" variant="outline" disabled={savingPassword} className="gap-2">
              {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Alterar senha
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Zona de perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
            <AlertDescription className="text-sm">
              Excluir sua conta removerá permanentemente todos os dados cadastrados,
              incluindo pacientes, sessões, avaliações e documentos. Esta ação é
              irreversível e está em conformidade com a LGPD (direito ao esquecimento).
            </AlertDescription>
          </Alert>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Excluir conta e todos os dados
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir conta permanentemente</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus dados serão excluídos definitivamente.
              <br />
              <br />
              Para confirmar, digite{' '}
              <strong className="font-mono">EXCLUIR</strong> no campo abaixo:
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="EXCLUIR"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="font-mono"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmText('')
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={deleteConfirmText !== 'EXCLUIR' || deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
