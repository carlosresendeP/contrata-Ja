"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Building2, ImageIcon, Rocket, TrendingUp, Landmark, Briefcase, Save, X, Plus, User, CreditCard, Crown, Upload, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useCompany } from "@/hooks/useCompany"
import { useAuthStore } from "@/store/auth.store"
import { companyService } from "@/services/company.service"
import { publicService } from "@/services/public.service"
import { cn } from "@/lib/utils"

// ─── Perfil de Ritmo ──────────────────────────────────────────────────────────

const PERFIS_RITMO = [
  {
    value: "Startup Acelerada",
    icon: Rocket,
    description: "Time enxuto, decisões rápidas e alta tolerância à incerteza.",
  },
  {
    value: "Scale-up em Crescimento",
    icon: TrendingUp,
    description: "Crescimento acelerado com processos sendo estruturados.",
  },
  {
    value: "Corporativo Estável",
    icon: Landmark,
    description: "Processos maduros, hierarquia clara e previsibilidade.",
  },
  {
    value: "Consultoria Dinâmica",
    icon: Briefcase,
    description: "Projetos variados, adaptabilidade e entrega orientada a prazo.",
  },
]

type Tab = "empresa" | "usuarios" | "plano"

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-3 px-1 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors",
        active
          ? "border-sidebar text-sidebar"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

// ─── Empresa Tab ──────────────────────────────────────────────────────────────

function EmpresaTab() {
  const queryClient = useQueryClient()
  const { data: company, isLoading } = useCompany()

  // values= sincroniza automaticamente quando company chega — sem useEffect
  const { control, setValue, reset } = useForm({
    values: {
      nome:        company?.nome        ?? "",
      razaoSocial: company?.razaoSocial ?? "",
      logoUrl:     company?.logoUrl     ?? "",
      valores:     company?.valores     ?? [] as string[],
      perfilRitmo: company?.perfilRitmo ?? "",
    },
  })

  const nome        = useWatch({ control, name: "nome" })
  const razaoSocial = useWatch({ control, name: "razaoSocial" })
  const logoUrl     = useWatch({ control, name: "logoUrl" })
  const valores     = useWatch({ control, name: "valores" })
  const perfilRitmo = useWatch({ control, name: "perfilRitmo" })

  const [novoValor, setNovoValor] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const valorInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef  = useRef<HTMLInputElement>(null)

  async function handleLogoFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const url = await publicService.uploadFile(file)
      setValue("logoUrl", url)
      toast.success("Logo enviado com sucesso!")
    } catch {
      toast.error("Erro ao enviar imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      companyService.update({
        nome:        nome.trim()        || undefined,
        razaoSocial: razaoSocial.trim() || undefined,
        logoUrl:     logoUrl.trim()     || undefined,
        valores,
        perfilRitmo: perfilRitmo        || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] })
      toast.success("Configurações salvas!")
    },
    onError: () => toast.error("Erro ao salvar. Tente novamente."),
  })

  function addValor() {
    const v = novoValor.trim()
    if (!v || valores.includes(v)) return
    setValue("valores", [...valores, v])
    setNovoValor("")
    valorInputRef.current?.focus()
  }

  function removeValor(v: string) {
    setValue("valores", valores.filter((x) => x !== v))
  }

  function handleValorKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addValor()
    }
  }

  function handleCancel() {
    reset()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Logo */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Logotipo da Empresa
        </p>
        <div className="flex gap-4 items-center">
          <div className="size-24 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={96} height={96} className="w-full h-full object-contain p-2" unoptimized />
            ) : (
              <Building2 className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading ? "Enviando..." : "Fazer upload"}
            </Button>
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-xs uppercase tracking-widest text-muted-foreground">
                Ou cole uma URL
              </Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setValue("logoUrl", e.target.value)}
                  placeholder="https://sua-empresa.com/logo.png"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, WebP ou SVG · máx. 5 MB</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Dados básicos */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Informações da Empresa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome" className="text-xs uppercase tracking-widest text-muted-foreground">
              Nome de Exibição
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setValue("nome", e.target.value)}
              placeholder="Ex: MakerStack RH"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="razaoSocial" className="text-xs uppercase tracking-widest text-muted-foreground">
              Razão Social
            </Label>
            <Input
              id="razaoSocial"
              value={razaoSocial}
              onChange={(e) => setValue("razaoSocial", e.target.value)}
              placeholder="MakerStack Tecnologia LTDA"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">CNPJ</Label>
            <Input value={company?.cnpj ?? ""} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Contate o suporte para alterar o CNPJ.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Valores e Cultura */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Valores e Cultura
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          {valores.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {valores.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="gap-1.5 pr-1 text-xs font-medium"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => removeValor(v)}
                    className="size-4 rounded-full hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={valorInputRef}
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
              onKeyDown={handleValorKeyDown}
              placeholder="Adicionar novo valor... (Enter para confirmar)"
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={addValor} className="shrink-0 gap-1">
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Perfil de Ritmo */}
      <section className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Perfil de Ritmo
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            A IA usa essa informação para avaliar o fit cultural dos candidatos com o ritmo da empresa.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERFIS_RITMO.map((p) => {
            const Icon = p.icon
            const selected = perfilRitmo === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setValue("perfilRitmo", selected ? "" : p.value)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                  selected
                    ? "border-sidebar bg-sidebar/10 text-sidebar"
                    : "border-border bg-background hover:border-sidebar/40 hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "size-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  selected ? "bg-sidebar/20" : "bg-muted"
                )}>
                  <Icon className={cn("size-4", selected ? "text-sidebar" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", selected ? "text-sidebar" : "text-foreground")}>
                    {p.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="size-4" />
          {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}

// ─── Usuários Tab ─────────────────────────────────────────────────────────────

function UsuariosTab() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Usuário Administrador
      </p>
      <Card className="border-border shadow-none">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-sidebar/20 flex items-center justify-center shrink-0">
              <User className="size-5 text-sidebar" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.nome ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
              <Badge variant="outline" className="mt-1.5 text-[10px] font-bold uppercase tracking-wider">
                {user?.role ?? "admin"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        <User className="size-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">Convite de usuários em breve</p>
        <p className="text-xs mt-1">Você poderá adicionar recrutadores e gestores ao painel.</p>
      </div>
    </div>
  )
}

// ─── Plano Tab ────────────────────────────────────────────────────────────────

function PlanoTab() {
  return (
    <div className="space-y-6">
      <Card className="border-sidebar/40 bg-sidebar/5 shadow-none">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-sidebar/20 flex items-center justify-center shrink-0">
              <Crown className="size-5 text-sidebar" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground text-lg">Plano Pro</p>
                <Badge className="bg-sidebar text-white text-[10px] font-bold uppercase tracking-wider">
                  Ativo
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Vagas ilimitadas · Análise IA · Testes psicométricos · Organograma
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Vagas ativas", value: "Ilimitadas" },
          { label: "Candidatos analisados", value: "Ilimitados" },
          { label: "Suporte", value: "Prioritário" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-sidebar">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        <CreditCard className="size-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">Gerenciamento de faturamento em breve</p>
        <p className="text-xs mt-1">Histórico de pagamentos e troca de plano estarão disponíveis aqui.</p>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState<Tab>("empresa")

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configurações da Empresa</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie o perfil da sua organização, usuários e detalhes de faturamento.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        <TabBtn active={tab === "empresa"}   onClick={() => setTab("empresa")}>Empresa</TabBtn>
        <TabBtn active={tab === "usuarios"}  onClick={() => setTab("usuarios")}>Usuários</TabBtn>
        <TabBtn active={tab === "plano"}     onClick={() => setTab("plano")}>Plano</TabBtn>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {tab === "empresa"  && <EmpresaTab />}
        {tab === "usuarios" && <UsuariosTab />}
        {tab === "plano"    && <PlanoTab />}
      </div>
    </div>
  )
}
