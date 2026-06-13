"""Sync local SQLite database to Turso cloud.

Reads all rows from the bot's local SQLite DB and upserts them into Turso.
Designed to run via cron every 15 minutes on the bot machine.

Usage:
    ~/anaconda3/envs/forex-bot/bin/python backend/scripts/sync_to_turso.py

Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env (project root).
"""

import logging
import sqlite3
import sys
from pathlib import Path

import libsql_experimental as libsql

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TABLES = {
    "events": {
        "columns": [
            "id", "title", "country", "impact", "scheduled_at",
            "actual", "forecast", "previous", "fred_series", "created_at",
        ],
        "conflict_key": "id",
    },
    "orders": {
        "columns": [
            "id", "ib_order_id", "instrument", "side", "order_type",
            "quantity", "price", "stop_loss", "take_profit", "status",
            "event_id", "strategy", "created_at", "filled_at", "fill_price",
            "entry_spread_pips", "slippage_pips",
        ],
        "conflict_key": "id",
    },
    "trades": {
        "columns": [
            "id", "order_id", "instrument", "side", "quantity",
            "entry_price", "exit_price", "stop_loss", "take_profit", "pnl",
            "pnl_pips", "event_id", "strategy", "opened_at", "closed_at",
            "notes", "entry_spread_pips", "fill_price", "slippage_pips",
        ],
        "conflict_key": "id",
    },
}


def load_env() -> dict[str, str]:
    """Load .env file from project root (simple key=value parsing)."""
    env_path = PROJECT_ROOT / ".env"
    if not env_path.exists():
        log.error(".env file not found at %s", env_path)
        sys.exit(1)

    env_vars: dict[str, str] = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, value = line.partition("=")
            env_vars[key.strip()] = value.strip()
    return env_vars


def read_local_rows(db_path: str, table: str, columns: list[str]) -> list[tuple]:
    """Read all rows from a local SQLite table."""
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.execute(f"SELECT {', '.join(columns)} FROM {table}")  # noqa: S608
        return cursor.fetchall()
    finally:
        conn.close()


def build_upsert_sql(table: str, columns: list[str], conflict_key: str) -> str:
    """Build an INSERT OR REPLACE statement."""
    placeholders = ", ".join("?" for _ in columns)
    col_list = ", ".join(columns)
    return f"INSERT OR REPLACE INTO {table} ({col_list}) VALUES ({placeholders})"


def sync_table(
    turso_conn: libsql.Connection,
    db_path: str,
    table: str,
    columns: list[str],
    conflict_key: str,
) -> int:
    """Sync a single table from local SQLite to Turso. Returns row count."""
    rows = read_local_rows(db_path, table, columns)
    if not rows:
        log.info("  %s: 0 rows (empty)", table)
        return 0

    sql = build_upsert_sql(table, columns, conflict_key)
    for row in rows:
        turso_conn.execute(sql, row)
    turso_conn.commit()

    log.info("  %s: %d rows synced", table, len(rows))
    return len(rows)


def main() -> None:
    env = load_env()

    db_path = env.get("BOT_DB_PATH")
    turso_url = env.get("TURSO_DATABASE_URL")
    turso_token = env.get("TURSO_AUTH_TOKEN")

    if not db_path or not Path(db_path).exists():
        log.error("BOT_DB_PATH not set or file not found: %s", db_path)
        sys.exit(1)
    if not turso_url or not turso_token:
        log.error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env")
        sys.exit(1)

    log.info("Connecting to Turso: %s", turso_url)
    turso_conn = libsql.connect(database=turso_url, auth_token=turso_token)

    total = 0
    for table, config in TABLES.items():
        total += sync_table(
            turso_conn, db_path, table, config["columns"], config["conflict_key"]
        )

    log.info("Sync complete: %d total rows across %d tables", total, len(TABLES))


if __name__ == "__main__":
    main()
