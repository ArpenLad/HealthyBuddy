# HealthyBuddy

HealthyBuddy is a gentle wellness dashboard for tracking daily habits, building consistency, and reviewing progress.

## Features

- Dashboard overview with progress and streaks
- Daily habit controls for updating progress
- Habit management for creating, editing, enabling, and deleting routines
- Analytics view for weekly consistency
- Optional browser reminders

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Habit tracking behavior

Dashboard updates are stored by calendar date. A habit can only be changed from the current day’s dashboard, and changes are kept separate from other dates. Existing saved data is migrated into today’s date automatically.

## Scripts

- `pnpm dev` — start the development server
- `pnpm build` — create a production build
- `pnpm lint` — run ESLint

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, and Lucide icons.
