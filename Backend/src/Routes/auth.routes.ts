import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/AuthController";
import { registerSchema, loginSchema, type RegisterDTO, type LoginDTO } from "../schemas/auth.schema";
import { validateSchema } from "@/middleware/validade.schema";

export async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController();

  // ROTA DE REGISTRO
  app.post<{ Body: RegisterDTO }>(
    "/register",
    {
      preHandler: [validateSchema(registerSchema)],
    },
    authController.register
  );

  // ROTA DE LOGIN
  app.post<{ Body: LoginDTO }>(
    "/login",
    {
      preHandler: [validateSchema(loginSchema)],
    },
    authController.login
  );
}