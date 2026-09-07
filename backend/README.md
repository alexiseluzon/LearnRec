# LearnRec Backend

NestJS API for a learning-resource recommender app — users save/rate learning resources (courses, articles, videos) and get rule-based recommendations based on shared tags with resources they've rated highly.

## Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL ([Neon](https://neon.tech))
- **ORM:** Prisma 7 (hand-reviewed SQL migrations, not purely ORM-reliant)
- **Auth:** JWT + Google OAuth 2.0 (Passport strategies)
- **Testing:** Jest (unit) + Supertest (e2e)

## Setup

### 1. Install dependencies

```powershell
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in real values:

```powershell
Copy-Item .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (pooled) |
| `JWT_SECRET` | Random secret for signing JWTs — generate with `openssl rand -base64 48` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |
| `GOOGLE_CALLBACK_URL` | e.g. `http://localhost:3000/auth/google/callback` |

### 3. Run database migrations

```powershell
npx prisma generate
npx prisma migrate dev
```

### 4. Start the dev server

```powershell
npm run start:dev
```

Server runs on `http://localhost:3000` by default.

## Testing

```powershell
npm test              # unit tests
npm run test:e2e      # e2e tests (hits real DB — see test/*.e2e-spec.ts)
npm run test:cov      # coverage report
```

## API Overview

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Create account (email/password) |
| POST | `/auth/login` | No | Log in, returns JWT |
| GET | `/auth/google` | No | Start Google OAuth flow |
| GET | `/auth/google/callback` | No | Google OAuth callback, returns JWT |
| POST | `/resources` | Yes | Create a learning resource |
| GET | `/resources` | Yes | List all resources |
| GET | `/resources/:id` | Yes | Get one resource |
| POST | `/resources/:id/rate` | Yes | Rate a resource (1–5) |
| GET | `/recommendations` | Yes | Get personalized recommendations |

Protected routes require `Authorization: Bearer <token>` header.

## Recommendation logic

Rule-based (no ML): finds tags from resources the user rated >=4, scores unrated resources by tag overlap, returns highest-overlap matches first. New users with no ratings yet get a popularity-based fallback.

## Project structure

```
src/
├── auth/            # JWT + Google OAuth, guards, strategies
├── users/           # User CRUD, Google account linking
├── resources/       # Learning resource CRUD + ratings
├── recommendations/ # Tag-overlap recommendation engine
└── prisma/           # Prisma client wrapper (global module)
```

## License

This project is for portfolio/demonstration purposes. No warranty; use at your own risk.