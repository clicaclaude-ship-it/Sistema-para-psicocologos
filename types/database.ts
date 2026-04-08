export interface Psychologist {
  id: string
  full_name: string
  crp: string | null
  email: string
  phone: string | null
  clinic_name: string | null
  whatsapp_provider: 'evolution' | 'zapi' | null
  whatsapp_api_url: string | null
  whatsapp_instance: string | null
  whatsapp_token: string | null
  whatsapp_enabled: boolean
  whatsapp_reminder_enabled: boolean
  whatsapp_reminder_message: string | null
  whatsapp_birthday_enabled: boolean
  whatsapp_birthday_message: string | null
  plan: 'trial' | 'active' | 'suspended' | 'cancelled' | null
  subscription_status: string | null
  trial_ends_at: string | null
  stripe_customer_id: string | null
  is_admin: boolean | null
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
  status: 'acompanhamento' | 'avaliacao' | 'alta'
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
  location: string | null
  visitor_name: string | null
  recurrence: 'none' | 'weekly' | 'biweekly' | 'monthly'
  recurrence_end_date: string | null
  recurrence_parent_id: string | null
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

export interface Contract {
  id: string
  psychologist_id: string
  patient_id: string
  title: string
  content: string
  signature_token: string
  signed_at: string | null
  signed_name: string | null
  signed_cpf: string | null
  signed_ip: string | null
  content_hash: string | null
  signed_user_agent: string | null
  created_at: string
}

export interface Laudo {
  id: string
  psychologist_id: string
  patient_id: string
  avaliacao_tipo: string | null
  data_inicio: string | null
  data_fim: string | null
  objetivo: string | null
  historico_queixa: string | null
  historico_desenvolvimento: string | null
  historico_escolar: string | null
  historico_familiar: string | null
  historico_medico: string | null
  comportamento_observado: string | null
  testes_aplicados: string | null
  resultados: string | null
  hipotese_diagnostica: string | null
  conclusao: string | null
  recomendacoes: string | null
  created_at: string
  updated_at: string
}
