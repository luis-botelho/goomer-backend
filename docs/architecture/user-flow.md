# User Flow — Goomer Menu API

Este documento descreve o sistema pela ótica do **negócio**: o que cada ator consegue fazer e qual resultado ele espera. Não há código nem SQL aqui — para isso, veja [`data-flow.md`](./data-flow.md).

## Atores

```mermaid
flowchart LR
    classDef ator fill:#4C6EF5,color:#fff,stroke:#364FC7,stroke-width:1px;

    Admin[Restaurante / Admin]:::ator
    Cliente[Cliente final]:::ator

    Admin -->|gerencia| Produtos((Produtos))
    Admin -->|gerencia| Promocoes((Promoções))
    Cliente -->|consulta| Cardapio((Cardápio))

    Produtos -.alimenta.-> Cardapio
    Promocoes -.alimenta.-> Cardapio
```

**Admin** é quem opera o restaurante: cria e mantém o catálogo. **Cliente** só enxerga o resultado final — nunca interage diretamente com `products` ou `promotions`, apenas com a projeção consolidada `/menu`.

Essa distinção importa porque as duas APIs têm contratos diferentes:

| | API de gestão (`/products`, `/promotions`) | API de cardápio (`/menu`) |
|---|---|---|
| Quem consome | Admin / painel do restaurante | Cliente final |
| Mostra produtos invisíveis? | Sim | Não |
| Mostra preço original e promocional? | Sim, os dois | Só o preço **vigente agora** |
| Depende de horário atual? | Não | Sim — é o dado mais importante da resposta |

---

## Fluxo 1 — Cadastrar produto

```mermaid
flowchart TD
    classDef ator fill:#4C6EF5,color:#fff;
    classDef acao fill:#f1f3f5,stroke:#adb5bd;
    classDef regra fill:#845EF7,color:#fff;
    classDef resultado fill:#2F9E44,color:#fff;

    A[Admin]:::ator --> B["Informa nome, preço,\ncategoria e visibilidade"]:::acao
    B --> C{Categoria é uma das 4 válidas?\nEntradas / Pratos / Sobremesas / Bebidas}:::regra
    C -->|não| C1[Rejeitado — 400]:::acao
    C -->|sim| D[Produto salvo]:::resultado
    D --> E{Visível?}:::regra
    E -->|sim| F[Pode aparecer no cardápio]:::resultado
    E -->|não| G[Existe, mas fica oculto do cardápio]:::resultado
```

**Resultado esperado:** o produto passa a existir independentemente da visibilidade — visibilidade decide se ele *aparece* no cardápio, não se ele *existe*.

---

## Fluxo 2 — Atualizar ou excluir produto

```mermaid
flowchart TD
    classDef ator fill:#4C6EF5,color:#fff;
    classDef acao fill:#f1f3f5,stroke:#adb5bd;
    classDef resultado fill:#2F9E44,color:#fff;
    classDef alerta fill:#E8590C,color:#fff;

    A[Admin]:::ator --> B[Seleciona produto existente]:::acao
    B --> C{Ação}
    C -->|Atualizar| D[Altera nome, preço,\ncategoria ou visibilidade]:::acao
    C -->|Excluir| E{Produto tem\npromoção vinculada?}:::alerta
    D --> F[Cardápio reflete a\nversão mais recente]:::resultado
    E -->|sim| E1[Promoção é excluída\nem cascata ou bloqueia exclusão]:::alerta
    E -->|não| E2[Produto removido definitivamente]:::resultado
```

> **Decisão de projeto a documentar no README principal:** exclusão em cascata (`ON DELETE CASCADE` nas promoções do produto) ou bloqueio (`409 Conflict` se houver promoção vinculada). Qualquer uma é aceitável — o que não pode acontecer é uma promoção órfã apontando para um produto inexistente.

---

## Fluxo 3 — Ocultar produto (visibilidade)

```mermaid
flowchart LR
    classDef ator fill:#4C6EF5,color:#fff;
    classDef estado fill:#f1f3f5,stroke:#adb5bd;
    classDef resultado fill:#2F9E44,color:#fff;

    A[Admin]:::ator --> B[Produto temporariamente\nindisponível — ex: acabou o insumo]:::estado
    B --> C[Marca como invisível]:::estado
    C --> D[Produto continua\nsalvo e gerenciável]:::resultado
    C --> E[Produto some do\n/menu público]:::resultado
```

**Regra de negócio:** ocultar ≠ excluir. É reversível, não perde histórico e não afeta promoções já cadastradas — só a exibição pública.

---

## Fluxo 4 — Criar promoção

```mermaid
flowchart TD
    classDef ator fill:#4C6EF5,color:#fff;
    classDef acao fill:#f1f3f5,stroke:#adb5bd;
    classDef regra fill:#845EF7,color:#fff;
    classDef resultado fill:#2F9E44,color:#fff;
    classDef erro fill:#E03131,color:#fff;

    A[Admin]:::ator --> B[Escolhe um produto existente]:::acao
    B --> C["Informa descrição\ne preço promocional"]:::acao
    C --> D["Define 1+ janelas:\ndia da semana + HH:mm início/fim"]:::acao
    D --> E{Intervalo possui\npelo menos 15 minutos?}:::regra
    E -->|não| E1[Rejeitado — 400]:::erro
    E -->|sim| F{Horário final > inicial?}:::regra
    F -->|não| F1[Rejeitado — 400]:::erro
    F -->|sim| H[Promoção + janelas salvas]:::resultado
```

> **Decisão de domínio ainda em aberto:** o enunciado não exige que `promotionalPrice` seja menor que o preço original do produto — só pede que exista um preço promocional. Por ora validamos apenas `promotionalPrice > 0`. Se decidirmos impor `promotionalPrice < product.price`, isso é uma regra de negócio nossa, não um requisito do desafio, e deve ser documentada como tal no README principal antes de virar validação obrigatória.

**Exemplo real:** produto *Chopp* (R$ 12,00), promoção *"Happy Hour"*, preço promocional R$ 6,00, ativa **quarta-feira das 18:00 às 20:00**. Uma mesma promoção pode ter várias janelas (ex.: sexta e sábado à noite) sem duplicar a promoção inteira — cada janela é um registro próprio ligado à mesma promoção.

---

## Fluxo 5 — Cliente consulta o cardápio

```mermaid
flowchart TD
    classDef ator fill:#4C6EF5,color:#fff;
    classDef regra fill:#845EF7,color:#fff;
    classDef resultado fill:#2F9E44,color:#fff;

    A[Cliente]:::ator --> B[Solicita GET /menu]
    B --> C[Sistema determina\ndia da semana e hora atuais]:::regra
    C --> D{Para cada produto: está visível?}:::regra
    D -->|não| D1[Excluído do resultado]
    D -->|sim| E{Existe promoção ativa\nagora, nesse dia/hora?}:::regra
    E -->|sim| E1[Preço = preço promocional]:::resultado
    E -->|não| E2[Preço = preço original]:::resultado
    E1 --> F[Cardápio consolidado]:::resultado
    E2 --> F
```

**Resultado esperado:** o cliente recebe uma lista pronta para renderizar — sem produtos ocultos, com o preço que realmente vale *agora*.

---

## Visão consolidada

```mermaid
flowchart LR
    classDef fonte fill:#2F9E44,color:#fff;
    classDef processo fill:#845EF7,color:#fff;
    classDef saida fill:#4C6EF5,color:#fff;

    A[Produtos cadastrados]:::fonte --> D[Motor do Cardápio]:::processo
    B[Visibilidade de cada produto]:::fonte --> D
    C[Promoções + janelas de horário]:::fonte --> D
    D --> E[Cardápio consolidado]:::saida
    E --> F[Cliente final]:::saida
```

**Resumo de negócio:**
- **Admin** alimenta o sistema (produtos, visibilidade, promoções).
- **Cliente** só consome a projeção final — nunca vê a estrutura interna.
- O **Menu** não é uma tabela, é uma *decisão calculada em tempo real* a partir de produto + visibilidade + promoção + horário.

---

## Evoluções opcionais

Estas funcionalidades não fazem parte do MVP documentado acima e só entram se decidirmos implementá-las — o desafio as trata como opcionais, e a documentação reflete apenas o que já está decidido.

### Timezone por restaurante

Hoje o domínio não possui a entidade `Restaurant`, então "hora atual" é calculada no fuso do próprio servidor. Caso essa funcionalidade seja implementada, o fluxo do `/menu` passa a ter um passo adicional **antes** de determinar dia/hora:

```mermaid
flowchart LR
    classDef regra fill:#845EF7,color:#fff;
    A[Sistema descobre o\nfuso do restaurante]:::regra --> B[Calcula dia da semana\ne hora NESSE fuso]:::regra
```

Isso evita o bug silencioso de um restaurante em Manaus (UTC-4) e outro em Fernando de Noronha (UTC-2) terem "quarta-feira 18h" resolvido em momentos absolutos diferentes — sem erro nenhum, só promoção ligando/desligando na hora errada.

### Ordenação de produtos

Também não implementada ainda. Quando decidida, o fluxo de "listar produtos" ganha uma ordem explícita controlável pelo Admin — documentaremos aqui assim que a coluna e a regra existirem.