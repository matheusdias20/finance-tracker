# Plano de Projeto: Finance Tracker Pessoal

## 1. Visão Geral
Sistema de controle de gastos pessoal web projetado para uso individual local, focado em performance, manutenibilidade e escalabilidade. O sistema permitirá o registro de transações (gastos, receitas, recorrentes), gestão de orçamento por categorias, e fornecerá relatórios detalhados com gráficos e previsões, acompanhados de alertas automatizados por email para controle efetivo.

## 2. Critérios de Sucesso
- A aplicação deve apresentar alta performance (LCP < 2.5s) e renderização imediata de dados.
- Cobertura de testes unitários e de integração validando com rigor os serviços core e repositórios.
- Zero erros de tipagem TypeScript em todo o repositório (Strict mode enabled, `noEmitOnError: true`).
- Implementação completa e respeitada do padrão arquitetural em camadas.
- Pipeline de CI/CD rodando com sucesso no GitHub Actions validando testes, lint e typecheck.
- Alertas de email disparados no momento exato das quebras de requisitos (ex: ultrapassar meta da categoria) e de forma programada (resumos e lembretes).

## 3. Stack Tecnológica e Justificativa
- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript
  - *Justificativa:* Framework robusto que permite Server Components e API Routes no mesmo projeto, facilitando o desenvolvimento de plataformas unificadas com altíssima performance.
- **Banco de Dados:** PostgreSQL (Neon Serverless)
  - *Justificativa:* Rápido, ideal para as relações complexas financeiras e, sendo serverless e provido de branchs dinâmicos, tem excelente DX e custo para uso pessoal.
- **ORM:** Drizzle ORM
  - *Justificativa:* Tipagem estrita de ponta a ponta (end-to-end type safety), não possui o overhead do Prisma e permite controle profundo das queries geradas.
- **Estilização & UI:** Tailwind CSS + shadcn/ui
  - *Justificativa:* Desenvolvimento rápido de interfaces limpas (dashboard look) com componentes maduros, acessíveis e customizáveis.
- **Validação:** Zod
  - *Justificativa:* O padrão de mercado atual para TypeScript. Integra perfeitamente com o React Hook Form no frontend e serve como barreira de segurança estrita nas rotas de API.
- **Email:** Resend
  - *Justificativa:* API super simples de usar, baseada em React Email, ótima para compor templates modernos com entrega garantida e baixa fricção de configuração.
- **Testes:** Vitest (Unitários/Integração)
  - *Justificativa:* Extremamente veloz comparado ao Jest, suporta TypeScript nativamente sem configurações complexas e compartilha ecossistema vite.

## 4. Estrutura de Arquivos (Enterprise SaaS Standard)
A estrutura garantirá a inversão de dependência e a visibilidade clara entre camadas: `Controller (API/UI) → Service (Regras de Negócio) → Repository (Banco)`.

```text
/
├── src/
│   ├── app/                    # Next.js App Router (Controllers/UI)
│   │   ├── api/                # API Routes (Controllers REST)
│   │   ├── (dashboard)/        # Páginas visuais do dashboard
│   │   └── layout.tsx          # Wrapper global (Providers)
│   ├── core/                   # Domínio e Regras de Negócio Puras
│   │   ├── entities/           # Entidades centrais do domínio
│   │   ├── services/           # Regras de Negócio (ex: TransactionService)
│   │   └── repositories/       # Interfaces dos Repositórios (Contratos)
│   ├── infrastructure/         # Detalhes de implementação externa
│   │   ├── database/           # Configs Drizzle, Schemas e Migrations
│   │   │   └── repositories/   # Implementação concreta dos Repositórios via Drizzle
│   │   ├── notifications/      # Implementação concreta de emails via Resend (React Email)
│   │   └── errors/             # Custom Error Classes e Handlers centralizados
│   ├── presentation/           # Componentes UI
│   │   ├── components/         # UI Elements (shadcn/ui), Gráficos
│   │   ├── hooks/              # Custom React Hooks
│   │   └── lib/                # Funções utilitárias (formatações visuais)
│   └── shared/                 # Elementos fronteiriços validadores
│       └── schemas/            # Zod Schemas
├── __tests__/                  # Suíte de testes (Mocks, Unitários, Integração)
├── .github/workflows/          # CI/CD Workflows
├── next.config.mjs
├── drizzle.config.ts
└── tailwind.config.ts
```

## 5. Breakdown de Tarefas

### Fase 1: Fundação do Projeto
**Agente Responsável:** Backend / DevOps Engineer
- **[ ] Setup Base:** Inicializar Next.js 14, configurar TypeScript Strict, Tailwind, ESLint, Prettier e Vitest.
  - *INPUT:* Comandos padronizados de Scaffold.
  - *OUTPUT:* Repositório rodando scripts básicos de lint e testes de boilerplate.
  - *VERIFY:* `npm run lint` e `npm run test` não quebram. Build compila sem falhas.
- **[ ] Estruturação do DB e ORM:** Setup da Neon DB, schemas do Drizzle para `transactions`, `categories` e `budgets`.
  - *INPUT:* Modelagem relacional do problema em TypeScript.
  - *OUTPUT:* Banco PostgreSQL criado na nuvem, cliente configurado no repositório.
  - *VERIFY:* Script `drizzle-kit push` reflete corretamente as tabelas n banco.
- **[ ] Pipeline CI:** Criar a base do `.github/workflows/main.yml`.
  - *INPUT:* Arquivo yaml definindo Node.js e steps.
  - *OUTPUT:* Workflow configurado.
  - *VERIFY:* Action fica verde no push para main validando Tipagem e Linters.

### Fase 2: Padrões Core e Handlers
**Agente Responsável:** Software Architect
- **[ ] Tratamento de Erro Global:** Construção de exceções `AppError`, `ValidationError` e wrapper genérico para API Routes lidarem com exceções centralizadas.
  - *INPUT:* Definição de classes de Erro estendidas nativas.
  - *OUTPUT:* Módulo injetável nas rotas API para parsing de erro do Zod e internos do App.
  - *VERIFY:* Ao jogar um `AppError("Invalido", 400)` o handler emite JSON condizente no output.
- **[ ] Abstração Repositories & Services:** Montagem das interfaces na camada Core e a implementação para Categories e Transações. Testar CRUD desvinculado de banco usando In-Memory DB ou mocks do Drizzle.
  - *INPUT:* Interfaces `ITransactionRepository` e classe `TransactionService`.
  - *OUTPUT:* Modulos concluídos e tipados firmemente.
  - *VERIFY:* Testes unitários vitest com coverage 100% sobre as regras de negócio dos serviços criados.

### Fase 3: APIs e Validação
**Agente Responsável:** Backend Engineer
- **[ ] Zod Schemas:** Escrever validadores padronizados que serão compartilhados entre Client Forms e API Handlers.
  - *INPUT:* Estruturas de modelagem.
  - *OUTPUT:* `shared/schemas/transaction.schema.ts` e afins.
  - *VERIFY:* `transactionSchema.safeParse` falhando corretamente caso inputs ausentes.
- **[ ] Controllers da API (Next Route Handlers):** Desenvolver as rotas `/api/...` integrando os Schemas de validação e injetando requisições aos Services.
  - *INPUT:* Body da HTTP Call.
  - *OUTPUT:* Response JSON com status apropriado.
  - *VERIFY:* Chamadas manuais na API (Postman/Curl) respondem os registros formatados com as regras corretas de inserção.

### Fase 4: O Painel Visual (Frontend)
**Agente Responsável:** Frontend Engineer
- **[ ] Design System Core:** Implementar Base UI usando `shadcn/ui` (inputs, seletor de data, dropdown, tabelas, modais/sidebars).
  - *INPUT:* Cli comandos do shadcn.
  - *OUTPUT:* Estrutura `presentation/components/ui`.
  - *VERIFY:* Componentes reativos respondendo bem a estados de acessibilidade local.
- **[ ] Integração de Fluxos Pessoais:** Criação de formulários reativos de inserção (Gasto, Ganho) com React Hook Form integrado via `@hookform/resolvers/zod`.
  - *INPUT:* Schemas Zod criados anteriomente.
  - *OUTPUT:* Componente formulário 100% Client-Side conectando nas APIs criadas.
  - *VERIFY:* Form impede submits sem preenchimento correto e exibe erro local abaixo dos campos usando inferência de tipo.
- **[ ] Relatórios e Dashboard Principal:** Construção do layout com gráficos dinâmicos usando `Recharts` englobando previsões, evoluções de meses e metas categorizadas visualmente por paineis de cor.
  - *INPUT:* Resumo/Agregação fornecido pelo DB service.
  - *OUTPUT:* Componente visual no dashboard principal.
  - *VERIFY:* Ao inserir um novo Gasto em categoria X, a barra da cor da categoria incrementa os gastos em tempo real ao recarregar (ou revalidar swr/react-query).

### Fase 5: Notificações & Cron (Acompanhamento)
**Agente Responsável:** Backend Engineer / Worker Developer
- **[ ] Motor Integrado Resend:** Criar templates de Email com `React Email` (Aviso Limite Rompido, Resumo Semanal/Mensal, Recorrentes).
  - *INPUT:* Key da API do Resend.
  - *OUTPUT:* Serviço disparador encapsulado no `infrastructure/notifications`.
  - *VERIFY:* Recebimento dos emails num ambiente sandbox local.
- **[ ] Disparo das Notificações:** Embutir nas lógicas de inserção (Services) para avisar via Resend sempre que uma nova transação colocar a Categoria atual alem do Orçamento Planejado.
  - *INPUT:* Service de Transação recebendo dependência de Email.
  - *OUTPUT:* Regra de "trigger on event".
  - *VERIFY:* Exceder a meta ao mockar gasto forçando os 101% do orçamento gera chamada para a função Resend.
- **[ ] Cron Job Worker:** Criar script ou Endpoint para lidar com tarefas agendadas (lançar faturas recorrentes todo dia X ou fechar mês enviando o email completo).
  - *INPUT:* Workflow ou Vercel Cron acionando um endpoint com Secret segura.
  - *OUTPUT:* Processamento em Batch das contas vencidas/resumes.
  - *VERIFY:* Log da function demostra os processamentos gerando faturas e e-mails disparados sem duplicação.

## 6. Checklist de Verificação Final (Phase X)
- [ ] A Arquitetura foi seguida religiosamente permitindo trocar o ORM ou UI sem alterar Services ou Controllers?
- [ ] O projeto apresenta zero ocorrências de tipos `any` nas confitgurações restritas do TypeScript?
- [ ] Todos os Schemas (Zod) são Single-Source-of-Truth tanto na UI (Forms) quanto nos Endpoints limitantes?
- [ ] A cobertura de testes automatizados abrange 100% dos cálculos críticos de gastos e projeções?
- [ ] Tentativas de criação de transações mal formadas geram Payload de erro uniforme formatado pela camada central "Global Error Handling"?
- [ ] Lançamentos recorrentes são contabilizados na previsão de Relatórios do Mês Seguinte?
- [ ] O CI/CD no GitHub recusa PRs caso o ESLint ou a tipagem acuse irregularidades?
- [ ] O projeto carrega instântaneamente (Abaixo de 2s) aproveitando Server Components ou boas politícas de caching nativas Next?
