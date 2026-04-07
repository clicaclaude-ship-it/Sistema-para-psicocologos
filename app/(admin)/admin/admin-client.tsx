'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Users, CheckCircle, Clock, XCircle, AlertTriangle,
  Search, TrendingUp, UserX, CreditCard, RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PsychRow {
  id: string
  full_name: string
  email: string
  crp: string | null
  clinic_name: string | null
  phone: string | null
  plan: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  last_payment_at: string | null
  next_payment_at: string | null
  last_seen_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  patient_count: number
  is_admin: boolean | null
}

type StatusFilter = 'all' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired_trial'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  trialing:       { label: 'Trial',        color: 'border-[#4F7CAC] text-[#4F7CAC]',   icon: Clock },
  active:         { label: 'Ativo',        color: 'border-[#6BAE8E] text-[#6BAE8E]',   icon: CheckCircle },
  past_due:       { label: 'Inadimplente', color: 'border-[#E8A838] text-[#E8A838]',   icon: AlertTriangle },
  canceled:       { label: 'Cancelado',    color: 'border-gray-400 text-gray-500',      icon: XCircle },
  unpaid:         { label: 'Não pago',     color: 'border-red-400 text-red-500',        icon: XCircle },
  expired_trial:  { label: 'Trial expirado', color: 'border-red-400 text-red-500',     icon: UserX },
}

function getEffectiveStatus(row: PsychRow): string {
  if (row.subscription_status === 'trialing') {
    const expired = row.trial_ends_at && new Date(row.trial_ends_at) < new Date()
    return expired ? 'expired_trial' : 'trialing'
  }
  return row.subscription_status ?? 'trialing'
}

function dt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function daysAgo(iso: string | null) {
  if (!iso) return null
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return '1 dia atrás'
  return `${diff} dias atrás`
}

export function AdminClient({ rows }: { rows: PsychRow[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const status = getEffectiveStatus(r)
      if (filter !== 'all' && status !== filter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.crp ?? '').toLowerCase().includes(q)
      )
    })
  }, [rows, search, filter])

  // Metrics
  const total = rows.length
  const active = rows.filter((r) => getEffectiveStatus(r) === 'active').length
  const trialing = rows.filter((r) => getEffectiveStatus(r) === 'trialing').length
  const expiredTrial = rows.filter((r) => getEffectiveStatus(r) === 'expired_trial').length
  const pastDue = rows.filter((r) => getEffectiveStatus(r) === 'past_due').length

  async function updatePlan(id: string, status: string) {
    setUpdating(id)
    const res = await fetch('/api/admin/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, subscription_status: status }),
    })
    if (res.ok) {
      toast.success('Plano atualizado!')
      window.location.reload()
    } else {
      toast.error('Erro ao atualizar')
    }
    setUpdating(null)
  }

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: `Todos (${total})` },
    { value: 'active', label: `Ativos (${active})` },
    { value: 'trialing', label: `Trial (${trialing})` },
    { value: 'expired_trial', label: `Trial expirado (${expiredTrial})` },
    { value: 'past_due', label: `Inadimplentes (${pastDue})` },
    { value: 'canceled', label: 'Cancelados' },
  ]

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E2A38]">Gestão de Usuários</h1>
        <p className="text-sm text-muted-foreground">Painel administrativo — visível apenas para você</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total cadastros', value: total, icon: Users, color: '#4F7CAC' },
          { label: 'Assinaturas ativas', value: active, icon: CreditCard, color: '#6BAE8E' },
          { label: 'Em trial', value: trialing, icon: Clock, color: '#E8A838' },
          { label: 'Trial expirado (não converteu)', value: expiredTrial, icon: UserX, color: '#D95555' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: m.color + '20' }}>
                  <m.icon className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1E2A38]">{m.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{m.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, e-mail ou CRP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-[#4F7CAC] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Psicólogo</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cadastro</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trial até</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Último pgto</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Pacientes</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ação manual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              const status = getEffectiveStatus(r)
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['trialing']
              const Icon = cfg.icon
              return (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1E2A38]">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                    {r.crp && <p className="text-xs text-muted-foreground">CRP {r.crp}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                    {r.stripe_subscription_id && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-[140px]">
                        {r.stripe_subscription_id}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dt(r.created_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dt(r.trial_ends_at)}
                    {status === 'expired_trial' && (
                      <span className="block text-xs text-red-500">Expirado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.last_payment_at ? dt(r.last_payment_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-medium">
                      {r.patient_count}
                      {r.patient_count === 0 && (
                        <span className="text-xs text-muted-foreground">(não usou)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {status !== 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-[#6BAE8E] border-[#6BAE8E]"
                          disabled={updating === r.id}
                          onClick={() => updatePlan(r.id, 'active')}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Ativar
                        </Button>
                      )}
                      {status !== 'trialing' && status !== 'expired_trial' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          disabled={updating === r.id}
                          onClick={() => updatePlan(r.id, 'trialing')}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reativar trial
                        </Button>
                      )}
                      {status !== 'canceled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-red-500 border-red-300"
                          disabled={updating === r.id}
                          onClick={() => updatePlan(r.id, 'canceled')}
                        >
                          <XCircle className="w-3 h-3" />
                          Suspender
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {filtered.length} de {total} usuários · Dados de assinatura sincronizados via Stripe Webhook
      </p>
    </div>
  )
}
