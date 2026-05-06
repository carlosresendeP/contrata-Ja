import { z } from "zod"

export const registerSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  razaoSocial: z.string().min(2, "A razão social é obrigatória"),
  cnpj: z.string().min(14, "CNPJ inválido"),
})

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha é obrigatória min 6 caracteres"),
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>