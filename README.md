# MakerStack SaaS RH — Backend

API REST para plataforma SaaS de RH com motor de testes psicométricos, match de candidatos com IA e chat assistente.

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify 5
- **ORM:** Prisma 7 + PostgreSQL
- **IA:** OpenAI GPT-4o-mini via Vercel AI SDK
- **Email:** Resend
- **Validação:** Zod

---

## Funcionalidades

- Autenticação JWT com multi-tenancy por empresa
- Onboarding de empresa em etapas
- Gestão de vagas e candidaturas com funil de status
- Organograma da empresa
- Motor de testes psicométricos: DISC, Eneagrama e 16 Personalidades
- Portal público para candidatos responderem o teste via link tokenizado
- Geração de Job Description com IA
- Match ranqueado candidato × vaga com score e justificativa
- Chat assistente de RH com streaming SSE
- Envio automático de email ao candidato com link de teste

---

## Configuração

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão: 3001) |
| `NODE_ENV` | `dev`, `test` ou `prod` |
| `DATABASE_URL` | Connection string do PostgreSQL |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT (mín. 10 chars) |
| `APP_URL` | URL base da API — usada para gerar links de teste |
| `OPENAI_API_KEY` | Chave da OpenAI (geração de JD e match) |
| `RESEND_API_KEY` | Chave do Resend (envio de emails) |
| `EMAIL_FROM` | Remetente dos emails (ex: `onboarding@resend.dev` para testes) |

### 3. Banco de dados

```bash
pnpm dlx prisma migrate dev
pnpm dlx prisma generate
```

### 4. Rodar em desenvolvimento

```bash
pnpm dev
```

---

## Build e produção

```bash
pnpm build
pnpm start
```

---

## Rotas disponíveis

Veja o arquivo [docs/routes.md](docs/routes.md) para a referência completa de todas as rotas com exemplos de body.

---

## Módulos

| Módulo | Prefixo | Descrição |
|---|---|---|
| Auth | `/api` | Registro, login e dados do usuário |
| Company | `/api/company` | Perfil e onboarding da empresa |
| Jobs | `/api/jobs` | CRUD de vagas |
| Applications | `/api/applications` | Candidaturas e funil de status |
| Organograma | `/api/organograma` | Estrutura hierárquica da empresa |
| Testes (público) | `/api/public/tests` | Portal do candidato sem autenticação |
| IA | `/api/ai` | Geração de JD e match com IA |
| Chat | `/api/chat` | Chat assistente com streaming SSE |

---

## Deploy (Render)

1. Crie um novo **Web Service** apontando para este repositório
2. Configure as variáveis de ambiente no painel do Render
3. Defina os comandos:
   - **Build:** `pnpm install && pnpm build`
   - **Start:** `pnpm start`
4. Adicione um banco PostgreSQL (Render ou Supabase) e configure `DATABASE_URL`
