import type { Row } from "@libsql/client";

/** Ensure a datetime string is treated as UTC by appending Z if missing. */
function utcify(val: unknown): string | unknown {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (!trimmed || trimmed.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(trimmed))
    return val;
  return trimmed.replace(" ", "T") + "Z";
}

/** Enrich a Turso event row: parse pairs_json and fix datetime timezone. */
export function enrichEventRow(row: Row) {
  const pairsJson = row.pairs_json;
  let pairs: unknown[] = [];
  if (typeof pairsJson === "string" && pairsJson) {
    try {
      pairs = JSON.parse(pairsJson);
    } catch {
      /* ignore malformed JSON */
    }
  }
  return {
    ...row,
    scheduled_at: utcify(row.scheduled_at),
    created_at: utcify(row.created_at),
    pairs,
  };
}
