import { FastifyRequest, FastifyReply } from "fastify";
import { CompanyService } from "../services/CompanyService";
import { UpdateCompanyDTO } from "../schemas/company.schema";
import { AppError } from "@/config/error";

export class CompanyController {
  private companyService = new CompanyService();

  get = async (req: FastifyRequest, reply: FastifyReply) => {
    const data = await this.companyService.getById(req.user.companyId);
    return reply.send({ ok: true, data });
  };

  //update
  update = async (
    req: FastifyRequest<{ Body: UpdateCompanyDTO }>, 
    reply: FastifyReply
  ) => {
    const data = await this.companyService.update(req.user.companyId, req.body);
    
    return reply.send({ ok: true, data });
  };

  updateStep = async (
    req: FastifyRequest<{ Params: { step: string } }>, 
    reply: FastifyReply
  ) => {
    const step = Number(req.params.step);
    
    if (isNaN(step)) {
      throw new AppError("O passo do onboarding deve ser um número", 400);
    }

    const data = await this.companyService.updateStep(
      req.user.companyId, 
      step
    );
    
    return reply.send({ ok: true, data });
  };
}