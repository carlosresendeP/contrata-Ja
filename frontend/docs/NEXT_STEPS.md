# Próximos Passos — Frontend MakerStack RH

> Estado atual: landing page + design system prontos.
> Este documento define a ordem exata de implementação do restante do frontend.

---

## O que já está feito ✅

| Arquivo                                        | Status |
| ---------------------------------------------- | ------ |
| `app/globals.css` — tokens OKLCH + Montserrat  | ✅     |
| `app/layout.tsx` — fontes configuradas         | ✅     |
| `app/page.tsx` — landing page                  | ✅     |
| `components/landing/Header.tsx` — menu mobile  | ✅     |
| `app/(marketing)/layout.tsx` — layout público  | ✅     |
| `types/api.ts` — tipos derivados do Prisma     | ✅     |
| `lib/utils.ts` — `cn()`                        | ✅     |
| shadcn: button, badge, input, avatar, progress | ✅     |

---

## Etapa 1 — Instalar dependências

> Único comando. Rodar antes de qualquer outra coisa.

```bash
pnpm add @tanstack/react-query zustand axios sonner| ✅ |
pnpm add react-hook-form @hookform/resolvers zod| ✅ |
```

**Componentes shadcn ainda necessários:**

```bash
pnpm dlx shadcn@latest add \  | ✅ |
  form label select textarea separator skeleton \| ✅ |
  dialog tabs card tooltip sheet radio-group checkbox \| ✅ |
  dropdown-menu switch sonner table| ✅ |
```

**Por quê antes de tudo:** os imports das etapas seguintes dependem dessas libs. Sem elas, nenhum outro arquivo compila.

---

## Etapa 2 — Fundação técnica (`lib/`)

Arquivos puros de utilitário — zero UI, zero estado. Base de tudo.

### 2.1 `lib/tokens.ts`

```ts
const KEY = "saas_rh_token";
export const tokenStorage = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(KEY) : null),
  set: (t: string) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
};
```

### 2.2 `lib/api.ts` — Axios + interceptors JWT

- Cria instância com `baseURL = process.env.NEXT_PUBLIC_API_URL`
- Interceptor de request: injeta `Authorization: Bearer <token>`
- Interceptor de response: em 401, limpa token e redireciona `/login`

### 2.3 `lib/utils.ts` — adicionar formatadores

```ts
export function formatDate(date: string | Date): string;
export function formatRelative(date: string | Date): string; // "hoje", "ontem", "há 3 dias"
```

### 2.4 `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3333
```

**Por quê antes das páginas:** `lib/api.ts` é importado por todos os services. Sem ele, nenhum service funciona.

---

## Etapa 3 — Estado de Auth (`store/` + `hooks/`)

### 3.1 `store/auth.store.ts` — Zustand

Campos: `user: AuthUser | null`, `token: string | null`, `isAuthenticated: boolean`
Actions: `setAuth(user, token)`, `clearAuth()`, `hydrate()` (chama `GET /me`)

### 3.2 `hooks/useAuth.ts`

Wrapper fino sobre o store — expõe só o que os componentes precisam.

**Por quê antes do shell:** `AuthGuard` e `Sidebar` dependem de `useAuth`.

---

## Etapa 4 — Providers no layout root

Atualizar `app/layout.tsx` para envolver toda a aplicação com:

1. `<QueryProvider>` — `components/providers/QueryProvider.tsx`
2. `<Toaster />` do Sonner — posição `top-right`

```tsx
// components/providers/QueryProvider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// staleTime: 60s, retry: 1
```

**Por quê agora:** qualquer hook do TanStack Query falha sem o Provider. O Toaster precisa estar no root para funcionar em qualquer página.

---

## Etapa 5 — Páginas de Auth

### 5.1 `services/auth.service.ts`

- `login(body)` → `POST /login`
- `signup(body)` → `POST /register`
- `me()` → `GET /me`

### 5.2 `app/(marketing)/login/page.tsx`

- Layout two-panel: esquerda Verde Floresta com slogan, direita form
- Campos: email + senha (RHF + Zod)
- Submit → `authService.login` → `setAuth` → `router.push("/dashboard")`

### 5.3 `app/(marketing)/cadastro/page.tsx`

- Campos: nome, email, senha, razão social, CNPJ (RHF + Zod)
- Submit → `authService.signup` → `setAuth` → `router.push("/onboarding/etapa-1")`

**Checkpoint:** ao terminar esta etapa, o fluxo de auth completo deve funcionar end-to-end.

---

## Etapa 6 — Shell Autenticado

Tudo que envolve a área protegida do app.

### 6.1 `app/(app)/layout.tsx`

- `"use client"` — chama `hydrate()` no mount
- Grid: `grid-cols-[240px_1fr]`
- `AuthGuard`: se `!isAuthenticated` após 300ms → `router.replace("/login")`
- Renderiza `<Sidebar />` + `<main>`

### 6.2 `components/layout/Sidebar.tsx`

- Background `bg-sidebar` (Verde Floresta)
- Nav items: Dashboard, Vagas, Organograma, Chat IA
- Item ativo: borda esquerda `bg-primary` + texto neon
- Footer: avatar do usuário + botão Sair

### 6.3 `components/layout/Topbar.tsx`

- Nome da empresa + nome do usuário
- Avatar com dropdown (Perfil, Sair)

### 6.4 `components/layout/EmptyState.tsx`

- Ícone + título + descrição + botão de ação (opcional)
- Usado por todas as páginas com estado vazio

### 6.5 `app/(app)/error.tsx`

- Boundary de erro global para o grupo `(app)`

**Checkpoint:** navegar para `/dashboard` sem token deve redirecionar para `/login`.

---

## Etapa 7 — Onboarding (4 etapas)

```
app/(app)/onboarding/
├── layout.tsx        → WizardStepper (4 passos)
├── etapa-1/page.tsx  → Dados cadastrais + logo
├── etapa-2/page.tsx  → Organograma
├── etapa-3/page.tsx  → Testes dos colaboradores
└── etapa-4/page.tsx  → Contexto da empresa
```

### Services necessários

- `services/company.service.ts` — `get()`, `update()`, `setOnboardingStep(n)`
- `services/organograma.service.ts` — `list()`, `create()`, `delete(id)`

### Componentes

- `components/onboarding/WizardStepper.tsx`
- `components/onboarding/OrganogramaTree.tsx`
- `hooks/useViaCep.ts` — lookup de CEP para etapa 1

**Checkpoint:** novo usuário deve conseguir completar as 4 etapas e chegar no dashboard.

---

## Etapa 8 — Dashboard

```
app/(app)/dashboard/page.tsx
```

- `services/job.service.ts` — `list()`, `getById()`, `create()`, `update()`, `generateJd()`, `generateMatch()`
- `hooks/useJobs.ts` — TanStack Query wrapping job.service
- KPI cards (vagas abertas, candidatos, em entrevista)
- Lista de vagas recentes

---

## Etapa 9 — Vagas

```
app/(app)/vagas/
├── page.tsx             → lista com TableSkeleton + EmptyState
├── nova/page.tsx        → escolha: IA vs Manual
├── nova/com-ia/page.tsx → briefing form + JdPreview
├── nova/manual/page.tsx → form + CandidatesRepeater
└── [id]/page.tsx        → RankingSidebar + CandidateAnalysis
```

### Services necessários

- `services/candidate.service.ts` — `listByJob(jobId)`, `apply()`

### Componentes principais

- `components/vagas/JdPreview.tsx` — card editável com borda neon ao gerar JD
- `components/vagas/CandidatesRepeater.tsx` — adicionar N candidatos
- `components/relatorio/RankingSidebar.tsx` — lista ranqueada por score
- `components/relatorio/CandidateAnalysis.tsx` — relatório completo

**É a página mais complexa.** Reservar mais tempo.

---

## Etapa 10 — Organograma

```
app/(app)/organograma/page.tsx
```

- `hooks/useOrganograma.ts`
- `components/organograma/OrgTree.tsx` — árvore hierárquica recursiva
- `components/organograma/AddNodeDialog.tsx` — Dialog para adicionar posição

---

## Etapa 11 — Chat IA

```
app/(app)/chat/page.tsx
```

- `hooks/useChatStream.ts` — consome SSE via `fetch` com `ReadableStream`
- `components/chat/MessageList.tsx` — bolhas de mensagem
- `components/chat/ChatInput.tsx` — textarea + enviar

---

## Etapa 12 — Configurações

```
app/(app)/configuracoes/page.tsx
```

- Tabs: Empresa | Plano
- Tag editor para `valores`
- Card picker para `perfilRitmo`

---

## Etapa 14 — Pipeline de Candidatos ✅

```
app/(app)/candidatos/page.tsx
```

- Kanban com 6 colunas: Pendente → Em Análise → Teste Psicométrico → Entrevista → Aprovado → Reprovado
- Filtro por vaga (select de todas as vagas da empresa)
- Cards com: nome, vaga, match score, indicador de teste concluído
- Mover candidato entre colunas via dropdown "Mover para"
- Clique no card abre a vaga correspondente (`/vagas/[id]`)
- Sidebar: novo item "Candidatos" com ícone Users

---

## Etapa 15 — Portal Público de Candidatura ✅

```
app/candidatar/[publicToken]/page.tsx
```

- Página pública (sem auth) acessada via link único gerado por vaga
- Exibe: logo da empresa, título, descrição da vaga, faixa salarial
- Formulário: nome*, email*, telefone, upload de currículo PDF (opcional)
- Upload via `POST /api/public/upload` → retorna URL → enviada no apply
- Submit → `POST /api/applications/apply` → tela de confirmação
- `services/public.service.ts` — `getJob(token)`, `uploadResume(file)`, `apply(body)`

**Backend necessário:**
- `GET /api/public/jobs/:publicToken` — retorna vaga + logo da empresa (sem auth)
- `POST /api/public/upload` — aceita PDF (multipart), salva em `backend/uploads/`
- `GET /api/public/uploads/:filename` — serve o arquivo

---

## Etapa 13 — Portal do Candidato ✅

```
app/teste/[token]/
├── layout.tsx          → header white-label com logo da empresa
├── page.tsx            → boas-vindas + aceite LGPD
├── disc/page.tsx       → pares forçados
├── eneagrama/page.tsx  → Likert 1-5
├── personalidades/page.tsx → Likert 1-5 + submit final
└── concluido/page.tsx  → tela de conclusão
```

- `services/test.service.ts` — `getSession(token)`, `submit(token, answers)`
- Respostas salvas em `sessionStorage` entre páginas
- **Mobile-first obrigatório**

---

---

## Fase 2 — Melhorias pós-MVP

> MVP entregue. As etapas abaixo são melhorias de qualidade, UX e infra.
> Ordem sugerida: priorize as que impactam diretamente o uso diário.

---

### Etapa 16 — Upload real de logo nas Configurações

```
app/(app)/configuracoes/page.tsx  →  seção "Logotipo da Empresa"
backend/src/Routes/publicJob.routes.ts  →  rota POST /public/upload (já existe)
```

Hoje a logo é salva como URL digitada manualmente. Substituir por upload de arquivo:

- Adicionar `<input type="file" accept="image/*">` oculto
- Ao selecionar: `POST /api/public/upload` com o arquivo (reutiliza endpoint de currículo)
  - Backend já aceita `application/pdf`; **atualizar** para aceitar também `image/png`, `image/jpeg`, `image/svg+xml`
- Retorna URL → `setValue("logoUrl", url)` → preview atualiza em tempo real
- Exibir barra de progresso durante o upload (mesmo padrão do portal de candidatura)
- Manter input de URL manual como fallback ("ou cole uma URL")

**Mudança necessária no backend** (`publicJob.routes.ts`):
```ts
// Alterar validação de mimetype:
const allowed = ["application/pdf", "image/png", "image/jpeg", "image/svg+xml", "image/webp"]
if (!allowed.includes(file.mimetype)) throw new AppError("Tipo de arquivo não suportado.", 400)
```

---

### Etapa 17 — Contexto da Empresa nas Configurações

```
app/(app)/configuracoes/page.tsx  →  nova seção na aba "Empresa"
```

O campo `contextoEmpresa` (Prisma: `String? @db.Text`) é crítico para a qualidade
do match de IA mas não tem UI. Adicionar na aba Empresa:

- Textarea de texto livre com contador de palavras (mínimo recomendado: 100)
- Label: "Descreva o momento atual da sua empresa"
- Placeholder com exemplo guiado
- Indicador visual: cinza < 50 palavras / amarelo 50–99 / verde ≥ 100
- Salvo junto com os outros campos no `PATCH /company`

---

### Etapa 18 — E-mails Automáticos (Resend)

```
backend/src/services/emailService.ts  →  novo
backend/src/services/ApplicationService.ts  →  chamar após apply()
backend/src/services/testService.ts  →  chamar após submit()
```

Instalar: `pnpm add resend` (backend)

Eventos prioritários:
1. **Candidato se inscreve** → e-mail para o RH: "Nova candidatura — {nome} para {vaga}"
2. **Testes concluídos** → e-mail para o RH: "{nome} concluiu os testes — ver relatório"
3. **Link de testes gerado** → e-mail para o candidato com o link (atualmente só é copiado)

Variáveis de ambiente necessárias:
```
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@suaempresa.com
```

---

### Etapa 19 — Página de Detalhe do Candidato

```
app/(app)/candidatos/[id]/page.tsx  →  novo
```

Hoje existe `/candidatos` (kanban) mas clicar num card abre `/vagas/[id]`, não o perfil do candidato.
Criar página dedicada ao candidato:

- Header: nome, e-mail, telefone, data de candidatura
- Badge de status atual com histórico de movimentações
- Resultados dos testes (DISC, Eneagrama, 16P) em cards visuais
- Link para baixar currículo (se `curriculoUrl` existe)
- Match score + resumo IA (se análise foi gerada)
- Botão "Ver Vaga" → `/vagas/[jobId]`

---

### Etapa 20 — Refresh Token & Segurança de Sessão

```
lib/api.ts  →  interceptor de resposta
backend/src/Routes/auth.routes.ts  →  rota POST /refresh
```

Hoje o token JWT expira e o usuário é redirecionado para login sem aviso.
Implementar refresh silencioso:

- Backend: `POST /auth/refresh` recebe `refreshToken` (cookie httpOnly), retorna novo `accessToken`
- Frontend: interceptor Axios captura 401 → tenta refresh → reenvia request original
- Se refresh falha → `clearAuth()` + redirect `/login`
- Armazenar `refreshToken` em cookie httpOnly (não localStorage)

---

### Etapa 21 — Dashboard Analytics

```
app/(app)/dashboard/page.tsx  →  melhorar KPIs
backend/src/Routes/  →  nova rota GET /company/stats
```

Melhorar o dashboard atual com métricas reais:

- Tempo médio de contratação por vaga (dias entre criação e APROVADO)
- Taxa de conversão por etapa do funil (% que avança de cada status)
- Gráfico de candidaturas por semana (sparkline simples)
- Top 3 vagas com mais candidatos
- Vagas sem candidatos há mais de 7 dias (alerta)

---

### Etapa 22 — BullMQ (Filas para IA em Background)

```
backend/src/queues/  →  novo diretório
backend/src/worker.ts  →  processo separado
```

Instalar: `pnpm add bullmq ioredis` (backend)  
Requer: Redis rodando (`docker run -p 6379:6379 redis` ou Railway Redis)

Quando implementar: quando o `generateMatch` ou `generateJd` demorar > 30s ou
quando houver múltiplos usuários simultâneos.

Fluxo:
1. `POST /ai/jobs/:id/match` → enfileira job → retorna `{ jobId, status: "processing" }`
2. Worker processa em background (sem bloquear request)
3. Frontend faz polling `GET /ai/jobs/:id/match/status` a cada 3s
4. Quando `status: "done"` → invalida query e mostra resultado

Variáveis necessárias:
```
REDIS_URL=redis://localhost:6379
```



20
NO BACKEND CRIAR AS ROTAS DO PUBLIC CORRETAMENTE 
POIS TA TUDO DENTRO DO ROTS CRIAR O SERVICES, CONTROLLER ETC
NAO ESTAO SEPARADOS CORRETAMENTE.


---

## Visão Geral — Estimativa Fase 2

| Etapa | Descrição                        | Complexidade | Tempo est. |
| ----- | -------------------------------- | ------------ | ---------- |
| 16    | Upload real de logo              | Baixa        | 30 min     |
| 17    | Contexto da empresa              | Baixa        | 20 min     |
| 18    | E-mails automáticos (Resend)     | Média        | 2h         |
| 19    | Detalhe do candidato             | Média        | 1.5h       |
| 20    | Refresh token & sessão segura    | Média        | 2h         |
| 21    | Dashboard analytics              | Média        | 2h         |
| 22    | BullMQ (filas IA background)     | Alta         | 3h         |
| **Total** |                             |              | **~11h**   |

---

## Regra de ouro

> **Nunca pule etapas.** Cada etapa depende da anterior.
> Etapas 2-4 são pré-requisito absoluto — sem elas, nenhuma página funciona.
