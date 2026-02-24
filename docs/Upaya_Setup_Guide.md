# Upaya — Developer Setup Guide

### Last Updated: February 2026 (Phase 0)

This document lists **every external account, API key, service, and local tool** you need to set up for the Upaya codebase to work. Follow it top-to-bottom. Items marked **(Required)** must be done before `pnpm dev`. Items marked **(Can Defer)** have mocks/fallbacks in code and can be set up later.

---

## Table of Contents

1. [Prerequisites (Local Tools)](#1-prerequisites-local-tools)
2. [Repository Setup](#2-repository-setup)
3. [PostgreSQL Database](#3-postgresql-database)
4. [Firebase (Authentication)](#4-firebase-authentication)
5. [LLM Providers (AI)](#5-llm-providers-ai)
6. [Razorpay (Payments)](#6-razorpay-payments)
7. [Google Places API](#7-google-places-api)
8. [Redis (Caching / Queues)](#8-redis-caching--queues)
9. [Object Storage (Cloudflare R2 / S3)](#9-object-storage-cloudflare-r2--s3)
10. [Expo (Mobile Builds)](#10-expo-mobile-builds)
11. [Vercel (Web Hosting)](#11-vercel-web-hosting)
12. [Domain & DNS](#12-domain--dns)
13. [Environment Variables Summary](#13-environment-variables-summary)
14. [Checklist](#14-checklist)

---

## 1. Prerequisites (Local Tools)

**All required before you can run the project.**

| Tool | Version | Install | Why |
|------|---------|---------|-----|
| **Node.js** | >= 20.x | `nvm install 20` or [nodejs.org](https://nodejs.org) | Runtime for API, web, and build tools |
| **pnpm** | 9.x | `corepack enable && corepack prepare pnpm@9.1.0 --activate` | Package manager (the monorepo uses pnpm workspaces) |
| **Git** | Latest | Pre-installed on most systems | Version control |
| **PostgreSQL** | >= 15.x | `brew install postgresql@15` (Mac) or [postgresql.org](https://www.postgresql.org/download/) | Local database. Alternatively use Supabase/Railway cloud |
| **Redis** | >= 7.x | `brew install redis` (Mac) or [redis.io](https://redis.io/download/) | Caching and job queues. **(Can Defer)** — API works without it |

**Optional (for mobile development):**

| Tool | Install | Why |
|------|---------|-----|
| **Expo CLI** | `npx expo` (no install needed) | Run and build mobile app |
| **Android Studio** | [developer.android.com](https://developer.android.com/studio) | Android emulator |
| **Xcode** | Mac App Store (macOS only) | iOS simulator |
| **Expo Go app** | Install on physical phone from Play Store / App Store | Test mobile app on real device |

---

## 2. Repository Setup

```bash
# Clone the repo
git clone https://github.com/Vinit-Chandak/upaya.git
cd upaya

# Install all dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp packages/api/.env.example packages/api/.env

# Build shared package (other packages depend on it)
pnpm --filter @upaya/shared build

# Verify everything works
pnpm typecheck
```

---

## 3. PostgreSQL Database

**(Required)** — The API server stores all data in PostgreSQL.

### Option A: Local PostgreSQL

```bash
# Create the database
createdb upaya

# Verify connection
psql -d upaya -c "SELECT NOW();"

# Set in packages/api/.env:
DATABASE_URL=postgresql://YOUR_USER@localhost:5432/upaya
DATABASE_SSL=false
```

### Option B: Supabase (Free Hosted)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Project Settings → Database → Connection string → Copy the URI
3. Set in `packages/api/.env`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
   DATABASE_SSL=true
   ```

### Option C: Railway

1. Go to [railway.app](https://railway.app) and create a new PostgreSQL service
2. Copy the `DATABASE_URL` from the service variables
3. Paste into `packages/api/.env`

### Run Migrations

```bash
# After setting DATABASE_URL, create all tables:
pnpm db:migrate
```

**Env vars to set:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/upaya
DATABASE_SSL=false
```

---

## 4. Firebase (Authentication)

**(Can Defer)** — The API has a mock mode when Firebase config is missing. Required for real user authentication (phone OTP, Google sign-in).

### Step-by-Step Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Create a new project** named `upaya` (or `upaya-prod`)
3. **Enable Authentication:**
   - Authentication → Sign-in method → Enable **Phone**
   - Authentication → Sign-in method → Enable **Google**
4. **Get Server Credentials (for API):**
   - Project Settings → Service accounts → Generate new private key
   - This downloads a JSON file. Extract these values:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY`
5. **Get Client Credentials (for Web & Mobile):**
   - Project Settings → General → Your apps → Add Web app
   - Copy the `apiKey` and `authDomain`

**Env vars to set:**
```
FIREBASE_PROJECT_ID=upaya-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@upaya-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----"
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=upaya-xxxxx.firebaseapp.com
```

**Security note:** Never commit the private key JSON file. The `.gitignore` already excludes `.env` files.

---

## 5. LLM Providers (AI)

**(At least one required)** — The diagnosis engine and chat use LLM APIs. You need at least one provider configured. The system has automatic fallback: if the primary fails, it tries the fallback.

### 5a. Anthropic (Claude) — Recommended as Primary

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account and add billing
3. API Keys → Create a new key
4. Model used: `claude-sonnet-4-20250514`

**Env var:**
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 5b. OpenAI (GPT) — Recommended as Fallback

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Create an account and add billing
3. API Keys → Create a new key
4. Model used: `gpt-4o`

**Env var:**
```
OPENAI_API_KEY=sk-proj-...
```

### 5c. Google Gemini — Optional Third Provider

1. Go to [aistudio.google.com](https://aistudio.google.com/)
2. Get API Key
3. Model used: `gemini-2.0-flash`

**Env var:**
```
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

### Provider Configuration

```
LLM_DEFAULT_PROVIDER=anthropic     # or openai / gemini
LLM_FALLBACK_PROVIDER=openai       # used if primary fails
```

**Cost estimates (per 1000 diagnoses):**
- Claude Sonnet: ~$15-20
- GPT-4o: ~$20-25
- Gemini Flash: ~$2-5

---

## 6. Razorpay (Payments)

**(Can Defer)** — Payment service has a mock mode for development. Required before accepting real payments.

### Test Account

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com/) and sign up
2. Switch to **Test Mode** (toggle at top of dashboard)
3. Settings → API Keys → Generate Test Key
4. Get:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

### Webhook Setup (for production)

1. Settings → Webhooks → Add New
2. URL: `https://your-api-domain.com/api/payments/webhook`
3. Events: select `payment.captured`, `payment.failed`
4. Copy the **Webhook Secret**

**Env vars to set:**
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### Going Live

1. Complete KYC on Razorpay dashboard
2. Link bank account
3. Switch to Live Mode
4. Generate Live API keys
5. Update env vars (remove `_test_` from key ID)

---

## 7. Google Places API

**(Can Defer)** — Used for birth place autocomplete search. The birth details form needs this to resolve city names to lat/lng coordinates.

### Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Places API** and **Geocoding API**
4. Credentials → Create API Key
5. Restrict the key:
   - Application restriction: HTTP referrers (for web) or Android/iOS apps (for mobile)
   - API restriction: Places API, Geocoding API only

**Env var to set:**
```
GOOGLE_PLACES_API_KEY=AIzaSy...
```

**Cost:** Free up to $200/month credit (covers ~40,000 autocomplete requests). After that, ~$2.83 per 1000 requests.

---

## 8. Redis (Caching / Queues)

**(Can Defer)** — Not yet actively used in Phase 0. Will be used for session caching, rate limiting, and background job queues in Phase 1+.

### Local

```bash
# Install and start
brew install redis    # macOS
redis-server          # start server

# Verify
redis-cli ping        # should return PONG
```

### Cloud (Upstash — Free Tier)

1. Go to [upstash.com](https://upstash.com/)
2. Create a Redis database
3. Copy the connection URL

**Env var to set:**
```
REDIS_URL=redis://localhost:6379
# or for Upstash:
REDIS_URL=rediss://default:xxxx@xxx-xxx.upstash.io:6379
```

---

## 9. Object Storage (Cloudflare R2 / S3)

**(Can Defer)** — Will be used for storing report PDFs, puja videos, and user uploads. Not actively used in Phase 0.

### Cloudflare R2 (Recommended — Cheapest)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2
2. Create a bucket named `upaya-assets`
3. Manage R2 API tokens → Create token with Object Read & Write
4. Get endpoint, access key, and secret key

**Env vars to set:**
```
STORAGE_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=xxxxx
STORAGE_SECRET_ACCESS_KEY=xxxxx
STORAGE_BUCKET=upaya-assets
```

---

## 10. Expo (Mobile Builds)

**(Can Defer)** — Only needed when you want to build APK/IPA files for distribution. Development uses Expo Go on a physical device or emulators.

### Expo Account

1. Go to [expo.dev](https://expo.dev/) and create an account
2. `npx expo login` from terminal
3. For production builds: configure EAS Build in `apps/mobile/eas.json`

### Android Keystore

For publishing to Play Store, you'll need a keystore. EAS Build can generate one automatically, or you can provide your own.

### Apple Developer Account

For iOS builds and TestFlight/App Store, you need an Apple Developer account ($99/year).

---

## 11. Vercel (Web Hosting)

**(Can Defer)** — For deploying the Next.js web app.

1. Go to [vercel.com](https://vercel.com/) and connect your GitHub
2. Import the `upaya` repo
3. Set Root Directory to `apps/web`
4. Add environment variables (API URL, Firebase client keys)
5. Deploy

---

## 12. Domain & DNS

**(Can Defer)** — Needed before public launch.

1. Register domain: `upaya.app` or `getupaya.com` or similar
2. Point DNS to Vercel (web) and Railway/Render (API)
3. Configure SSL (automatic with Vercel and Railway)

---

## 13. Environment Variables Summary

### `packages/api/.env` (API Server)

| Variable | Required | Source | Description |
|----------|----------|--------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL | Connection string |
| `DATABASE_SSL` | Yes | — | `true` for cloud, `false` for local |
| `FIREBASE_PROJECT_ID` | Can Defer | Firebase Console | Project ID |
| `FIREBASE_CLIENT_EMAIL` | Can Defer | Firebase Console | Service account email |
| `FIREBASE_PRIVATE_KEY` | Can Defer | Firebase Console | Service account private key |
| `ANTHROPIC_API_KEY` | **Yes (1 of 3)** | Anthropic Console | Claude API key |
| `OPENAI_API_KEY` | Can Defer | OpenAI Platform | GPT API key |
| `GOOGLE_GEMINI_API_KEY` | Can Defer | Google AI Studio | Gemini API key |
| `LLM_DEFAULT_PROVIDER` | Yes | — | `anthropic`, `openai`, or `gemini` |
| `LLM_FALLBACK_PROVIDER` | Yes | — | Fallback provider name |
| `RAZORPAY_KEY_ID` | Can Defer | Razorpay Dashboard | Test/Live key ID |
| `RAZORPAY_KEY_SECRET` | Can Defer | Razorpay Dashboard | Key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Can Defer | Razorpay Dashboard | Webhook secret |
| `REDIS_URL` | Can Defer | Local or Upstash | Redis connection URL |
| `NODE_ENV` | Yes | — | `development` / `production` |
| `PORT` | Yes | — | API server port (default: 3001) |
| `CORS_ORIGINS` | Yes | — | Comma-separated allowed origins |
| `JWT_SECRET` | **Yes** | Generate yourself | Random string for JWT signing |
| `JWT_EXPIRES_IN` | Yes | — | Token expiry (default: `7d`) |

### `.env` (Root — shared config)

Contains all of the above plus:

| Variable | Required | Source | Description |
|----------|----------|--------|-------------|
| `FIREBASE_API_KEY` | Can Defer | Firebase Console | Client-side API key |
| `FIREBASE_AUTH_DOMAIN` | Can Defer | Firebase Console | Auth domain |
| `GOOGLE_PLACES_API_KEY` | Can Defer | Google Cloud Console | Places autocomplete |
| `STORAGE_ENDPOINT` | Can Defer | Cloudflare/AWS | R2/S3 endpoint |
| `STORAGE_ACCESS_KEY_ID` | Can Defer | Cloudflare/AWS | Storage access key |
| `STORAGE_SECRET_ACCESS_KEY` | Can Defer | Cloudflare/AWS | Storage secret |
| `STORAGE_BUCKET` | Can Defer | Cloudflare/AWS | Bucket name |
| `API_URL` | Yes | — | API base URL |
| `WEB_URL` | Yes | — | Web app base URL |

### Generate a JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 14. Checklist

### Minimum to Start Development
- [ ] Node.js 20+ installed
- [ ] pnpm 9+ installed
- [ ] `pnpm install` successful
- [ ] PostgreSQL running (local or cloud)
- [ ] `DATABASE_URL` set in `packages/api/.env`
- [ ] `pnpm db:migrate` successful
- [ ] At least one LLM API key set (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`)
- [ ] `JWT_SECRET` generated and set
- [ ] `pnpm dev` starts without errors

### Before First User Testing
- [ ] Firebase project created and configured
- [ ] Phone OTP and Google sign-in enabled
- [ ] Firebase credentials set in `.env`
- [ ] Razorpay test account created and keys set
- [ ] Google Places API key created and set

### Before Public Launch
- [ ] Razorpay live account KYC complete
- [ ] Razorpay live keys set
- [ ] Domain registered and DNS configured
- [ ] Web app deployed on Vercel
- [ ] API deployed on Railway/Render
- [ ] PostgreSQL on Supabase/Railway (not local)
- [ ] Redis on Upstash (not local)
- [ ] Object storage bucket created (Cloudflare R2)
- [ ] Firebase production project (separate from dev)
- [ ] All env vars set in production
- [ ] SSL certificates active on all endpoints
- [ ] Expo EAS Build configured for Android
- [ ] Privacy policy and Terms of Service pages live
- [ ] Company registration complete (for Razorpay KYC)
