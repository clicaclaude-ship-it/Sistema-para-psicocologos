'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Loader2, Plus, X, Check, Ban } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Appointment, Patient } from '@/types/database'

// ─── Localizer ────────────────────────────────────────────────────────────────

const locales = { 'pt-BR': ptBR }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales,
})

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<Appointment['type'], string> = {
  consulta: '#4F7CAC',
  avaliacao: '#7B68C8',
  devolutiva: '#6BAE8E',
  retorno: '#E8A838',
}

const TYPE_LABELS: Record<Appointment['type'], string> = {
  consulta: 'Consulta',
  avaliacao: 'Avaliação',
  devolutiva: 'Devolutiva',
  retorno: 'Retorno',
}

const STATUS_LABELS: Record<Appointment['status'], string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  falta: 'Falta',
}

const DURATION_OPTIONS = [30, 45, 50, 60, 90]

const PT_BR_MESSAGES = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Consulta',
  noEventsInRange: 'Nenhuma consulta neste período.',
  showMore: (total: number) => `+${total} mais`,
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Appointment & { patient_name?: string }
}

interface ModalState {
  open: boolean
  mode: 'create' | 'view'
  appointment?: Appointment & { patient_name?: string }
  slotStart?: Date
}

interface FormState {
  patient_id: string
  date: string
  time: string
  duration_min: number
  type: Appointment['type']
  notes: string
  recurrence: Appointment['recurrence']
  recurrence_end_date: string
}

const DEFAULT_FORM: FormState = {
  patient_id: '',
  date: '',
  time: '09:00',
  duration_min: 50,
  type: 'consulta',
  notes: '',
  recurrence: 'none',
  recurrence_end_date: '',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const supabase = createClient()

  const [isMobile, setIsMobile] = useState(false)
  const [view, setView] = useState<View>(Views.MONTH)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [patients, setPatients] = useState<Pick<Patient, 'id' | 'full_name'>[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create' })
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  // Detect mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setView(Views.DAY)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Load patients once
  useEffect(() => {
    async function loadPatients() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      const { data } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('psychologist_id', userData.user.id)
        .in('status', ['acompanhamento', 'avaliacao'])
        .order('full_name')
      setPatients(data ?? [])
    }
    loadPatients()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load appointments for displayed date range
  const loadAppointments = useCallback(
    async (date: Date) => {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setLoading(false)
        return
      }

      // Fetch prev month → next month to cover all calendar views
      const start = startOfMonth(subMonths(date, 1)).toISOString()
      const end = endOfMonth(addMonths(date, 1)).toISOString()

      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(full_name)')
        .eq('psychologist_id', userData.user.id)
        .gte('scheduled_at', start)
        .lte('scheduled_at', end)
        .order('scheduled_at')

      if (error) {
        toast.error('Erro ao carregar agenda', { description: error.message })
        setLoading(false)
        return
      }

      const mapped: CalendarEvent[] = (data ?? []).map((apt: Appointment & { patients?: { full_name: string } | null }) => {
        const start = new Date(apt.scheduled_at)
        const end = new Date(start.getTime() + apt.duration_min * 60000)
        const patientName = apt.patients?.full_name ?? 'Paciente'
        return {
          id: apt.id,
          title: `${apt.recurrence !== 'none' ? '↻ ' : ''}${patientName} — ${TYPE_LABELS[apt.type]}`,
          start,
          end,
          resource: { ...apt, patient_name: patientName },
        }
      })

      setEvents(mapped)
      setLoading(false)
    },
    [supabase]
  )

  useEffect(() => {
    loadAppointments(currentDate)
  }, [currentDate, loadAppointments])

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openCreate(start: Date) {
    const dateStr = format(start, 'yyyy-MM-dd')
    const timeStr = format(start, 'HH:mm')
    setForm({ ...DEFAULT_FORM, date: dateStr, time: timeStr })
    setModal({ open: true, mode: 'create', slotStart: start })
  }

  function openView(event: CalendarEvent) {
    setModal({ open: true, mode: 'view', appointment: event.resource })
  }

  function closeModal() {
    setModal({ open: false, mode: 'create' })
    setForm(DEFAULT_FORM)
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function handleCreate() {
    if (!form.patient_id) {
      toast.error('Selecione um paciente')
      return
    }
    if (!form.date || !form.time) {
      toast.error('Informe data e horário')
      return
    }

    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setSaving(false)
      return
    }

    const scheduled_at = new Date(`${form.date}T${form.time}:00`).toISOString()

    const { data: created, error } = await supabase.from('appointments').insert({
      psychologist_id: userData.user.id,
      patient_id: form.patient_id,
      scheduled_at,
      duration_min: form.duration_min,
      type: form.type,
      notes: form.notes || null,
      status: 'agendado',
      recurrence: form.recurrence,
      recurrence_end_date: form.recurrence_end_date || null,
    }).select().single()

    // Create recurring appointments
    if (!error && created && form.recurrence !== 'none' && form.recurrence_end_date) {
      const endDate = new Date(form.recurrence_end_date + 'T23:59:59')
      const recurrences: object[] = []
      let current = new Date(`${form.date}T${form.time}:00`)
      while (true) {
        if (form.recurrence === 'monthly') {
          current = new Date(current)
          current.setMonth(current.getMonth() + 1)
        } else {
          const days = form.recurrence === 'weekly' ? 7 : 14
          current = new Date(current.getTime() + days * 86400000)
        }
        if (current > endDate) break
        recurrences.push({
          psychologist_id: userData.user.id,
          patient_id: form.patient_id,
          scheduled_at: current.toISOString(),
          duration_min: form.duration_min,
          type: form.type,
          notes: form.notes || null,
          status: 'agendado',
          recurrence: form.recurrence,
          recurrence_end_date: form.recurrence_end_date || null,
          recurrence_parent_id: created.id,
        })
      }
      if (recurrences.length > 0) {
        await supabase.from('appointments').insert(recurrences)
      }
    }

    if (error) {
      toast.error('Erro ao criar consulta', { description: error.message })
    } else {
      toast.success('Consulta criada!')
      closeModal()
      loadAppointments(currentDate)
    }
    setSaving(false)
  }

  async function handleUpdateStatus(id: string, status: Appointment['status']) {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao atualizar consulta', { description: error.message })
    } else {
      toast.success('Status atualizado!')
      closeModal()
      loadAppointments(currentDate)
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancelar esta consulta?')) return
    await handleUpdateStatus(id, 'cancelado')
  }

  async function handleMarkDone(id: string) {
    await handleUpdateStatus(id, 'realizado')
  }

  // ── Event style ────────────────────────────────────────────────────────────

  function eventStyleGetter(event: CalendarEvent) {
    const color = TYPE_COLORS[event.resource.type] ?? '#4F7CAC'
    const isCancelled = event.resource.status === 'cancelado'
    return {
      style: {
        backgroundColor: isCancelled ? '#9CA3AF' : color,
        borderColor: isCancelled ? '#6B7280' : color,
        opacity: isCancelled ? 0.6 : 1,
        color: '#fff',
        borderRadius: 4,
        fontSize: '0.75rem',
      },
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const apt = modal.appointment

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-[#1E2A38]">Agenda</h1>

        <div className="flex items-center gap-2">
          {/* View toggle — desktop only */}
          {!isMobile && (
            <div className="hidden md:flex rounded-lg border border-border overflow-hidden">
              {([Views.MONTH, Views.WEEK, Views.DAY] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    view === v
                      ? 'bg-[#4F7CAC] text-white'
                      : 'bg-white text-muted-foreground hover:bg-[#4F7CAC]/10'
                  }`}
                >
                  {v === Views.MONTH ? 'Mês' : v === Views.WEEK ? 'Semana' : 'Dia'}
                </button>
              ))}
            </div>
          )}

          <Button size="sm" onClick={() => openCreate(new Date())} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova consulta</span>
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {(Object.entries(TYPE_COLORS) as [Appointment['type'], string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="flex-1 min-h-[500px] bg-white rounded-xl border border-border overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#4F7CAC]" />
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          culture="pt-BR"
          messages={PT_BR_MESSAGES}
          eventPropGetter={eventStyleGetter}
          onSelectSlot={(slot) => openCreate(slot.start as Date)}
          onSelectEvent={openView}
          selectable
          style={{ height: '100%', padding: '12px' }}
          formats={{
            dayHeaderFormat: (date: Date) =>
              format(date, "EEEE, d 'de' MMMM", { locale: ptBR }),
            monthHeaderFormat: (date: Date) =>
              format(date, "MMMM 'de' yyyy", { locale: ptBR }),
            weekdayFormat: (date: Date) =>
              format(date, 'EEEE', { locale: ptBR }),
            agendaDateFormat: (date: Date) =>
              format(date, "d 'de' MMMM", { locale: ptBR }),
            agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, "d 'de' MMMM", { locale: ptBR })} – ${format(end, "d 'de' MMMM", { locale: ptBR })}`,
          }}
        />
      </div>

      {/* Modal */}
      <Dialog open={modal.open} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal.mode === 'create' ? 'Nova consulta' : 'Detalhes da consulta'}
            </DialogTitle>
          </DialogHeader>

          {modal.mode === 'create' ? (
            <div className="space-y-4 py-2">
              {/* Patient */}
              <div className="space-y-1.5">
                <Label>Paciente *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Horário *</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>

              {/* Duration + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Duração</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.duration_min}
                    onChange={(e) =>
                      setForm({ ...form, duration_min: Number(e.target.value) })
                    }
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} min
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as Appointment['type'] })
                    }
                  >
                    {(Object.entries(TYPE_LABELS) as [Appointment['type'], string][]).map(
                      ([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Repetir</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.recurrence}
                    onChange={(e) => setForm({ ...form, recurrence: e.target.value as Appointment['recurrence'] })}
                  >
                    <option value="none">Não repetir</option>
                    <option value="weekly">Toda semana</option>
                    <option value="biweekly">A cada 2 semanas</option>
                    <option value="monthly">Todo mês</option>
                  </select>
                </div>
                {form.recurrence !== 'none' && (
                  <div className="space-y-1.5">
                    <Label>Repetir até</Label>
                    <Input
                      type="date"
                      value={form.recurrence_end_date}
                      min={form.date}
                      onChange={(e) => setForm({ ...form, recurrence_end_date: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações sobre a consulta..."
                  className="text-base resize-none min-h-[72px]"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar consulta
                </Button>
              </div>
            </div>
          ) : apt ? (
            <div className="space-y-4 py-2">
              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: TYPE_COLORS[apt.type] }}
                  />
                  <span className="font-semibold text-[#1E2A38]">{apt.patient_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                      Data e hora
                    </p>
                    <p>
                      {format(new Date(apt.scheduled_at), "d 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                      Duração
                    </p>
                    <p>{apt.duration_min} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                      Tipo
                    </p>
                    <p>{TYPE_LABELS[apt.type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        apt.status === 'realizado'
                          ? 'border-[#6BAE8E] text-[#6BAE8E]'
                          : apt.status === 'cancelado' || apt.status === 'falta'
                          ? 'border-destructive text-destructive'
                          : apt.status === 'confirmado'
                          ? 'border-[#4F7CAC] text-[#4F7CAC]'
                          : 'border-[#E8A838] text-[#E8A838]'
                      }
                    >
                      {STATUS_LABELS[apt.status]}
                    </Badge>
                  </div>
                </div>

                {apt.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                      Observações
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{apt.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {apt.status !== 'cancelado' && apt.status !== 'realizado' && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-[#6BAE8E] border-[#6BAE8E] hover:bg-[#6BAE8E]/10"
                    onClick={() => handleMarkDone(apt.id)}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Marcar como realizado
                  </Button>
                  {apt.status === 'agendado' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-[#4F7CAC] border-[#4F7CAC] hover:bg-[#4F7CAC]/10"
                      onClick={() => handleUpdateStatus(apt.id, 'confirmado')}
                    >
                      Confirmar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => handleCancel(apt.id)}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancelar
                  </Button>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
