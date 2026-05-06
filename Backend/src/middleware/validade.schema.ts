import { FastifyReply, FastifyRequest } from "fastify";
import { ZodSchema } from "zod";

export const validateSchema = (schema: ZodSchema) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    // 1. Executa o parse do Zod nos dados que chegaram no body
    const result = schema.safeParse(req.body);

    // 2. Se a validação falhar, para a requisição aqui mesmo e retorna 400
    if (!result.success) {
      return reply.status(400).send({
        ok: false,
        message: "Dados inválidos",
        errors: result.error.format(),
      });
    }

    // 3. Se passar, sobrescreve o req.body com os dados limpos/formatados pelo Zod
    req.body = result.data;
    
    // No Fastify, ao usar funções async no preHandler, 
    // basta não retornar erro para ele seguir adiante.
  };
};