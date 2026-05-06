import { FastifyInstance } from "fastify";
import { CompanyController } from "../controllers/CompanyController";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validateSchema } from "@/middleware/validade.schema";
import { UpdateCompanyDTO, updateCompanySchema } from "../schemas/company.schema";

export async function companyRoutes(app: FastifyInstance) {
  const controller = new CompanyController();

  // Protege todas as rotas deste arquivo 🔒
  app.addHook("preHandler", authMiddleware);

  // Rotas do Item 3 do seu plano
  app.get("/", controller.get); 
  
  app.patch<{ Body: UpdateCompanyDTO }>(
    "/",
    { preHandler: [validateSchema(updateCompanySchema)] },
    controller.update
  );

  app.patch("/onboarding/:step", controller.updateStep);
}