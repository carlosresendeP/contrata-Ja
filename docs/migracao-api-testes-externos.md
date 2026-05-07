# Migração para API de Testes Externa (futuro)

## Contexto

O MVP usa um motor interno de cálculo (`disc.ts`, `eneagrama.ts`, `personalities.ts`).
Quando o produto exigir testes com validação científica certificada (ex: Assessments 24x7,
White Label DISC), a troca é cirúrgica — só muda o `testService.ts`.

---

## O que muda

**Hoje (motor interno):**
```
candidato envia respostas → backend calcula (disc.ts) → salva resultado
```

**Com API externa:**
```
candidato envia respostas → backend chama API externa → recebe resultado → salva
```

### Só mexe em `testService.ts` — método `submitAnswers`:

```ts
// Hoje
const testResults = {
  disc: data.disc ? calculateDisc(data.disc) : null,
}

// Com API externa (ex: Assessments 24x7)
const testResults = await assessments24x7.submit({
  candidateId: link.application.candidateId,
  answers: data.disc
})
```

---

## O que NÃO muda

- Rotas (`publicTest.routes.ts`)
- Controller (`publicTestController.ts`)
- Banco de dados — resultado continua em `Candidate.respostasJson`
- Frontend

---

## Como implementar quando chegar a hora

1. Criar `src/lib/assessments.ts` com o cliente da API externa
2. Adicionar a chave da API no `env.ts` e no `.env`
3. Substituir os `calculate*()` no `submitAnswers` pelas chamadas ao cliente
4. Remover os arquivos `disc.ts`, `eneagrama.ts`, `personalities.ts` se não forem mais necessários

---

## Opções de API (do relatório de pesquisa)

| Teste | Opção Recomendada | Observação |
|---|---|---|
| DISC | Assessments 24x7 ou White Label DISC | Para RH corporativo sério |
| Personalidade | IPIP (open source) | Domínio público, gratuito |
| Eneagrama | Bibliotecas MIT do GitHub | Cautela na interpretação |

> Lembrar: adicionar disclaimer na plataforma informando que os resultados
> têm caráter informativo e não substituem avaliação psicológica profissional.
