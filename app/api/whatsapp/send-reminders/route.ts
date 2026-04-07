import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

async function sendWhatsApp(
  provider: string,
  apiUrl: string,
  instance: string,
  token: string,
  phone: string,
  message: string
): Promise<boolean> {
  const number = formatPhone(phone)
  try {
    if (provider === 'zapi') {
      const res = await fetch(
        `${apiUrl.replace(/\/$/, '')}/instances/${instance}/token/${token}/send-text`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: number, message }),
        }
      )
      return res.ok
    } else {
      // Evolution API
      const res = await fetch(
        `${apiUrl.replace(/\/$/, '')}/message/sendText/${instance}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: token },
          body: JSON.stringify({ number, text: message }),
        }
      )
      return res.ok
    }
  } catch {
    return false
  }
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!psych?.whatsapp_api_url || !psych?.whatsapp_instance || !psych?.whatsapp_token) {
    return NextResponse.json({ error: 'WhatsApp não configurado' }, { status: 400 })
  }

  // Appointments for tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const start = new Date(tomorrow)
  start.setHours(0, 0, 0, 0)
  const end = new Date(tomorrow)
  end.setHours(23, 59, 59, 999)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patients(full_name, phone)')
    .eq('psychologist_id', user.id)
    .in('status', ['agendado', 'confirmado'])
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())

  let sent = 0
  const errors: string[] = []

  for (const apt of appointments ?? []) {
    const patient = apt.patients as { full_name: string; phone: string | null } | null
    if (!patient?.phone) continue

    const hora = new Date(apt.scheduled_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const data = new Date(apt.scheduled_at).toLocaleDateString('pt-BR')

    const message = (psych.whatsapp_reminder_message ?? '')
      .replace(/\{\{nome\}\}/g, patient.full_name)
      .replace(/\{\{horario\}\}/g, hora)
      .replace(/\{\{data\}\}/g, data)

    const ok = await sendWhatsApp(
      psych.whatsapp_provider ?? 'evolution',
      psych.whatsapp_api_url,
      psych.whatsapp_instance,
      psych.whatsapp_token,
      patient.phone,
      message
    )

    if (ok) sent++
    else errors.push(`Erro ao enviar para ${patient.full_name}`)
  }

  return NextResponse.json({ sent, errors })
}
