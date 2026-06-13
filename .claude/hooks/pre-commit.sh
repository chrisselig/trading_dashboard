#!/bin/bash
# Pre-commit hook: runs ruff check and pytest on backend before allowing commits.
# Called by Claude Code via .claude/settings.json PreToolUse hook.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
PYTHON="$HOME/anaconda3/envs/forex-bot/bin/python"

errors=""

# --- Backend: ruff lint ---
if ! "$PYTHON" -m ruff check "$PROJECT_DIR/backend/" 2>&1; then
  errors="$errors\n- ruff check failed. Run: python -m ruff check backend/ --fix"
fi

# --- Backend: pytest (only if tests exist) ---
if find "$PROJECT_DIR/backend/tests" -name '*.py' 2>/dev/null | grep -q .; then
  if ! "$PYTHON" -m pytest "$PROJECT_DIR/backend/tests/" -q --tb=short 2>&1; then
    errors="$errors\n- pytest failed. Run: python -m pytest backend/tests/ -v"
  fi
fi

# --- Report ---
if [ -n "$errors" ]; then
  reason=$(printf "Pre-commit checks failed:\n%b\n\nFix the issues before committing." "$errors")
  jq -n --arg reason "$reason" '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": $reason
    }
  }'
  exit 0
fi

exit 0
