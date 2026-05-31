# TaskedProfit (Find Business at Ease)

Production-oriented starter for discovering active local businesses without listed websites.

## Stack
- Next.js + TypeScript + Tailwind CSS
- Next.js API routes
- Prisma schema for Supabase PostgreSQL
- Zod validation
- JWT auth via HTTP-only cookie

## Current MVP Scope
- Auth endpoints (`/api/auth/login|logout|refresh|me`)
- Search jobs endpoints (`/api/search/jobs...`)
- Businesses endpoints (`/api/businesses...`)
- Export endpoints (`/api/exports...`) with CSV output
- Saved searches endpoints (`/api/saved-searches...`)
- Health and audit log endpoints
- Deduplication, confidence scoring, and filter utilities
- Dashboard UI to create, run, review, filter, sort, and export searches

## Local Run
```bash
npm install
npm run dev
```

Demo user:
- email: `admin@taskedprofit.local`
- password: `ChangeMe123!`

## Test
```bash
npm run test
```

## Deployment Readiness
Use one command to validate runtime readiness:
```bash
npm run verify
```

Release checklist:
- `npm run verify` passes (lint, tests, production build)
- Required env vars are set (`DATABASE_URL`, auth secrets)
- `/api/health` responds with `status: ok`
- Login, job creation, run, filter, and export flows are manually sanity-checked
- No critical or high security issues are introduced in the release diff

## Prisma
Set `DATABASE_URL` for Supabase/PostgreSQL and run migrations as needed.
