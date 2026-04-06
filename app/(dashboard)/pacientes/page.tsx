import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Search, Users } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PatientCard } from '@/components/patient-card'
import { PatientsClient } from './patients-client'
import type { Patient } from '@/types/database'

export default async function PatientsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('psychologist_id', user.id)
    .order('full_name', { ascending: true })

  // Get last session date per patient
  const { data: lastSessions } = await supabase
    .from('clinical_notes')
    .select('patient_id, session_date')
    .eq('psychologist_id', user.id)
    .order('session_date', { ascending: false })

  const lastSessionMap: Record<string, string> = {}
  for (const s of lastSessions ?? []) {
    if (!lastSessionMap[s.patient_id]) {
      lastSessionMap[s.patient_id] = s.session_date
    }
  }

  return (
    <PatientsClient
      patients={(patients ?? []) as Patient[]}
      lastSessionMap={lastSessionMap}
    />
  )
}
