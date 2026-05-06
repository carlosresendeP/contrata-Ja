# PLANNING — BACKEND (API Separada)
## SaaS RH · Hackathon MakerStack #01

**Stack:** Node.js · Fastify · TypeScript strict · Prisma · PostgreSQL (Supabase) · JWT ( jsonwebtoken) · Zod · Anthropic Claude SDK · Resend · @supabase/supabase-js

**Repo:** `saas-rh-api` (separado do frontend)
**Deploy:** Railway ou Render (free tier)
**Porta local:** `3001`

---

## 1. Princípios

1. **Multi-tenancy obrigatória.** Todo handler extrai `companyId` do JWT. Toda query filtra por ele. Sem exceção.
2. **Services isolam o Prisma.** Nenhum handler chama `prisma.*` direto. Sempre via `src/services/*`.
3. **Validação na borda com Zod.** Body, params e query passam por schema antes de qualquer lógica. Usar `fastify-type-provider-zod` pra integração nativa.
4. **Erros não vazam stack trace.** Handler lança `AppError`, plugin de erro formata a resposta.
5. **Respostas padronizadas.** Toda rota retorna `{ ok: true, data: T }` ou `{ ok: false, error: string }`.
6. **IA síncrona no MVP.** Análise de match roda direto no handler com `reply.raw` pra streaming quando necessário. Sem fila.
7. **Rotas públicas explícitas.** Prefixo `/public/*` nunca tem `authenticate` hook. Tudo fora disso exige Bearer token.

---

## 2. Estrutura de Pastas

```
saas-rh-api/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── server.ts                      → cria e exporta a instância Fastify
│   ├── main.ts                        → inicia o servidor
│   │
│   ├── config/
│   │   └── env.ts                     → variáveis de ambiente validadas com Zod
│   │
│   ├── lib/
│   │   ├── prisma.ts                  → singleton PrismaClient
│   │   ├── supabase.ts                → client Supabase Admin (Storage)
│   │   ├── jwt.ts                     → sign/verify com jsonwebtoken
│   │   └── app-error.ts               → classe AppError
│   │
│   ├── ai/
│   │   ├── claude.ts                  → cliente Anthropic + generateJson()
│   │   ├── prompts/
│   │   │   ├── match.ts
│   │   │   ├── jd.ts
│   │   │   └── chat.ts
│   │   └── schemas/
│   │       ├── match.schema.ts        → Zod schema do output IA
│   │       └── jd.schema.ts
│   │
│   ├── tests-engine/                  → motor dos testes psicométricos
│   │   ├── types.ts
│   │   ├── disc.ts
│   │   ├── eneagrama.ts
│   │   ├── personalities.ts
│   │   └── data/
│   │       ├── disc-questions.json
│   │       ├── eneagrama-questions.json
│   │       └── ipip-questions.json
│   │
│   ├── email/
│   │   ├── resend.ts
│   │   └── templates/
│   │       ├── test-link.ts
│   │       ├── test-completed.ts
│   │       └── candidate-result.ts
│   │
│   ├── services/
│   │   ├── company.service.ts
│   │   ├── organograma.service.ts
│   │   ├── job.service.ts
│   │   ├── candidate.service.ts
│   │   ├── test.service.ts
│   │   ├── match.service.ts
│   │   ├── chat.service.ts
│   │   └── upload.service.ts
│   │
│   ├── plugins/
│   │   ├── cors.ts                    → @fastify/cors
│   │   ├── multipart.ts               → @fastify/multipart (upload)
│   │   ├── jwt-auth.ts                → hook authenticate
│   │   └── error-handler.ts           → formata erros globalmente
│   │
│   └── routes/
│       ├── index.ts                   → registra todos os plugins/rotas
│       │
│       ├── auth/
│       │   └── auth.routes.ts         → POST /auth/signup, /auth/login, /auth/refresh
│       │
│       ├── company/
│       │   └── company.routes.ts      → GET/PATCH /company, PATCH /company/onboarding/:step
│       │
│       ├── organograma/
│       │   └── organograma.routes.ts  → CRUD /organograma
│       │
│       ├── jobs/
│       │   └── job.routes.ts          → CRUD /jobs, POST /jobs/:id/generate-jd, POST /jobs/:id/match
│       │
│       ├── candidates/
│       │   └── candidate.routes.ts    → CRUD /candidates
│       │
│       ├── chat/
│       │   └── chat.routes.ts         → POST /chat (stream)
│       │
│       ├── upload/
│       │   └── upload.routes.ts       → POST /upload
│       │
│       └── public/                    → sem autenticação
│           ├── test-link.routes.ts    → GET /public/tests/:token
│           └── test-submit.routes.ts  → POST /public/tests/:token/submit
│
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 3. Setup — Comandos na Ordem

```bash
# 1. Criar projeto
mkdir saas-rh-api && cd saas-rh-api
pnpm init -y

# 2. TypeScript
pnpm add -D typescript @types/node tsx tsup
npx tsc --init

# 3. Fastify e plugins
pnpm add fastify
pnpm add @fastify/cors @fastify/multipart @fastify/helmet
pnpm add fastify-type-provider-zod        # integra Zod com tipos nativos do Fastify

# 4. Banco
pnpm add prisma @prisma/client
pnpm dlx prisma init

# 5. Auth
pnpm add jose                             # JWT moderno, sem dependências
pnpm add bcryptjs
pnpm add -D @types/bcryptjs

# 6. Validação
pnpm add zod

# 7. IA + Email + Storage
pnpm add @anthropic-ai/sdk
pnpm add resend
pnpm add @supabase/supabase-js

# 8. Utils
pnpm add nanoid
pnpm add dotenv

# 9. Dev
pnpm add -D @types/node

# 10. Scripts no package.json
```

### `package.json` (scripts)

```json
{
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsup src/main.ts --format cjs --out-dir dist",
    "start": "node dist/main.js",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "prisma"],
  "exclude": ["node_modules", "dist"]
}
```

### `.env`

```env
# Supabase
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."

# JWT
JWT_SECRET="gera-com-openssl-rand-base64-64"
JWT_EXPIRES_IN="7d"

# App
PORT=3333
FRONTEND_URL="http://localhost:3000"   # em prod: URL do Vercel

# IA + Email
ANTHROPIC_API_KEY="sk-ant-..."
RESEND_API_KEY="re_..."
```

---

## 4. Configuração — Arquivos Base

### `src/config/env.ts`

```ts
import { z } from "zod"
import "dotenv/config"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3333),
  FRONTEND_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:")
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
```

### `src/lib/app-error.ts`

```ts
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly code?: string,
  ) {
    super(message)
    this.name = "AppError"
  }
}
```

### `src/lib/prisma.ts`

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### `src/lib/jwt.ts`

```ts
import { SignJWT, jwtVerify } from "jose"
import { env } from "@/config/env"

const secret = new TextEncoder().encode(env.JWT_SECRET)

export interface JwtPayload {
  sub: string        // userId
  companyId: string
  role: string
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JwtPayload
}
```

### `src/lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js"
import { env } from "@/config/env"

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)
```

---

## 5. Servidor Fastify

### `src/server.ts`

```ts
import Fastify from "fastify"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty" }
          : undefined,
    },
  })

  // Zod como provider de validação e serialização
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  return app
}
```

### `src/main.ts`

```ts
import { buildApp } from "./server"
import { registerRoutes } from "./routes"
import { env } from "./config/env"

async function main() {
  const app = buildApp()

  await registerRoutes(app)

  await app.listen({ port: env.PORT, host: "0.0.0.0" })
  console.log(`API rodando em http://localhost:${env.PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

### `src/routes/index.ts`

```ts
import type { FastifyInstance } from "fastify"
import { corsPlugin } from "@/plugins/cors"
import { errorHandlerPlugin } from "@/plugins/error-handler"
import { jwtAuthPlugin } from "@/plugins/jwt-auth"
import { multipartPlugin } from "@/plugins/multipart"

import { authRoutes } from "./auth/auth.routes"
import { companyRoutes } from "./company/company.routes"
import { organogramaRoutes } from "./organograma/organograma.routes"
import { jobRoutes } from "./jobs/job.routes"
import { candidateRoutes } from "./candidates/candidate.routes"
import { chatRoutes } from "./chat/chat.routes"
import { uploadRoutes } from "./upload/upload.routes"
import { testLinkPublicRoutes } from "./public/test-link.routes"
import { testSubmitPublicRoutes } from "./public/test-submit.routes"

export async function registerRoutes(app: FastifyInstance) {
  // plugins globais
  await app.register(corsPlugin)
  await app.register(errorHandlerPlugin)
  await app.register(jwtAuthPlugin)
  await app.register(multipartPlugin)

  // health check
  app.get("/health", async () => ({ ok: true, timestamp: new Date().toISOString() }))

  // rotas públicas (sem auth)
  await app.register(authRoutes, { prefix: "/auth" })
  await app.register(testLinkPublicRoutes, { prefix: "/public" })
  await app.register(testSubmitPublicRoutes, { prefix: "/public" })

  // rotas protegidas (precisam de Bearer token)
  await app.register(
    async (protectedApp) => {
      protectedApp.addHook("onRequest", app.authenticate)
      await protectedApp.register(companyRoutes, { prefix: "/company" })
      await protectedApp.register(organogramaRoutes, { prefix: "/organograma" })
      await protectedApp.register(jobRoutes, { prefix: "/jobs" })
      await protectedApp.register(candidateRoutes, { prefix: "/candidates" })
      await protectedApp.register(chatRoutes, { prefix: "/chat" })
      await protectedApp.register(uploadRoutes, { prefix: "/upload" })
    },
  )
}
```

---

## 6. Plugins

### `src/plugins/cors.ts`

```ts
import fp from "fastify-plugin"
import cors from "@fastify/cors"
import { env } from "@/config/env"

export const corsPlugin = fp(async (app) => {
  app.register(cors, {
    origin: [env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
})
```

> Instalar `fastify-plugin`: `npm i fastify-plugin`

### `src/plugins/jwt-auth.ts`

```ts
import fp from "fastify-plugin"
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { verifyToken } from "@/lib/jwt"
import { AppError } from "@/lib/app-error"

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    user: { userId: string; companyId: string; role: string }
  }
}

export const jwtAuthPlugin = fp(async (app: FastifyInstance) => {
  app.decorate(
    "authenticate",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError("Token não fornecido", 401, "UNAUTHORIZED")
      }
      const token = authHeader.slice(7)
      try {
        const payload = await verifyToken(token)
        req.user = {
          userId: payload.sub,
          companyId: payload.companyId,
          role: payload.role,
        }
      } catch {
        throw new AppError("Token inválido ou expirado", 401, "INVALID_TOKEN")
      }
    },
  )
})
```

### `src/plugins/error-handler.ts`

```ts
import fp from "fastify-plugin"
import type { FastifyInstance } from "fastify"
import { AppError } from "@/lib/app-error"
import { ZodError } from "zod"

export const errorHandlerPlugin = fp(async (app: FastifyInstance) => {
  app.setErrorHandler((error, req, reply) => {
    // AppError — erro de negócio controlado
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        ok: false,
        error: error.message,
        code: error.code,
      })
    }

    // Erro de validação Zod (via fastify-type-provider-zod)
    if (error instanceof ZodError) {
      return reply.status(400).send({
        ok: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      })
    }

    // Erro inesperado — loga e não vaza
    req.log.error(error)
    return reply.status(500).send({
      ok: false,
      error: "Erro interno do servidor",
    })
  })
})
```

### `src/plugins/multipart.ts`

```ts
import fp from "fastify-plugin"
import multipart from "@fastify/multipart"

export const multipartPlugin = fp(async (app) => {
  app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  })
})
```

---

## 7. Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Company {
  id              String   @id @default(uuid())
  razaoSocial     String
  cnpj            String   @unique
  enderecoJson    Json?
  logoUrl         String?
  url             String?
  contextoEmpresa String?  @db.Text
  perfilRitmo     String?  // startup | consolidada | reestruturacao | outro
  valores         String[]
  desafios        String?  @db.Text
  estiloLideranca String?
  onboardingStep  Int      @default(1)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  users              User[]
  organograma        OrganogramaNode[]
  jobs               Job[]
  personalityResults PersonalityResult[]
  candidates         Candidate[]
  testLinks          TestLink[]
  chatMessages       ChatMessage[]
}

model User {
  id        String   @id @default(uuid())
  companyId String
  nome      String
  email     String   @unique
  password  String
  role      String   @default("admin")
  createdAt DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([companyId])
}

model OrganogramaNode {
  id           String  @id @default(uuid())
  companyId    String
  nome         String
  cargo        String
  departamento String?
  email        String?
  parentId     String?

  company  Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)
  parent   OrganogramaNode?  @relation("Hierarchy", fields: [parentId], references: [id])
  children OrganogramaNode[] @relation("Hierarchy")

  @@index([companyId])
  @@index([parentId])
}

model PersonalityResult {
  id            String   @id @default(uuid())
  companyId     String
  subjectId     String
  subjectType   String   // employee | candidate
  discJson      Json?
  enneagramJson Json?
  mbtiJson      Json?
  createdAt     DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([companyId, subjectId])
}

model Job {
  id                String   @id @default(uuid())
  companyId         String
  titulo            String
  liderId           String?
  motivo            String?  @db.Text
  responsabilidades String?  @db.Text
  metas             String?  @db.Text
  jdGerada          String?  @db.Text
  perguntasChave    Json?
  salaryMin         Int?
  salaryMax         Int?
  encargosJson      Json?
  perfilIdealJson   Json?
  publicToken       String?  @unique
  status            String   @default("rascunho")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  company      Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  candidates   Candidate[]
  matches      MatchReport[]
  chatMessages ChatMessage[]

  @@index([companyId])
}

model Candidate {
  id              String    @id @default(uuid())
  jobId           String
  companyId       String
  nome            String
  email           String
  linkedinUrl     String?
  cvUrl           String?
  respostasJson   Json?
  entrevistaTexto String?   @db.Text
  testCompletedAt DateTime?
  createdAt       DateTime  @default(now())

  job     Job           @relation(fields: [jobId], references: [id], onDelete: Cascade)
  company Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  matches MatchReport[]

  @@index([companyId])
  @@index([jobId])
}

model MatchReport {
  id              String   @id @default(uuid())
  jobId           String
  candidateId     String
  rankingPosition Int
  matchScore      Int
  relatorioJson   Json
  createdAt       DateTime @default(now())

  job       Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidate Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@unique([jobId, candidateId])
  @@index([jobId])
}

model TestLink {
  id          String    @id @default(uuid())
  companyId   String
  token       String    @unique
  type        String    // candidate | employee
  candidateId String?
  employeeId  String?
  jobId       String?
  expiresAt   DateTime
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([companyId])
}

model ChatMessage {
  id        String   @id @default(uuid())
  companyId String
  jobId     String?
  role      String   // user | assistant
  content   String   @db.Text
  createdAt DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  job     Job?    @relation(fields: [jobId], references: [id], onDelete: SetNull)

  @@index([companyId, jobId])
}
```

### Comandos Prisma

```bash
npx prisma db push        # syncar schema (dev)
npx prisma generate       # gerar client TS
npx prisma studio         # GUI do banco
npx prisma db seed        # popular com dados demo
```

---

## 8. Pattern de Services

Todos os services recebem `companyId` como **primeiro parâmetro** — garante multi-tenancy.

### Exemplo: `src/services/job.service.ts`

```ts
import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/app-error"
import type { Prisma } from "@prisma/client"

export const jobService = {
  async list(companyId: string) {
    return prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { candidates: true } } },
    })
  },

  async getById(companyId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, companyId },
      include: {
        candidates: true,
        matches: { orderBy: { rankingPosition: "asc" } },
      },
    })
    if (!job) throw new AppError("Vaga não encontrada", 404)
    return job
  },

  async create(companyId: string, data: Omit<Prisma.JobUncheckedCreateInput, "companyId">) {
    return prisma.job.create({ data: { ...data, companyId } })
  },

  async update(companyId: string, jobId: string, data: Prisma.JobUpdateInput) {
    const job = await prisma.job.findFirst({ where: { id: jobId, companyId } })
    if (!job) throw new AppError("Vaga não encontrada", 404)
    return prisma.job.update({ where: { id: jobId }, data })
  },

  async delete(companyId: string, jobId: string) {
    const job = await prisma.job.findFirst({ where: { id: jobId, companyId } })
    if (!job) throw new AppError("Vaga não encontrada", 404)
    return prisma.job.delete({ where: { id: jobId } })
  },
}
```

---

## 9. Pattern de Rotas

Toda rota protegida tem acesso a `req.user` (userId, companyId, role). Zod valida body/params/query nativamente via `fastify-type-provider-zod`.

### Exemplo: `src/routes/jobs/job.routes.ts`

```ts
import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { jobService } from "@/services/job.service"
import { matchService } from "@/services/match.service"

export async function jobRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  // GET /jobs
  typed.get("/", async (req) => {
    const jobs = await jobService.list(req.user.companyId)
    return { ok: true, data: jobs }
  })

  // GET /jobs/:id
  typed.get(
    "/:id",
    { schema: { params: z.object({ id: z.string().uuid() }) } },
    async (req) => {
      const job = await jobService.getById(req.user.companyId, req.params.id)
      return { ok: true, data: job }
    },
  )

  // POST /jobs
  typed.post(
    "/",
    {
      schema: {
        body: z.object({
          titulo: z.string().min(3),
          liderId: z.string().uuid().nullable().optional(),
          motivo: z.string().optional(),
          responsabilidades: z.string().optional(),
          metas: z.string().optional(),
        }),
      },
    },
    async (req, reply) => {
      const job = await jobService.create(req.user.companyId, req.body)
      return reply.status(201).send({ ok: true, data: job })
    },
  )

  // POST /jobs/:id/generate-jd
  typed.post(
    "/:id/generate-jd",
    { schema: { params: z.object({ id: z.string().uuid() }) } },
    async (req) => {
      const { companyId } = req.user
      const jd = await matchService.generateJd(companyId, req.params.id)
      return { ok: true, data: jd }
    },
  )

  // POST /jobs/:id/match
  typed.post(
    "/:id/match",
    { schema: { params: z.object({ id: z.string().uuid() }) } },
    async (req) => {
      const report = await matchService.generate(req.user.companyId, req.params.id)
      return { ok: true, data: report }
    },
  )

  // PATCH /jobs/:id
  typed.patch(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          titulo: z.string().min(3).optional(),
          status: z.enum(["rascunho", "aberta", "fechada"]).optional(),
          jdGerada: z.string().optional(),
          responsabilidades: z.string().optional(),
        }),
      },
    },
    async (req) => {
      const job = await jobService.update(req.user.companyId, req.params.id, req.body)
      return { ok: true, data: job }
    },
  )

  // DELETE /jobs/:id
  typed.delete(
    "/:id",
    { schema: { params: z.object({ id: z.string().uuid() }) } },
    async (req, reply) => {
      await jobService.delete(req.user.companyId, req.params.id)
      return reply.status(204).send()
    },
  )
}
```

---

## 10. Auth Routes

### `src/routes/auth/auth.routes.ts`

```ts
import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signToken } from "@/lib/jwt"
import { AppError } from "@/lib/app-error"

export async function authRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  // POST /auth/signup
  typed.post(
    "/signup",
    {
      schema: {
        body: z.object({
          nome: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
          razaoSocial: z.string().min(2),
          cnpj: z.string().min(14),
        }),
      },
    },
    async (req, reply) => {
      const { nome, email, password, razaoSocial, cnpj } = req.body

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) throw new AppError("E-mail já cadastrado", 409)

      const hashed = await bcrypt.hash(password, 10)

      // Cria empresa + user na mesma transação
      const result = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: { razaoSocial, cnpj },
        })
        const user = await tx.user.create({
          data: { nome, email, password: hashed, companyId: company.id },
        })
        return { company, user }
      })

      const token = await signToken({
        sub: result.user.id,
        companyId: result.company.id,
        role: result.user.role,
      })

      return reply.status(201).send({
        ok: true,
        data: { token, user: { id: result.user.id, nome, email, role: result.user.role } },
      })
    },
  )

  // POST /auth/login
  typed.post(
    "/login",
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }),
      },
    },
    async (req) => {
      const { email, password } = req.body

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) throw new AppError("Credenciais inválidas", 401)

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) throw new AppError("Credenciais inválidas", 401)

      const token = await signToken({
        sub: user.id,
        companyId: user.companyId,
        role: user.role,
      })

      return {
        ok: true,
        data: { token, user: { id: user.id, nome: user.nome, email, role: user.role } },
      }
    },
  )

  // GET /auth/me (rota protegida dentro de /auth pra facilitar)
  typed.get(
    "/me",
    { preHandler: [app.authenticate] },
    async (req) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: req.user.userId },
        select: { id: true, nome: true, email: true, role: true, companyId: true },
      })
      return { ok: true, data: user }
    },
  )
}
```

---

## 11. Rotas Públicas — Portal do Candidato

### `src/routes/public/test-link.routes.ts`

```ts
import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { testService } from "@/services/test.service"
import { discQuestions } from "@/tests-engine/disc"
import { eneaQuestions } from "@/tests-engine/eneagrama"
import { ipipQuestions } from "@/tests-engine/personalities"

export async function testLinkPublicRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  // GET /public/tests/:token
  // Valida o token e retorna as perguntas pra o front renderizar
  typed.get(
    "/tests/:token",
    { schema: { params: z.object({ token: z.string() }) } },
    async (req) => {
      const validation = await testService.validateToken(req.params.token)
      if (!validation.valid) {
        throw new Error(`Link inválido: ${validation.reason}`)
      }

      const { link } = validation
      const company = await import("@/lib/prisma").then(({ prisma }) =>
        prisma.company.findUnique({
          where: { id: link.companyId },
          select: { razaoSocial: true, logoUrl: true },
        }),
      )

      return {
        ok: true,
        data: {
          companyName: company?.razaoSocial,
          companyLogo: company?.logoUrl,
          questions: {
            disc: discQuestions,
            enea: eneaQuestions,
            ipip: ipipQuestions,
          },
        },
      }
    },
  )
}
```

### `src/routes/public/test-submit.routes.ts`

```ts
import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { testService } from "@/services/test.service"

const discAnswerSchema = z.object({
  questionId: z.string(),
  most: z.string(),
  least: z.string(),
})

const scaleAnswerSchema = z.object({
  questionId: z.string(),
  value: z.number().int().min(1).max(5),
})

export async function testSubmitPublicRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  // POST /public/tests/:token/submit
  typed.post(
    "/tests/:token/submit",
    {
      schema: {
        params: z.object({ token: z.string() }),
        body: z.object({
          disc: z.array(discAnswerSchema),
          enea: z.array(scaleAnswerSchema),
          ipip: z.array(scaleAnswerSchema),
        }),
      },
    },
    async (req, reply) => {
      await testService.submitAnswers({
        token: req.params.token,
        discAnswers: req.body.disc,
        eneaAnswers: req.body.enea,
        ipipAnswers: req.body.ipip,
      })
      return reply.status(200).send({ ok: true })
    },
  )
}
```

---

## 12. Motor dos Testes Psicométricos

### `src/tests-engine/types.ts`

```ts
export interface DiscAnswer { questionId: string; most: string; least: string }
export interface ScaleAnswer { questionId: string; value: 1 | 2 | 3 | 4 | 5 }

export interface DiscResult {
  D: number; I: number; S: number; C: number
  dominante: "D" | "I" | "S" | "C"
}

export interface EneagramaResult {
  tipoPrincipal: number
  asa: number | null
  scores: Record<number, number>
}

export interface MbtiResult {
  tipo: string
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number }
}
```

### `src/tests-engine/disc.ts`

```ts
import discData from "./data/disc-questions.json"
import type { DiscAnswer, DiscResult } from "./types"

interface DiscOption { id: string; text: string; dimension: "D" | "I" | "S" | "C" }
interface DiscQuestion { id: string; index: number; options: DiscOption[] }

export const discQuestions = discData as DiscQuestion[]

export function scoreDisc(answers: DiscAnswer[]): DiscResult {
  const scores = { D: 0, I: 0, S: 0, C: 0 }

  for (const answer of answers) {
    const q = discQuestions.find((q) => q.id === answer.questionId)
    if (!q) continue
    const most = q.options.find((o) => o.id === answer.most)
    const least = q.options.find((o) => o.id === answer.least)
    if (most) scores[most.dimension] += 1
    if (least) scores[least.dimension] -= 1
  }

  const dominante = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as "D" | "I" | "S" | "C"
  return { ...scores, dominante }
}
```

### `src/tests-engine/personalities.ts`

```ts
import ipipData from "./data/ipip-questions.json"
import type { ScaleAnswer, MbtiResult } from "./types"

interface IpipQuestion {
  id: string; index: number; text: string
  reversed: boolean
  pole: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"
}

export const ipipQuestions = ipipData as IpipQuestion[]

export function scoreMbti(answers: ScaleAnswer[]): MbtiResult {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  for (const answer of answers) {
    const q = ipipQuestions.find((q) => q.id === answer.questionId)
    if (!q) continue
    const v = q.reversed ? 6 - answer.value : answer.value
    scores[q.pole] += v
  }

  const tipo = [
    scores.E >= scores.I ? "E" : "I",
    scores.S >= scores.N ? "S" : "N",
    scores.T >= scores.F ? "T" : "F",
    scores.J >= scores.P ? "J" : "P",
  ].join("")

  return { tipo, scores }
}
```

### `src/tests-engine/eneagrama.ts`

```ts
import eneaData from "./data/eneagrama-questions.json"
import type { ScaleAnswer, EneagramaResult } from "./types"

interface EneaQuestion { id: string; index: number; text: string; type: number }

export const eneaQuestions = eneaData as EneaQuestion[]

export function scoreEneagrama(answers: ScaleAnswer[]): EneagramaResult {
  const scores: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 }

  for (const answer of answers) {
    const q = eneaQuestions.find((q) => q.id === answer.questionId)
    if (!q) continue
    scores[q.type] += answer.value
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const tipoPrincipal = parseInt(sorted[0][0])
  const left = tipoPrincipal === 1 ? 9 : tipoPrincipal - 1
  const right = tipoPrincipal === 9 ? 1 : tipoPrincipal + 1
  const asa = scores[left] >= scores[right] ? left : right

  return { tipoPrincipal, asa, scores }
}
```

### `src/services/test.service.ts`

```ts
import { nanoid } from "nanoid"
import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/app-error"
import { scoreDisc } from "@/tests-engine/disc"
import { scoreEneagrama } from "@/tests-engine/eneagrama"
import { scoreMbti } from "@/tests-engine/personalities"
import type { DiscAnswer, ScaleAnswer } from "@/tests-engine/types"

export const testService = {
  async createLink(params: {
    companyId: string
    type: "candidate" | "employee"
    candidateId?: string
    employeeId?: string
    jobId?: string
    expiresInHours?: number
  }) {
    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + (params.expiresInHours ?? 72) * 3_600_000)
    return prisma.testLink.create({ data: { ...params, token, expiresAt } })
  },

  async validateToken(token: string) {
    const link = await prisma.testLink.findUnique({ where: { token } })
    if (!link) return { valid: false, reason: "not_found" } as const
    if (link.completedAt) return { valid: false, reason: "completed" } as const
    if (link.expiresAt < new Date()) return { valid: false, reason: "expired" } as const
    return { valid: true, link } as const
  },

  async submitAnswers(params: {
    token: string
    discAnswers: DiscAnswer[]
    eneaAnswers: ScaleAnswer[]
    ipipAnswers: ScaleAnswer[]
  }) {
    const v = await this.validateToken(params.token)
    if (!v.valid) throw new AppError(`Link inválido: ${v.reason}`, 400)

    const { link } = v
    const disc = scoreDisc(params.discAnswers)
    const enea = scoreEneagrama(params.eneaAnswers)
    const mbti = scoreMbti(params.ipipAnswers)
    const subjectId = link.candidateId ?? link.employeeId!

    await prisma.$transaction([
      prisma.personalityResult.create({
        data: {
          companyId: link.companyId,
          subjectId,
          subjectType: link.type,
          discJson: disc,
          enneagramJson: enea,
          mbtiJson: mbti,
        },
      }),
      prisma.testLink.update({
        where: { id: link.id },
        data: { completedAt: new Date() },
      }),
      ...(link.candidateId
        ? [prisma.candidate.update({
            where: { id: link.candidateId },
            data: { testCompletedAt: new Date() },
          })]
        : []),
    ])

    return { disc, enea, mbti }
  },
}
```

---

## 13. Integração Claude

### `src/ai/claude.ts`

```ts
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { env } from "@/config/env"

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
const MODEL = "claude-sonnet-4-20250514"

export async function generateText(params: {
  system: string
  user: string
  maxTokens?: number
}): Promise<string> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 4000,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  })
  const block = res.content.find((b) => b.type === "text")
  if (!block || block.type !== "text") throw new Error("Sem conteúdo de texto na resposta da IA")
  return block.text
}

export async function generateJson<T>(params: {
  system: string
  user: string
  schema: z.ZodType<T>
  maxTokens?: number
  retries?: number
}): Promise<T> {
  const retries = params.retries ?? 1
  let lastErr: unknown

  for (let i = 0; i <= retries; i++) {
    try {
      const raw = await generateText({
        system: params.system + "\n\nResponda APENAS com JSON válido. Sem markdown, sem comentários.",
        user: params.user,
        maxTokens: params.maxTokens,
      })
      const clean = raw.replace(/```json|```/g, "").trim()
      return params.schema.parse(JSON.parse(clean))
    } catch (err) {
      lastErr = err
    }
  }
  throw new Error(`generateJson falhou após ${params.retries} tentativas: ${lastErr}`)
}

// Streaming — pra rota de chat
export function streamText(params: {
  system: string
  messages: { role: "user" | "assistant"; content: string }[]
  maxTokens?: number
}) {
  return client.messages.stream({
    model: MODEL,
    max_tokens: params.maxTokens ?? 1500,
    system: params.system,
    messages: params.messages,
  })
}
```

### `src/routes/chat/chat.routes.ts`

```ts
import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { streamText } from "@/ai/claude"

export async function chatRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  typed.post(
    "/",
    {
      schema: {
        body: z.object({
          jobId: z.string().uuid().nullable().optional(),
          message: z.string().min(1).max(2000),
        }),
      },
    },
    async (req, reply) => {
      const { companyId, userId } = req.user
      const { jobId, message } = req.body

      const company = await prisma.company.findUnique({ where: { id: companyId } })
      const job = jobId
        ? await prisma.job.findFirst({
            where: { id: jobId, companyId },
            include: { _count: { select: { candidates: true, matches: true } } },
          })
        : null

      const history = await prisma.chatMessage.findMany({
        where: { companyId, jobId: jobId ?? null },
        orderBy: { createdAt: "asc" },
        take: 20,
      })

      const systemPrompt = `Você é um assistente de RH especializado.
Empresa: ${JSON.stringify({ nome: company?.razaoSocial, ritmo: company?.perfilRitmo })}
${job ? `Vaga: ${JSON.stringify({ titulo: job.titulo, candidatos: job._count.candidates })}` : ""}
Responda de forma direta e prática em português.`

      // salva mensagem do user
      await prisma.chatMessage.create({
        data: { companyId, jobId, role: "user", content: message },
      })

      // streaming via SSE
      reply.raw.setHeader("Content-Type", "text/event-stream")
      reply.raw.setHeader("Cache-Control", "no-cache")
      reply.raw.setHeader("X-Accel-Buffering", "no")

      let full = ""
      const stream = streamText({
        system: systemPrompt,
        messages: [
          ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user", content: message },
        ],
      })

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          full += event.delta.text
          reply.raw.write(`data: ${JSON.stringify({ chunk: event.delta.text })}\n\n`)
        }
      }

      // salva resposta completa
      await prisma.chatMessage.create({
        data: { companyId, jobId, role: "assistant", content: full },
      })

      reply.raw.write("data: [DONE]\n\n")
      reply.raw.end()
    },
  )
}
```

---

## 14. Upload — Supabase Storage

### `src/services/upload.service.ts`

```ts
import { supabaseAdmin } from "@/lib/supabase"
import { nanoid } from "nanoid"

const BUCKET = "company-assets"

export const uploadService = {
  async uploadLogo(companyId: string, file: Buffer, mimeType: string) {
    const ext = mimeType.split("/")[1]
    const path = `${companyId}/logo-${nanoid(8)}.${ext}`
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, file, { contentType: mimeType, upsert: true })
    if (error) throw error
    return supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  },

  async uploadCv(companyId: string, candidateId: string, file: Buffer) {
    const path = `${companyId}/cvs/${candidateId}-${nanoid(8)}.pdf`
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, file, { contentType: "application/pdf" })
    if (error) throw error
    return supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  },
}
```

### `src/routes/upload/upload.routes.ts`

```ts
import type { FastifyInstance } from "fastify"
import { AppError } from "@/lib/app-error"
import { uploadService } from "@/services/upload.service"
import { prisma } from "@/lib/prisma"

export async function uploadRoutes(app: FastifyInstance) {
  // POST /upload
  // multipart com campo "kind" (logo | cv) e "file"
  app.post("/", async (req, reply) => {
    const data = await req.file()
    if (!data) throw new AppError("Nenhum arquivo enviado", 400)

    const kind = data.fields.kind as { value: string } | undefined
    const candidateId = data.fields.candidateId as { value: string } | undefined

    const buffer = await data.toBuffer()
    const { companyId } = req.user

    let url: string

    if (kind?.value === "logo") {
      url = await uploadService.uploadLogo(companyId, buffer, data.mimetype)
      await prisma.company.update({ where: { id: companyId }, data: { logoUrl: url } })
    } else if (kind?.value === "cv" && candidateId?.value) {
      url = await uploadService.uploadCv(companyId, candidateId.value, buffer)
      await prisma.candidate.update({
        where: { id: candidateId.value, companyId },
        data: { cvUrl: url },
      })
    } else {
      throw new AppError("kind inválido", 400)
    }

    return reply.send({ ok: true, data: { url } })
  })
}
```

---

## 15. E-mail Transacional

### `src/email/resend.ts`

```ts
import { Resend } from "resend"
import { env } from "@/config/env"

const resend = new Resend(env.RESEND_API_KEY)
const FROM = "RH Match <noreply@devcarlosresende.com.br>"

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
  if (error) { console.error("[sendEmail]", error); throw error }
  return data
}
```

---

## 16. Seed (`prisma/seed.ts`)

```ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

async function main() {
  await prisma.matchReport.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.job.deleteMany()
  await prisma.personalityResult.deleteMany()
  await prisma.organogramaNode.deleteMany()
  await prisma.testLink.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  const company = await prisma.company.create({
    data: {
      razaoSocial: "Enviagora Logística S.A.",
      cnpj: "12.345.678/0001-90",
      contextoEmpresa: "Empresa de logística com crescimento de 300% ao ano.",
      perfilRitmo: "startup",
      valores: ["execução", "responsabilidade", "tecnologia"],
      onboardingStep: 4,
    },
  })

  await prisma.user.create({
    data: {
      companyId: company.id,
      nome: "Carlos Demo",
      email: "demo@enviagora.com.br",
      password: await bcrypt.hash("demo123", 10),
    },
  })

  const ceo = await prisma.organogramaNode.create({
    data: { companyId: company.id, nome: "Ana Souza", cargo: "CEO" },
  })
  const cto = await prisma.organogramaNode.create({
    data: { companyId: company.id, nome: "Bruno Lima", cargo: "CTO", parentId: ceo.id },
  })

  await prisma.personalityResult.create({
    data: {
      companyId: company.id,
      subjectId: cto.id,
      subjectType: "employee",
      discJson: { D: 8, I: 4, S: 2, C: 6, dominante: "D" },
      enneagramJson: { tipoPrincipal: 8, asa: 7, scores: {} },
      mbtiJson: { tipo: "ENTJ", scores: {} },
    },
  })

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      titulo: "Desenvolvedor Full Stack Pleno",
      liderId: cto.id,
      status: "aberta",
      publicToken: nanoid(32),
      responsabilidades: "Desenvolver features no app de logística, integrar APIs de transportadoras.",
    },
  })

  const candidatesData = [
    { nome: "João Silva", disc: { D: 7, I: 3, S: 4, C: 6, dominante: "D" }, mbti: "ENTJ", enea: 8 },
    { nome: "Maria Santos", disc: { D: 3, I: 6, S: 7, C: 4, dominante: "S" }, mbti: "ISFJ", enea: 2 },
    { nome: "Pedro Oliveira", disc: { D: 5, I: 4, S: 3, C: 8, dominante: "C" }, mbti: "INTJ", enea: 5 },
  ]

  for (const cd of candidatesData) {
    const cand = await prisma.candidate.create({
      data: {
        companyId: company.id,
        jobId: job.id,
        nome: cd.nome,
        email: `${cd.nome.toLowerCase().replace(" ", ".")}@email.com`,
        testCompletedAt: new Date(),
      },
    })
    await prisma.personalityResult.create({
      data: {
        companyId: company.id,
        subjectId: cand.id,
        subjectType: "candidate",
        discJson: cd.disc,
        mbtiJson: { tipo: cd.mbti, scores: {} },
        enneagramJson: { tipoPrincipal: cd.enea, asa: null, scores: {} },
      },
    })
  }

  console.log("✓ Seed OK — demo@enviagora.com.br / demo123")
}

main().catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

---

## 17. Deploy no Railway

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Dentro do repo da API
railway init
railway up

# 4. Configurar variáveis de ambiente
# Railway dashboard → seu projeto → Variables → adicionar tudo do .env

# 5. Confirmar porta
# Railway usa a variável PORT automaticamente (já está no env.ts)

# 6. Health check (Railway verifica esse endpoint)
# GET /health → { ok: true } → tá no ar
```

> Alternativa: **Render** (render.com). Cria Web Service → aponta pro repo → `npm run build` → `npm start`. Configura as env vars no dashboard. Igualmente simples.

---

## 18. Endpoints Completos da API

```
POST   /auth/signup
POST   /auth/login
GET    /auth/me                          (autenticado)

GET    /company                          (autenticado)
PATCH  /company                          (autenticado)
PATCH  /company/onboarding/:step         (autenticado)

GET    /organograma                      (autenticado)
POST   /organograma                      (autenticado)
PATCH  /organograma/:id                  (autenticado)
DELETE /organograma/:id                  (autenticado)

GET    /jobs                             (autenticado)
POST   /jobs                             (autenticado)
GET    /jobs/:id                         (autenticado)
PATCH  /jobs/:id                         (autenticado)
DELETE /jobs/:id                         (autenticado)
POST   /jobs/:id/generate-jd             (autenticado)
POST   /jobs/:id/match                   (autenticado)

GET    /jobs/:id/candidates              (autenticado)
POST   /jobs/:id/candidates              (autenticado)
PATCH  /candidates/:id                   (autenticado)
DELETE /candidates/:id                   (autenticado)

POST   /chat                             (autenticado, streaming SSE)

POST   /upload                           (autenticado, multipart)

GET    /public/tests/:token              (público)
POST   /public/tests/:token/submit       (público)

GET    /health                           (público)
```

---

## 19. Checklist — Ordem de Execução

### Fundação
- [ ] `mkdir saas-rh-api` + `npm init`
- [ ] Instalar todas as deps (seção 3)
- [ ] `tsconfig.json`
- [ ] `src/config/env.ts` + `.env`
- [ ] `src/lib/prisma.ts`, `jwt.ts`, `app-error.ts`, `supabase.ts`
- [ ] `prisma/schema.prisma` + `npx prisma db push` + `npx prisma generate`
- [ ] `src/server.ts` + `src/main.ts`
- [ ] `src/plugins/` (cors, error-handler, jwt-auth, multipart)
- [ ] `src/routes/index.ts`
- [ ] `npm run dev` — verificar `/health` respondendo

### Auth
- [ ] `src/routes/auth/auth.routes.ts` (signup + login + me)
- [ ] Testar com Bruno no Insomnia/Postman

### Company + Organograma
- [ ] `src/services/company.service.ts`
- [ ] `src/routes/company/company.routes.ts`
- [ ] `src/services/organograma.service.ts`
- [ ] `src/routes/organograma/organograma.routes.ts`

### Jobs + Candidates
- [ ] `src/services/job.service.ts`
- [ ] `src/routes/jobs/job.routes.ts`
- [ ] `src/services/candidate.service.ts`
- [ ] `src/routes/candidates/candidate.routes.ts`

### Motor dos Testes
- [ ] `src/tests-engine/types.ts`
- [ ] `src/tests-engine/data/*.json` (os 3 JSONs)
- [ ] `src/tests-engine/disc.ts`
- [ ] `src/tests-engine/personalities.ts`
- [ ] `src/tests-engine/eneagrama.ts`
- [ ] `src/services/test.service.ts`
- [ ] `src/routes/public/test-link.routes.ts`
- [ ] `src/routes/public/test-submit.routes.ts`

### IA
- [ ] `src/ai/claude.ts`
- [ ] `src/ai/prompts/match.ts`, `jd.ts`, `chat.ts`
- [ ] `src/ai/schemas/match.schema.ts`, `jd.schema.ts`
- [ ] `src/services/match.service.ts`
- [ ] `POST /jobs/:id/generate-jd`
- [ ] `POST /jobs/:id/match`

### Chat + Upload + Email
- [ ] `src/routes/chat/chat.routes.ts` (streaming SSE)
- [ ] `src/services/upload.service.ts`
- [ ] `src/routes/upload/upload.routes.ts`
- [ ] `src/email/resend.ts` + templates

### Finalização
- [ ] `prisma/seed.ts` + `npm run db:seed`
- [ ] Deploy no Railway
- [ ] Testar todos os endpoints em prod
- [ ] Configurar CORS com URL real do Vercel

---

## 20. O que NÃO entra no MVP

- BullMQ + Redis → IA síncrona
- Refresh token → token de 7 dias serve
- Rate limiting → nice-to-have
- Soft delete → cascade direto
- 2FA, SSO OAuth
- Logs estruturados (Sentry)
- i18n
- Validação CNPJ via Receita Federal

---

**Fim do PLANNING-BACKEND-FASTIFY.**