# Plan: Connect Chat, Kundli, and Diagnosis to Real APIs

## Current State Summary

### Backend (packages/api) — Almost fully real
- **LLM service**: 3 providers (Anthropic, OpenAI, Gemini) with automatic fallback — REAL
- **Kundli service**: Swiss Ephemeris calculations, dosha detection, dasha — REAL
- **Diagnosis route**: Calls LLM with kundli data + context — REAL
- **Chat route**: Creates sessions, saves messages, calls LLM — REAL but has a **bug** (empty `systemPrompt` on line 101 of `chat.ts`)
- **Database schema**: Defined in `schema.ts` — needs `pnpm db:migrate` to create tables

### Mobile (apps/mobile) — Screens exist but ALL hardcoded
- Chat screen: ALL AI responses are hardcoded templates (`QUALIFYING_QUESTIONS`, `CURIOSITY_BRIDGES`). **Zero API calls**.
- Birth Details: Form exists inside `chat.tsx`. On submit, navigates to `/kundli-animation` with params but **never calls the backend**.
- Kundli Animation: Runs timer-based fake animation with **hardcoded planet positions**. No API call.
- Diagnosis screen: **Does not exist**. Kundli animation currently navigates back to `/home`.

### What's missing
- No API client / HTTP layer in the mobile app
- No config for API base URL in the mobile app
- No error handling or loading states for network calls
- No diagnosis result screen

---

## Plan (7 Steps)

### Step 1: Add Azure OpenAI provider to backend

The OpenAI npm SDK natively supports Azure via `AzureOpenAI` class. We add a new provider alongside the existing three.

**Files to modify:**
- `packages/api/src/config/index.ts` — Add `azure_openai` config block with env vars
- `packages/api/src/services/llm/azure-openai.ts` — **New file**. `AzureOpenAIProvider` using `AzureOpenAI` from the `openai` SDK
- `packages/api/src/services/llm/index.ts` — Register `azure_openai` provider in the factory map + update `ProviderName` type

**New env vars:**
```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

**Config change:**
```typescript
azureOpenai: {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
},
```

**Provider type update:** `ProviderName = 'anthropic' | 'openai' | 'gemini' | 'azure_openai'`

Now you can set `LLM_DEFAULT_PROVIDER=azure_openai` to use your Azure Foundry GPT-4.1, or `anthropic`, `openai`, `gemini` — all via env vars.

---

### Step 2: Fix chat route systemPrompt bug

**File:** `packages/api/src/routes/chat.ts` (line 101)

**Current (broken):**
```typescript
systemPrompt: '',
```

**Fix:**
```typescript
systemPrompt: buildChatSystemPrompt(session.language as 'hi' | 'en'),
```

Add the import at top:
```typescript
import { buildChatSystemPrompt } from '../services/llm/prompts';
```

Then update each LLM provider's `generateChatResponse` to use `input.systemPrompt` instead of calling `buildChatSystemPrompt` internally — since the route now passes it correctly. Currently, the Anthropic and Gemini providers build their own system prompt (ignoring the empty one passed in), so chat still works. But the OpenAI provider also builds its own. After this fix, all providers should use the `input.systemPrompt` passed from the route, making it consistent.

Actually, looking more carefully: the OpenAI provider calls `buildChatSystemPrompt(input.language)` inside `generateChatResponse`. Anthropic does the same. So all providers currently ignore `input.systemPrompt` and build their own.

**Cleaner fix:** Have the route pass the system prompt, and have all providers USE `input.systemPrompt` instead of rebuilding it. This keeps prompt logic centralized in the route (or a single place), not duplicated across 4 providers.

**Files to modify:**
- `packages/api/src/routes/chat.ts` — Pass real system prompt
- `packages/api/src/services/llm/anthropic.ts` — Use `input.systemPrompt` instead of calling `buildChatSystemPrompt`
- `packages/api/src/services/llm/openai.ts` — Same
- `packages/api/src/services/llm/gemini.ts` — Same
- `packages/api/src/services/llm/azure-openai.ts` — Use `input.systemPrompt` (new file from Step 1)

---

### Step 3: Create API client layer in mobile app

**New files:**
- `apps/mobile/src/services/api.ts` — Central API client with base URL config, fetch wrapper, error handling
- `apps/mobile/src/services/types.ts` — Response types for API endpoints (can re-use from @upaya/shared where possible)

**API client design:**
```typescript
// Base URL from Expo Constants (extra.apiUrl) or fallback
const API_BASE = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

// Wrapper around fetch with JSON headers, error handling, timeout
async function apiRequest<T>(path: string, options?: RequestInit): Promise<T>

// Specific endpoint functions:
export const api = {
  chat: {
    createSession(problemType: string, language: string): Promise<{ session: ChatSession }>,
    sendMessage(sessionId: string, content: string): Promise<{ userMessage, aiMessage }>,
    getMessages(sessionId: string): Promise<{ messages: ChatMessage[] }>,
  },
  kundli: {
    generate(input: { dateOfBirth, timeOfBirth, placeOfBirthLat, placeOfBirthLng, placeOfBirthName }): Promise<{ kundli: Kundli }>,
  },
  diagnosis: {
    generate(input: { kundliId, problemType, emotionalContext, qualifyingAnswer, language }): Promise<{ diagnosis: Diagnosis }>,
  },
};
```

**Config in app.json:**
```json
"extra": {
  "apiUrl": "http://localhost:3001"
}
```

Uses plain `fetch` (built into React Native) — no need for axios.

---

### Step 4: Connect Chat screen to real LLM API

**File:** `apps/mobile/src/app/chat.tsx`

**What changes:**
1. On screen mount (when problem selected): call `api.chat.createSession(problemType, language)` → store `sessionId` in state
2. Replace the hardcoded `QUALIFYING_QUESTIONS` flow:
   - After session created, the FIRST message should come from the AI. However, the backend chat flow expects the USER to send a message first, then the AI responds.
   - **Design decision**: The initial qualifying question (empathy + question) IS the first AI message. Two approaches:
     - **Option A**: Keep the first qualifying question hardcoded on the client (as it is now), since it's a fixed template per problem type. Only Exchange 2 (curiosity bridge) uses the real LLM.
     - **Option B**: Send an initial "user message" to the backend with the problem type, and let the LLM generate Exchange 1.

   **Recommendation: Option A** (hybrid). The first qualifying question is a fixed, tested template — it doesn't need LLM creativity. It's faster (no network round-trip) and more reliable. Only Exchange 2 (curiosity bridge after user's qualifying answer) goes through the real LLM.

3. When user responds to Exchange 1 (taps chip or types):
   - Call `api.chat.sendMessage(sessionId, userText)` → get real AI response (curiosity bridge)
   - Remove hardcoded `CURIOSITY_BRIDGES` template
   - Show typing indicator while waiting for API response
   - Display AI response from server (which follows the 2-exchange prompt rules)

4. **Error handling**: If API call fails, show a retry message. Don't crash the chat.

5. **Loading states**: Real typing indicator while waiting for LLM response (replace the fake `setTimeout`).

**Hardcoded data to KEEP (not remove):**
- `QUALIFYING_QUESTIONS` — Keep for Exchange 1 (fast, reliable, no network needed)
- `QUALIFYING_CHIPS` — Keep (these are UI elements, not AI responses)
- `POPULAR_CITIES` — Keep (static place data)
- `APPROX_OPTIONS` — Keep (static time options)

**Hardcoded data to REMOVE:**
- `CURIOSITY_BRIDGES` — Replace with real LLM response from `api.chat.sendMessage`

---

### Step 5: Connect Birth Details to real Kundli API

**File:** `apps/mobile/src/app/chat.tsx` (handleBirthSubmit function)

**Current flow:**
```
User fills form → navigate to /kundli-animation with {dob, tob, place, lang}
```

**New flow:**
```
User fills form → call api.kundli.generate({dateOfBirth, timeOfBirth, lat, lng, placeName})
  → on success: navigate to /kundli-animation with {kundliId, dob, tob, place, lang}
  → on error: show error in chat, let user retry
```

**Changes to handleBirthSubmit:**
1. Parse DOB from `DD/MM/YYYY` to `YYYY-MM-DD` (API expects ISO format)
2. Parse time from `HH:MM AM/PM` to `HH:MM` (24-hour, API expects this)
3. Call `api.kundli.generate(...)` with lat/lng already stored in state
4. Pass `kundliId` (from API response) to kundli-animation screen
5. Also pass the sessionId and chat context (for diagnosis generation later)

**New navigation params to /kundli-animation:**
```typescript
router.push({
  pathname: '/kundli-animation',
  params: {
    kundliId,        // NEW — from API response
    sessionId,       // NEW — for diagnosis generation
    problemType,     // NEW — for diagnosis generation
    emotionalContext, // NEW — user's qualifying answer text
    dob, tob, place, lang  // existing
  },
});
```

---

### Step 6: Connect Kundli Animation to real data + trigger Diagnosis API

**File:** `apps/mobile/src/app/kundli-animation.tsx`

**Current:** All planet positions and dosha checks are hardcoded fake data. Animation runs on timers.

**New flow:**
1. Receive `kundliId` from params (kundli already generated in Step 5)
2. Fetch the full kundli data: `GET /api/kundli/:kundliId`
3. **Phase 2 (Planet scanning)**: Use REAL planet positions from API response instead of hardcoded `PLANETS` array
4. **Phase 3 (Dosha analysis)**: Use REAL dosha results from the kundli data
5. **Between Phase 3 and 4**: Call `api.diagnosis.generate({kundliId, problemType, emotionalContext, qualifyingAnswer, language})` — this is the LLM diagnosis call
6. **Phase 4 (Complete)**: Store diagnosis ID in state. "View Your Diagnosis" button navigates to `/diagnosis?id=<diagnosisId>`

**Key change**: The animation timing stays the same (it's a UX feature, not dependent on API speed). But the data displayed during animation is real. The LLM diagnosis call runs in parallel with Phase 3 animation — by the time the user sees "Analysis Complete", the diagnosis is ready.

**If diagnosis API is slow**: Phase 3 animation can stall at the last check item ("Severity compute") until the API returns. This feels natural — like the system is "computing".

---

### Step 7: Build Diagnosis Result screen

**New file:** `apps/mobile/src/app/diagnosis.tsx`

**Receives:** `diagnosisId` via route params

**Fetches:** `GET /api/diagnosis/:id` for full diagnosis data

**Screen layout (per implementation plan Section 1.7):**

**Part 1 — Diagnosis Card (visible):**
- Root dosha identified (planet name + house)
- Current dasha period
- Impacted areas (primary + secondary)
- Dosha level: "Significant" / "Moderate" / "Mild" (text, not numbers)
- "Commonly addressed? YES" badge
- "Responsive to remedies? Highly responsive" badge
- Positive message from AI

**Part 2 — Free Remedies (visible, 2-3 cards):**
- Remedy name + type (mantra/fasting/daan/daily practice)
- Mantra text in Devanagari + Roman
- Frequency + duration
- "Add to Remedy Tracker" button (placeholder for Phase 3)

**Part 3 — Paywall CTA (locked section):**
- Grey locked section showing what the full report contains
- "Unlock Complete Plan ₹199 (~~₹499~~)" golden button
- (Actual payment flow is for a later task — button can show "Coming Soon" or navigate to a placeholder)

**Navigation:** From kundli-animation "View Your Diagnosis" → `/diagnosis?id=<id>`

---

## Files Changed Summary

| File | Action | Step |
|------|--------|------|
| `packages/api/src/config/index.ts` | Modify (add azure_openai config) | 1 |
| `packages/api/src/services/llm/azure-openai.ts` | **New** (Azure OpenAI provider) | 1 |
| `packages/api/src/services/llm/index.ts` | Modify (register azure_openai) | 1 |
| `packages/api/src/routes/chat.ts` | Modify (fix systemPrompt) | 2 |
| `packages/api/src/services/llm/anthropic.ts` | Modify (use input.systemPrompt) | 2 |
| `packages/api/src/services/llm/openai.ts` | Modify (use input.systemPrompt) | 2 |
| `packages/api/src/services/llm/gemini.ts` | Modify (use input.systemPrompt) | 2 |
| `apps/mobile/src/services/api.ts` | **New** (API client) | 3 |
| `apps/mobile/app.json` | Modify (add extra.apiUrl) | 3 |
| `apps/mobile/src/app/chat.tsx` | Modify (connect to chat + kundli APIs) | 4, 5 |
| `apps/mobile/src/app/kundli-animation.tsx` | Modify (use real data + call diagnosis API) | 6 |
| `apps/mobile/src/app/kundli-animation.tsx` | Modify (navigate to diagnosis screen) | 6 |
| `apps/mobile/src/app/diagnosis.tsx` | **New** (diagnosis result screen) | 7 |
| `apps/mobile/src/app/_layout.tsx` | Modify (add diagnosis route) | 7 |
| `packages/api/.env.example` | Modify (add azure_openai env vars) | 1 |

## What This Plan Does NOT Include (explicitly out of scope)
- Firebase Auth integration (login, OTP) — comes with paywall
- Payment flow (Razorpay) — comes after diagnosis screen
- Full paid report screen — comes after payment
- Analytics/event tracking
- Voice input (V1.1 feature)
- Google Places API for place autocomplete (keeping hardcoded cities for now)
- Mantra audio playback (V1.1 feature)
