# Upaya — Windows Local Setup Guide

> Step-by-step instructions to run the full Upaya stack locally on Windows after cloning the repo.
> Covers: API (Express), Web (Next.js), Mobile (Expo + Android Emulator).
>
> Last updated: February 2026

---

## Prerequisites

Install these before starting. Verify each with the command shown.

| Tool | Version | Install | Verify |
|------|---------|---------|--------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) or `nvm` | `node --version` |
| pnpm | 9+ | `npm install -g pnpm@9` | `pnpm --version` |
| Git | any | [git-scm.com](https://git-scm.com) | `git --version` |
| PostgreSQL | 15+ | [postgresql.org](https://www.postgresql.org/download/windows/) | Windows Services |
| VS Build Tools 2022 | 17+ | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) — install **"Desktop development with C++"** workload | `vswhere -products *` |
| Android Studio | latest | [developer.android.com/studio](https://developer.android.com/studio) — needed for the Android Emulator | Android Studio → AVD Manager |
| Python | 3.x | [python.org](https://www.python.org/downloads/) — required by node-gyp | `python --version` |

> **VS Build Tools** and **Python** are required to compile the Swiss Ephemeris native module (`swisseph`).
> **Android Studio** is only needed if you want to run the mobile app on an emulator.

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/your-org/upaya.git
cd upaya
```

---

## Step 2 — Install dependencies

```bash
pnpm install
```

This installs all workspace packages. It will attempt to compile the `swisseph` native module — it may fail here on Windows (see Step 5 for the fix).

---

## Step 3 — Set up PostgreSQL

### 3.1 Make sure the PostgreSQL service is running

Open **Windows Services** (`services.msc`) and confirm `postgresql-x64-XX` is **Running**.
Or check via PowerShell:

```powershell
Get-Service postgresql*
```

If it's stopped, start it:

```powershell
Start-Service postgresql-x64-18   # adjust version number as needed
```

### 3.2 Find psql

PostgreSQL installs `psql.exe` at:
```
C:\Program Files\PostgreSQL\<version>\bin\psql.exe
```

Add it to your PATH, or use the full path in commands below.

### 3.3 Create the database

```bash
PGPASSWORD=yourpassword psql -U postgres -c "CREATE DATABASE upaya;"
```

Replace `yourpassword` with the password you set during PostgreSQL installation.

---

## Step 4 — Create the API environment file

Copy the example and fill in values:

```bash
cp packages/api/.env.example packages/api/.env
```

Edit `packages/api/.env`. The minimum required for local dev:

```env
# Database — required
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/upaya
DATABASE_SSL=false

# LLM — set at least one provider key for chat/diagnosis to work
# Leave blank to start the server without AI (chat routes will return errors)
ANTHROPIC_API_KEY=sk-ant-...
LLM_DEFAULT_PROVIDER=anthropic
LLM_FALLBACK_PROVIDER=openai

# Server
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# JWT
JWT_SECRET=dev-secret-local
JWT_EXPIRES_IN=7d
```

All other keys (Firebase, Razorpay, Redis, Azure OpenAI) can be left blank for local dev — those features will simply not work until keys are added.

---

## Step 5 — Build the Swiss Ephemeris native module

`swisseph` is a C++ native addon compiled with `node-gyp`. On Windows, running `node-gyp` inside **Git Bash** fails with:

```
AssignProcessToJobObject: (87) The parameter is incorrect.
```

This is a Windows Job Object restriction that affects Git Bash and MSYS2. The fix is to compile from **PowerShell** instead.

### 5.1 Create the build script

Create `build_swisseph.ps1` in the repo root:

```powershell
Set-Location "C:\path\to\upaya\node_modules\swisseph"
node-gyp rebuild --msvs_version=2022
exit $LASTEXITCODE
```

Replace `C:\path\to\upaya` with the actual path to your cloned repo.

### 5.2 Run it from a new PowerShell process

The key is launching it as a **new process** that isn't inheriting the Job Object from Claude Code / your terminal:

```powershell
Start-Process powershell.exe -ArgumentList '-ExecutionPolicy Bypass -File C:\path\to\upaya\build_swisseph.ps1' -Wait -NoNewWindow
```

You should see output like:

```
gyp info using node-gyp@12.x.x
gyp info using node@20.x.x | win32 | x64
gyp info find VS using VS2022 ...
  swisseph.vcxproj -> ...\swisseph\build\Release\swisseph.node
gyp info ok
```

Confirm the binary exists:

```bash
ls node_modules/swisseph/build/Release/swisseph.node
```

> **Why this is needed:** `swisseph` must be compiled once per machine. After this step, `pnpm install` won't need to recompile it (the binary is cached at `node_modules/swisseph/build/Release/`). If you delete `node_modules` and reinstall, repeat this step.

---

## Step 6 — Run database migrations

```bash
pnpm db:migrate
```

This creates all 8 tables (`users`, `kundlis`, `chat_sessions`, `chat_messages`, `diagnoses`, `reports`, `payments`, `referrals`) in the `upaya` database.

Expected output:

```
[Migration] Starting database migration...
[Migration] Migration completed successfully.
```

---

## Step 7 — Start the API and Web servers

```bash
pnpm dev
```

Turborepo starts all packages in parallel:

| Package | Port | Ready when you see |
|---------|------|--------------------|
| `@upaya/api` | 3001 | `[Upaya API] Server running on port 3001` |
| `@upaya/web` | 3000 | `✓ Ready in Xs` |
| `@upaya/shared` | — | `Found 0 errors. Watching for file changes.` |
| `@upaya/mobile` | 8081 | `Waiting on http://localhost:8081` |

Verify the API is up:

```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","version":"0.1.0"}
```

Open the web app: **http://localhost:3000**

> **Note:** `pnpm dev` also starts the Expo dev server on port 8081. If you later run `npx expo start` separately, use `--port 8082` to avoid a conflict.

---

## Step 8 — Run the mobile app on the Android Emulator

### 8.1 Set up an Android Virtual Device (AVD)

Open **Android Studio → Device Manager** (or **AVD Manager**) and create a virtual device if you don't have one:
- **Device:** Medium Phone
- **System Image:** API 34 or higher (download if needed)
- **Name:** something like `Medium_Phone_API_36`

Check existing AVDs from the command line:

```bash
"$ANDROID_HOME/emulator/emulator" -list-avds
```

### 8.2 Start the emulator

```bash
"$ANDROID_HOME/emulator/emulator" -avd <AVD_NAME> -no-snapshot-load
```

Wait for it to fully boot:

```bash
"$ANDROID_HOME/platform-tools/adb.exe" shell getprop sys.boot_completed
# Returns "1" when ready
```

### 8.3 Set ANDROID_HOME

If not already set in your environment, add this to your shell profile or set it for the session:

```bash
export ANDROID_HOME="$HOME/AppData/Local/Android/Sdk"
```

Or in PowerShell:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### 8.4 Launch the app

Since `pnpm dev` already occupies port 8081, start Expo on a different port:

```bash
cd apps/mobile
npx expo start --android --port 8082
```

Expo will:
1. Start the Metro bundler on port 8082
2. Install **Expo Go** on the emulator automatically (first time only)
3. Open the app — bundling takes ~30s on first load

You should see the **Upaya splash screen** (saffron → maroon gradient).

> **Alternative:** If you stopped `pnpm dev` first and port 8081 is free, just run `npx expo start --android` without `--port 8082`.

---

## Summary: What's running locally

| Service | URL | Command |
|---------|-----|---------|
| API (Express) | http://localhost:3001 | `pnpm --filter @upaya/api dev` |
| Web (Next.js) | http://localhost:3000 | `pnpm --filter @upaya/web dev` |
| Mobile (Expo Metro) | http://localhost:8081 | Started by `pnpm dev` |
| Mobile (Expo Metro, alternate) | http://localhost:8082 | `npx expo start --port 8082` |
| Android Emulator | (emulator window) | `emulator -avd <name>` |

---

## Troubleshooting

### `swisseph` native module fails to load

```
Error: Cannot find module '.../swisseph/build/Release/swisseph.node'
```

**Fix:** Follow Step 5 — compile via PowerShell. The Git Bash `node-gyp` fails due to Windows Job Objects.

---

### PostgreSQL: `password authentication failed`

Check the password you used during PostgreSQL installation. You can reset it via:

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
# If that asks for a password, try the one you set at install time
```

---

### `Port 8081 is being used by another process`

`pnpm dev` already started Metro on 8081. Either:
- Use `npx expo start --android --port 8082` (recommended)
- Or stop `pnpm dev` first, then run `npx expo start --android`

---

### Emulator not detected by adb

```bash
"$ANDROID_HOME/platform-tools/adb.exe" kill-server
"$ANDROID_HOME/platform-tools/adb.exe" start-server
"$ANDROID_HOME/platform-tools/adb.exe" devices
```

---

### API starts but DB routes fail

Make sure `DATABASE_URL` in `packages/api/.env` is correct and migrations have run:

```bash
pnpm db:migrate
```

---

### Chat / diagnosis returns an error

No LLM key is set. Add at least one to `packages/api/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
LLM_DEFAULT_PROVIDER=anthropic
```

Restart the API after changing `.env`.
