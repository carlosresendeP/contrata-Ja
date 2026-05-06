# Backend — MVP (foco total)

---

## 1. Schema (fazer primeiro, tudo depende disso)
- Adicionar campos em `Company` (onboardingStep, contextoEmpresa, perfilRitmo, valores[], logoUrl)
- Adicionar campos em `Job` (liderId, jdGerada, perfilIdealJson, publicToken, salaryMin, salaryMax)
- Adicionar campos em `Candidate` (respostasJson, testCompletedAt)
- Criar `OrganogramaNode`, `PersonalityResult`, `MatchReport`, `TestLink`, `ChatMessage`
- `prisma db push` + `prisma generate`

---


## 2. Auth + Company
- `GET /auth/me`
- `GET /company` e `PATCH /company`
- `PATCH /company/onboarding/:step`

---

## 3. Jobs + Candidates (completar o que falta)
- `GET /jobs/:id`, `PATCH /jobs/:id`
- `GET /applications/job/:jobId`
- `PATCH /applications/:id/status`

---

## 4. Organograma (simples)
- `GET /organograma`, `POST /organograma`, `DELETE /organograma/:id`

---

## 5. Motor de Testes + Portal Candidato
- `disc.ts`, `eneagrama.ts`, `personalities.ts` + os 3 JSONs de perguntas
- `test.service.ts` — `createLink()`, `validateToken()`, `submitAnswers()`
- `GET /public/tests/:token`
- `POST /public/tests/:token/submit`

---

## 6. IA
- `src/ai/claude.ts` — `generateText()`, `generateJson()`, `streamText()`
- Prompts: `jd.ts`, `match.ts`, `chat.ts`
- `match.service.ts` — `generateJd()`, `generate()`
- `POST /jobs/:id/generate-jd`
- `POST /jobs/:id/match`

---

## 7. Chat
- `POST /chat` com SSE streaming

---

## 8. Fechar
- Atualizar `env.ts` com ANTHROPIC_API_KEY e SUPABASE_SERVICE_ROLE_KEY
- Registrar rotas novas no `index.ts`
- `prisma/seed.ts` com dados demo
- Deploy Railway

---

**Fora:** upload de arquivo, email, refresh token, delete de tudo, paginação
