# NutriFlow AI — Complete Setup & Usage Guide

This guide explains **everything step-by-step** to run NutriFlow AI on your computer (Windows/macOS/Linux), initialize the database, start frontend/backend, and use the app safely.

---

## 1) What You’re Installing

NutriFlow AI has:
- **Backend**: NestJS API (`apps/backend`)
- **Frontend**: React + Vite web app (`apps/frontend`)
- **Database**: SQLite file (local, no DB server required)
- **AI Provider**: OpenAI API key

---

## 2) Prerequisites

Install these first:

1. **Node.js 20+**
   - Check: `node -v`
2. **npm 10+**
   - Check: `npm -v`
3. **Git**
   - Check: `git --version`

Optional:
- **Docker Desktop** (if you want to run with Docker)

---

## 3) Download the Project

```bash
git clone <your-repo-url>
cd NutriFlowAI
```

If you already have the project, just open terminal in the repo root.

---

## 4) Configure Environment Variables

Create local env file from sample:

```bash
cp .env.example .env
```

Open `.env` and verify values:

- `DATABASE_URL="file:./apps/backend/prisma/dev.db"`
- `JWT_SECRET=...` (set a long random secret)
- `OPENAI_API_KEY=...` (your real OpenAI key)
- `OPENAI_MODEL=gpt-4o-mini` (or model of your choice)
- `FRONTEND_URL=http://localhost:5173`
- `VITE_API_URL=http://localhost:4000`

---

## 5) Install Dependencies

From repo root:

```bash
npm install
```

This installs root + workspace dependencies.

---

## 6) Initialize Prisma + SQLite Database

Run:

```bash
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run prisma:migrate -- --name init
```

Optional seed data:

```bash
npm --workspace apps/backend run seed
```

After this, SQLite DB file will exist at:
- `apps/backend/prisma/dev.db`

---

## 7) Start the App (Local Development)

From repo root:

```bash
npm run dev
```

This starts:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

Open browser: `http://localhost:5173`

---

## 8) How to Use the App (First Run)

1. **Register a user** (via API tool or add register UI if needed)
2. **Login** in app UI (current login form)
3. Start chat with NutriFlow AI:
   - It asks progressive onboarding questions
   - One question at a time
4. Submit daily metrics (water/sleep/steps/mood)
5. Click **Generate Plan** to create meal plan + grocery list
6. Review generated grocery sections in right panel

---

## 9) API Endpoints You Can Test

Auth:
- `POST /auth/register`
- `POST /auth/login`

User/profile:
- `GET /users/me`

AI:
- `POST /ai/chat`
- `POST /ai/generate-plan`
- `GET /ai/nutrition-preview`

Meal plans:
- `GET /meal-plans`
- `POST /meal-plans/generate`

Daily logs:
- `GET /daily-logs`
- `POST /daily-logs`

Most endpoints require `Authorization: Bearer <token>`.

---

## 10) Run with Docker (Alternative)

Build + run:

```bash
docker compose up --build
```

Then open frontend at `http://localhost:5173`.

If ports are busy, change port mappings in `docker-compose.yml`.

---

## 11) Common Problems & Fixes

### A) `npm install` fails
- Check internet access
- Check corporate firewall/registry policy
- Retry with clean cache:
  ```bash
  npm cache clean --force
  npm install
  ```

### B) Prisma errors
- Ensure `.env` exists and `DATABASE_URL` is valid
- Re-run:
  ```bash
  npm --workspace apps/backend run prisma:generate
  npm --workspace apps/backend run prisma:migrate -- --name init
  ```

### C) 401 Unauthorized in frontend
- Login again
- Ensure token exists in browser localStorage
- Confirm backend runs on `http://localhost:4000`

### D) OpenAI errors
- Verify `OPENAI_API_KEY`
- Confirm model name in `OPENAI_MODEL`
- Check rate limits on your OpenAI account

---

## 12) Security Checklist Before Real Deployment

Before production:
1. Use strong `JWT_SECRET`
2. Lock CORS to your real frontend domain
3. Move SQLite to managed Postgres for scale/reliability
4. Add HTTPS via reverse proxy (Nginx/Cloudflare)
5. Add monitoring/logging (Sentry, OpenTelemetry)
6. Rotate API keys regularly
7. Add backup strategy for DB

---

## 13) Recommended Daily Workflow (Developer)

```bash
git pull
npm install
npm --workspace apps/backend run prisma:generate
npm run dev
```

When schema changes:
```bash
npm --workspace apps/backend run prisma:migrate -- --name <change-name>
```

---

## 14) Project Structure (Quick Reference)

- `apps/backend`: NestJS API + Prisma
- `apps/frontend`: React web app
- `.env.example`: environment template
- `docker-compose.yml`: containerized local run
- `docs/SETUP_AND_USAGE_GUIDE.md`: this guide

---

## 15) Final Notes

If you want, next step can be adding:
- UI registration screen
- Password reset flow
- Email verification
- Full conversation history page
- Export grocery list to PDF/print

