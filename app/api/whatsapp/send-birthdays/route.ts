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

  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  // Patients with birthday today (same month+day)
  const { data: patients } = await supabase
    .from('patients')
    .select('full_name, phone, birth_date')
    .eq('psychologist_id', user.id)
    .in('status', ['acompanhamento', 'avaliacao'])
    .not('phone', 'is', null)
    .not('birth_date', 'is', null)

  const birthdayPatients = (patients ?? []).filter((p) => {
    if (!p.birth_date) return false
    const [, m, d] = p.birth_date.split('-')
    return m === month && d === day
  })

  let sent = 0
  const errors: string[] = []

  for (const patient of birthdayPatients) {
    if (!patient.phone) continue

    const message = (psych.whatsapp_birthday_message ?? '')
      .replace(/\{\{nome\}\}/g, patient.full_name)

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
