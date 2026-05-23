# NutriFlow AI

NutriFlow AI is a full-stack conversational meal-planning SaaS app with progressive AI onboarding, nutrition target calculation, and structured plan generation.

## What now works (core point)
- Conversational onboarding that asks **one question at a time** and stores answers in conversation metadata.
- Automatic nutrition profile creation (BMR/TDEE/macros) after onboarding completion.
- Structured meal-plan generation endpoint returning JSON for meals + grocery sections.
- Authenticated chat memory (`conversationId`) so the assistant maintains context across turns.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind + Framer Motion + Zustand
- Backend: NestJS + Prisma + SQLite (local) + JWT + OpenAI API

## Local Setup (SQLite)
1. `cp .env.example .env`
2. `npm i`
3. `npm --workspace apps/backend run prisma:generate`
4. `npm --workspace apps/backend run prisma:migrate -- --name init`
5. `npm run dev`

## Key API
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `POST /ai/chat`
- `POST /ai/generate-plan`
- `GET /ai/nutrition-preview`

## Docker
- `docker compose up --build`
- Uses SQLite file DB locally (`apps/backend/prisma/dev.db`) for zero-dependency boot.
