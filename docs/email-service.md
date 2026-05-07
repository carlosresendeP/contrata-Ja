# Email Service — Envio de Link de Teste

## O que faz

Quando o RH gera um link de teste para um candidato (`POST /api/applications/:id/test-link`),
o sistema envia automaticamente um email para o candidato com o link e a data de expiração.

## Fluxo completo

```
RH chama POST /applications/:id/test-link
        ↓
TestService.createLink(applicationId)
  - busca Application (com Candidate + Job)
  - gera token UUID
  - salva TestLink no banco (expira em 2 dias)
  - chama emailService.sendTestLink(...)
        ↓
emailService envia via Resend
  - para: candidate.email
  - assunto: "Você foi convidado para um teste — {jobTitle}"
  - corpo: HTML com botão de acesso ao link
        ↓
Candidato acessa GET /public/tests/:token
Candidato responde POST /public/tests/:token/submit
```

## Arquivos envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/services/emailService.ts` | Conecta com Resend e monta o HTML do email |
| `src/services/testService.ts` | Chama emailService.sendTestLink dentro de createLink |
| `src/config/env.ts` | Valida RESEND_API_KEY e EMAIL_FROM |

## Variáveis de ambiente necessárias

Adicione no `.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
```

- **RESEND_API_KEY**: gerada em https://resend.com → API Keys
- **EMAIL_FROM**: precisa ser um domínio verificado no Resend. Em desenvolvimento pode usar `onboarding@resend.dev` (domínio de teste do Resend, só envia para o email cadastrado na conta).

## Como obter a RESEND_API_KEY

1. Acesse https://resend.com e crie uma conta gratuita
2. Vá em **API Keys** → **Create API Key**
3. Copie a chave e adicione no `.env`
4. Para produção: adicione e verifique seu domínio em **Domains**

## Plano gratuito Resend

- 3.000 emails/mês
- 100 emails/dia
- Suficiente para MVP e validação inicial
