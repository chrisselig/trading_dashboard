# Forex Dashboard — Project Instructions

## Project Overview

Professional trading dashboard for the forex trading bot. Displays trade history, performance analytics, event schedules, and system status. Reads from the bot's SQLite database (read-only). Supports both paper and live trading accounts.

**Companion repo**: [forex_trading_bot](https://github.com/chrisselig/forex_trading_bot) — the trading bot that generates the data this dashboard displays.

## Architecture

```
forex-dashboard/
  backend/                # FastAPI (Python)
    app/
      main.py             # FastAPI app, CORS, lifespan
      config.py           # Settings (bot DB path, host, port)
      routers/            # API route modules
        trades.py         # GET /api/trades, /api/trades/{id}
        performance.py    # GET /api/performance (Sharpe, PF, win rate, equity curve)
        events.py         # GET /api/events (upcoming + historical)
        system.py         # GET /api/system (IB status, circuit breaker, positions)
      models/             # Pydantic response schemas
      services/           # Business logic (DB queries, metric calculations)
      db.py               # SQLAlchemy async session (read-only to bot's SQLite)
    requirements.txt
    pyproject.toml
  frontend/               # Next.js + React + TypeScript
    src/
      app/                # Next.js App Router pages
        page.tsx           # Dashboard home (overview cards)
        trades/            # Trade journal page
        performance/       # Analytics page
        events/            # Event schedule page
        system/            # System status page
      components/         # Reusable UI components
        ui/               # shadcn/ui primitives
        charts/           # Chart components (equity curve, P&L distribution)
        tables/           # Data tables (trades, events)
        layout/           # Sidebar, header, theme toggle
      lib/                # Utilities, API client, types
      hooks/              # Custom React hooks (useApi, useWebSocket)
    tailwind.config.ts
    package.json
    tsconfig.json
  docker-compose.yml      # Optional: run both services together
  .env.example            # BOT_DB_PATH, API_HOST, API_PORT
  CLAUDE.md
```

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: SQLAlchemy 2.0 async (aiosqlite) — **read-only** connection to the bot's SQLite DB
- **Server**: Uvicorn
- **Validation**: Pydantic v2
- **Virtual env**: Use `~/anaconda3/envs/forex-bot/bin/python` — same conda env as the bot (shares SQLAlchemy models)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Charts**: Lightweight Charts (TradingView) for equity curves, Recharts for bar/pie charts
- **Data fetching**: TanStack Query (React Query) for caching + refetching
- **Tables**: TanStack Table for sortable/filterable data grids
- **Real-time**: WebSocket for live system status updates
- **Package manager**: pnpm

## Design Philosophy

### Hedge-Fund Grade UI/UX
- **Dark theme by default** — slate/zinc backgrounds, high-contrast data
- **Data-dense layouts** — maximize information per screen, minimize whitespace waste
- **Monospace numbers** — all financial figures in tabular/monospace font for alignment
- **Color coding** — green for profit/positive, red for loss/negative, amber for warnings
- **Mobile-responsive** — usable on phone (user checks trades while commuting)
- **Fast** — no loading spinners for cached data, optimistic updates, skeleton loaders
- **Bloomberg Terminal meets modern web** — professional, not flashy

### Color Palette
```
Background:     slate-950 (#020617)
Surface:        slate-900 (#0f172a)
Card:           slate-800/50 with border slate-700
Text primary:   slate-50
Text secondary: slate-400
Profit/Up:      emerald-400 (#34d399)
Loss/Down:      red-400 (#f87171)
Warning:        amber-400 (#fbbf24)
Accent:         violet-500 (#8b5cf6)
```

## Key Conventions

### Backend
- Async/await throughout — never block the event loop
- All responses use Pydantic models (not raw dicts)
- Database is **read-only** — never write to the bot's DB from the dashboard
- Absolute imports: `from app.services.trades import TradeService`
- Error responses follow RFC 7807 (Problem Details)
- All timestamps returned as UTC ISO 8601, frontend converts to ET for display

### Frontend
- **TypeScript strict** — no `any` types, no `@ts-ignore`
- Components: functional with hooks, no class components
- File naming: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Colocate tests: `component.test.tsx` next to `component.tsx`
- Server components by default, `"use client"` only when needed (interactivity, hooks)
- API types auto-generated or manually mirrored from backend Pydantic models

### Git Workflow (same as bot repo)
- Always create a feature branch for new features, bug fixes, and refactors
- Branch naming: `feat/short-description`, `fix/short-description`
- Open a PR via `gh pr create` when ready
- Small doc-only changes may go directly to `main` if requested

## Data Connection

The dashboard connects to the bot's SQLite database via a file path:

```bash
# .env
BOT_DB_PATH=/home/doopdeep/00_data_projects/forex_trading_bot/data/forex_bot.db
BOT_CONFIG_PATH=/home/doopdeep/00_data_projects/forex_trading_bot/config/settings.yaml
```

### Key Database Tables (from the bot)
- `orders` — All orders placed (instrument, side, type, quantity, price, SL, TP, status, strategy, event_id, timestamps)
- `trades` — Filled trades with entry/exit prices and P&L
- `events` — Economic events (title, country, impact, scheduled_at, actual, forecast, previous)

### Settings Access
The dashboard reads `config/settings.yaml` from the bot repo to display:
- Which pairs are active and their straddle parameters
- Risk limits (max positions, max drawdown, spread limits)
- Event targets and filters

## Pages

### 1. Dashboard Home (`/`)
- Summary cards: today's P&L, open positions, next event countdown, connection status
- Mini equity curve (last 30 days)
- Recent trades (last 5)
- Upcoming events (next 3)

### 2. Trade Journal (`/trades`)
- Full trade table: date, pair, side, entry, exit, P&L (pips + $), strategy, event, status
- Filters: date range, pair, event type, strategy, paper/live
- Running equity curve
- Export to CSV

### 3. Performance Analytics (`/performance`)
- KPI cards: total P&L, Sharpe ratio, win rate, profit factor, max drawdown
- P&L by pair (bar chart)
- P&L by event type (bar chart)
- P&L by month (heatmap or bar)
- Win rate over time (rolling)
- Drawdown chart
- Paper vs live comparison toggle

### 4. Event Schedule (`/events`)
- Upcoming events table with countdown timers
- Which pairs will trade each event
- Straddle parameters being used
- Historical events with actual vs forecast, surprise magnitude
- Calendar view (month)

### 5. System Status (`/system`)
- IB connection state (connected/disconnected, last heartbeat)
- Circuit breaker status (active/cooldown/halted)
- Active positions with live P&L
- Pending orders
- Bot uptime
- Last calendar refresh

## Common Commands

```bash
# Backend
cd backend
~/anaconda3/envs/forex-bot/bin/python -m uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # Production build
pnpm lint         # ESLint + TypeScript check

# Both (via docker-compose)
docker-compose up
```

## Deployment & Hosting

### Architecture Constraint
The backend **must** run on the same machine as the trading bot — it reads the bot's local SQLite file. There is no cloud database.

### Self-Hosted (Primary)
Both backend and frontend run on the bot machine. The bot machine already runs 24/5 (weekday cron for TWS).

```bash
# Production backend (systemd service or PM2)
~/anaconda3/envs/forex-bot/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Production frontend (static export served by nginx or Next.js standalone)
cd frontend && pnpm build && pnpm start  # http://localhost:3000
```

### Remote Access (Free)
To access the dashboard from phone/laptop outside the home network:

- **Cloudflare Tunnel** (recommended, free) — `cloudflared tunnel` exposes localhost to a `*.cfargotunnel.com` subdomain. No port forwarding, no dynamic DNS. Install once, runs as a systemd service.
- **Tailscale** (alternative, free for personal use) — mesh VPN, access via Tailscale IP. Simpler but requires Tailscale on every client device.

### GitHub Actions CI/CD

CI runs on every PR and push to `main`:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r backend/requirements.txt
      - run: cd backend && python -m pytest tests/ -v
      - run: cd backend && python -m ruff check .

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm, cache-dependency-path: frontend/pnpm-lock.yaml }
      - run: cd frontend && pnpm install --frozen-lockfile
      - run: cd frontend && pnpm lint
      - run: cd frontend && pnpm build
```

Deployment to the bot machine is a `git pull && restart` (manual or via a simple deploy script). No need for Docker in production — the machine already has the conda env and Node.js.

### Optional: Auto-Deploy on Push
If you want push-to-deploy, add a GitHub Actions workflow that SSHs into the bot machine:

```yaml
# .github/workflows/deploy.yml (optional)
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: ssh bot-machine "cd ~/forex-dashboard && git pull && cd frontend && pnpm build && sudo systemctl restart forex-dashboard"
```

This requires adding an SSH key as a GitHub secret. Only set up if manual deploys become tedious.

## General Rules

- When the user asks you to create specific files (CLAUDE.md, skills, configs), create them in the same session — do not defer or forget. Treat explicit file creation requests as hard requirements.
- When the user asks "how do I access X" or "where is X deployed", give the direct URL or command first, then explain details only if asked.

## Testing & Linting

This project uses Python (primary), TypeScript (dashboard), and YAML (configs). Always run `ruff check` and `pytest` after Python changes. For TypeScript, run the build to catch type errors before committing.

Testing is mandatory. Every new feature, bug fix, or refactor must include tests. Do not skip tests or defer them. CI must pass before merging.

### Backend (Python — pytest)

- **Location**: `backend/tests/` — mirror the `app/` structure (e.g., `tests/services/test_trades.py`)
- **Framework**: pytest with pytest-asyncio for async tests
- **Run**: `cd backend && python -m pytest tests/ -v`
- All service logic must be tested. Use an in-memory SQLite DB, not the real bot DB.
- Test edge cases: empty tables, null fields, boundary values (limit=0, limit=500).

#### Good examples

```python
# tests/services/test_performance.py
import pytest
from app.services.performance import PerformanceService

class TestSharpe:
    def test_sharpe_with_positive_trades(self):
        """Sharpe ratio should be positive for consistently profitable trades."""
        pnls = [10.0, 20.0, 15.0, 25.0, 30.0]
        result = PerformanceService._sharpe(pnls)
        assert result > 0

    def test_sharpe_with_single_trade_returns_zero(self):
        """Need at least 2 trades to calculate standard deviation."""
        assert PerformanceService._sharpe([10.0]) == 0.0

    def test_sharpe_with_identical_trades_returns_zero(self):
        """Zero std deviation means Sharpe is undefined, return 0."""
        assert PerformanceService._sharpe([10.0, 10.0, 10.0]) == 0.0

class TestMaxDrawdown:
    def test_no_drawdown_when_always_profitable(self):
        assert PerformanceService._max_drawdown([10, 20, 30]) == 0.0

    def test_drawdown_after_peak(self):
        result = PerformanceService._max_drawdown([100, -50, -30])
        assert result == 80.0  # peak=100, trough=20, dd=80

    def test_empty_pnls(self):
        assert PerformanceService._max_drawdown([]) == 0.0
```

```python
# tests/services/test_trades.py
import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.services.trades import TradeService

@pytest.fixture
async def session():
    """Create an in-memory SQLite DB with the trades schema."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE trades (
                id INTEGER PRIMARY KEY, instrument TEXT, side TEXT,
                quantity REAL, entry_price REAL, exit_price REAL,
                pnl REAL, opened_at TEXT, closed_at TEXT,
                strategy TEXT DEFAULT '', notes TEXT,
                order_id INTEGER, stop_loss REAL, take_profit REAL,
                pnl_pips REAL, event_id INTEGER,
                entry_spread_pips REAL, fill_price REAL, slippage_pips REAL
            )
        """))
    async_session = async_sessionmaker(engine, class_=AsyncSession)
    async with async_session() as s:
        yield s

@pytest.mark.asyncio
async def test_get_trades_empty_table(session):
    service = TradeService(session)
    trades = await service.get_trades()
    assert trades == []
    assert await service.count_trades() == 0

@pytest.mark.asyncio
async def test_todays_pnl_no_trades(session):
    service = TradeService(session)
    assert await service.get_todays_pnl() == 0.0
```

#### Bad examples — do NOT do this

```python
# BAD: Testing nothing meaningful
def test_trade_service_exists():
    assert TradeService is not None  # This tests nothing

# BAD: No assertions
async def test_get_trades(session):
    service = TradeService(session)
    service.get_trades()  # Forgot to assert or even await

# BAD: Testing implementation details instead of behavior
def test_build_trades_sql_has_select():
    sql = service._build_trades_sql(None, None, None, None, None, 50, 0)
    assert "SELECT" in sql  # Tests SQL string, not query results

# BAD: Using the real bot database in tests
def test_real_db():
    conn = sqlite3.connect("/home/doopdeep/.../forex_bot.db")  # Never do this

# BAD: No test isolation — tests depend on each other's state
class TestTrades:
    shared_data = []
    def test_insert(self):
        self.shared_data.append({"id": 1})
    def test_read(self):
        assert len(self.shared_data) == 1  # Fails if test_insert didn't run first
```

### Frontend (TypeScript — Jest or Vitest)

- **Location**: colocated next to source — `component.test.tsx` beside `component.tsx`
- **Run**: `cd frontend && pnpm test`
- Test utility functions, data transformations, and hooks. UI components with React Testing Library.

#### Good examples

```typescript
// src/lib/formatters.test.ts
import { formatPnl, formatPips } from "./formatters";

describe("formatPnl", () => {
  it("formats positive P&L with + sign and green", () => {
    expect(formatPnl(123.45)).toBe("+$123.45");
  });

  it("formats negative P&L with - sign", () => {
    expect(formatPnl(-50.0)).toBe("-$50.00");
  });

  it("formats zero as $0.00", () => {
    expect(formatPnl(0)).toBe("$0.00");
  });

  it("handles null gracefully", () => {
    expect(formatPnl(null)).toBe("—");
  });
});
```

#### Bad examples — do NOT do this

```typescript
// BAD: Snapshot test with no thought — breaks on any CSS change
it("renders", () => {
  const { container } = render(<TradeTable trades={[]} />);
  expect(container).toMatchSnapshot();  // Fragile, no intent

// BAD: Testing library internals
it("uses useState internally", () => {
  // Don't test React internals, test user-visible behavior

// BAD: No description of what's being tested
it("works", () => {
  expect(formatPnl(10)).toBeTruthy();  // What does "works" mean?
});
```

### General Testing Rules

1. **Tests must run in CI** — if it's not in the CI pipeline, it doesn't count
2. **Use descriptive test names** — name should explain the scenario and expected outcome
3. **One assertion per concept** — test one behavior per test function
4. **Test boundaries** — empty inputs, nulls, max values, negative numbers
5. **Never test against production data** — always use fixtures or in-memory DBs
6. **Tests must be independent** — no shared mutable state, no ordering dependencies
7. **Run tests before pushing** — `pytest` / `pnpm test` locally before `git push`

## CI/CD

When modifying CI/CD configs, always verify all dependencies (ruff, pytest, etc.) are included in requirements files and that build-time env vars are handled gracefully with fallbacks.

## Alberta/Canada Notes
- User is in Mountain Time (America/Edmonton)
- Display times in Eastern Time (ET) — industry standard for US economic releases
- OANDA is NOT available in Alberta — never suggest it
- All monetary values in CAD (account base currency) unless otherwise noted
