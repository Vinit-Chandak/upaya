# CLAUDE.md — Upaya Project Context

> This file is read by Claude Code at the start of every session.
> Keep it up to date. It is the single source of truth for AI-assisted development.

---

## What is Upaya?

Upaya is an AI-powered Vedic astrology platform. Users describe their life problems (marriage delay, career stuck, money issues, etc.), the AI analyzes their kundli (birth chart), identifies doshas (planetary afflictions), and provides personalized remedies — including mantras, fasting, temple puja booking, and spiritual products.

**Target users:** Hindi-speaking Indians in distress (marriage, career, health problems) who believe in astrology.
**Revenue model:** Free kundli diagnosis → Paid full remedy report (₹199) → Puja booking commissions → Spiritual product sales.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Mobile | React Native (Expo managed workflow) |
| Web | Next.js 14+ (App Router) |
| API | Express + TypeScript |
| Database | PostgreSQL |
| Auth | Firebase Auth (Phone OTP + Google) |
| Payments | Razorpay |
| AI/LLM | Anthropic Claude (primary), OpenAI GPT (fallback), Google Gemini (optional) |
| Kundli Engine | Swiss Ephemeris (C library with Node.js bindings) |
| Caching | Redis |
| Storage | Cloudflare R2 (S3-compatible) |
| CI/CD | GitHub Actions |
| Hosting | Vercel (web), Azure Ubuntu VM (API + PostgreSQL + Redis) |

---

## Repository Structure

```
upaya/
├── docs/                              # Product docs, plans, UI specs
│   ├── Upaya_Implementation_Plan.md   # Phased build plan (Phase 0–6)
│   ├── Upaya_MVP_UI_Flow.md           # Complete UI specs for all screens
│   ├── Upaya_Business_Plan.md         # Business model and financials
│   ├── Upaya_Bootstrap_Strategy.md    # Bootstrap vs raise analysis
│   ├── Upaya_Setup_Guide.md           # Account setup, API keys, infra checklist
│   ├── Upaya_Competitor_Analysis.md   # AstroTalk, etc.
│   ├── Upaya_Market_Research.md       # Market sizing and research
│   ├── Upaya_Strategic_Playbook.md    # Go-to-market strategy
│   └── Upaya_Temple_Onboarding_Playbook.md
├── apps/
│   ├── web/                           # Next.js web app
│   │   ├── src/app/                   # App Router pages
│   │   │   ├── layout.tsx             # Root layout with metadata
│   │   │   ├── page.tsx               # Landing page (splash + language + chips + trust)
│   │   │   ├── page.module.css        # Responsive styles for landing page
│   │   │   └── globals.css            # CSS custom properties design system
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── mobile/                        # Expo React Native app
│       ├── src/
│       │   ├── app/                   # Expo Router screens
│       │   │   ├── _layout.tsx        # Root stack navigator
│       │   │   ├── index.tsx          # Splash screen (auto-transitions)
│       │   │   ├── language.tsx       # Language selection
│       │   │   └── onboarding.tsx     # 3-screen swipeable onboarding
│       │   └── theme/
│       │       └── index.ts           # RN responsive scaling (wp/hp/fp)
│       ├── app.json                   # Expo config
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── api/                           # Express API server
│   │   ├── src/
│   │   │   ├── index.ts              # Server entry (Express app)
│   │   │   ├── config/index.ts       # Environment config
│   │   │   ├── db/
│   │   │   │   ├── connection.ts     # PostgreSQL pool + query helpers
│   │   │   │   ├── schema.ts         # SQL schema (all tables)
│   │   │   │   ├── migrate.ts        # Migration runner
│   │   │   │   └── seed.ts           # Seed data
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # Firebase token verification
│   │   │   │   ├── error.ts          # Global error handler
│   │   │   │   └── logger.ts         # Request logger
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts           # POST /register, GET/PATCH /me
│   │   │   │   ├── chat.ts           # Sessions + messages (with AI response)
│   │   │   │   ├── kundli.ts         # POST /generate, GET /:id
│   │   │   │   ├── diagnosis.ts      # POST /generate, GET /:id
│   │   │   │   ├── report.ts         # CRUD for paid reports
│   │   │   │   └── payment.ts        # Razorpay orders, verify, webhook
│   │   │   └── services/
│   │   │       ├── firebase.ts       # Firebase Admin SDK (token verify)
│   │   │       ├── kundli.ts         # Swiss Ephemeris kundli calc + dosha detection
│   │   │       ├── payment.ts        # Razorpay SDK wrapper
│   │   │       └── llm/
│   │   │           ├── index.ts      # Provider-agnostic service with fallback
│   │   │           ├── types.ts      # LLMProvider interface
│   │   │           ├── prompts.ts    # System prompts for diagnosis + chat
│   │   │           ├── anthropic.ts  # Claude provider
│   │   │           ├── openai.ts     # GPT provider
│   │   │           └── gemini.ts     # Gemini provider
│   │   ├── .env.example
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── shared/                        # Shared types, design tokens, i18n
│       ├── src/
│       │   ├── index.ts              # Re-exports everything
│       │   ├── design/
│       │   │   ├── colors.ts         # Color palette tokens
│       │   │   ├── typography.ts     # Fluid font sizes, text styles
│       │   │   ├── spacing.ts        # Spacing, breakpoints, layout, shadows
│       │   │   └── index.ts
│       │   ├── types/
│       │   │   ├── user.ts           # User, Language
│       │   │   ├── kundli.ts         # Planet, Zodiac, House, Dosha, Dasha, KundliData
│       │   │   ├── chat.ts           # ProblemType, ChatMessage, ChatSession
│       │   │   ├── diagnosis.ts      # DiagnosisResult, FreeRemedy, Report
│       │   │   ├── payment.ts        # Payment, PRICING
│       │   │   ├── referral.ts       # Referral
│       │   │   └── index.ts
│       │   └── i18n/
│       │       ├── hi.ts             # Hindi strings (native, not translated)
│       │       ├── en.ts             # English strings
│       │       └── index.ts          # getTranslations(), interpolate()
│       ├── tsconfig.json
│       └── package.json
├── .github/workflows/ci.yml          # CI: lint, typecheck, test, build
├── .env.example                       # Root env template
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── turbo.json                         # Turborepo task config
├── tsconfig.base.json                 # Shared TypeScript config
├── pnpm-workspace.yaml
├── package.json                       # Root workspace config
└── CLAUDE.md                          # This file
```

---

## Key Commands

```bash
# Install all dependencies
pnpm install

# Build shared package (must be done first — other packages depend on it)
pnpm --filter @upaya/shared build

# Run everything in dev mode
pnpm dev

# Run individual apps
pnpm --filter @upaya/web dev        # Next.js on port 3000
pnpm --filter @upaya/api dev        # API on port 3001
pnpm --filter @upaya/mobile dev     # Expo dev server

# Database
pnpm db:migrate                     # Run PostgreSQL migrations
pnpm db:seed                        # Seed test data

# Code quality
pnpm lint                           # ESLint
pnpm typecheck                      # TypeScript
pnpm format                         # Prettier
pnpm test                           # Run tests

# Build for production
pnpm build                          # Build all packages
```

---

## Database Schema (v1)

8 tables in PostgreSQL:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | firebase_uid, phone, email, language |
| `kundlis` | Birth chart data | date_of_birth, time_of_birth, place, planetary_data (JSONB) |
| `chat_sessions` | Conversation sessions | session_id, problem_type, language, status |
| `chat_messages` | Chat messages | session_id, role, content, message_type |
| `diagnoses` | AI diagnosis results | kundli_id, root_dosha, severity, free_remedies (JSONB) |
| `reports` | Paid remedy reports | user_id, diagnosis_id, status, pdf_url |
| `payments` | Razorpay payment records | razorpay_order_id, amount, status |
| `referrals` | Referral codes | referrer_user_id, code, conversion_status |

Schema file: `packages/api/src/db/schema.ts`

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register/login with Firebase ID token |
| GET | `/api/auth/me` | Required | Get current user profile |
| PATCH | `/api/auth/me` | Required | Update user (name, language) |
| POST | `/api/chat/sessions` | Optional | Create chat session |
| POST | `/api/chat/sessions/:id/messages` | Optional | Send message, get AI response |
| GET | `/api/chat/sessions/:id/messages` | Optional | Get session messages |
| POST | `/api/kundli/generate` | Optional | Generate kundli from birth details |
| GET | `/api/kundli/:id` | No | Get kundli by ID |
| POST | `/api/diagnosis/generate` | Optional | Generate AI diagnosis |
| GET | `/api/diagnosis/:id` | No | Get diagnosis by ID |
| POST | `/api/reports` | Required | Create paid report |
| GET | `/api/reports/:id` | Required | Get report |
| GET | `/api/reports` | Required | List user's reports |
| POST | `/api/payments/create-order` | Required | Create Razorpay order |
| POST | `/api/payments/verify` | Required | Verify payment |
| POST | `/api/payments/webhook` | No (signature) | Razorpay webhook |
| GET | `/health` | No | Health check |

---

## Design System

### Colors
- Primary Saffron: `#FF8C00` (buttons, highlights)
- Deep Saffron: `#FF6B00` (splash gradient start)
- Deep Maroon: `#4A0E0E` (splash gradient end, secondary)
- Accent Gold: `#D4A017` (kundli special, CTA gradient)
- Warm Cream: `#FFF8F0` (AI chat bubbles, backgrounds)
- User Bubble: `#FFF3E0` (user chat messages)

### Typography
- Font: Noto Sans + Noto Sans Devanagari
- All sizes use `clamp()` for fluid scaling (320px to 1280px viewport)
- Defined in: `packages/shared/src/design/typography.ts`
- CSS vars in: `apps/web/src/app/globals.css`

### Responsive Approach
- **Web:** CSS custom properties with `clamp()`, CSS Grid with `auto-fit`/`auto-fill`, media queries at 480/768/1024px
- **Mobile:** `wp()`/`hp()`/`fp()` scaling functions in `apps/mobile/src/theme/index.ts` — scale relative to a 390x844 reference device

---

## Implementation Phases

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 0** | **DONE** | Foundation — monorepo, design system, DB schema, LLM abstraction, Swiss Ephemeris, Firebase Auth, Razorpay, i18n, CI/CD |
| **Phase 1** | NOT STARTED | Core MVP — Chat to Paid Report (Splash, Language, Onboarding, Home/Chat, Birth Details, Kundli Animation, Diagnosis, Paywall, Report) |
| **Phase 2** | NOT STARTED | Puja Booking & Fulfillment |
| **Phase 3** | NOT STARTED | Retention Engine — Tracker, Alerts, Pandit |
| **Phase 4** | NOT STARTED | Commerce & Monetization Expansion |
| **Phase 5** | NOT STARTED | Growth & Scale Features |
| **Phase 6** | NOT STARTED | Series A Readiness |

Detailed plan: `docs/Upaya_Implementation_Plan.md`
UI specs: `docs/Upaya_MVP_UI_Flow.md`

---

## Important Design Decisions

1. **No login wall.** Auth is only triggered at: payment, save report, book puja. Anonymous users can chat, generate kundli, and see free diagnosis.
2. **2-exchange chat flow.** The AI asks exactly ONE qualifying question, then immediately gives the curiosity bridge + birth details CTA. Speed to value is critical.
3. **Empowerment over anxiety.** Diagnosis uses "Dosha Level: Significant" not "Severity: HIGH 78/100". Free remedies are given BEFORE the paywall. User pays for optimization, not rescue.
4. **Hindi first.** All UI strings are written natively in Hindi, not translated. English is the secondary language.
5. **LLM with fallback.** If the primary provider (Anthropic) fails, automatically falls back to the secondary (OpenAI). No single point of failure.
6. **Responsive everywhere.** Web uses fluid `clamp()` typography and spacing. Mobile uses proportional scaling functions. Everything adapts to any screen size.
7. **Firebase Auth + self-hosted backend.** Firebase handles Phone OTP + Google Sign-In (free tier, battle-tested in India). Everything else (Express API, PostgreSQL, Redis, Swiss Ephemeris) runs on a single Azure Ubuntu VM (B1ms, India Central). Web stays on Vercel free tier. No Supabase, no Railway, no managed DB — full control at ~₹1.2K/month.

---

## Safety Rules (LLM Prompts)

These are enforced in `packages/api/src/services/llm/prompts.ts`:

- If user mentions **suicide/self-harm**: Show AASRA helpline 9820466726 (24/7). Pause remedy flow.
- If user mentions **health conditions**: Advise professional medical help alongside spiritual guidance.
- If user asks about **gambling/lottery**: Redirect to financial stability remedies.
- **NEVER** use words like "danger", "cursed", "terrible", "disaster".
- **NEVER** promise specific outcomes.
- **NEVER** use scary numerical severity scores.

---

## Languages

- **Hindi (hi):** Primary. All strings in `packages/shared/src/i18n/hi.ts`
- **English (en):** Secondary. All strings in `packages/shared/src/i18n/en.ts`
- **Tamil, Telugu:** Planned (coming soon). Not yet implemented.

---

## Development Conventions

- **Package manager:** pnpm (never use npm or yarn)
- **Imports:** Use `@upaya/shared` for shared types, design tokens, and i18n
- **Validation:** Zod schemas in API route handlers
- **Error handling:** Throw `AppError(statusCode, message, code)` in routes
- **Auth middleware:** `requireAuth` (must be logged in) or `optionalAuth` (works either way)
- **Responsive design (web):** Use CSS custom properties (`var(--text-lg)`, `var(--space-card-padding)`, etc.)
- **Responsive design (mobile):** Use `wp()`, `hp()`, `fp()` from `src/theme`
- **Commits:** Descriptive messages, prefix with the area (e.g., "api: add chat routes")
- **Branch naming:** `claude/<description>-<id>` for AI sessions

---

## Changelog

| Date | Session | Changes |
|------|---------|---------|
| 2026-02-24 | Phase 0 | Initial monorepo setup, all packages scaffolded, design system, DB schema, LLM abstraction, Swiss Ephemeris, Firebase Auth, Razorpay, i18n, CI/CD, web landing page, mobile splash/language/onboarding |
| 2026-02-24 | Docs | Added Setup Guide (`docs/Upaya_Setup_Guide.md`) and this CLAUDE.md |
| 2026-02-26 | Arch | Architecture decision: Firebase Auth (OTP) + Azure Ubuntu VM (API + PostgreSQL + Redis + Swiss Ephemeris) + Vercel (web). Dropped Supabase, Railway, Render |
