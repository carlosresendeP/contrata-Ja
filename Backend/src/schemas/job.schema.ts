import { JobStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export const createJobSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "A descrição deve ser mais detalhada"),
  requisitos: z.string().optional(),
  salario: z.coerce.number().optional(),
  status: z.enum(JobStatus).default("ABERTA"),
});

export type CreateJobDTO = z.infer<typeof createJobSchema>;