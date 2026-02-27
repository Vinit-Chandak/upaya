#!/usr/bin/env bash
# ============================================================
# Upaya — One-Click Dev Environment Setup & Launch
# ============================================================
# Usage:
#   bash scripts/dev.sh              # Full setup + launch
#   bash scripts/dev.sh --run-only   # Skip install/migrate, just launch servers
#   bash scripts/dev.sh --setup-only # Install + migrate only, don't launch
#   bash scripts/dev.sh --no-emulator # Launch without Android emulator
#
# Requirements:
#   - Git Bash (MINGW64) on Windows
#   - Node.js >= 20
#   - PostgreSQL installed and service running
#   - Android SDK + AVD configured (for emulator)
#
# Configuration:
#   Copy scripts/setup.conf.example to scripts/setup.conf
#   and fill in your machine-specific values.
# ============================================================

set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

# ---- Resolve project root (script lives in <root>/scripts/) ----
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ---- Parse flags ----
RUN_ONLY=false
SETUP_ONLY=false
NO_EMULATOR=false
for arg in "$@"; do
  case $arg in
    --run-only)    RUN_ONLY=true ;;
    --setup-only)  SETUP_ONLY=true ;;
    --no-emulator) NO_EMULATOR=true ;;
    --help|-h)
      echo "Usage: bash scripts/dev.sh [--run-only] [--setup-only] [--no-emulator]"
      exit 0 ;;
    *) warn "Unknown flag: $arg" ;;
  esac
done

# ---- Load config ----
CONF_FILE="$SCRIPT_DIR/setup.conf"
if [ ! -f "$CONF_FILE" ]; then
  warn "No scripts/setup.conf found — copying from setup.conf.example"
  if [ -f "$SCRIPT_DIR/setup.conf.example" ]; then
    cp "$SCRIPT_DIR/setup.conf.example" "$CONF_FILE"
    warn "Please edit scripts/setup.conf with your machine's values, then re-run."
    exit 1
  else
    fail "No setup.conf.example found either. Cannot continue."
  fi
fi
# shellcheck source=/dev/null
source "$CONF_FILE"

# ---- Defaults (if not set in config) ----
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-upaya_dev_2026}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-upaya}"
PG_BIN="${PG_BIN:-}"
ANDROID_SDK="${ANDROID_SDK:-}"
AVD_NAME="${AVD_NAME:-}"
API_PORT="${API_PORT:-3001}"
EXPO_PORT="${EXPO_PORT:-8081}"
WEB_PORT="${WEB_PORT:-3000}"
LLM_DEFAULT_PROVIDER="${LLM_DEFAULT_PROVIDER:-anthropic}"
LLM_FALLBACK_PROVIDER="${LLM_FALLBACK_PROVIDER:-openai}"

# ---- Build PATH ----
# npm global bin (where pnpm lives)
NPM_GLOBAL="$(npm root -g 2>/dev/null | sed 's|/node_modules||')"
if [ -n "$NPM_GLOBAL" ]; then
  export PATH="$PATH:$NPM_GLOBAL"
fi

# PostgreSQL
if [ -n "$PG_BIN" ] && [ -d "$PG_BIN" ]; then
  export PATH="$PATH:$PG_BIN"
fi

# Android SDK
if [ -n "$ANDROID_SDK" ] && [ -d "$ANDROID_SDK" ]; then
  export ANDROID_HOME="$ANDROID_SDK"
  export ANDROID_SDK_ROOT="$ANDROID_SDK"
  export PATH="$PATH:$ANDROID_SDK/platform-tools:$ANDROID_SDK/emulator:$ANDROID_SDK/tools:$ANDROID_SDK/tools/bin"
fi

# Java (auto-detect from Program Files)
if ! command -v java &>/dev/null; then
  for jdir in "/c/Program Files/Java"/jdk-*/bin "/c/Program Files/Eclipse Adoptium"/jdk-*/bin; do
    if [ -d "$jdir" ]; then
      export PATH="$PATH:$jdir"
      break
    fi
  done
fi

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo ""
echo "============================================"
echo "  Upaya Dev Environment"
echo "============================================"
echo ""

# ============================================================
# PHASE 1: Checks
# ============================================================
info "Checking prerequisites..."

# Node.js
if ! command -v node &>/dev/null; then
  fail "Node.js not found. Install Node.js >= 20 from https://nodejs.org"
fi
NODE_VER="$(node -v)"
info "  Node.js: $NODE_VER"

# pnpm
if ! command -v pnpm &>/dev/null; then
  warn "pnpm not found. Installing via npm..."
  npm install -g pnpm@9 || fail "Failed to install pnpm"
fi
PNPM_VER="$(pnpm --version)"
info "  pnpm: $PNPM_VER"

# Git
if ! command -v git &>/dev/null; then
  fail "Git not found."
fi
info "  Git: $(git --version | cut -d' ' -f3)"

# PostgreSQL
if command -v psql &>/dev/null; then
  info "  PostgreSQL: $(psql --version | cut -d' ' -f3)"
else
  fail "psql not found. Set PG_BIN in setup.conf to your PostgreSQL bin directory."
fi

# PostgreSQL service running
if command -v pg_isready &>/dev/null; then
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" &>/dev/null; then
    ok "  PostgreSQL is running on ${DB_HOST}:${DB_PORT}"
  else
    fail "PostgreSQL is not running on ${DB_HOST}:${DB_PORT}. Start the service first."
  fi
fi

# Android SDK (only if needed)
if [ "$NO_EMULATOR" = false ] && [ "$SETUP_ONLY" = false ]; then
  if [ -z "$ANDROID_SDK" ] || [ ! -d "$ANDROID_SDK" ]; then
    warn "Android SDK not found at '$ANDROID_SDK'. Set ANDROID_SDK in setup.conf."
    warn "Continuing without emulator support."
    NO_EMULATOR=true
  else
    info "  Android SDK: $ANDROID_SDK"
    if [ -n "$AVD_NAME" ]; then
      if emulator -list-avds 2>/dev/null | grep -q "^${AVD_NAME}$"; then
        ok "  AVD '$AVD_NAME' found"
      else
        warn "  AVD '$AVD_NAME' not found. Available: $(emulator -list-avds 2>/dev/null | tr '\n' ', ')"
        NO_EMULATOR=true
      fi
    else
      warn "  AVD_NAME not set in setup.conf. Skipping emulator."
      NO_EMULATOR=true
    fi
  fi
fi

echo ""

# ============================================================
# PHASE 2: Install & Build (skip with --run-only)
# ============================================================
if [ "$RUN_ONLY" = false ]; then
  info "Installing dependencies..."
  pnpm install || fail "pnpm install failed"
  ok "Dependencies installed"

  info "Building shared package..."
  pnpm --filter @upaya/shared build || fail "Shared package build failed"
  ok "Shared package built"

  # ---- Create .env files if missing ----
  JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"

  if [ ! -f "$PROJECT_ROOT/packages/api/.env" ]; then
    info "Creating packages/api/.env..."
    cat > "$PROJECT_ROOT/packages/api/.env" <<APIEOF
# Auto-generated by dev.sh
DATABASE_URL=${DATABASE_URL}
DATABASE_SSL=false

FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-}
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL:-}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY:-}

ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY:-}
LLM_DEFAULT_PROVIDER=${LLM_DEFAULT_PROVIDER}
LLM_FALLBACK_PROVIDER=${LLM_FALLBACK_PROVIDER}

FOUNDRY_BASE_URL=${FOUNDRY_BASE_URL:-}
FOUNDRY_API_KEY=${FOUNDRY_API_KEY:-}
FOUNDRY_MODEL=${FOUNDRY_MODEL:-gpt-4.1-mini}

AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT:-}
AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY:-}
AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME:-}
AZURE_OPENAI_API_VERSION=${AZURE_OPENAI_API_VERSION:-2024-12-01-preview}

RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID:-}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET:-}
RAZORPAY_WEBHOOK_SECRET=${RAZORPAY_WEBHOOK_SECRET:-}

REDIS_URL=redis://localhost:6379

NODE_ENV=development
PORT=${API_PORT}
CORS_ORIGINS=http://localhost:${WEB_PORT},http://localhost:${EXPO_PORT}

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
APIEOF
    ok "packages/api/.env created"
  else
    info "packages/api/.env already exists — skipping"
  fi

  if [ ! -f "$PROJECT_ROOT/.env" ]; then
    info "Creating root .env..."
    cat > "$PROJECT_ROOT/.env" <<ROOTEOF
# Auto-generated by dev.sh
DATABASE_URL=${DATABASE_URL}
DATABASE_SSL=false

FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-}
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL:-}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY:-}
FIREBASE_API_KEY=${FIREBASE_API_KEY:-}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN:-}

ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY:-}
LLM_DEFAULT_PROVIDER=${LLM_DEFAULT_PROVIDER}
LLM_FALLBACK_PROVIDER=${LLM_FALLBACK_PROVIDER}

RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID:-}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET:-}
RAZORPAY_WEBHOOK_SECRET=${RAZORPAY_WEBHOOK_SECRET:-}

GOOGLE_PLACES_API_KEY=

STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_BUCKET=upaya-assets

REDIS_URL=redis://localhost:6379

NODE_ENV=development
PORT=${API_PORT}
API_URL=http://localhost:${API_PORT}
WEB_URL=http://localhost:${WEB_PORT}
CORS_ORIGINS=http://localhost:${WEB_PORT},http://localhost:${EXPO_PORT}

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
ROOTEOF
    ok "Root .env created"
  else
    info "Root .env already exists — skipping"
  fi

  # ---- Create database if it doesn't exist ----
  info "Checking database '${DB_NAME}'..."
  DB_EXISTS=$(PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}';" postgres 2>/dev/null || true)
  if [ "$DB_EXISTS" != "1" ]; then
    info "Creating database '${DB_NAME}'..."
    PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE ${DB_NAME};" postgres || fail "Failed to create database"
    ok "Database '${DB_NAME}' created"
  else
    ok "Database '${DB_NAME}' already exists"
  fi

  # ---- Run migrations ----
  info "Running database migrations..."
  pnpm db:migrate || fail "Migrations failed"
  ok "Migrations complete"

  echo ""
  ok "=== Setup complete ==="
  echo ""
fi

# ============================================================
# PHASE 3: Launch servers (skip with --setup-only)
# ============================================================
if [ "$SETUP_ONLY" = true ]; then
  ok "Setup-only mode. Exiting."
  exit 0
fi

# Track PIDs for cleanup
PIDS=()
cleanup() {
  echo ""
  info "Shutting down..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null
    fi
  done
  # Kill processes on the ports we used
  npx kill-port "$API_PORT" "$EXPO_PORT" 2>/dev/null || true
  ok "All processes stopped."
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# ---- Free ports ----
info "Freeing ports ${API_PORT}, ${EXPO_PORT}..."
npx kill-port "$API_PORT" "$EXPO_PORT" 2>/dev/null || true
sleep 1

# ---- Start Android emulator ----
if [ "$NO_EMULATOR" = false ] && [ -n "$AVD_NAME" ]; then
  # Check if emulator is already running
  if adb devices 2>/dev/null | grep -q "emulator"; then
    ok "Android emulator already running"
  else
    info "Starting Android emulator '${AVD_NAME}'..."
    emulator -avd "$AVD_NAME" -no-snapshot-load &>/dev/null &
    EMU_PID=$!
    PIDS+=("$EMU_PID")

    info "Waiting for emulator to boot..."
    adb wait-for-device 2>/dev/null
    for i in $(seq 1 60); do
      BOOT=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
      if [ "$BOOT" = "1" ]; then
        ok "Emulator booted"
        break
      fi
      if [ "$i" = "60" ]; then
        warn "Emulator is taking too long. Continuing anyway..."
      fi
      sleep 2
    done
  fi
fi

# ---- Start API server ----
info "Starting API server on port ${API_PORT}..."
pnpm --filter @upaya/api dev &
API_PID=$!
PIDS+=("$API_PID")

# Wait for API to be ready
for i in $(seq 1 20); do
  if curl -s "http://localhost:${API_PORT}/health" &>/dev/null; then
    ok "API server ready at http://localhost:${API_PORT}"
    break
  fi
  if [ "$i" = "20" ]; then
    warn "API server didn't respond to health check. It may still be starting..."
  fi
  sleep 2
done

# ---- Start Expo (mobile) ----
if [ "$NO_EMULATOR" = false ]; then
  info "Starting Expo dev server on port ${EXPO_PORT}..."
  (cd "$PROJECT_ROOT/apps/mobile" && npx expo start --android --port "$EXPO_PORT") &
  EXPO_PID=$!
  PIDS+=("$EXPO_PID")
else
  info "Starting Expo dev server on port ${EXPO_PORT} (no emulator)..."
  (cd "$PROJECT_ROOT/apps/mobile" && npx expo start --port "$EXPO_PORT") &
  EXPO_PID=$!
  PIDS+=("$EXPO_PID")
fi

echo ""
echo "============================================"
echo "  Upaya Dev Environment Running"
echo "============================================"
echo ""
echo "  API:      http://localhost:${API_PORT}"
echo "  Health:   http://localhost:${API_PORT}/health"
echo "  Expo:     http://localhost:${EXPO_PORT}"
if [ "$NO_EMULATOR" = false ] && [ -n "$AVD_NAME" ]; then
echo "  Emulator: ${AVD_NAME}"
fi
echo ""
echo "  Press Ctrl+C to stop all servers."
echo "============================================"
echo ""

# Wait for any child to exit
wait
