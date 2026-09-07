# Arquitetura — Goomer Menu API

## Documentos

- [Fluxos de usuário](./user-flow.md): comportamentos e regras de negócio.
- [Fluxos de dados](./data-flow.md): caminho das requisições pelas camadas da aplicação.
- [Modelo de dados (ERD)](./erd.md): entidades, relacionamentos, restrições e decisões de integridade.

## Legenda dos diagramas

| Cor | Significado |
|---|---|
| 🟢 Verde | Dado persistido |
| 🟣 Roxo | Regra, decisão ou processamento |
| 🔵 Azul | Resultado exposto ao cliente |
| 🟠 Laranja | Ponto de atenção |
| 🔴 Vermelho | Exclusão ou ponto de atenção |

## Decisões do modelo

A exclusão de um produto remove em cascata suas promoções e janelas de horário.
O preço promocional deve ser positivo; não há restrição que exija um valor inferior ao preço original.

O [ERD](./erd.md) registra as decisões completas e os pontos ainda pendentes, incluindo promoções simultâneas e janelas que atravessam a meia-noite.
