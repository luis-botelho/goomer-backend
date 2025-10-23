# Desafio Técnico - Pessoa Desenvolvedora Back-end

A avaliação será baseada na sua capacidade de escrever um código simples, de fácil manutenção, **pela quantidade e qualidade das funcionalidades que você entregar**.

## Instruções

- **Nome do Projeto:** Goomer Menu API
- **Objetivo do Projeto:** Criar uma API capaz de gerenciar os produtos, promoções e o cardápio de um restaurante.

### Tecnologias e Requisitos

- **Node.js**
    - O projeto deve ser desenvolvido em **TypeScript**
    - **Não** usar frameworks que impõem arquitetura (ex.: NestJS, Adonis)
    - Sugestões: **Fastify** ou **Express**
- **Banco de Dados SQL**
    - **Não** utilizar o query builder do ORM para as consultas. As consultas devem ser implementadas em SQL puro.
    - Utilize ORM para as migrations.
    - Escolha entre: **PostgreSQL** ou **MySQL**

## Desafio

- A sua API deverá ser capaz de:
    - Criar, listar, atualizar e excluir produtos
    - Criar, listar, atualizar e excluir promoções
    - Retornar o cardápio com as informações consolidadas
    - Controlar visibilidade do produto
    - Aplicar promoções apenas nos horários e dias definidos
    - Permitir gerenciar a ordenação dos produtos no cardápio *(opcional)*
    - Tratar *timezone* para restaurantes localizados em diferentes estados *(opcional)*

### Campos esperados do produto

- Nome do produto
- Preço do produto
- Categoria (pode ser do tipo: Entradas, Pratos principais, Sobremesas ou Bebidas)
- *Flag* de visibilidade (Visível/Invisível)

### Campos esperados da promoção

- Descrição da promoção (ex.: "*Chopp* pela metade do preço")
- Preço promocional
- Dias da semana e horários em que a promoção deve estar ativa

### **Formato de horários**

- É necessário tratar os campos que indicam horários de disponibilidade dos produtos e horário para as promoções.
- Os campos devem possuir o formato `HH:mm`.
- Os horários devem possuir intervalo mínimo de 15 minutos.

## Descrição das funcionalidades

- **Produto visível/invisível:** Permite ao restaurante esconder produtos temporariamente sem excluí-los.
- **Promoção por produto:** Permite criar campanhas como *“Happy hour — Chopp em dobro toda quarta-feira das 18h às 20h”*.
- **Cardápio:** Fornece o retorno consolidado que será utilizado para montar o cardápio exibido aos clientes (ex.: não retornar produtos marcados como invisível).

### Funcionalidades opcionais

As funcionalidades abaixo **não serão consideradas na avaliação**, porém, caso você opte por implementá-las, **elas devem estar funcionando corretamente**.

- **Ordenação dos produtos:** Dá controle ao restaurante sobre a disposição dos produtos no cardápio.
- **Tratamento de *timezone*:** Evita inconsistências em horários para restaurantes localizados em diferentes regiões do país.

## O que nós vamos avaliar

- Qualidade, clareza e legibilidade do código
- Estrutura, boas práticas e uso adequado do SQL
- Organização do projeto e clareza da documentação
- Quantidade e qualidade das funcionalidades entregues
- Inclua um arquivo *README* que possua:
    - Desafios e problemas encontrados durante o desenvolvimento
    - Instruções detalhadas para rodar o projeto localmente

## Dicas

- Documente seu projeto em *markdown* (setup, estrutura e requisitos)
- Tenha em mente a usabilidade, escalabilidade e colaboração
- Estruture *commits* e *branches* de forma organizada
- Os testes unitários contarão pontos para você
- O uso de Docker é muito bem-vindo
- Pense em código *production ready*

## FAQ

### Posso utilizar JavaScript ao invés de TypeScript?

Não. O desafio deve ser desenvolvido inteiramente em TypeScript.
Queremos avaliar sua familiaridade com *tipagem* estática, interfaces e boas práticas do ecossistema TypeScript.

### Posso utilizar frameworks/bibliotecas?

Você pode usar bibliotecas como Fastify ou Express, mas não deve usar frameworks que impõem uma arquitetura específica (ex.: NestJS, Adonis).

O objetivo é avaliar sua capacidade de estruturar o projeto por conta própria — desde a organização das pastas até a forma como você define rotas, middlewares e validações.

Frameworks opinados ocultam muitas decisões importantes e dificultam a avaliação do seu raciocínio técnico sobre arquitetura e design da aplicação.

### Preciso fazer as funcionalidades opcionais?

Não. Elas não contam pontos na avaliação, mas, caso você decida implementá-las, elas devem estar 100% funcionais. Essas funcionalidades servem apenas como um desafio extra para quem quiser ir além do essencial.

### Preciso entregar testes automatizados?

Não é obrigatório, mas testes unitários e/ou de integração contam pontos positivos. Eles ajudam a mostrar como você estrutura o código para ser testável e como pensa em cenários de validação.

### Posso usar Docker?

Sim! O uso de Docker é muito bem-vindo e facilita a execução do seu projeto por quem for avaliá-lo, garantindo que o ambiente funcione exatamente como você configurou.

### Preciso me preocupar com *commits* e estrutura do repositório?

Sim. A forma como você organiza seus *commits*, *branches* e documentação também faz parte da avaliação.

*Commits* pequenos e descritivos, além de uma estrutura de pastas clara, facilitam o entendimento do seu raciocínio.
