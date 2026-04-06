import { z } from 'zod'

export const patientSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  birth_date: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  guardian_name: z.string().optional().nullable(),
  main_complaint: z.string().optional().nullable(),
  brief_history: z.string().optional().nullable(),
  lgpd_consent: z.boolean().refine((val) => val === true, {
    message: 'É necessário declarar o consentimento do paciente conforme a LGPD',
  }),
})

export const clinicalNoteSchema = z.object({
  session_date: z.string().min(1, 'Data da sessão é obrigatória'),
  complaint: z.string().optional().nullable(),
  intervention: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  plan: z.string().optional().nullable(),
})

export const neuroEvalSchema = z.object({
  test_name: z.string().min(1, 'Nome do teste é obrigatório'),
  applied_at: z.string().min(1, 'Data de aplicação é obrigatória'),
  results: z.string().optional().nullable(),
  interpretation: z.string().optional().nullable(),
})

export const profileSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  crp: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  clinic_name: z.string().optional().nullable(),
})

export type PatientFormData = z.infer<typeof patientSchema>
export type ClinicalNoteFormData = z.infer<typeof clinicalNoteSchema>
export type NeuroEvalFormData = z.infer<typeof neuroEvalSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
