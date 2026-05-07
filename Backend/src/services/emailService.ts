import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendTestLinkParams {
  to: string;
  candidateName: string;
  jobTitle: string;
  testUrl: string;
  expiresAt: string;
}

export const emailService = {
  async sendTestLink({ to, candidateName, jobTitle, testUrl, expiresAt }: SendTestLinkParams) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: [to],
      subject: `Você foi convidado para um teste — ${jobTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Olá, ${candidateName}!</h2>
          <p>Você foi selecionado para realizar um teste psicométrico referente à vaga <strong>${jobTitle}</strong>.</p>
          <p>Clique no botão abaixo para acessar o teste:</p>
          <a href="${testUrl}" style="
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 16px 0;
          ">
            Acessar Teste
          </a>
          <p style="color: #6B7280; font-size: 14px;">
            Este link expira em <strong>${expiresAt}</strong>.<br/>
            Se você não se candidatou a esta vaga, ignore este e-mail.
          </p>
        </div>
      `,
    });

  },
};
