# 🚀 Project Guide: GraphQL Blog API

A production-ready NestJS + GraphQL API for a blog platform with authentication, posts, categories, comments, and voting.

---

## 📋 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Development Workflow](#-development-workflow)
3. [Project Structure](#-project-structure)
4. [Core Features & Business Logic](#-core-features--business-logic)
5. [Backend Patterns & Utilities](#-backend-patterns--utilities)
6. [Deployment & Ops](#-deployment--ops)
7. [API Reference](#-api-reference)

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) 11
- **API**: [GraphQL](https://graphql.org/) with Apollo Server
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Neon)
- **ORM**: [Prisma](https://www.prisma.io/) 6.18
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Cache**: [Upstash Redis](https://upstash.com/)
- **Testing**: [Vitest](https://vitest.dev/) + Supertest

---

## 💻 Development Workflow

### 🚀 Quick Start
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
pnpm prisma generate

# Run migrations (local)
pnpm prisma migrate dev

# Start development server
pnpm start:dev
```
Open [http://localhost:3001/graphql](http://localhost:3001/graphql) for GraphQL Playground.

### 🔄 Git Workflow
Standardize contributions using [Conventional Commits](https://conventionalcommits.org/).

| Branch      | Purpose                 | Deploys to |
| ----------- | ----------------------- | ---------- |
| `main`      | Production-ready code   | Production |
| `develop`   | Integration branch      | Staging    |
| `feature/*` | New features            | -          |
| `fix/*`     | Bug fixes               | -          |

### 🧪 Testing
```bash
pnpm test:e2e        # Run all E2E tests
pnpm test:e2e:watch  # Watch mode
pnpm test:cov        # With coverage
```

### 🛠️ Useful Commands
- `pnpm prisma studio`: Open GUI for database
- `pnpm lint`: Run ESLint
- `pnpm format`: Format code with Prettier
- `pnpm build`: Prepare for production

---

## 🏗️ Project Structure

```
src/
├── config/           # Configuration module
├── common/           # Shared utilities, filters, interceptors, decorators
│   ├── decorators/   # Custom @StringField, @SingleItem, etc.
│   ├── filters/      # Error handling (GraphQL & Prisma)
│   ├── interceptors/ # Response transformation
│   └── registers/    # Dynamic enum registration
├── modules/
│   ├── auth/         # Authentication (Better Auth)
│   ├── user/         # User management
│   ├── post/         # Blog posts (CRUD, views, slugs)
│   ├── category/     # Categories
│   ├── session/      # Session management
│   └── health/       # Health check endpoints
├── prisma/           # Database service
└── main.ts           # Application entry
```

---

## 🏛️ Core Features & Business Logic

### 📝 Post Management System
- **Authorship**: Only logged-in users can create posts. Users can only edit/delete their own posts.
- **Slug Generation**: SEO-friendly slugs are auto-generated from titles.
- **Workflow**: 
  - `DRAFT`: Saved but not public.
  - `PENDING`: (Default for users) Requires admin review.
  - `PUBLISHED`: (Direct for Admins/Moderators) Live on site.
- **Soft Delete**: Posts are marked as `isDeleted` rather than permanently removed.
- **View Tracking**: Increments view counts using Redis to prevent duplicate counting.

### 🔐 Authorization Rules
| Action           | Owner | Admin/Moderator | Other User |
| ---------------- | ----- | --------------- | ---------- |
| Create Post      | ✅    | ✅              | ✅         |
| View Published   | ✅    | ✅              | ✅         |
| Edit/Delete Own  | ✅    | ✅              | ❌         |
| Publish Directly | ❌    | ✅              | ❌         |

---

## 🛠️ Backend Patterns & Utilities

### 📤 Consistent Response Formatting
All GraphQL responses follow a standard structure automatically via a global interceptor:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": { ... } // Optional: for pagination
}
```
**Usage in Resolvers:**
- `@SingleItem('Found')` / `@ArrayItems('Listed')`
- `@Paginated('Posts')` / `@DeleteOperation('Removed')`

### 🏷️ Custom DTO Decorators
Reduces boilerplate by combining validation and GraphQL metadata:
- `@StringField({ minLength: 5 })`
- `@OptionalIntField()`
- `@EnumField(PostStatus)`

### 🔢 Dynamic Enum Registration
Automatically registers enums with formatted descriptions:
```typescript
dynamicRegisterEnum(PostStatus, {
  name: 'PostStatus',
  customDescriptions: { DRAFT: 'Draft post' }
});
```

### ⚠️ Exception Handling
Custom `GraphQLExceptionFilter` ensures even errors are returned in the standard format (`success: false`, `code: "..."`) rather than raw GraphQL error arrays.

---

## 🚢 Deployment & Ops

### 🚄 Railway & Neon Setup
1. **GitHub**: Connect repository to Railway.
2. **Database**: Use Neon PostgreSQL.
3. **Environment**: Configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, `UPSTASH_REDIS_REST_URL`, etc.
4. **CORS**: Set `CORS_ORIGINS` to allow your frontend domain.

### 🔄 Rollback Procedures
- **App**: Redeploy previous successful build via Railway dashboard.
- **Database**: Use Neon's branch/snapshot feature before critical migrations as Prisma doesn't support automatic rollbacks.

---

## 🏥 API Reference

### Health Checks
- `GET /health`: Liveness probe
- `GET /health/db`: Database connectivity
- `GET /health/ready`: Full readiness

### GraphQL Endpoints
- `POST /graphql`: Main API endpoint
- `GET /graphql`: Playground (Development only)

---
*For more detailed implementation details, refer to the source code or specific module documentation.*
