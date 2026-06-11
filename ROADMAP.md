# Roadmap

## Phase 1: Cloud Deployment (access from anywhere)

### 1.1 Cloud Database — Turso (free)

The bot writes to a local SQLite DB. To access data when the machine is off, sync it to [Turso](https://turso.tech) — a cloud SQLite (libSQL) service. The schema maps 1:1, no query rewrites needed.

**Free tier:** 5 GB storage, 500M row reads/month, 100 databases.

**Sync strategy:**
- Add a cron job on the bot machine (already runs 24/5 for TWS) that pushes the local SQLite to Turso every 15 minutes using the `libsql-client` Python SDK.
- The cloud dashboard reads from Turso instead of the local file.
- The local dev setup continues reading from the local SQLite — no changes needed.

> **Why not MotherDuck?** MotherDuck uses DuckDB, a different SQL dialect. Turso is cloud SQLite (libSQL fork), so all existing queries, schema, and types work without modification.

### 1.2 Frontend Deployment — Vercel (free)

Deploy the Next.js frontend to [Vercel](https://vercel.com). Native Next.js support, zero config, auto-deploys on push to `main`.

**Free tier:** 100 GB bandwidth/month, serverless functions, custom domains.

**Key change:** Move API routes into Next.js API Route Handlers (`app/api/`) that read from Turso directly. This eliminates the need for a separate backend host — everything runs on Vercel's serverless functions.

The local FastAPI backend stays for development, but the production cloud version is a single Vercel deployment.

### 1.3 Authentication — Auth.js + GitHub OAuth (free)

Add [Auth.js](https://authjs.dev) (NextAuth v5) with GitHub as the OAuth provider. Only your GitHub account can access the dashboard.

- Free, no third-party auth service needed.
- Single environment variable to allowlist your GitHub username.
- Middleware protects all routes — unauthenticated users see a login page.
- Works on Vercel free tier out of the box.

### 1.4 Data Sync Script

A Python script that runs on the bot machine via cron:

```
Bot machine (cron every 15 min)
  └─> reads local SQLite
  └─> pushes new/updated rows to Turso cloud

Vercel (serverless)
  └─> Next.js API routes read from Turso
  └─> serves dashboard to browser
```

---

## Phase 2: Dashboard Enhancements

### 2.1 CSV Export
- Add "Export to CSV" button on the trades page.
- Client-side generation from the already-fetched data.

### 2.2 Trade Detail Drawer
- Click a trade row to open a slide-over panel with full details.
- Show related order, event context, and notes.

### 2.3 Date Range Filters
- Date picker on trades and performance pages.
- Filter equity curve and KPIs to custom date ranges.

### 2.4 P&L Heatmap
- Monthly P&L heatmap on the performance page (calendar grid, color intensity by P&L).

---

## Phase 3: Real-Time Features

### 3.1 WebSocket Live Updates (local mode)
- WebSocket endpoint on FastAPI for live system status.
- Open positions with real-time P&L from IB.
- Connection heartbeat indicator.

### 3.2 Event Countdown Push
- When an event is < 5 minutes away, show a prominent banner on all pages.

### 3.3 Telegram Notification Links
- Deep-link from Telegram bot notifications to the relevant trade/event page in the dashboard.

---

## Phase 4: Analytics Depth

### 4.1 Rolling Win Rate Chart
- Line chart of win rate over a rolling 20-trade window.

### 4.2 Drawdown Chart
- Dedicated drawdown visualization below the equity curve.

### 4.3 Paper vs Live Toggle
- Toggle on performance page to compare paper and live trading results side by side.

### 4.4 Event Outcome Analysis
- For each event type: average P&L, win rate, best/worst outcome.
- Surprise magnitude vs P&L scatter plot.

---

## Deployment Architecture Summary

```
LOCAL (development)                    CLOUD (production)
─────────────────                      ──────────────────
Bot machine                            Vercel (free)
  ├─ forex_trading_bot                   ├─ Next.js frontend
  │    └─ SQLite DB (write)              │    ├─ App Router pages
  │                                      │    ├─ API Route Handlers
  ├─ trading_dashboard                   │    └─ Auth.js middleware
  │    ├─ FastAPI (reads SQLite)          │
  │    └─ Next.js dev server             └─ Turso (free)
  │                                           └─ Cloud SQLite (read)
  └─ sync script (cron 15m)
       └─ pushes SQLite → Turso
```
