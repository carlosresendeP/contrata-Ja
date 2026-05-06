import { prisma } from "@/config/prisma"; 
import { AppError } from "@/config/error";
import { ApplyJobDTO } from "../schemas/application.schema";

export class ApplicationService {
  async apply(data: ApplyJobDTO) {
    // 1. Verificar se a vaga existe e pegar o companyId dela
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      select: { id: true, companyId: true, status: true }
    });

    if (!job) {
      throw new AppError("A vaga informada não existe.", 404);
    }

    if (job.status !== "ABERTA") {
      throw new AppError("Esta vaga não está mais aceitando inscrições.", 400);
    }

    // 2. Buscar ou Criar o candidato (Upsert manual para controle total)
    let candidate = await prisma.candidate.findUnique({
      where: { email: data.email }
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          curriculoUrl: data.curriculoUrl
        }
      });
    }

    // 3. Verificar se o candidato já está inscrito NESTA vaga
    const alreadyApplied = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        candidateId: candidate.id
      }
    });

    if (alreadyApplied) {
      throw new AppError("Você já se candidatou para esta vaga.", 409);
    }

    // 4. Criar a inscrição vinculando empresa, vaga e candidato
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        companyId: job.companyId, // Multi-tenancy garantido
      },
      include: {
        candidate: true,
        job: { select: { titulo: true } }
      }
    });

    return application;
  }

  //listar as aplicações de uma empresa
  async listByCompany(companyId: string) {
  // O Prisma já sabe buscar as relações graças ao que configuramos no schema
  const applications = await prisma.application.findMany({
    where: { companyId },
    include: {
      candidate: true, // Traz os dados do candidato (nome, email, etc)
      job: { 
        select: { titulo: true } // Traz apenas o título da vaga para não sobrecarregar o JSON
      }
    },
    orderBy: { createdAt: 'desc' } // Os mais recentes primeiro
  });

  return applications;
}
}