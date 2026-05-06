# Rotas disponíveis na API

Base URL: `http://localhost:3001/api`

---

## Health Check

**GET** `http://localhost:3001/api/health`
> Sem body

---

## Auth

**POST** `http://localhost:3001/api/register`
```json
{
  "nome": "Carlos Silva",
  "email": "carlos@empresa.com",
  "password": "123456",
  "razaoSocial": "Empresa Teste LTDA",
  "cnpj": "12345678000190"
}
```

**POST** `http://localhost:3001/api/login`
```json
{
  "email": "carlos@empresa.com",
  "password": "123456"
}
```

**GET** `http://localhost:3001/api/me`
> Sem body — requer Bearer token no header

---

## Company

**GET** `http://localhost:3001/api/company`
> Sem body — requer Bearer token

**PATCH** `http://localhost:3001/api/company`
```json
{
  "razaoSocial": "Empresa Atualizada LTDA",
  "contextoEmpresa": "Empresa de tecnologia em fase de crescimento acelerado.",
  "perfilRitmo": "Acelerado",
  "valores": ["inovação", "transparência", "resultado"],
  "logoUrl": "https://minha-empresa.com/logo.png"
}
```

**PATCH** `http://localhost:3001/api/company/onboarding/:step`
> Substitua `:step` pelo número da etapa (1, 2, 3 ou 4)
```json
{
  "onboardingStep": 2
}
```

---

## Jobs

**POST** `http://localhost:3001/api/jobs`
```json
{
  "titulo": "Desenvolvedor Full Stack",
  "descricao": "Responsável por desenvolver e manter as aplicações da empresa.",
  "requisitos": "Node.js, React, PostgreSQL",
  "salaryMin": 5000,
  "salaryMax": 8000
}
```

**GET** `http://localhost:3001/api/jobs`
> Sem body — requer Bearer token

**GET** `http://localhost:3001/api/jobs/:id`
> Sem body — substitua `:id` pelo UUID da vaga

**PATCH** `http://localhost:3001/api/jobs/:id`
```json
{
  "titulo": "Desenvolvedor Full Stack Sênior",
  "status": "FECHADA",
  "salaryMax": 10000
}
```

---

## Applications

**POST** `http://localhost:3001/api/applications/apply`
```json
{
  "jobId": "uuid-da-vaga-aqui",
  "nome": "João Candidato",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "curriculoUrl": "https://linkedin.com/in/joao"
}
```

**GET** `http://localhost:3001/api/applications/company`
> Sem body — requer Bearer token

**GET** `http://localhost:3001/api/applications/job/:jobId`
> Sem body — substitua `:jobId` pelo UUID da vaga

**PATCH** `http://localhost:3001/api/applications/:id/status`
```json
{
  "status": "EM_ANALISE"
}
```
> Status disponíveis: `PENDENTE` | `EM_ANALISE` | `TESTE_PSICOMETRICO` | `ENTREVISTA` | `APROVADO` | `REPROVADO`
