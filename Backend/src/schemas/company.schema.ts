import { z } from "zod";

export const updateCompanySchema = z.object({
  nome: z.string().min(3).optional(),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  contextoEmpresa: z.string().optional(),
  perfilRitmo: z.string().optional(),
  valores: z.array(z.string()).optional(),
  logoUrl: z.string().url().optional(),
});

// Este tipo substitui o 'any' no Service e no Controller
export type UpdateCompanyDTO = z.infer<typeof updateCompanySchema>;