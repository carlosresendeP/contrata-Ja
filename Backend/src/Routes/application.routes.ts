import type { FastifyInstance } from "fastify";
import { ApplicationController } from "../controllers/ApplicationController";
import { applyJobSchema } from "../schemas/application.schema";

import type { ApplyJobDTO } from "../schemas/application.schema";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validateSchema } from "@/middleware/validade.schema";

export async function applicationRoutes(app: FastifyInstance) {
  const applicationController = new ApplicationController();

  // 1. ROTA PÚBLICA: Candidato se inscrevendo na vaga
  // Não tem authMiddleware porque o candidato não está logado.
  app.post<{ Body: ApplyJobDTO }>(
    "/apply",
    {
      preHandler: [validateSchema(applyJobSchema)],
    },
    applicationController.apply
  );

  // 2. ROTA PROTEGIDA: Empresa listando seus candidatos
  // Aqui usamos o authMiddleware para pegar o companyId do token 
  app.get(
    "/company",
    {
      preHandler: [authMiddleware],
    },
    applicationController.listByCompany
  );
}