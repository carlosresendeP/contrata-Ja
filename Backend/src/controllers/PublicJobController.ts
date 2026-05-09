import type { FastifyRequest, FastifyReply } from "fastify"
import { PublicJobService } from "@/services/PublicJobService"

const publicJobService = new PublicJobService()

export class PublicJobController {
  async getJob(req: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) {
    const { publicToken } = req.params
    const job = await publicJobService.getJobByPublicToken(publicToken)
    
    return reply.send({ ok: true, data: job })
  }
}