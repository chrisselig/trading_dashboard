-- Turso schema for forex_dashboard
-- Mirrors the forex_trading_bot local SQLite database (read-only replica)
-- Upload with: turso db shell <db-name> < turso_schema.sql

CREATE TABLE IF NOT EXISTS events (
    id INTEGER NOT NULL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    country VARCHAR(10) NOT NULL,
    impact VARCHAR(10) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    actual VARCHAR(50),
    forecast VARCHAR(50),
    previous VARCHAR(50),
    fred_series VARCHAR(50),
    created_at DATETIME NOT NULL,
    pairs_json TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER NOT NULL PRIMARY KEY,
    ib_order_id INTEGER,
    instrument VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL,
    order_type VARCHAR(10) NOT NULL,
    quantity FLOAT NOT NULL,
    price FLOAT,
    stop_loss FLOAT,
    take_profit FLOAT,
    status VARCHAR(20) NOT NULL,
    event_id INTEGER,
    strategy VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    filled_at DATETIME,
    fill_price FLOAT,
    entry_spread_pips FLOAT,
    slippage_pips FLOAT,
    commission FLOAT,
    account_type VARCHAR(10) DEFAULT 'paper'
);

CREATE TABLE IF NOT EXISTS trades (
    id INTEGER NOT NULL PRIMARY KEY,
    order_id INTEGER,
    instrument VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL,
    quantity FLOAT NOT NULL,
    entry_price FLOAT NOT NULL,
    exit_price FLOAT,
    stop_loss FLOAT,
    take_profit FLOAT,
    pnl FLOAT,
    pnl_pips FLOAT,
    event_id INTEGER,
    strategy VARCHAR(50) NOT NULL,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME,
    notes TEXT,
    entry_spread_pips FLOAT,
    fill_price FLOAT,
    slippage_pips FLOAT,
    commission FLOAT,
    account_type VARCHAR(10) DEFAULT 'paper'
);
