import { z } from "zod";

export const applyJobSchema = z.object({
  jobId: z.string().uuid("ID da vaga inválido"),
  nome: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(11, "Telefone inválido").optional(),
  curriculoUrl: z.string().url("URL do currículo inválida").optional(),
});

export type ApplyJobDTO = z.infer<typeof applyJobSchema>;