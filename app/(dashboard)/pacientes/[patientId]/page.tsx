import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PatientRecord } from './patient-record'
import type { Patient, ClinicalNote, NeuroEvaluation, Document } from '@/types/database'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientPage({ params }: Props) {
  const { patientId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: patient },
    { data: clinicalNotes },
    { data: neuroEvals },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('psychologist_id', user.id)
      .single(),
    supabase
      .from('clinical_notes')
      .select('*')
      .eq('patient_id', patientId)
      .eq('psychologist_id', user.id)
      .order('session_date', { ascending: false }),
    supabase
      .from('neuro_evaluations')
      .select('*')
      .eq('patient_id', patientId)
      .eq('psychologist_id', user.id)
      .order('applied_at', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('patient_id', patientId)
      .eq('psychologist_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (!patient) notFound()

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-2 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/pacientes">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold text-[#1E2A38] truncate">
          {patient.full_name}
        </h1>
      </div>

      <PatientRecord
        patient={patient as Patient}
        clinicalNotes={(clinicalNotes ?? []) as ClinicalNote[]}
        neuroEvals={(neuroEvals ?? []) as NeuroEvaluation[]}
        documents={(documents ?? []) as Document[]}
      />
    </div>
  )
}
