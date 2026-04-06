export interface Psychologist {
  id: string
  full_name: string
  crp: string | null
  email: string
  phone: string | null
  clinic_name: string | null
  created_at: string
}

export interface Patient {
  id: string
  psychologist_id: string
  full_name: string
  birth_date: string | null
  cpf: string | null
  phone: string | null
  guardian_name: string | null
  main_complaint: string | null
  brief_history: string | null
  status: 'active' | 'inactive' | 'archived'
  consent_signed_at: string | null
  created_at: string
}

export interface Appointment {
  id: string
  psychologist_id: string
  patient_id: string
  scheduled_at: string
  duration_min: number
  type: 'consulta' | 'avaliacao' | 'devolutiva' | 'retorno'
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'falta'
  notes: string | null
  created_at: string
}

export interface ClinicalNote {
  id: string
  psychologist_id: string
  patient_id: string
  appointment_id: string | null
  session_date: string
  complaint: string | null
  intervention: string | null
  observations: string | null
  plan: string | null
  created_at: string
}

export interface NeuroEvaluation {
  id: string
  psychologist_id: string
  patient_id: string
  test_name: string
  applied_at: string
  results: string | null
  interpretation: string | null
  created_at: string
}

export interface Document {
  id: string
  psychologist_id: string
  patient_id: string
  name: string
  type: 'laudo' | 'relatorio' | 'declaracao' | 'protocolo' | 'outro'
  storage_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}
