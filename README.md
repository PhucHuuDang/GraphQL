# GraphQL Blog API

A production-ready NestJS + GraphQL API for a blog platform with authentication, posts, categories, comments, and voting.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) 11
- **API**: [GraphQL](https://graphql.org/) with Apollo Server
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Neon)
- **ORM**: [Prisma](https://www.prisma.io/) 6.18
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Cache**: [Upstash Redis](https://upstash.com/)
- **Testing**: [Vitest](https://vitest.dev/) + Supertest

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Start development server
pnpm start:dev
```

Open http://localhost:3001/graphql for GraphQL Playground.

## Available Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm start:dev`     | Start development server with hot reload |
| `pnpm build`         | Build for production                     |
| `pnpm start:prod`    | Start production server                  |
| `pnpm test:e2e`      | Run E2E tests                            |
| `pnpm lint`          | Run ESLint                               |
| `pnpm prisma studio` | Open Prisma Studio                       |

## Project Structure

```
src/
├── config/           # Configuration module
├── common/           # Shared utilities, filters, interceptors
├── modules/
│   ├── auth/         # Authentication (Better Auth)
│   ├── user/         # User management
│   ├── post/         # Blog posts
│   ├── category/     # Categories
│   ├── session/      # Session management
│   └── health/       # Health check endpoints
├── prisma/           # Database service
└── main.ts           # Application entry
```

## API Endpoints

### Health Checks

- `GET /health` - Liveness probe
- `GET /health/db` - Database connectivity
- `GET /health/ready` - Readiness probe

### GraphQL

- `POST /graphql` - GraphQL endpoint
- `GET /graphql` - GraphQL Playground

## Environment Variables

See [.env.example](.env.example) for all required variables.

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `UPSTASH_REDIS_REST_URL` - Redis URL
- `CORS_ORIGINS` - Allowed CORS origins

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Railway deployment guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow

## CI/CD

Automated pipelines via GitHub Actions:

- **CI**: Lint, type check, tests on every PR
- **Staging**: Auto-deploy to staging on `develop` merge
- **Production**: Auto-deploy to production on `main` merge

## License

[MIT](LICENSE)
