import { prisma } from "@/config/prisma"
import { AppError } from "@/config/error"

export class PublicJobService {
  async getJobByPublicToken(publicToken: string) {
    const job = await prisma.job.findUnique({
      where: { publicToken },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        jdGerada: true,
        requisitos: true,
        salaryMin: true,
        salaryMax: true,
        status: true,
        company: {
          select: {
            nome: true,
            razaoSocial: true,
            logoUrl: true,
          },
        },
      },
    })

    if (!job) throw new AppError("Vaga não encontrada ou link inválido.", 404)
    if (job.status === "FECHADA") {
      throw new AppError("Esta vaga foi encerrada e não está mais aceitando candidaturas.", 410)
    }

    return job
  }
}