import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../config/error";

declare module "fastify" {
  interface FastifyRequest {
    user: { userId: string; companyId: string; role: string };
  }
}

// Interface para tipar o que tem dentro do token
interface JwtPayload {
  sub: string;
  companyId: string;
  role: string;
}

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Token de autenticação não fornecido", 401);
  }

  // Pega apenas a hash do token, tirando a palavra "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Verifica a assinatura do token de forma síncrona/padrão do jsonwebtoken
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Injeta os dados decodificados na requisição para o Controller poder usar
    req.user = {
      userId: decoded.sub,
      companyId: decoded.companyId,
      role: decoded.role,
    };
  } catch (error) {
    throw new AppError("Token inválido ou expirado", 401);
  }
}