# Goomer Menu API

API RESTful para gerenciamento de produtos, promoções e cardápio de restaurantes.

## Funcionalidades

### Produtos (CRUD)

| Método | Rota               | Descrição               |
|--------|--------------------|-------------------------|
| POST   | `/products`        | Criar produto           |
| GET    | `/products`        | Listar todos os produtos|
| GET    | `/products/:id`    | Buscar produto por ID   |
| PATCH  | `/products/:id`    | Atualizar produto       |
| DELETE | `/products/:id`    | Excluir produto         |

**Campos do produto:**
- `name` (string, obrigatório) — Nome do produto
- `price` (number, obrigatório) — Preço do produto (maior que 0)
- `category` (enum, obrigatório) — `STARTER`, `MAIN_COURSE`, `DESSERT` ou `BEVERAGE`
- `visible` (boolean, opcional, padrão `true`) — Controla visibilidade no cardápio

### Promoções (CRUD)

| Método | Rota                  | Descrição                 |
|--------|-----------------------|---------------------------|
| POST   | `/promotions`         | Criar promoção            |
| GET    | `/promotions`         | Listar todas as promoções |
| GET    | `/promotions/:id`     | Buscar promoção por ID    |
| PATCH  | `/promotions/:id`     | Atualizar promoção        |
| DELETE | `/promotions/:id`     | Excluir promoção          |

**Campos da promoção:**
- `productId` (UUID, obrigatório) — ID do produto associado
- `description` (string, obrigatório) — Descrição da promoção
- `promotionalPrice` (number, obrigatório) — Preço promocional (maior que 0)
- `schedules` (array, obrigatório) — Lista de horários da promoção
  - `weekday` (integer 0-6) — Dia da semana (0=Domingo, 6=Sábado)
  - `startTime` (HH:mm) — Horário de início
  - `endTime` (HH:mm) — Horário de término (mínimo 15min após início)

### Cardápio

| Método | Rota    | Descrição                                    |
|--------|---------|----------------------------------------------|
| GET    | `/menu` | Retorna cardápio consolidado com promoções   |

O endpoint `/menu` retorna apenas **produtos visíveis** com as promoções ativas no momento atual (baseado no dia da semana e horário do servidor). Se houver múltiplas promoções para um mesmo produto no horário, é selecionada a de menor preço.

### Health Check

| Método | Rota      | Descrição       |
|--------|-----------|-----------------|
| GET    | `/health` | Status da API   |

## Tecnologias

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify
- **Banco de dados:** PostgreSQL 16
- **Migrations:** Prisma
- **Queries SQL:** SQL puro (sem query builder do ORM)
- **Validação de schemas:** TypeBox (via `@fastify/type-provider-typebox`)
- **Testes:** Vitest
- **Containerização:** Docker + Docker Compose

## Estrutura do Projeto

```
src/
├── config/
│   └── env.ts                        # Variáveis de ambiente
├── db/
│   └── pool.ts                       # Conexão com o PostgreSQL (pg)
├── modules/
│   ├── menu/
│   │   ├── menu.controller.ts
│   │   ├── menu.repository.ts        # Query SQL consolidada do cardápio
│   │   ├── menu.routes.ts
│   │   └── menu.service.ts
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.repository.ts    # Queries SQL de produtos
│   │   ├── products.routes.ts
│   │   ├── products.schema.ts        # Validação com TypeBox
│   │   └── products.service.ts
│   └── promotions/
│       ├── promotions.controller.ts
│       ├── promotions.repository.ts  # Queries SQL de promoções (transações)
│       ├── promotions.routes.ts
│       ├── promotions.schema.ts      # Validação com TypeBox
│       └── promotions.service.ts
├── shared/
│   └── errors/
│       ├── error-handler.ts          # Handler global de erros Fastify
│       ├── not-found-error.ts
│       └── validation-error.ts
├── app.ts                            # Configuração do Fastify
└── server.ts                         # Entrypoint do servidor

prisma/
├── schema.prisma                     # Schema do Prisma (models + enums)
└── migrations/
    ├── *_init/                       # Tabelas iniciais
    └── *_add_domain_constraints/     # CHECK constraints

tests/
└── unit/
    ├── products.service.test.ts
    ├── promotions.service.test.ts
    └── menu.service.test.ts
```

## Como Rodar

### Pré-requisitos

- Node.js >= 18
- Docker e Docker Compose (opcional, mas recomendado)

### 1. Subir o banco de dados

```bash
docker compose up -d
```

Isso inicia um container PostgreSQL 16 na porta **5433**.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

O arquivo `.env.example` já contém a string de conexão correta para o Docker Compose.

### 3. Instalar dependências

```bash
npm install
```

### 4. Rodar as migrations

```bash
npx prisma migrate deploy
```

### 5. Iniciar o servidor (desenvolvimento)

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`.

### Build para produção

```bash
npm run build
npm start
```

### Rodar os testes

```bash
npm test          # modo watch
npm run test:run  # execução única
```

## Decisões de Design

### Camadas da aplicação

A API segue uma arquitetura em camadas:

- **Routes** — Definem as rotas e vinculam os schemas de validação (TypeBox) ao Fastify
- **Controllers** — Recebem a request, delegam ao service e retornam a response
- **Services** — Contêm a lógica de negócio (validações, regras, orquestração)
- **Repositories** — Executam queries SQL puras diretamente no PostgreSQL

Essa separação mantém o código testável e de fácil manutenção. O banco de dados é acessado exclusivamente via queries SQL raw, enquanto o Prisma é utilizado apenas para migrations e definição do schema.

### Validação com TypeBox

Todos os schemas de request (body, params) são definidos com TypeBox e registrados diretamente nas rotas do Fastify. Isso garante validação automática antes que o controller seja chamado, eliminando boilerplate de validação.

### Transações para promoções

A criação e atualização de promoções utilizam transações PostgreSQL para garantir atomicidade entre a inserção da promoção e de seus horários. Se qualquer etapa falhar, toda a operação é revertida.

### Cardápio com JOIN LATERAL

A query do cardápio utiliza `LEFT JOIN LATERAL` para buscar a melhor promoção (menor preço) ativa no momento para cada produto, consolidando tudo em uma única query.

### Foreign Keys com CASCADE

As relações entre tabelas utilizam `ON DELETE CASCADE`, garantindo que a exclusão de um produto remova suas promoções, e a exclusão de uma promoção remova seus horários.

## Desafios e Problemas Encontrados

1. **Consulta consolidada do cardápio** — O maior desafio foi construir a query SQL que retorna os produtos com suas promoções ativas no horário atual. A utilização de `LEFT JOIN LATERAL` com subquery correlacionada permitiu selecionar automaticamente a melhor promoção por produto.

2. **Validação de horários** — Garantir que os horários de promoção tenham intervalo mínimo de 15 minutos e que o fim seja sempre posterior ao início exigiu validação tanto no schema (TypeBox) quanto no service (regras de negócio).

3. **Transações com pg** — Diferente de ORMs que abstraem transações, aqui foi necessário gerenciar manualmente `BEGIN`, `COMMIT`, `ROLLBACK` e `client.release()` no repository de promoções.

4. **Separação entre Prisma e queries raw** — Manter o Prisma apenas para migrations, enquanto toda a consulta de dados é feita em SQL puro, exigiu disciplina para não misturar abordagens.
