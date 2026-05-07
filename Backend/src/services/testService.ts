import { prisma } from '@/config/prisma';
import { v4 as uuidv4 } from 'uuid';
import { formatBR } from '@/config/dayjs';
import { AppError } from '@/config/error';
import { env } from '@/config/env';
import { calculateDisc } from '../logic/disc';
import { calculateEneagrama } from '../logic/eneagrama';
import { calculatePersonalities } from '../logic/personalities';
import { SubmitTestDTO } from '../schemas/testLink.schema';

export class TestService {

  //essa rota vai ser chamada no applicationController
  async createLink(applicationId: string) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    const testLink = await prisma.testLink.create({
      data: { token, applicationId, expiresAt },
    });

    return {
      url: `${env.APP_URL}/public/tests/${token}`,
      expiresAt: formatBR(testLink.expiresAt),
    };
  }

  //essa rota vai ser chamada no publicTestController
  async validateToken(token: string) {
    const link = await prisma.testLink.findUnique({
      where: { token },
      include: {
        application: {
          include: { candidate: true },
        },
      },
    });

    if (!link) throw new AppError('Link inválido.', 404);
    if (new Date() > link.expiresAt) throw new AppError('Este link de teste já expirou.', 410);

    return link;
  }

  async submitAnswers(token: string, data: SubmitTestDTO) {
    const link = await this.validateToken(token);

    const testResults = {
      disc: data.disc ? calculateDisc(data.disc) : null,
      eneagrama: data.eneagrama ? calculateEneagrama(data.eneagrama) : null,
      personalities: data.personalities ? calculatePersonalities(data.personalities) : null,
    };

    // Salva os resultados no Candidate (campo correto no schema)
    await prisma.candidate.update({
      where: { id: link.application.candidateId },
      data: {
        respostasJson: JSON.parse(JSON.stringify(testResults)),
        testCompletedAt: new Date(),
      },
    });

    // Avança o status da candidatura no funil
    await prisma.application.update({
      where: { id: link.applicationId },
      data: { status: 'TESTE_PSICOMETRICO' },
    });

    // Invalida o token após uso
    await prisma.testLink.delete({ where: { id: link.id } });

    return { ok: true, results: testResults };
  }
}
