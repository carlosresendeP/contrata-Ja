import type { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "@/services/authService";
import type { LoginDTO, RegisterDTO } from "../schemas/auth.schema";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  //register
  register = async (
    req: FastifyRequest<{ Body: RegisterDTO }>, 
    reply: FastifyReply
  ) => {
    // req.body já chega validado perfeitamente pelo Zod
    const { user, company } = await this.authService.register(req.body);

    return reply.status(201).send({
      ok: true,
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
        },
        company: {
          id: company.id,
          razaoSocial: company.razaoSocial,
        },
      },
    });
  };
  //login
  login = async (req: FastifyRequest<{ Body: LoginDTO }>, reply: FastifyReply) => {
    const result = await this.authService.login(req.body);

    return reply.status(200).send({
      ok: true,
      data: {
        user: result.user,
        company: result.company,
      },
      token: result.token,
    });
  };

//Get Current User
  me = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = await this.authService.getMe(req.user.userId);

  return reply.send({ ok: true, data: user });
};  
}