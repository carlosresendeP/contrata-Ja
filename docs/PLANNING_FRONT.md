# PLANNING — FRONTEND
## SaaS RH · Hackathon MakerStack #01

**Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · shadcn/ui · React Hook Form + Zod · Lucide · Zustand · TanStack Query

**Repo:** `saas-rh-web` (separado da API)
**Deploy:** Vercel
**API Base URL:** `http://localhost:3333` (dev) / URL do Railway (prod)

**Diferença crítica em relação ao Next.js full-stack:**
Não existe mais Server Actions nem NextAuth. Toda mutação vira `fetch` pra API Fastify com `Authorization: Bearer <token>`. Auth é JWT armazenado em `localStorage`. Páginas são Client Components na maioria.

---

## 1. Princípios de UI

1. **Client Components por padrão** nesse projeto. Como tudo depende de JWT e estado de auth, RSC é usado só pra páginas estáticas (landing, login). O app interno é SPA dentro do Next.js.
2. **Sem genéricos de IA.** Nada de gradient azul-roxo, hero + 3 colunas, cards quadrados em grid 3xN. Estética **Linear meets Notion** — interface densa de informação, séria, com personalidade.
3. **Acessibilidade não é estilo.** Foco visível, contraste real (WCAG AA mínimo), labels em todo input, estados de erro descritos.
4. **Estados explícitos sempre.** Loading, vazio, erro, sucesso — toda UI cobre os 4. `Skeleton` pra loading, `EmptyState` próprio pra vazio.
5. **Forms via React Hook Form + Zod.** Schemas de validação no front espelham os do backend — mesmas regras, duplicadas intencionalmente pra feedback imediato.
6. **Mobile-first nos lugares certos.** O **portal do candidato** (`/teste/[token]`) precisa ser 100% mobile. O dashboard interno pode ser desktop-first.
7. **Densidade > beleza.** Avaliador enxerga muito sistema em pouco scroll. Tabelas reais, fontes médias, espaçamento contido.

---

## 2. Setup — Comandos na Ordem

```bash
# 1. Criar projeto
npx create-next-app@latest saas-rh-web \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd saas-rh-web

# 2. shadcn
npx shadcn@latest init
npx shadcn@latest add \
  button card dialog input select tabs toast \
  progress badge avatar dropdown-menu form textarea \
  separator skeleton tooltip alert label switch \
  sheet accordion radio-group checkbox sonner table

# 3. Deps de estado e data fetching
npm i @tanstack/react-query
npm i zustand

# 4. Formulários
npm i react-hook-form @hookform/resolvers zod

# 5. Utils
npm i lucide-react
npm i sonner
npm i clsx tailwind-merge
npm i axios                             # pra interceptors de JWT

# 6. Variáveis de ambiente
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3333
EOF
```

### `tsconfig.json` — confirmar paths

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## 3. Estrutura de Pastas

```
saas-rh-web/
├── app/
│   ├── (marketing)/                     → páginas públicas
│   │   ├── layout.tsx
│   │   ├── page.tsx                     → landing
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   │
│   ├── (app)/                           → app autenticado
│   │   ├── layout.tsx                   → sidebar + topbar + QueryProvider + AuthGuard
│   │   ├── onboarding/
│   │   │   ├── layout.tsx               → wizard stepper
│   │   │   ├── etapa-1/page.tsx
│   │   │   ├── etapa-2/page.tsx
│   │   │   ├── etapa-3/page.tsx
│   │   │   └── etapa-4/page.tsx
│   │   │
│   │   ├── dashboard/page.tsx
│   │   │
│   │   ├── vagas/
│   │   │   ├── page.tsx
│   │   │   ├── nova/
│   │   │   │   ├── page.tsx             → escolha de fluxo
│   │   │   │   ├── com-ia/page.tsx
│   │   │   │   └── manual/page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx             → detalhes + relatório
│   │   │
│   │   └── chat/page.tsx
│   │
│   ├── teste/[token]/                   → portal white-label público
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── disc/page.tsx
│   │   ├── eneagrama/page.tsx
│   │   ├── personalidades/page.tsx
│   │   └── concluido/page.tsx
│   │
│   ├── globals.css
│   └── layout.tsx                       → root + providers
│
├── components/
│   ├── ui/                              → shadcn (não mexer)
│   │
│   ├── providers/
│   │   ├── QueryProvider.tsx            → TanStack Query
│   │   └── AuthProvider.tsx            → contexto de auth (opcional, Zustand resolve)
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── AuthGuard.tsx               → redireciona se não autenticado
│   │   └── EmptyState.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   │
│   ├── onboarding/
│   │   ├── WizardStepper.tsx
│   │   ├── DadosCadastraisForm.tsx
│   │   ├── OrganogramaForm.tsx
│   │   ├── OrganogramaTree.tsx
│   │   ├── ColaboradoresTestes.tsx
│   │   └── ContextoEmpresaForm.tsx
│   │
│   ├── vagas/
│   │   ├── JobsList.tsx
│   │   ├── JobRow.tsx
│   │   ├── NewJobChoice.tsx
│   │   ├── JobBriefingForm.tsx
│   │   ├── JobManualForm.tsx
│   │   ├── CandidatesRepeater.tsx
│   │   └── JdPreview.tsx
│   │
│   ├── relatorio/
│   │   ├── MatchReport.tsx
│   │   ├── RankingSidebar.tsx
│   │   ├── CandidateAnalysis.tsx
│   │   ├── ScoreNumeral.tsx
│   │   ├── PointsList.tsx
│   │   └── DesafioCard.tsx
│   │
│   ├── chat/
│   │   ├── ChatSheet.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   │
│   ├── testes/
│   │   ├── TestProgressBar.tsx
│   │   ├── DiscQuestion.tsx
│   │   ├── EneagramaQuestion.tsx
│   │   ├── PersonalityQuestion.tsx
│   │   ├── TestNav.tsx
│   │   └── ResultSummary.tsx
│   │
│   └── shared/
│       ├── CopyButton.tsx
│       ├── LoadingButton.tsx
│       ├── ConfirmDialog.tsx
│       └── CvUploader.tsx
│
├── lib/
│   ├── api.ts                           → instância Axios + interceptors JWT
│   ├── utils.ts                         → cn(), formatadores
│   └── tokens.ts                        → get/set/clear token no localStorage
│
├── services/                            → funções que chamam a API
│   ├── auth.service.ts
│   ├── company.service.ts
│   ├── organograma.service.ts
│   ├── job.service.ts
│   ├── candidate.service.ts
│   ├── test.service.ts
│   └── match.service.ts
│
├── store/
│   └── auth.store.ts                    → Zustand: user + token + actions
│
├── hooks/
│   ├── useAuth.ts                       → lê do auth.store
│   ├── useJobs.ts                       → TanStack Query wrapping job.service
│   ├── useCandidates.ts
│   ├── useOrganograma.ts
│   ├── useViaCep.ts
│   └── useChatStream.ts                 → consome SSE do chat
│
└── types/
    └── api.ts                           → tipos das respostas da API
```

---

## 4. Cliente HTTP — Axios com JWT

### `lib/tokens.ts`

```ts
const KEY = "saas_rh_token"

export const tokenStorage = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(KEY) : null),
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
}
```

### `lib/api.ts`

```ts
import axios from "axios"
import { tokenStorage } from "@/lib/tokens"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
})

// Injeta Bearer token em toda requisição
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Trata 401 globalmente — limpa token e redireciona pro login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      tokenStorage.clear()
      window.location.href = "/login"
    }
    return Promise.reject(err)
  },
)
```

### `lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(date))
}

export function formatRelative(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return "hoje"
  if (days === 1) return "ontem"
  return `há ${days} dias`
}
```

---

## 5. Auth Store — Zustand

### `store/auth.store.ts`

```ts
import { create } from "zustand"
import { tokenStorage } from "@/lib/tokens"

interface AuthUser {
  id: string
  nome: string
  email: string
  role: string
  companyId: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    tokenStorage.set(token)
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    tokenStorage.clear()
    set({ user: null, token: null, isAuthenticated: false })
  },

  // Chama uma vez no mount do AuthProvider pra reidratar do localStorage
  hydrate: () => {
    const token = tokenStorage.get()
    if (!token) return
    // Valida token no backend — GET /auth/me
    import("@/services/auth.service").then(({ authService }) => {
      authService.me().then((user) => {
        set({ user, token, isAuthenticated: true })
      }).catch(() => {
        tokenStorage.clear()
      })
    })
  },
}))
```

### `hooks/useAuth.ts`

```ts
import { useAuthStore } from "@/store/auth.store"

export function useAuth() {
  return useAuthStore((s) => ({
    user: s.user,
    isAuthenticated: s.isAuthenticated,
    setAuth: s.setAuth,
    clearAuth: s.clearAuth,
  }))
}
```

---

## 6. Services (camada de acesso à API)

Todas as funções retornam o `data` já tipado. Erros são relançados pra o React Query ou pra o catch do form tratar.

### `services/auth.service.ts`

```ts
import { api } from "@/lib/api"

export interface AuthUser {
  id: string; nome: string; email: string; role: string; companyId: string
}

export const authService = {
  async signup(body: { nome: string; email: string; password: string; razaoSocial: string; cnpj: string }) {
    const { data } = await api.post<{ ok: true; data: { token: string; user: AuthUser } }>("/auth/signup", body)
    return data.data
  },

  async login(body: { email: string; password: string }) {
    const { data } = await api.post<{ ok: true; data: { token: string; user: AuthUser } }>("/auth/login", body)
    return data.data
  },

  async me() {
    const { data } = await api.get<{ ok: true; data: AuthUser }>("/auth/me")
    return data.data
  },
}
```

### `services/job.service.ts`

```ts
import { api } from "@/lib/api"

export interface Job {
  id: string
  titulo: string
  status: string
  liderId: string | null
  jdGerada: string | null
  salaryMin: number | null
  salaryMax: number | null
  perfilIdealJson: unknown
  publicToken: string | null
  createdAt: string
  _count?: { candidates: number }
}

export const jobService = {
  async list() {
    const { data } = await api.get<{ ok: true; data: Job[] }>("/jobs")
    return data.data
  },

  async getById(id: string) {
    const { data } = await api.get<{ ok: true; data: Job }>(`/jobs/${id}`)
    return data.data
  },

  async create(body: { titulo: string; liderId?: string; motivo?: string; responsabilidades?: string; metas?: string }) {
    const { data } = await api.post<{ ok: true; data: Job }>("/jobs", body)
    return data.data
  },

  async update(id: string, body: Partial<Job>) {
    const { data } = await api.patch<{ ok: true; data: Job }>(`/jobs/${id}`, body)
    return data.data
  },

  async generateJd(id: string) {
    const { data } = await api.post<{ ok: true; data: { jdGerada: string } }>(`/jobs/${id}/generate-jd`)
    return data.data
  },

  async generateMatch(id: string) {
    const { data } = await api.post<{ ok: true; data: unknown }>(`/jobs/${id}/match`)
    return data.data
  },

  async delete(id: string) {
    await api.delete(`/jobs/${id}`)
  },
}
```

> Seguir o mesmo padrão para `company.service.ts`, `organograma.service.ts`, `candidate.service.ts`, `test.service.ts`.

---

## 7. TanStack Query — Providers e Hooks

### `components/providers/QueryProvider.tsx`

```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,       // 1 min
        retry: 1,
      },
    },
  }))

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

### `hooks/useJobs.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { jobService } from "@/services/job.service"
import { toast } from "sonner"

export const jobKeys = {
  all: ["jobs"] as const,
  detail: (id: string) => ["jobs", id] as const,
}

export function useJobs() {
  return useQuery({
    queryKey: jobKeys.all,
    queryFn: jobService.list,
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: jobService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.all })
      toast.success("Vaga criada")
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? "Erro ao criar vaga")
    },
  })
}

export function useGenerateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => jobService.generateMatch(jobId),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) })
      toast.success("Relatório gerado")
    },
    onError: () => toast.error("Erro ao gerar relatório"),
  })
}
```

---

## 8. Layout Root e AuthGuard

### `app/layout.tsx`

```tsx
import { Inter, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { QueryProvider } from "@/components/providers/QueryProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-loaded" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-loaded" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

### `app/(app)/layout.tsx`

```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      // espera a hidratação antes de redirecionar
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().isAuthenticated) {
          router.replace("/login")
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return null  // evita flash

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-bg">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### `components/layout/Sidebar.tsx`

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Briefcase, Users, GitBranch,
  MessageSquare, Settings, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vagas", href: "/vagas", icon: Briefcase },
  { label: "Organograma", href: "/organograma", icon: GitBranch },
  { label: "Chat IA", href: "/chat", icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, clearAuth } = useAuth()
  const router = useRouter()

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  return (
    <aside className="flex flex-col border-r border-border bg-bg-elevated h-screen sticky top-0">
      {/* workspace */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-sm font-semibold truncate">{user?.nome}</p>
        <p className="text-xs text-fg-muted truncate">{user?.email}</p>
      </div>

      {/* nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-fg-muted hover:text-fg hover:bg-bg-subtle",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* footer */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg-muted hover:text-danger hover:bg-danger/5 w-full transition-colors"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
```

---

## 9. Design System — `app/globals.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", monospace;

  /* Cores em OKLCH */
  --color-bg:           oklch(99% 0.005 240);
  --color-bg-elevated:  oklch(100% 0 0);
  --color-bg-subtle:    oklch(97% 0.005 240);
  --color-border:       oklch(92% 0.005 240);
  --color-border-strong:oklch(85% 0.008 240);

  --color-fg:           oklch(20% 0.02 240);
  --color-fg-muted:     oklch(45% 0.015 240);
  --color-fg-subtle:    oklch(60% 0.012 240);

  --color-primary:      oklch(48% 0.13 195);   /* verde-azulado denso */
  --color-primary-hover:oklch(42% 0.13 195);
  --color-primary-fg:   oklch(98% 0.01 195);

  --color-accent:       oklch(72% 0.17 70);    /* âmbar quente */
  --color-accent-fg:    oklch(20% 0.05 70);

  --color-success:      oklch(58% 0.15 150);
  --color-warn:         oklch(72% 0.15 80);
  --color-danger:       oklch(55% 0.20 25);

  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  10px;
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: var(--font-sans);
    font-feature-settings: "cv11", "ss01";
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: oklch(80% 0.10 195); }
}

@layer utilities {
  .text-mono {
    font-family: var(--font-mono);
    font-feature-settings: "tnum";
  }
}
```

---

## 10. Auth — Login e Cadastro

### `app/(marketing)/login/page.tsx`

```tsx
"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { toast } from "sonner"
import Link from "next/link"

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [pending, startTransition] = useTransition()

  const form = useForm({ resolver: zodResolver(schema) })

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      try {
        const { user, token } = await authService.login(values)
        setAuth(user, token)
        router.push("/dashboard")
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        toast.error(msg ?? "Credenciais inválidas")
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm p-8 bg-bg-elevated rounded-lg border border-border">
        <h1 className="text-xl font-semibold mb-6">Entrar</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl><Input type="email" placeholder="voce@empresa.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl><Input type="password" placeholder="••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-sm text-center text-fg-muted">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-primary underline">Criar agora</Link>
        </p>
      </div>
    </div>
  )
}
```

### `app/(marketing)/cadastro/page.tsx`

Mesma estrutura do login, com campos extras: `nome`, `razaoSocial`, `cnpj`. Após sucesso chama `authService.signup`, grava token no store, redireciona pra `/onboarding/etapa-1`.

---

## 11. Onboarding

### Layout com Stepper (`app/(app)/onboarding/layout.tsx`)

```tsx
"use client"

import { usePathname } from "next/navigation"
import { WizardStepper } from "@/components/onboarding/WizardStepper"

const steps = [
  { id: 1, label: "Empresa", path: "/onboarding/etapa-1" },
  { id: 2, label: "Organograma", path: "/onboarding/etapa-2" },
  { id: 3, label: "Colaboradores", path: "/onboarding/etapa-3" },
  { id: 4, label: "Contexto", path: "/onboarding/etapa-4" },
]

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const current = steps.find((s) => pathname.includes(s.path.split("/")[2]))?.id ?? 1

  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <WizardStepper steps={steps} current={current} />
      <div className="mt-10">{children}</div>
    </div>
  )
}
```

### `components/onboarding/WizardStepper.tsx`

```tsx
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step { id: number; label: string; path: string }

export function WizardStepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = current > step.id
        const active = current === step.id
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "size-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors",
                done && "bg-primary border-primary text-primary-fg",
                active && "border-primary text-primary bg-bg",
                !done && !active && "border-border text-fg-muted",
              )}>
                {done ? <Check className="size-3.5" /> : step.id}
              </div>
              <span className={cn(
                "text-xs whitespace-nowrap",
                active ? "text-fg font-medium" : "text-fg-muted",
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-px mx-2 mb-5 transition-colors",
                done ? "bg-primary" : "bg-border",
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### Etapa 1 — Dados Cadastrais

Campos: Razão Social, CNPJ (mask), CEP + ViaCEP lookup, Logradouro, Número, Complemento, Cidade, Estado, Logo (upload), URL da empresa (opcional).

**`hooks/useViaCep.ts`**

```ts
"use client"
import { useState } from "react"

export function useViaCep() {
  const [loading, setLoading] = useState(false)

  async function lookup(cep: string) {
    const cleaned = cep.replace(/\D/g, "")
    if (cleaned.length !== 8) return null
    setLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      const data = await res.json()
      if (data.erro) return null
      return {
        logradouro: data.logradouro as string,
        bairro: data.bairro as string,
        cidade: data.localidade as string,
        estado: data.uf as string,
      }
    } finally {
      setLoading(false)
    }
  }

  return { lookup, loading }
}
```

**Upload de logo:** `fetch` pra `POST /upload` com `FormData` (kind=logo). A URL retornada vai no `PATCH /company`.

### Etapa 2 — Organograma

UI: lista indentada read-only à direita + botão "+ Adicionar pessoa" que abre Dialog.

Campos do Dialog: Nome, Cargo, Departamento, E-mail, Líder direto (Select com todos os nodes existentes).

Ao salvar: `POST /organograma`. Ao fechar: `PATCH /company/onboarding/2`.

**`components/onboarding/OrganogramaTree.tsx`**

```tsx
interface Node {
  id: string; nome: string; cargo: string; parentId: string | null
  children?: Node[]
}

function buildTree(flat: Node[]): Node[] {
  const map = new Map(flat.map((n) => [n.id, { ...n, children: [] as Node[] }]))
  const roots: Node[] = []
  for (const n of map.values()) {
    n.parentId ? map.get(n.parentId)?.children?.push(n) : roots.push(n)
  }
  return roots
}

function NodeRow({ node, depth }: { node: Node; depth: number }) {
  return (
    <div>
      <div className="flex items-center justify-between py-2 border-b border-border"
           style={{ paddingLeft: depth * 24 + 8 }}>
        <div>
          <p className="text-sm font-medium">{node.nome}</p>
          <p className="text-xs text-fg-muted">{node.cargo}</p>
        </div>
      </div>
      {node.children?.map((c) => <NodeRow key={c.id} node={c} depth={depth + 1} />)}
    </div>
  )
}

export function OrganogramaTree({ nodes }: { nodes: Node[] }) {
  const tree = buildTree(nodes)
  return (
    <div className="rounded-md border border-border overflow-hidden">
      {tree.map((n) => <NodeRow key={n.id} node={n} depth={0} />)}
    </div>
  )
}
```

### Etapa 3 — Testes dos Colaboradores

Tabs "Já tenho resultados" / "Ainda não tenho".

- **Já tenho:** inputs DISC/Eneagrama/MBTI por colaborador.
- **Ainda não tenho:** botão "Copiar link" por colaborador. Chama `POST /organograma/:id/test-link` (ou endpoint equivalente) e copia o token pra área de transferência com `CopyButton`.

### Etapa 4 — Contexto da Empresa

Radio cards visuais: Startup / Consolidada / Reestruturação / Outro.
Textarea (min 100 chars, contador embaixo).
Tags input pra valores (chips).
Textareas pra desafios e estilo de liderança.

Submit → `PATCH /company` com todos os dados → `PATCH /company/onboarding/4` → `router.push("/dashboard")`.

---

## 12. Dashboard

```tsx
"use client"

import { useJobs } from "@/hooks/useJobs"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { data: jobs = [], isLoading } = useJobs()
  const user = useAuthStore((s) => s.user)

  const abertas = jobs.filter((j) => j.status === "aberta").length
  const totalCandidatos = jobs.reduce((acc, j) => acc + (j._count?.candidates ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {user?.nome?.split(" ")[0]}
        </h1>
        <p className="text-sm text-fg-muted mt-1">Painel de recrutamento</p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-6">
        {[
          { label: "Vagas abertas", value: abertas },
          { label: "Candidatos totais", value: totalCandidatos },
          { label: "Análises geradas", value: jobs.filter((j) => j.perfilIdealJson).length },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 p-5 border border-border rounded-lg bg-bg-elevated">
            <p className="text-xs text-fg-muted uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-semibold text-mono mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* CTA + lista */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Vagas em andamento</h2>
        <Button asChild>
          <Link href="/vagas/nova">+ Nova Vaga</Link>
        </Button>
      </div>

      {/* lista inline de vagas recentes */}
    </div>
  )
}
```

---

## 13. Vagas — Lista e Criação

### Lista (`app/(app)/vagas/page.tsx`)

```tsx
"use client"

import { useJobs } from "@/hooks/useJobs"
import { Badge } from "@/components/ui/badge"
import { formatRelative } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/layout/EmptyState"
import { Briefcase } from "lucide-react"

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  rascunho: { label: "Rascunho", variant: "outline" },
  aberta: { label: "Aberta", variant: "default" },
  fechada: { label: "Fechada", variant: "secondary" },
}

export default function VagasPage() {
  const { data: jobs, isLoading } = useJobs()

  if (isLoading) return (
    <div className="space-y-2">
      {[1,2,3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
    </div>
  )

  if (!jobs?.length) return (
    <EmptyState
      icon={Briefcase}
      title="Nenhuma vaga criada"
      description="Crie sua primeira vaga e comece a analisar candidatos com IA."
      action={{ label: "+ Nova Vaga", href: "/vagas/nova" }}
    />
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Vagas</h1>
        <Button asChild><Link href="/vagas/nova">+ Nova Vaga</Link></Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        {jobs.map((job) => {
          const s = statusLabel[job.status] ?? statusLabel.rascunho
          return (
            <Link
              key={job.id}
              href={`/vagas/${job.id}`}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-bg-subtle transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{job.titulo}</p>
                <p className="text-xs text-fg-muted">{formatRelative(job.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-fg-muted text-mono">
                  {job._count?.candidates ?? 0} candidatos
                </span>
                <Badge variant={s.variant}>{s.label}</Badge>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

### Fluxo A — Com IA (`app/(app)/vagas/nova/com-ia/page.tsx`)

1. Form: Cargo, Líder (Select do organograma), Motivo, Responsabilidades, Metas
2. Submit → `POST /jobs` → `POST /jobs/:id/generate-jd` (loading skeleton 8-15s)
3. Exibe `JdPreview` com o conteúdo gerado
4. Botão "Publicar" → `PATCH /jobs/:id` com status "aberta" → vai pra `/vagas/:id`

### Fluxo B — Manual (`app/(app)/vagas/nova/manual/page.tsx`)

1. Form da vaga (mesmos campos)
2. Abaixo: `CandidatesRepeater` com botão "+ Adicionar candidato"
3. Cada candidato: Nome, E-mail, LinkedIn, CV (upload), Resultados dos testes (inputs ou textarea)
4. Botão "Ver Match" → `POST /jobs` → adiciona candidatos via `POST /jobs/:id/candidates` → `POST /jobs/:id/match`
5. Loading com skeleton (pode demorar 15-30s) → vai pra `/vagas/:id` com relatório pronto

---

## 14. Relatório de Match (`app/(app)/vagas/[id]/page.tsx`)

Layout em 2 colunas:

```tsx
"use client"

import { useState } from "react"
import { useJob } from "@/hooks/useJobs"
import { RankingSidebar } from "@/components/relatorio/RankingSidebar"
import { CandidateAnalysis } from "@/components/relatorio/CandidateAnalysis"
import { useGenerateMatch } from "@/hooks/useJobs"
import { Button } from "@/components/ui/button"

export default function VagaDetailPage({ params }: { params: { id: string } }) {
  const { data: job, isLoading } = useJob(params.id)
  const generateMatch = useGenerateMatch()
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)

  if (isLoading) return <div>Carregando...</div>
  if (!job) return <div>Vaga não encontrada</div>

  const matches = (job as unknown as { matches?: { candidateId: string; rankingPosition: number; matchScore: number; relatorioJson: unknown }[] })?.matches ?? []
  const selected = matches.find((m) => m.candidateId === selectedCandidateId) ?? matches[0]

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.titulo}</h1>
          <p className="text-sm text-fg-muted">{matches.length} candidatos analisados</p>
        </div>
        {matches.length === 0 && (
          <Button
            onClick={() => generateMatch.mutate(params.id)}
            disabled={generateMatch.isPending}
          >
            {generateMatch.isPending ? "Analisando..." : "Gerar Match com IA"}
          </Button>
        )}
      </div>

      {/* 2 colunas */}
      {matches.length > 0 && (
        <div className="flex gap-6 min-h-[600px]">
          <RankingSidebar
            matches={matches}
            selectedId={selected?.candidateId}
            onSelect={setSelectedCandidateId}
          />
          {selected && <CandidateAnalysis report={selected.relatorioJson} />}
        </div>
      )}
    </div>
  )
}
```

### `components/relatorio/RankingSidebar.tsx`

```tsx
import { cn } from "@/lib/utils"

interface Match {
  candidateId: string
  rankingPosition: number
  matchScore: number
  relatorioJson: unknown
}

export function RankingSidebar({
  matches, selectedId, onSelect,
}: {
  matches: Match[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="w-64 shrink-0 border border-border rounded-lg overflow-hidden self-start sticky top-6">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Ranking</p>
      </div>
      {matches
        .sort((a, b) => a.rankingPosition - b.rankingPosition)
        .map((match) => {
          const report = match.relatorioJson as { resumoExecutivo?: string }
          const active = match.candidateId === selectedId
          return (
            <button
              key={match.candidateId}
              onClick={() => onSelect(match.candidateId)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 border-b border-border last:border-0 transition-colors text-left",
                active ? "bg-primary/8" : "hover:bg-bg-subtle",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-fg-muted text-mono w-4">
                  {match.rankingPosition}
                </span>
                <span className="text-sm font-medium truncate max-w-[110px]">
                  {(match.relatorioJson as Record<string, unknown>)?.nome as string ?? "Candidato"}
                </span>
              </div>
              <span className={cn(
                "text-mono text-sm font-semibold tabular-nums",
                match.matchScore >= 75 ? "text-success" :
                match.matchScore >= 50 ? "text-warn" : "text-danger",
              )}>
                {match.matchScore}
              </span>
            </button>
          )
        })}
    </div>
  )
}
```

### `components/relatorio/CandidateAnalysis.tsx`

Layout editorial — coluna única, hierarquia tipográfica.

```tsx
import type { MatchReport } from "@/types/api"
import { PointsList } from "./PointsList"
import { DesafioCard } from "./DesafioCard"
import { ScoreNumeral } from "./ScoreNumeral"

export function CandidateAnalysis({ report }: { report: unknown }) {
  const r = report as MatchReport["candidates"][0]

  return (
    <div className="flex-1 space-y-8 max-w-2xl">
      {/* score hero */}
      <div className="flex items-start gap-6">
        <ScoreNumeral value={r.matchScore} />
        <div>
          <p className="text-lg font-semibold">{r.resumoExecutivo}</p>
        </div>
      </div>

      <Section title="Pontos fortes">
        <PointsList items={r.pontosFortes} variant="positive" />
      </Section>

      <Section title="Pontos de atenção">
        <PointsList items={r.pontosAtencao} variant="warning" />
      </Section>

      <Section title="Como liderar esse candidato">
        <div className="space-y-3">
          <Item label="Delegação" value={r.comoLiderarEsseCandidato.delegacao} />
          <Item label="Feedback" value={r.comoLiderarEsseCandidato.feedback} />
          <Item label="Motivação" value={r.comoLiderarEsseCandidato.motivacao} />
        </div>
      </Section>

      <Section title="Match com a cultura">
        <Item label="Onde encaixa" value={r.matchComCultura.onde} />
        <Item label="Fricção esperada" value={r.matchComCultura.fricaoEsperada} />
      </Section>

      {r.perguntasComplementares.length > 0 && (
        <Section title="Perguntas para entrevista">
          <ol className="list-decimal list-inside space-y-1.5">
            {r.perguntasComplementares.map((q, i) => (
              <li key={i} className="text-sm">{q}</li>
            ))}
          </ol>
        </Section>
      )}

      <DesafioCard desafio={r.desafioPratico} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted border-b border-border pb-1.5">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-fg-muted font-medium">{label}</p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  )
}
```

---

## 15. Chat com Streaming SSE

### `hooks/useChatStream.ts`

```ts
"use client"

import { useState } from "react"
import { tokenStorage } from "@/lib/tokens"

export function useChatStream() {
  const [streaming, setStreaming] = useState(false)
  const [partial, setPartial] = useState("")

  async function send(
    jobId: string | null,
    message: string,
    onDone: (full: string) => void,
  ) {
    setStreaming(true)
    setPartial("")
    let full = ""

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStorage.get()}`,
      },
      body: JSON.stringify({ jobId, message }),
    })

    if (!res.body) { setStreaming(false); return }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      // parse SSE lines: "data: {...}\n\n"
      const lines = text.split("\n").filter((l) => l.startsWith("data: "))
      for (const line of lines) {
        const raw = line.slice(6)
        if (raw === "[DONE]") break
        try {
          const { chunk } = JSON.parse(raw) as { chunk: string }
          full += chunk
          setPartial(full)
        } catch { /* ignora linhas malformadas */ }
      }
    }

    setStreaming(false)
    onDone(full)
  }

  return { streaming, partial, send }
}
```

### `components/chat/ChatSheet.tsx`

```tsx
"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { useChatStream } from "@/hooks/useChatStream"

interface Message { role: "user" | "assistant"; content: string }

export function ChatSheet({ jobId }: { jobId?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const { streaming, partial, send } = useChatStream()

  async function handleSend(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text }])

    await send(jobId ?? null, text, (full) => {
      setMessages((prev) => [...prev, { role: "assistant", content: full }])
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 size-12 rounded-full shadow-lg"
        >
          <MessageSquare className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-[420px] p-0">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="text-sm">Assistente de RH</SheetTitle>
        </SheetHeader>

        <MessageList
          messages={messages}
          streaming={streaming}
          partial={partial}
        />

        <ChatInput onSend={handleSend} disabled={streaming} />
      </SheetContent>
    </Sheet>
  )
}
```

---

## 16. Portal do Candidato — `/teste/[token]`

**Mobile-first.** Layout sem sidebar. Consome `GET /public/tests/:token` pra pegar perguntas e meta da empresa. Submete via `POST /public/tests/:token/submit`.

### `app/teste/[token]/layout.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface CompanyMeta { companyName: string; companyLogo?: string }

export default function TestLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { token: string }
}) {
  const [meta, setMeta] = useState<CompanyMeta | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/tests/${params.token}`)
      .then((r) => r.json())
      .then((res) => setMeta(res.data))
      .catch(() => {})
  }, [params.token])

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="px-4 py-3 border-b border-border flex items-center justify-center">
        {meta?.companyLogo ? (
          <Image src={meta.companyLogo} alt={meta.companyName} height={32} width={120} className="h-8 w-auto object-contain" />
        ) : (
          <p className="text-sm font-semibold">{meta?.companyName}</p>
        )}
      </header>
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {children}
      </main>
      <footer className="py-3 text-center text-xs text-fg-subtle border-t border-border">
        Avaliação fornecida via RH Match
      </footer>
    </div>
  )
}
```

### Fluxo dos Testes

O estado de todas as respostas fica em `sessionStorage` (pra sobreviver refresh sem login). Cada página de teste (`/disc`, `/eneagrama`, `/personalidades`) carrega as perguntas do contexto, registra respostas localmente e navega pra próxima etapa.

Na página `/personalidades`, após concluir, faz `POST /public/tests/:token/submit` com todas as respostas e redireciona pra `/concluido`.

### `components/testes/DiscQuestion.tsx`

```tsx
"use client"

interface DiscOption { id: string; text: string; dimension: string }
interface DiscQuestionData { id: string; index: number; options: DiscOption[] }

interface Props {
  question: DiscQuestionData
  most: string | null
  least: string | null
  onChange: (most: string | null, least: string | null) => void
}

export function DiscQuestion({ question, most, least, onChange }: Props) {
  return (
    <div className="space-y-3">
      {question.options.map((opt) => (
        <div key={opt.id} className="flex items-center gap-4 p-3 border border-border rounded-md bg-bg-elevated">
          <span className="flex-1 text-sm">{opt.text}</span>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`most-${question.id}`}
                checked={most === opt.id}
                onChange={() => onChange(opt.id, least === opt.id ? null : least)}
                className="accent-primary"
              />
              <span className="text-xs text-fg-muted">Mais</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`least-${question.id}`}
                checked={least === opt.id}
                onChange={() => onChange(most === opt.id ? null : most, opt.id)}
                className="accent-primary"
              />
              <span className="text-xs text-fg-muted">Menos</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### `components/testes/EneagramaQuestion.tsx` / `PersonalityQuestion.tsx`

Escala Likert 1-5 com radio buttons grandes e touch-friendly:

```tsx
"use client"

const SCALE = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" },
]

interface Props {
  questionId: string
  text: string
  value: number | null
  onChange: (value: number) => void
}

export function ScaleQuestion({ questionId, text, value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium leading-relaxed">{text}</p>
      <div className="grid grid-cols-5 gap-2">
        {SCALE.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-md border text-xs transition-colors
              ${value === s.value
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border bg-bg-elevated text-fg-muted hover:border-primary/40"}
            `}
          >
            <span className="text-base font-semibold">{s.value}</span>
            <span className="hidden sm:block text-center leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### `components/testes/TestProgressBar.tsx`

```tsx
interface Props { step: 1 | 2 | 3; current: number; total: number }

const labels = { 1: "DISC", 2: "Eneagrama", 3: "16 Personalidades" }

export function TestProgressBar({ step, current, total }: Props) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="mb-6 space-y-2">
      <div className="flex justify-between text-xs text-fg-muted">
        <span>Etapa {step} de 3 — {labels[step]}</span>
        <span>{current} / {total}</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

---

## 17. Estados Padrão

### Loading

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
      ))}
    </div>
  )
}
```

### Vazio

```tsx
import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  icon?: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-bg-subtle p-3 border border-border">
          <Icon className="size-5 text-fg-muted" />
        </div>
      )}
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted max-w-sm">{description}</p>
      {action && (
        <Button asChild className="mt-6">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
```

### Erro Global

```tsx
// app/(app)/error.tsx
"use client"
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <h2 className="text-lg font-medium">Algo deu errado</h2>
      <p className="mt-1 text-sm text-fg-muted">Tente novamente ou recarregue a página.</p>
      <button onClick={reset} className="mt-4 text-sm text-primary underline">
        Tentar de novo
      </button>
    </div>
  )
}
```

---

## 18. Tipos da API (`types/api.ts`)

```ts
export interface ApiResponse<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: string
  fieldErrors?: Record<string, string[]>
}

export interface Job {
  id: string; titulo: string; status: string
  liderId: string | null; jdGerada: string | null
  salaryMin: number | null; salaryMax: number | null
  perfilIdealJson: unknown; publicToken: string | null
  createdAt: string
  candidates?: Candidate[]
  matches?: MatchReportRow[]
  _count?: { candidates: number }
}

export interface Candidate {
  id: string; nome: string; email: string
  linkedinUrl: string | null; cvUrl: string | null
  testCompletedAt: string | null; createdAt: string
}

export interface MatchReportRow {
  id: string; jobId: string; candidateId: string
  rankingPosition: number; matchScore: number
  relatorioJson: MatchReport["candidates"][0]
  createdAt: string
}

export interface MatchReport {
  candidates: Array<{
    candidateId: string
    rankingPosition: number
    matchScore: number
    resumoExecutivo: string
    pontosFortes: Array<{ titulo: string; descricao: string; impactoNaFuncao: string }>
    pontosAtencao: Array<{ titulo: string; descricao: string; sugestaoDeDesenvolvimento: string }>
    comoLiderarEsseCandidato: { delegacao: string; feedback: string; motivacao: string }
    matchComCultura: { onde: string; fricaoEsperada: string }
    perguntasComplementares: string[]
    desafioPratico: { titulo: string; descricao: string; duracaoEstimada: string; habilidadesAvaliadas: string[] }
  }>
}

export interface OrganogramaNode {
  id: string; nome: string; cargo: string
  departamento: string | null; email: string | null
  parentId: string | null; companyId: string
}
```

---

## 19. Checklist — Ordem de Execução

### Setup
- [ ] `create-next-app` + alias `@/*`
- [ ] shadcn init + componentes (seção 2)
- [ ] Instalar deps (tanstack-query, zustand, axios, etc.)
- [ ] `globals.css` com tokens OKLCH
- [ ] `lib/api.ts` com Axios + interceptors
- [ ] `lib/tokens.ts`
- [ ] `lib/utils.ts` com `cn()`
- [ ] `store/auth.store.ts`
- [ ] `components/providers/QueryProvider.tsx`
- [ ] `app/layout.tsx` root com fontes + QueryProvider + Toaster
- [ ] `.env.local` com `NEXT_PUBLIC_API_URL`

### Auth
- [ ] `app/(marketing)/login/page.tsx`
- [ ] `app/(marketing)/cadastro/page.tsx`
- [ ] `services/auth.service.ts`
- [ ] `hooks/useAuth.ts`
- [ ] `app/(app)/layout.tsx` com AuthGuard + Sidebar

### Layout
- [ ] `components/layout/Sidebar.tsx`
- [ ] `components/layout/Topbar.tsx`
- [ ] `components/layout/EmptyState.tsx`
- [ ] `app/(app)/error.tsx`

### Onboarding
- [ ] `components/onboarding/WizardStepper.tsx`
- [ ] Etapa 1 — DadosCadastraisForm + ViaCEP + upload logo
- [ ] Etapa 2 — OrganogramaForm + OrganogramaTree
- [ ] Etapa 3 — ColaboradoresTestes
- [ ] Etapa 4 — ContextoEmpresaForm

### Dashboard
- [ ] `app/(app)/dashboard/page.tsx`

### Vagas
- [ ] `hooks/useJobs.ts`
- [ ] `services/job.service.ts`
- [ ] `app/(app)/vagas/page.tsx` (lista com tabela densa)
- [ ] `app/(app)/vagas/nova/page.tsx` (escolha de fluxo)
- [ ] `nova/com-ia/page.tsx` + JdPreview
- [ ] `nova/manual/page.tsx` + CandidatesRepeater

### Relatório
- [ ] `app/(app)/vagas/[id]/page.tsx`
- [ ] `RankingSidebar.tsx`
- [ ] `CandidateAnalysis.tsx`
- [ ] `ScoreNumeral.tsx`, `PointsList.tsx`, `DesafioCard.tsx`

### Chat
- [ ] `hooks/useChatStream.ts`
- [ ] `ChatSheet.tsx` + `MessageList.tsx` + `ChatInput.tsx`

### Portal do Candidato
- [ ] `app/teste/[token]/layout.tsx`
- [ ] `app/teste/[token]/page.tsx` (boas-vindas + LGPD)
- [ ] `TestProgressBar.tsx`
- [ ] `DiscQuestion.tsx`
- [ ] `ScaleQuestion.tsx` (enea + 16p)
- [ ] `TestNav.tsx`
- [ ] `concluido/page.tsx`

### Tipos e Services
- [ ] `types/api.ts`
- [ ] `services/company.service.ts`
- [ ] `services/organograma.service.ts`
- [ ] `services/candidate.service.ts`
- [ ] `services/test.service.ts`

---

## 20. Cortes Conscientes

- Sem Server Actions — tudo via REST com fetch/Axios
- Sem NextAuth — JWT puro no localStorage
- Sem drag-and-drop no organograma — formulário hierárquico com Select
- Sem salvamento questão a questão nos testes — salva no final de cada etapa
- Sem PDF do resultado — stretch goal
- Sem dark mode — stretch goal
- Sem i18n — tudo PT-BR
- Sem paginação nas listas — MVP tem volume baixo

---

**Fim do PLANNING-FRONTEND.**