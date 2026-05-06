import type { FastifyRequest, FastifyReply } from "fastify";
import { JobService } from "../services/JobService";
import type { CreateJobDTO, UpdateJobDTO } from "../schemas/job.schema";

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }


  //criar nova vaga
  create = async (
    req: FastifyRequest<{ Body: CreateJobDTO }>, 
    reply: FastifyReply
  ) => {
    // O companyId vem lá do seu authMiddleware!
    const { companyId } = req.user; 

    const job = await this.jobService.create(req.body, companyId);

    return reply.status(201).send({ ok: true, data: job });
  };


  //listar todas as vagas de uma empresa
  list = async (req: FastifyRequest, reply: FastifyReply) => {
    const { companyId } = req.user;
    const jobs = await this.jobService.listByCompany(companyId);
    
    return reply.send({ ok: true, data: jobs });
  };


  //update
  update = async (req: FastifyRequest<{ Params: { id: string }, Body: UpdateJobDTO }>, reply: FastifyReply) => {
  const data = await this.jobService.update(req.params.id, req.user.companyId, req.body);
  return reply.send({ ok: true, data });
};


  //buscar vaga por id
  getById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const data = await this.jobService.getById(req.params.id, req.user.companyId);
  return reply.send({ ok: true, data });
};

}