# Forex Trading Dashboard

Professional trading dashboard for monitoring the [forex trading bot](https://github.com/chrisselig/forex_trading_bot). Trade journal, performance analytics, event schedules, and system status.

## Stack

- **Backend**: FastAPI + SQLAlchemy (reads bot's SQLite DB)
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Charts**: TradingView Lightweight Charts + Recharts

## Setup

```bash
# 1. Copy env
cp .env.example .env
# Edit .env to point BOT_DB_PATH to your bot's database

# 2. Backend
cd backend
~/anaconda3/envs/forex-bot/bin/python -m uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd frontend
pnpm install
pnpm dev
```

Dashboard runs at http://localhost:3000, API at http://localhost:8000.

## Deployment

The frontend is deployed on Vercel: https://tradingdashboardforbot.vercel.app/

- **Framework**: Next.js (Vercel preset)
- **Root Directory**: `frontend/`
- **Environment Variables**: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (set in Vercel project settings)
