import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, CalendarDays, AlertCircle, Plus } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { greetingByTime, formatDate, calcAge } from '@/lib/utils'
import type { Appointment, Patient } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Onboarding redirect: new users with no patients created within 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [{ count: onboardingPatientCount }, { data: psychologistCreated }] = await Promise.all([
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('psychologist_id', user.id),
    supabase
      .from('psychologists')
      .select('created_at')
      .eq('id', user.id)
      .single(),
  ])

  if (
    onboardingPatientCount === 0 &&
    psychologistCreated?.created_at &&
    new Date(psychologistCreated.created_at) > sevenDaysAgo
  ) {
    redirect('/onboarding')
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

  // Week boundaries (Mon–Sun)
  const dayOfWeek = now.getDay() // 0=Sun
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const [
    { data: psychologist },
    { data: patients, count: totalPatients },
    { data: recentPatients },
    { data: alertPatients },
    { data: todayAppointments },
    { count: appointmentsThisWeek },
  ] = await Promise.all([
    supabase.from('psychologists').select('*').eq('id', user.id).single(),
    supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('psychologist_id', user.id)
      .in('status', ['acompanhamento', 'avaliacao']),
    supabase
      .from('patients')
      .select('*')
      .eq('psychologist_id', user.id)
      .in('status', ['acompanhamento', 'avaliacao'])
      .order('created_at', { ascending: false })
      .limit(5),
    // Patients without any clinical note in the last 30 days
    supabase
      .from('patients')
      .select('*')
      .eq('psychologist_id', user.id)
      .in('status', ['acompanhamento', 'avaliacao'])
      .limit(20),
    // Today's appointments with patient name
    supabase
      .from('appointments')
      .select('*, patients(full_name)')
      .eq('psychologist_id', user.id)
      .gte('scheduled_at', todayStart)
      .lte('scheduled_at', todayEnd)
      .order('scheduled_at'),
    // Appointments this week (count)
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('psychologist_id', user.id)
      .gte('scheduled_at', weekStart.toISOString())
      .lte('scheduled_at', weekEnd.toISOString())
      .neq('status', 'cancelado'),
  ])

  // Find patients without sessions in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentNotes } = await supabase
    .from('clinical_notes')
    .select('patient_id')
    .eq('psychologist_id', user.id)
    .gte('session_date', thirtyDaysAgo.toISOString().slice(0, 10))

  const patientsWithRecentSession = new Set((recentNotes ?? []).map((n) => n.patient_id))
  const inactiveAlerts = (alertPatients ?? []).filter(
    (p: Patient) => !patientsWithRecentSession.has(p.id)
  )

  const greeting = greetingByTime()

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2A38]">
            {greeting},{' '}
            {psychologist?.full_name?.split(' ')[0] ?? 'Psicólogo'}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Button asChild>
          <Link href="/pacientes/novo">
            <Plus className="w-4 h-4 mr-1" />
            Novo paciente
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4F7CAC]/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#4F7CAC]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E2A38]">
                  {totalPatients ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Pacientes ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6BAE8E]/10 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-[#6BAE8E]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E2A38]">
                  {appointmentsThisWeek ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Consultas esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8A838]/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-[#E8A838]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E2A38]">
                  {inactiveAlerts.length}
                </p>
                <p className="text-xs text-muted-foreground">Sem sessão há +30 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's appointments */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#4F7CAC]" />
            Hoje
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-[#4F7CAC]">
            <Link href="/agenda">Ver agenda</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!todayAppointments || todayAppointments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhuma consulta hoje.{' '}
              <Link href="/agenda" className="text-[#4F7CAC] hover:underline">
                Configure sua agenda!
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {(todayAppointments as (Appointment & { patients?: { full_name: string } | null })[]).map((apt) => {
                const time = new Date(apt.scheduled_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const typeColors: Record<string, string> = {
                  consulta: '#4F7CAC',
                  avaliacao: '#7B68C8',
                  devolutiva: '#6BAE8E',
                  retorno: '#E8A838',
                }
                const typeLabels: Record<string, string> = {
                  consulta: 'Consulta',
                  avaliacao: 'Avaliação',
                  devolutiva: 'Devolutiva',
                  retorno: 'Retorno',
                }
                const statusLabels: Record<string, string> = {
                  agendado: 'Agendado',
                  confirmado: 'Confirmado',
                  realizado: 'Realizado',
                  cancelado: 'Cancelado',
                  falta: 'Falta',
                }
                const color = typeColors[apt.type] ?? '#4F7CAC'
                return (
                  <Link
                    key={apt.id}
                    href="/agenda"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1E2A38]">{time}</span>
                        <span className="text-sm truncate">{apt.patients?.full_name ?? '—'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {typeLabels[apt.type]} · {apt.duration_min} min
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-xs"
                      style={{
                        borderColor: apt.status === 'realizado' ? '#6BAE8E'
                          : apt.status === 'cancelado' ? '#D95555'
                          : apt.status === 'confirmado' ? '#4F7CAC'
                          : '#E8A838',
                        color: apt.status === 'realizado' ? '#6BAE8E'
                          : apt.status === 'cancelado' ? '#D95555'
                          : apt.status === 'confirmado' ? '#4F7CAC'
                          : '#E8A838',
                      }}
                    >
                      {statusLabels[apt.status]}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent patients */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4F7CAC]" />
            Pacientes recentes
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-[#4F7CAC]">
            <Link href="/pacientes">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!recentPatients || recentPatients.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhum paciente cadastrado ainda.{' '}
              <Link href="/pacientes/novo" className="text-[#4F7CAC] hover:underline">
                Adicione o primeiro!
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPatients.map((p: Patient) => {
                const age = calcAge(p.birth_date)
                return (
                  <Link
                    key={p.id}
                    href={`/pacientes/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1E2A38] truncate">
                        {p.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {age !== null ? `${age} anos` : 'Idade não informada'}
                        {p.main_complaint ? ` · ${p.main_complaint.slice(0, 50)}` : ''}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        p.status === 'acompanhamento'
                          ? 'border-[#6BAE8E] text-[#6BAE8E]'
                          : p.status === 'avaliacao'
                          ? 'border-[#7B68C8] text-[#7B68C8]'
                          : 'border-muted-foreground text-muted-foreground'
                      }
                    >
                      {p.status === 'acompanhamento' ? 'Acompanhamento' : p.status === 'avaliacao' ? 'Em Avaliação' : 'Alta'}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {inactiveAlerts.length > 0 && (
        <Card className="border-[#E8A838]/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-[#E8A838]">
              <AlertCircle className="w-4 h-4" />
              Alertas — sem sessão há mais de 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactiveAlerts.slice(0, 5).map((p: Patient) => {
                const age = calcAge(p.birth_date)
                return (
                  <Link
                    key={p.id}
                    href={`/pacientes/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {age !== null ? `${age} anos` : ''}
                        {' · Cadastrado em '}
                        {formatDate(p.created_at)}
                      </p>
                    </div>
                    <span className="text-xs text-[#E8A838] font-medium shrink-0">
                      Sem sessão
                    </span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
