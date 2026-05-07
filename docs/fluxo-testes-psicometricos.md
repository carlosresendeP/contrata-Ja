# Fluxo — Testes Psicométricos

## Para que serve

Após um candidato se inscrever em uma vaga, a empresa pode enviar um link de teste
para ele responder DISC, Eneagrama e/ou Personalidade (MBTI simplificado).
Os resultados ficam salvos no candidato e avançam o status da candidatura para `TESTE_PSICOMETRICO`.

---

## Passo a passo para testar

### 1. Gerar o link de teste (empresa autenticada)

```
POST http://localhost:3001/api/applications/:id/test-link
Authorization: Bearer <token>
```

> Sem body — substitua `:id` pelo `id` da candidatura.

Resposta:
```json
{
  "ok": true,
  "data": {
    "url": "http://localhost:3001/api/public/tests/<token>",
    "expiresAt": "14/05/2026 22:00"
  }
}
```

> O link expira em 7 dias. Envie a `url` para o candidato.

---

### 2. Candidato acessa o teste (rota pública — sem token)

```
GET http://localhost:3001/api/public/tests/<token>
```

Retorna os dados da candidatura e do candidato para montar o formulário.

---

### 3. Candidato envia as respostas (rota pública — sem token)

```
POST http://localhost:3001/api/public/tests/<token>/submit

{
  "disc": {
    "q1": "D",
    "q2": "I",
    "q3": "S"
  },
  "eneagrama": {
    "q1": 3,
    "q2": 7
  },
  "personalities": {
    "q1": "E",
    "q2": "N",
    "q3": "T",
    "q4": "J"
  }
}
```

> Os três campos (`disc`, `eneagrama`, `personalities`) são opcionais —
> pode enviar só um ou todos.

Após o submit:
- Resultados salvos em `Candidate.respostasJson`
- `Candidate.testCompletedAt` preenchido com a data/hora
- Status da candidatura avança para `TESTE_PSICOMETRICO`
- Token invalidado (não pode ser reusado)

---

## O que é a pasta `dist/`

A pasta `dist/` é gerada pelo comando `npm run build` (usa o `tsup`).
Ela contém o código TypeScript **compilado para JavaScript** pronto para produção.

| Ambiente | Comando | Pasta |
|---|---|---|
| Desenvolvimento | `npm run dev` | `src/` (tsx compila on-the-fly) |
| Produção | `npm run build` + `npm start` | `dist/` (JS compilado) |

> Em desenvolvimento você nunca precisa olhar ou mexer no `dist/`.
> Ela só importa no deploy (Railway, Render, etc.).
