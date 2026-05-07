import { z } from "zod";

// Parâmetros de URL (Token)
export const testTokenParamsSchema = z.object({
  token: z.string().uuid("Token inválido"),
});

// Schema para as respostas enviadas pelo candidato
export const submitTestSchema = z.object({
  disc: z.record(z.string(), z.enum(["D", "I", "S", "C"])).optional(),
  eneagrama: z.record(z.string(), z.number().int().min(1).max(9)).optional(),
  personalities: z.record(z.string(), z.enum(["E", "I", "S", "N", "T", "F", "J", "P"])).optional(),
});

// Tipos inferidos automaticamente dos schemas
export type TestTokenParams = z.infer<typeof testTokenParamsSchema>;
export type SubmitTestDTO = z.infer<typeof submitTestSchema>;