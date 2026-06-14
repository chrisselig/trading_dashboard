# Forex Trading Dashboard

**Live**: https://trading-dashboard-chi-wheat.vercel.app/

Professional trading dashboard for monitoring the [forex trading bot](https://github.com/chrisselig/forex_trading_bot). Trade journal, performance analytics, event schedules, and system status.

## Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: Turso (cloud SQLite) — data synced from the bot's local SQLite DB
- **Charts**: TradingView Lightweight Charts + Recharts

## Setup

```bash
# 1. Frontend
cd frontend
cp .env.local.example .env.local
# Edit .env.local to set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
pnpm install
pnpm dev
```

Dashboard runs at http://localhost:3000.

## Deployment

The frontend is deployed on Vercel: https://trading-dashboard-chi-wheat.vercel.app/

- **Framework**: Next.js (Vercel preset)
- **Root Directory**: `frontend/`
- **Environment Variables**: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (set in Vercel project settings)
