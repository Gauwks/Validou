# API de Controle de Validade

API REST (Node.js + Express + Firebase Firestore/Auth) consumida pelo painel **web** e pelo app **mobile**.

## Como ligar ao Firebase (o que falta fazer)

1. No [Console do Firebase](https://console.firebase.google.com), crie um projeto.
2. **Build > Firestore Database > Criar banco de dados** (modo produção).
3. **Build > Authentication > Começar** e ative o login por **E-mail/senha**.
4. **Configurações do projeto > Contas de serviço > Gerar nova chave privada**. Salve o arquivo como `serviceAccountKey.json` na raiz do projeto.
5. Copie `.env.example` para `.env` (o caminho já aponta para `./serviceAccountKey.json`).
6. `npm install` e `npm run dev`. Teste: `GET http://localhost:3000/api/saude`.

> O `serviceAccountKey.json` e o `.env` já estão no `.gitignore`. Nunca suba para o GitHub.

## Autenticação

Web e mobile fazem login com o **Firebase Auth** (SDK do cliente) e enviam o token em todas as requisições:

```
Authorization: Bearer <idToken>
```

No primeiro acesso, o usuário chama `POST /api/estabelecimentos`, que cria a loja e a vincula a ele.
Depois disso todos os dados ficam isolados por estabelecimento.

## Estrutura no Firestore

```
usuarios/{uid}                       -> { email, estabelecimentoId }
estabelecimentos/{estId}             -> { nome, tipo, cnpj, plano, donoUid }
  ├─ produtos/{id}                   -> { nome, codigoBarras, categoria, custo, precoVenda }
  ├─ lotes/{id}                      -> { produtoId, produtoNome, codigoLote, dataValidade (YYYY-MM-DD),
  │                                       quantidadeInicial, quantidadeAtual }
  ├─ baixas/{id}                     -> { loteId, produtoId, tipo (venda|descarte|promocao), quantidade,
  │                                       custoUnitario, precoUnitario, valorPerdido, data, mes }
  └─ alertas/{loteId_faixa}          -> { loteId, produtoNome, dataValidade, faixa (7|15|30|vencido),
                                          diasRestantes, lido }
```

## Endpoints (todos com prefixo `/api`)

| Método | Rota | Uso |
|---|---|---|
| GET | `/saude` | Health check (sem login) |
| POST | `/estabelecimentos` | Cria a loja do usuário logado |
| GET / PUT | `/estabelecimentos/meu` | Ver / editar a loja |
| GET | `/produtos` | Lista produtos |
| GET | `/produtos/codigo/:codigoBarras` | **Mobile:** busca após escanear (404 = cadastrar) |
| POST | `/produtos` | Cadastra produto |
| GET / PUT / DELETE | `/produtos/:id` | Detalhe, edição, exclusão |
| POST | `/lotes` | **Mobile:** registra lote e validade |
| GET | `/lotes?produtoId=&ativos=true` | Lista lotes (com `diasRestantes`) |
| GET / PUT | `/lotes/:id` | Detalhe / edição |
| POST | `/lotes/:id/baixas` | Baixa de venda, descarte ou promoção (debita o estoque) |
| GET | `/baixas?mes=2026-11&tipo=descarte` | Histórico de baixas |
| GET | `/dashboard/vencimentos` | **Web:** vencidos, até 7, 15 e 30 dias + sugestão de promoção |
| GET | `/relatorios/perdas?mes=2026-11` | **Web:** relatório mensal de perdas |
| POST | `/alertas/gerar` | Gera/atualiza alertas (pode rodar diariamente) |
| GET | `/alertas?lido=false` | Lista alertas |
| PATCH | `/alertas/:id/lido` | Marca como lido |

### Exemplos de corpo

```jsonc
// POST /produtos
{ "nome": "Iogurte Natural 170g", "codigoBarras": "7891234567890", "custo": 2.1, "precoVenda": 4.5 }

// POST /lotes
{ "produtoId": "abc123", "codigoLote": "L2411", "dataValidade": "2026-11-20", "quantidade": 24 }

// POST /lotes/:id/baixas
{ "tipo": "promocao", "quantidade": 6, "precoUnitario": 3.15 }
```

## Regra de sugestão de promoção

| Dias para vencer | Desconto sugerido |
|---|---|
| ≤ 1 | 50% |
| ≤ 3 | 40% |
| ≤ 7 | 30% |
| ≤ 15 | 15% |
| > 15 | sem promoção (apenas monitorar) |
| vencido | descartar |

O preço sugerido nunca fica abaixo do custo do produto. As faixas estão em `src/services/promocao.js`.

## Observações

- Datas de validade usam `YYYY-MM-DD` e o fuso `America/Sao_Paulo`.
- As consultas foram feitas para **não exigir índices compostos** no Firestore. Se no futuro aparecer o erro
  "The query requires an index", o link para criar o índice vem na própria mensagem.
- Regras de segurança do Firestore: como só a API (Admin SDK) acessa o banco, deixe as regras fechadas
  (`allow read, write: if false;`).
- Para testar sem o front, gere um token com a API REST do Firebase Auth (`accounts:signInWithPassword`)
  usando a *Web API Key* do projeto e envie no header `Authorization`.
