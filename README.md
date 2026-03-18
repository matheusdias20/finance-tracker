# Finance Tracker

Sistema de controle de gastos pessoal com relatórios, metas por categoria
e notificações automáticas por email.

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Banco de dados**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM
- **Email**: Resend + React Email
- **Estilização**: Tailwind CSS
- **Testes**: Vitest + Testing Library

## Pré-requisitos

- Node.js 20+
- Conta no [Neon](https://neon.tech) (banco de dados)
- Conta no [Resend](https://resend.com) (emails)
- Conta no [Vercel](https://vercel.com) (deploy)

## Setup local

1. Clonar o repositório:
   ```bash
   git clone https://github.com/seu-usuario/finance-tracker.git
   cd finance-tracker
   ```

2. Instalar dependências:
   ```bash
   npm install
   ```

3. Configurar variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   # Preencher cada variável conforme documentado no .env.example
   ```

4. Criar as tabelas no banco:
   ```bash
   npm run db:push
   ```

5. Popular categorias padrão:
   ```bash
   npm run db:seed
   ```

6. Rodar em desenvolvimento:
   ```bash
   npm run dev
   ```

   Acessar: http://localhost:3000

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar código com ESLint |
| `npm run type-check` | Verificar tipagem TypeScript |
| `npm run test` | Rodar testes |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run db:push` | Aplicar schema no banco |
| `npm run db:seed` | Popular categorias padrão |
| `npm run db:studio` | Abrir Drizzle Studio (visualizar banco) |

## Deploy na Vercel

1. Conectar repositório no painel da Vercel
2. Configurar as variáveis de ambiente (Settings → Environment Variables)
3. O deploy é automático a cada push na branch `main`
4. O cron job roda automaticamente às 08:00 BRT via vercel.json

## Arquitetura

```
src/
├── app/              # Next.js App Router (páginas e API routes)
├── core/             # Domínio puro (entities, services, interfaces)
├── infrastructure/   # Implementações externas (Drizzle, Resend, erros)
├── presentation/     # Componentes React e hooks
└── shared/           # Schemas Zod compartilhados
```

A arquitetura segue o padrão Controller → Service → Repository,
garantindo que a lógica de negócio em `core/` é independente de
qualquer framework ou biblioteca externa.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do Neon PostgreSQL |
| `RESEND_API_KEY` | Chave da API do Resend |
| `RESEND_FROM_EMAIL` | Email remetente (verificado no Resend) |
| `RESEND_TO_EMAIL` | Seu email para receber os alertas |
| `CRON_SECRET` | String aleatória para proteger o endpoint de cron |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação em produção |
