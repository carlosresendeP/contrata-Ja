import { FastifyReply, FastifyRequest } from 'fastify';
import { TestService } from '../services/testService';
import { SubmitTestDTO, TestTokenParams } from '../schemas/testLink.schema';

import discQuestions from '../data/disc_questions.json';
import eneagramaQuestions from '../data/eneagrama_questions.json';
import personalityQuestions from '../data/personality_questions.json';

export class PublicTestController {
  private service = new TestService();

  getTest = async (req: FastifyRequest<{ Params: TestTokenParams }>, reply: FastifyReply) => {
    const link = await this.service.validateToken(req.params.token);

    return reply.send({
      ok: true,
      data: {
        candidate: link.application.candidate.nome,
        expiresAt: link.expiresAt,
        questions: {
          disc: discQuestions,
          eneagrama: eneagramaQuestions,
          personalities: personalityQuestions,
        },
      },
    });
  };

  submit = async (req: FastifyRequest<{ Params: TestTokenParams; Body: SubmitTestDTO }>, reply: FastifyReply) => {
    const result = await this.service.submitAnswers(req.params.token, req.body);
    return reply.send(result);
  };

  
}
