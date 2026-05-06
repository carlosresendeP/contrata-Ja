import type { FastifyInstance } from "fastify";
import { ApplicationController } from "../controllers/ApplicationController";
import { applyJobSchema } from "../schemas/application.schema";

import type { ApplyJobDTO } from "../schemas/application.schema";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validateSchema } from "@/middleware/validade.schema";
import { ApplicationStatus } from "@/generated/prisma/enums";

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

// 3. Listar candidatos de uma vaga específica
  // Adicionamos <{ Params: { jobId: string } }> para casar com o Controller
  app.get<{ Params: { jobId: string } }>(
    "/job/:jobId", 
    applicationController.listByJob
  );

  // 4. Mudar status do candidato (Funil)
  // Tipamos o Params e o Body para aceitar apenas o Enum ApplicationStatus
  app.patch<{ 
    Params: { id: string }, 
    Body: { status: ApplicationStatus } 
  }>(
    "/:id/status",
    applicationController.updateStatus
  );

}