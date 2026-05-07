import { FastifyInstance } from "fastify";
import { PublicTestController } from "../controllers/publicTestController";
import { validateSchema } from "@/middleware/validade.schema";
import { 
  submitTestSchema, 
  testTokenParamsSchema,
  SubmitTestDTO,
  TestTokenParams
} from "../schemas/testLink.schema";

export async function publicTestRoutes(app: FastifyInstance) {
  const controller = new PublicTestController();

  // GET /public/tests/:token - Carrega as perguntas e dados do candidato
  app.get<{ Params: TestTokenParams }>(
    "/:token",
    { preHandler: [validateSchema(testTokenParamsSchema, "params")] },
    controller.getTest
  );

  // POST /public/tests/:token/submit - Envia as respostas para cálculo
  app.post<{ Params: TestTokenParams; Body: SubmitTestDTO }>(
    "/:token/submit",
    { 
      preHandler: [
        validateSchema(testTokenParamsSchema, "params"),
        validateSchema(submitTestSchema, "body")
      ] 
    },
    controller.submit
  );
}