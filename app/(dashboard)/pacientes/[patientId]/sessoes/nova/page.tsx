import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionFormWithAppointment } from '@/components/session-form-with-appointment'
import type { Appointment } from '@/types/database'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function NovaSessaoPage({ params }: Props) {
  const { patientId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('id', patientId)
    .eq('psychologist_id', user.id)
    .single()

  if (!patient) redirect('/pacientes')

  // Fetch pending appointments for this patient
  const { data: pendingAppointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .in('status', ['agendado', 'confirmado'])
    .order('scheduled_at')

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/pacientes/${patientId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[#1E2A38]">Nova Sessão</h1>
          <p className="text-sm text-muted-foreground">{patient.full_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registro de sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionFormWithAppointment
            patientId={patientId}
            pendingAppointments={(pendingAppointments ?? []) as Appointment[]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
