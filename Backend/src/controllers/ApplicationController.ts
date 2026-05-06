import type { FastifyRequest, FastifyReply } from "fastify";
import { ApplicationService } from "../services/ApplicationService";
import type { ApplyJobDTO } from "../schemas/application.schema";

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  apply = async (
    req: FastifyRequest<{ Body: ApplyJobDTO }>, 
    reply: FastifyReply
  ) => {
    const result = await this.applicationService.apply(req.body);
    return reply.status(201).send({ ok: true, data: result });
  };

  //listar as aplicações de uma empresa
  listByCompany = async (req: FastifyRequest, reply: FastifyReply) => {
  // Pegamos o ID da empresa direto do token decodificado pelo middleware
  const { companyId } = req.user; 

  const applications = await this.applicationService.listByCompany(companyId);

  return reply.send({ 
    ok: true, 
    data: applications 
  });
};
}