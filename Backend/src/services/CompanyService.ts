import { prisma } from "@/config/prisma";
import { AppError } from "@/config/error";
import { UpdateCompanyDTO } from "../schemas/company.schema";

export class CompanyService {
  async getById(id: string) {
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) throw new AppError("Empresa não encontrada", 404);
    return company;
  }

  async update(id: string, data: UpdateCompanyDTO) {
    // O Prisma agora reconhece os tipos automaticamente através do DTO
    return await prisma.company.update({
      where: { id },
      data: {
        nome: data.nome,
        razaoSocial: data.razaoSocial,
        cnpj: data.cnpj,
        contextoEmpresa: data.contextoEmpresa,
        perfilRitmo: data.perfilRitmo,
        valores: data.valores,
        logoUrl: data.logoUrl,
      },
    });
  }

  async updateStep(id: string, step: number) {
    return await prisma.company.update({
      where: { id },
      data: { onboardingStep: step },
    });
  }
}