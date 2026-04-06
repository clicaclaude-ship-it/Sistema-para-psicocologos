import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export const cadastroSchema = z
  .object({
    full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    crp: z.string().optional(),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'As senhas não conferem',
    path: ['confirm_password'],
  })

export const recuperarSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type CadastroFormData = z.infer<typeof cadastroSchema>
export type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaSchema>
