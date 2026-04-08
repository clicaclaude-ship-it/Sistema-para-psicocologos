'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Brain,
  LogOut,
  User,
  ChevronDown,
  FileSignature,
  AlertTriangle,
  CreditCard,
  BadgeCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Psychologist } from '@/types/database'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/contratos', label: 'Contratos', icon: FileSignature },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface AppShellProps {
  children: React.ReactNode
  psychologist: Psychologist | null
}

function TrialBanner({ psychologist }: { psychologist: Psychologist | null }) {
  const [loading, setLoading] = useState(false)

  if (!psychologist) return null
  const status = psychologist.subscription_status ?? 'trialing'
  if (status === 'active') return null

  const trialEnds = psychologist.trial_ends_at ? new Date(psychologist.trial_ends_at) : null
  const daysLeft = trialEnds
    ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000))
    : 0
  const expired = status === 'trialing' && trialEnds && trialEnds < new Date()
  const isPastDue = status === 'past_due'

  if (!expired && !isPastDue && status === 'trialing' && daysLeft > 7) return null

  async function handleAssinar() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  const bg = expired || isPastDue ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
  const textColor = expired || isPastDue ? 'text-red-800' : 'text-amber-800'
  const Icon = expired || isPastDue ? AlertTriangle : AlertTriangle

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2 border-b text-xs ${bg} ${textColor}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {expired
          ? 'Seu período de teste encerrou. Assine para continuar usando.'
          : isPastDue
          ? 'Pagamento pendente. Regularize para manter o acesso.'
          : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''} no seu período de teste.`}
      </div>
      <button
        onClick={handleAssinar}
        disabled={loading}
        className="flex items-center gap-1 font-semibold underline underline-offset-2 whitespace-nowrap shrink-0"
      >
        <CreditCard className="w-3.5 h-3.5" />
        {loading ? 'Aguarde...' : 'Assinar agora'}
      </button>
    </div>
  )
}

export function AppShell({ children, psychologist }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  const initials = psychologist?.full_name
    ? psychologist.full_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'P'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Até logo!')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-border fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-[#4F7CAC] flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-[#1E2A38] text-base">PsicoDoc</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                  active
                    ? 'bg-[#4F7CAC]/10 text-[#4F7CAC]'
                    : 'text-muted-foreground hover:text-[#1E2A38] hover:bg-muted'
                )}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              }
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-[#4F7CAC]/10 text-[#4F7CAC] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate text-[#1E2A38]">
                  {psychologist?.full_name ?? 'Psicólogo'}
                </p>
                {psychologist?.crp && (
                  <p className="text-xs text-muted-foreground">CRP {psychologist.crp}</p>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                render={<Link href="/configuracoes" className="gap-2" />}
              >
                <User className="w-4 h-4" />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/planos" className="gap-2" />}
              >
                <BadgeCheck className="w-4 h-4" />
                Meu plano
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-60">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-border px-4 h-14 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#4F7CAC] flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#1E2A38]">PsicoDoc</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              }
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#4F7CAC]/10 text-[#4F7CAC] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 border-b mb-1">
                <p className="text-sm font-medium truncate">
                  {psychologist?.full_name ?? 'Psicólogo'}
                </p>
              </div>
              <DropdownMenuItem
                render={<Link href="/configuracoes" className="gap-2" />}
              >
                <User className="w-4 h-4" />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/planos" className="gap-2" />}
              >
                <BadgeCheck className="w-4 h-4" />
                Meu plano
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Trial/payment banner */}
        <TrialBanner psychologist={psychologist} />

        {/* Page content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Bottom nav — mobile only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-20 flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors min-h-[56px]',
                  active ? 'text-[#4F7CAC]' : 'text-muted-foreground'
                )}
              >
                <Icon
                  size={20}
                  className={cn(active ? 'text-[#4F7CAC]' : 'text-muted-foreground')}
                />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
