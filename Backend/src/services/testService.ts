import { prisma } from '@/config/prisma';
import { v4 as uuidv4 } from 'uuid';
import { formatBR } from '@/config/dayjs';
import { AppError } from '@/config/error';
import { env } from '@/config/env';
import { calculateDisc } from '../logic/disc';
import { calculateEneagrama } from '../logic/eneagrama';
import { calculatePersonalities } from '../logic/personalities';
import { SubmitTestDTO } from '../schemas/testLink.schema';
import { emailService } from './emailService';

export class TestService {

  //essa rota vai ser chamada no applicationController
  async createLink(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!application) throw new AppError('Candidatura não encontrada', 404);

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); // 2 dias

    const testLink = await prisma.testLink.create({
      data: { token, applicationId, expiresAt },
    });

    const url = `${env.APP_URL}/public/tests/${token}`;
    const expiresAtFormatted = formatBR(testLink.expiresAt);

    await emailService.sendTestLink({
      to: 'carlosale.paula2001@gmail.com',  //-> application.candidate.email
      candidateName: application.candidate.nome,
      jobTitle: application.job.titulo,
      testUrl: url,
      expiresAt: expiresAtFormatted,
    });

    return { url, expiresAt: expiresAtFormatted };
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
