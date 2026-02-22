# Upaya MVP — Complete UI Flow Specification

### Document Version: 1.0 | February 2026
### Target: Android (Primary) + Web (Secondary)
### Languages: Hindi (Primary), English (Secondary)

---

## Table of Contents

1. [App Architecture & Navigation](#1-app-architecture--navigation)
2. [S1: Splash & Language Selection](#2-s1-splash--language-selection)
3. [S2: Home / Chat Entry](#3-s2-home--chat-entry)
4. [S3: AI Emotional Intake Chat](#4-s3-ai-emotional-intake-chat)
5. [S4: Birth Details Capture (In-Chat)](#5-s4-birth-details-capture-in-chat)
6. [S5: Kundli Generation Animation](#6-s5-kundli-generation-animation)
7. [S6: Free Diagnosis Result](#7-s6-free-diagnosis-result)
8. [S7: Paywall / Report Purchase](#8-s7-paywall--report-purchase)
9. [S8: Full Paid Remedy Report](#9-s8-full-paid-remedy-report)
10. [S9: Puja Booking Flow](#10-s9-puja-booking-flow)
11. [S10: Pandit Consultation](#11-s10-pandit-consultation)
12. [S11: Siddha Store (Commerce)](#12-s11-siddha-store-commerce)
13. [S12: Remedy Tracker Dashboard](#13-s12-remedy-tracker-dashboard)
14. [S13: Order Tracking](#14-s13-order-tracking)
15. [S14: Transit Alerts & Notifications](#15-s14-transit-alerts--notifications)
16. [S15: Profile & Kundli Vault](#16-s15-profile--kundli-vault)
17. [S16: Authentication (Progressive)](#17-s16-authentication-progressive)
18. [S17: Settings](#18-s17-settings)
19. [Chat AI Logic & Conversation Trees](#19-chat-ai-logic--conversation-trees)
20. [Notification Strategy](#20-notification-strategy)
21. [Screen State Matrix](#21-screen-state-matrix)

---

## 1. App Architecture & Navigation

### Bottom Tab Bar (4 Tabs)

```
┌─────────────────────────────────────────────┐
│                                             │
│              [Screen Content]               │
│                                             │
├───────────┬───────────┬───────────┬─────────┤
│  🏠 Home  │ 📿 Remedies│ 🛕 Explore │ 👤 Me  │
│  (Chat)   │ (Tracker) │(Store/Temples)│(Profile)│
└───────────┴───────────┴───────────┴─────────┘
```

| Tab | Primary Purpose | Key Screens |
|-----|----------------|-------------|
| **Home** | AI chat, diagnosis, reports | Chat, Diagnosis, Report |
| **Remedies** | Active remedy tracking | Tracker, Mantra player, Streaks |
| **Explore** | Browse temples, pujas, products | Temple list, Puja catalog, Siddha Store |
| **Me** | Profile, kundli, history, settings | Kundli chart, Family vault, Orders, Settings |

### Navigation Principles

- Chat is ALWAYS the home screen (first thing user sees after language)
- No login wall anywhere. Login triggered only at: payment, save report, book puja
- Back button always works predictably
- Deep links supported: notification → specific screen
- Swipe-back gesture on all screens
- Bottom tab persists on all primary screens, hides on focused flows (payment, booking)

### Global Elements (Every Screen)

```
┌─────────────────────────────────────────────┐
│ [Status Bar - system]                       │
├─────────────────────────────────────────────┤
│ [Top Bar]                                   │
│  Left: Back arrow (if nested) or Upaya logo │
│  Center: Screen title (contextual)          │
│  Right: 🔔 Notification bell + 🌐 Language  │
├─────────────────────────────────────────────┤
│                                             │
│           [Screen Content Area]             │
│                                             │
├─────────────────────────────────────────────┤
│ [Bottom Tab Bar]                            │
└─────────────────────────────────────────────┘
```

---

## 2. S1: Splash & Language Selection

### S1.1: Splash Screen (1.5 seconds)

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│              ✦ UPAYA ✦                      │
│                                             │
│        [Animated Om/Lotus symbol]           │
│                                             │
│      "Your spiritual problem solver"        │
│                                             │
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior:**
- App icon animates into full logo (scale up + fade in)
- Subtle golden particle effect behind logo
- Warm gradient background: deep saffron (#FF6B00) → dark maroon (#4A0E0E)
- Auto-transitions to language screen after 1.5s
- If returning user: skip language, go straight to Home/Chat

### S1.2: Language Selection (First Launch Only)

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│         🙏 Namaste / Welcome                │
│                                             │
│     "Choose your preferred language"        │
│     "अपनी भाषा चुनें"                         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🇮🇳  हिन्दी                          │    │
│  │      Hindi                          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🇬🇧  English                        │    │
│  │      अंग्रेज़ी                          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐    │
│  │  🔜 தமிழ் (Coming Soon)              │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘    │
│                                             │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐    │
│  │  🔜 తెలుగు (Coming Soon)              │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘    │
│                                             │
│     You can change this anytime in          │
│     Settings                                │
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Tap Hindi → app switches to Hindi, navigates to Onboarding
- Tap English → app switches to English, navigates to Onboarding
- Coming Soon options are greyed out, not tappable
- Language stored locally, changeable in Settings
- Each option shows the language in its own script + the other language below
- Gentle haptic feedback on selection

---

## 2B. S1.3: Value Onboarding (First Launch Only)

**3 swipeable screens. Shown once after language selection. Skippable via "Skip" link top-right. Never shown again to returning users.**

The target user is someone in DISTRESS. They don't want feature slides. They want to feel understood and believe this app can help. The onboarding must answer: **"Why should I trust Upaya with my deepest worries?"**

Design principle: **Story → Process → Proof → Action**

### Screen 1 of 3: "We've Helped People Like You" (Emotional Hook)

```
┌─────────────────────────────────────────────┐
│                                     Skip →  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │  [Warm illustration: woman's face     │  │
│  │   transforming from worried to        │  │
│  │   hopeful, with soft mandala          │  │
│  │   pattern behind. NOT a photo —       │  │
│  │   illustrated for privacy/warmth]     │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  💍 Priya, 28, Lucknow               │  │
│  │                                       │  │
│  │  "4 saal se shaadi ke rishte aa ke    │  │
│  │  toot rahe the. Sabne kaha Mangal     │  │
│  │  Dosha hai, lekin koi solution nahi   │  │
│  │  bataya.                              │  │
│  │                                       │  │
│  │  Upaya ne kundli analyze ki → exact   │  │
│  │  problem mili → Mangalnath Temple     │  │
│  │  mein specific puja suggest ki.       │  │
│  │                                       │  │
│  │  5 mahine mein rishta pakka hua." 🙏  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│                                             │
│               ● ○ ○                         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │            Aage Badhein →            │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Design notes:**
- The testimonial card has a soft cream background with subtle golden left border
- Name/age/city makes it feel real (these are anonymized composites, not real users pre-launch — but feel authentic)
- The story follows a clear arc: problem → failed attempts → Upaya's role → outcome
- Illustration shows emotional transformation, not astrology symbols
- Hindi is primary; English version shows equivalent story

**Hindi version of story (for Hindi users):**
Exactly as written above — native Hindi, not translated.

**English version of story (for English users):**
> "Marriage talks kept falling apart for 4 years. Everyone said it's Mangal Dosha but nobody gave a real solution. Upaya analyzed my chart, found the exact cause, and recommended a specific puja at Mangalnath Temple. Got married within 5 months."

### Screen 2 of 3: "How Upaya Works" (Process — 4 Steps)

```
┌─────────────────────────────────────────────┐
│                                     Skip →  │
│                                             │
│     Upaya kaise kaam karta hai              │
│     "How Upaya works"                       │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │  ① Apni problem batayein              │  │
│  │     [Chat bubble icon]                │  │
│  │     AI empathetically samjhega        │  │
│  │                                       │  │
│  │            ↓                          │  │
│  │                                       │  │
│  │  ② AI aapki kundli analyze kare       │  │
│  │     [Kundli chart icon]               │  │
│  │     Exact graha aur dosha dhundhega   │  │
│  │                                       │  │
│  │            ↓                          │  │
│  │                                       │  │
│  │  ③ Personalized remedy plan           │  │
│  │     [Scroll/remedy icon]              │  │
│  │     Specific mantras, temples,        │  │
│  │     timing — sab kuch tailored        │  │
│  │                                       │  │
│  │            ↓                          │  │
│  │                                       │  │
│  │  ④ Temple puja + Video proof          │  │
│  │     [Temple + play button icon]       │  │
│  │     Real puja at real temple,         │  │
│  │     video delivered, prasad shipped   │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  "Diagnosis se lekar remedy execution       │
│   tak — sab ek jagah"                       │
│                                             │
│               ○ ● ○                         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │            Aage Badhein →            │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Design notes:**
- Each step has a small circular icon (32px) in saffron/gold
- Steps are connected by a vertical dotted line (journey metaphor)
- Text is concise — max 2 lines per step
- Subtle animation: each step fades in sequentially on first view (staggered 200ms)
- The tagline at bottom reinforces the full-stack value prop

### Screen 3 of 3: "Trusted & Proven" (Social Proof + CTA)

```
┌─────────────────────────────────────────────┐
│                                     Skip →  │
│                                             │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │         [Upaya logo, large]           │  │
│  │                                       │  │
│  │    ✨ "Aapka spiritual problem         │  │
│  │        solver" ✨                      │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  📊       │  │  🛕       │  │  📹       │  │
│  │ 50,000+  │  │  100+    │  │  Video   │  │
│  │ Kundlis  │  │ Temples  │  │  proof   │  │
│  │ analyzed │  │ verified │  │ of every │  │
│  │          │  │          │  │  puja    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  📦       │  │  🔒       │  │  🙏       │  │
│  │ Prasad   │  │  100%    │  │ Pandit   │  │
│  │ delivered│  │ Private  │  │ verified │  │
│  │ home     │  │ & Secure │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ⭐⭐⭐⭐⭐                               │  │
│  │  "Pehli baar laga ki kisi ne sach     │  │
│  │  mein samjha aur sahi raasta bataya"  │  │
│  │  — Rahul S., Delhi                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│               ○ ○ ●                         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │     🙏 Shuru Karein / Get Started    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Free kundli analysis · No login required   │
│                                             │
└─────────────────────────────────────────────┘
```

**Design notes:**
- 6 trust badges in a 3×2 grid, each with icon + label
- Numbers should be real at launch (even if "1,000+" to start) — never fake
- Mini testimonial at bottom is a second social proof hit
- CTA button is the largest, warmest element — golden gradient with 🙏
- "Free kundli analysis · No login required" below CTA removes last friction
- Tapping "Get Started" navigates to Home/Chat Entry screen

**Pre-launch note:** Before 50K users, adjust numbers honestly: "1,000+ kundlis" is fine. Fake numbers destroy trust in a faith business.

### Onboarding Component Specs

| Element | Spec |
|---------|------|
| Skip link | Top-right, subtle grey text. Skips to Home/Chat immediately |
| Dot indicators | Bottom-center. Active = saffron filled. Inactive = grey outline |
| "Aage Badhein" button | Full-width, 48px height, saffron outline (secondary style). Not too pushy — user can also swipe |
| "Shuru Karein" button (final) | Full-width, 52px height, golden gradient fill (primary style). This is THE CTA |
| Swipe gesture | Standard horizontal page swipe. Velocity-sensitive |
| Auto-advance | No. User controls pace. Distressed users read carefully |
| Analytics events | Track: screen_viewed, screen_skipped, skip_tapped, get_started_tapped, time_per_screen |
| Persistence | Show once. Store `onboarding_completed = true` locally. Never show again |

### Why This Onboarding Works

1. **Screen 1 (Story)** hooks emotionally — "someone like me was helped"
2. **Screen 2 (Process)** builds understanding — "oh, this isn't just another astrology app, it does the FULL thing"
3. **Screen 3 (Proof)** builds trust — numbers + testimonial + "free, no login" removes risk
4. Total time: 15-25 seconds. Fast enough to not annoy. Substantial enough to convert skeptics.
5. Distressed users who are in a hurry can skip — the chat will still convert them. This onboarding is for the 40% who would otherwise bounce.

---

## 3. S2: Home / Chat Entry

This is the most important screen. User lands here every time they open the app.

### S2.1: First-Time User (No Chat History)

```
┌─────────────────────────────────────────────┐
│ [Upaya Logo]              🔔  🌐            │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│         [Warm illustration:                 │
│          person sitting peacefully          │
│          with soft divine glow]             │
│                                             │
│                                             │
│     "आज आपको क्या परेशान कर रहा है?"          │
│     "Tell me what's worrying you today"     │
│                                             │
│                                             │
│  Quick chips (horizontally scrollable):     │
│                                             │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐   │
│  │ 💍 शादी   │ │ 💼 करियर   │ │ 💰 पैसा   │   │
│  │  में देरी  │ │  में रुकावट │ │ की समस्या │   │
│  │ Marriage  │ │  Career   │ │  Money   │   │
│  │  Delay    │ │  Stuck    │ │ Problems │   │
│  └──────────┘ └───────────┘ └──────────┘   │
│                                             │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐   │
│  │ 🏥 स्वास्थ्य│ │ ⚖️ कानूनी  │ │ 👨‍👩‍👧‍👦 पारिवा-│   │
│  │  समस्या   │ │  विवाद    │ │  रिक कलह │   │
│  │ Health   │ │  Legal    │ │  Family  │   │
│  │ Issues   │ │ Matters   │ │ Conflict │   │
│  └──────────┘ └───────────┘ └──────────┘   │
│                                             │
│  ┌──────────┐ ┌───────────┐                 │
│  │ 📖 कुंडली  │ │ 🔮 कुछ और  │                 │
│  │  बनवाएं   │ │  पूछना है  │                 │
│  │ Get My   │ │ Something │                 │
│  │ Kundli   │ │   Else    │                 │
│  └──────────┘ └───────────┘                 │
│                                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐  [🎤]   │
│ │ अपनी बात यहाँ लिखें...            │  [📎]   │
│ │ Type your concern here...       │         │
│ └─────────────────────────────────┘  [➤]   │
├───────────┬───────────┬───────────┬─────────┤
│  🏠 Home  │ 📿 Remedies│ 🛕 Explore │ 👤 Me  │
└───────────┴───────────┴───────────┴─────────┘
```

**Component Details:**

| Component | Spec |
|-----------|------|
| Illustration | Warm, Indian aesthetic. Not cartoonish. Soft watercolor style. Person in peaceful posture with subtle divine light. Changes based on time of day (morning: sunrise tones, evening: diya tones, night: moon tones) |
| Main prompt | Large text, centered, bilingual (selected language primary, other secondary in smaller font) |
| Problem chips | Rounded rectangles, soft fill color, emoji + text. Each has Hindi primary + English secondary (or vice versa based on language). Horizontally scrollable in rows of 3 |
| "Get My Kundli" chip | Different color (golden border) — for users who just want kundli without problem context |
| "Something Else" chip | Opens free-text with hint: "Describe your situation in your own words" |
| Text input | Bottom-pinned. Microphone for voice input (critical for Hindi-belt users). Send button appears when text entered |
| Voice input | Tap mic → recording overlay → speech-to-text → fills text box → user confirms and sends |

**Interaction:**
- Tapping a chip immediately sends it as the first message and opens the chat
- Typing + send does the same
- Voice input: records, transcribes, shows text, user taps send
- Chips have subtle press animation (scale down slightly + color darken)

### S2.2: Returning User (Has Chat History)

```
┌─────────────────────────────────────────────┐
│ [Upaya Logo]              🔔  🌐            │
├─────────────────────────────────────────────┤
│                                             │
│  "Welcome back, Mohit 🙏"                   │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 📊 Your Active Remedy Plan          │    │
│  │ Shani Dosha Protocol — Day 14/63    │    │
│  │ ████████░░░░░░░░ 22%               │    │
│  │ Today: Hanuman Chalisa (7x)         │    │
│  │                        [Continue →] │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🔔 Transit Alert                    │    │
│  │ "Rahu transit entering your 7th     │    │
│  │  house in 12 days. Tap to see       │    │
│  │  protective remedies."              │    │
│  │                     [View Details →] │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌──────────────────┐ ┌──────────────────┐  │
│  │ 💬 Continue       │ │ 🆕 New Problem   │  │
│  │ last chat         │ │                  │  │
│  └──────────────────┘ └──────────────────┘  │
│                                             │
│  Recent:                                    │
│  ┌─────────────────────────────────────┐    │
│  │ 💍 Marriage Delay Analysis           │    │
│  │ Feb 15 · Report purchased · ⭐ Saved │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 💼 Career Guidance                   │    │
│  │ Feb 10 · Free diagnosis             │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐  [🎤]   │
│ │ Ask me anything...              │         │
│ └─────────────────────────────────┘  [➤]   │
├───────────┬───────────┬───────────┬─────────┤
│  🏠 Home  │ 📿 Remedies│ 🛕 Explore │ 👤 Me  │
└───────────┴───────────┴───────────┴─────────┘
```

**Returning user logic:**
- If active remedy plan exists → show progress card at top
- If transit alerts pending → show alert card
- Show recent chat sessions as list
- "Continue last chat" resumes where they left off
- "New Problem" starts fresh chat with chips
- Input box always visible at bottom

---

## 4. S3: AI Emotional Intake Chat (Compressed — 2 Exchanges to Diagnosis)

The core experience. Redesigned for SPEED to first value.

**Critical design decision:** The old flow had 3-5 exchanges before asking for birth details. Every extra exchange is a dropout point (10-15% loss per message). The new flow compresses to **exactly 2 exchanges** before the curiosity bridge, getting users to diagnosis in ~2 minutes instead of 5+.

**The deeper emotional conversation happens AFTER the free diagnosis** — when the user is already invested and has received value. This is psychologically stronger: give value first, then deepen the relationship.

```
OLD FLOW (4-6 min):                    NEW FLOW (~2 min):
Chip/Text ──────────────────────        Chip/Text ──────────────────────
  ↓                                       ↓
AI Empathy ─────────────────────        AI Empathy + 1 Question ────────
  ↓                                       ↓
User answers ───────────────────        User answers ───────────────────
  ↓                                       ↓
AI follow-up #2 ────────────────        AI Curiosity Bridge (IMMEDIATE) ──
  ↓                                       ↓
User answers ───────────────────        Birth Details Form ─────────────
  ↓                                       ↓
AI follow-up #3 ────────────────        Kundli Animation ───────────────
  ↓                                       ↓
AI follow-up #4 (maybe) ───────        FREE Diagnosis + Free Remedies ──
  ↓                                       ↓
Curiosity bridge ───────────────        AI: "Ab aur batayein..." ───────
  ↓                                       (deeper conversation AFTER value)
Birth Details ──────────────────
  ↓
Diagnosis ──────────────────────
```

### S3.1: Chat Interface Layout (2-Exchange Flow)

```
┌─────────────────────────────────────────────┐
│ ← Upaya AI            💍 Marriage Delay  ⋮  │
├─────────────────────────────────────────────┤
│                                             │
│        [AI Avatar - warm, wise face]        │
│                                             │
│  ── EXCHANGE 1: Empathy + One Question ──   │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🙏 Shaadi mein deri — main samajh   │    │
│  │ sakta hoon yeh kitna mushkil hai,   │    │
│  │ aapke liye bhi aur family ke liye   │    │
│  │ bhi.                                │    │
│  │                                     │    │
│  │ Mujhe thoda aur batayein — kab se   │    │
│  │ yeh chal raha hai?                  │    │
│  │                                     │    │
│  │  ┌──────────┐ ┌────────┐ ┌───────┐ │    │
│  │  │ < 1 saal │ │ 1-3    │ │ 3+    │ │    │
│  │  │          │ │ saal   │ │ saal  │ │    │
│  │  └──────────┘ └────────┘ └───────┘ │    │
│  └─────────────────────────────────────┘    │
│                                  2:34 PM    │
│                                             │
│                ┌───────────────────────────┐ │
│                │ 2 saal se rishte aa rahe  │ │
│                │ hain but kuch final nahi  │ │
│                │ ho raha                   │ │
│                └───────────────────────────┘ │
│                                  2:34 PM ✓✓ │
│                                             │
│  ── EXCHANGE 2: Curiosity Bridge ────────   │
│  (AI responds IMMEDIATELY with insight      │
│   + birth details request — NO more         │
│   follow-up questions before this)          │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 2 saal se rishte aake tootna — yeh │    │
│  │ ek specific pattern hai jo bahut    │    │
│  │ cases mein dikhta hai.              │    │
│  │                                     │    │
│  │ 💡 Aksar yeh tab hota hai jab koi   │    │
│  │ planetary combination directly      │    │
│  │ 7th house (marriage house) ko       │    │
│  │ affect kar raha ho. Yeh permanent   │    │
│  │ nahi hota — sahi remedies se iske   │    │
│  │ effects significantly kam hote hain.│    │
│  │                                     │    │
│  │ Main aapki exact kundli se confirm  │    │
│  │ kar sakta hoon ki kaunsa graha yeh  │    │
│  │ kar raha hai aur kya remedy sabse   │    │
│  │ effective hogi.                     │    │
│  │                                     │    │
│  │ ┌─────────────────────────────────┐ │    │
│  │ │  📋 Apni Birth Details Dein →    │ │    │
│  │ │  (2 minute mein kundli tayyaar) │ │    │
│  │ └─────────────────────────────────┘ │    │
│  └─────────────────────────────────────┘    │
│                                  2:35 PM    │
│                                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐  [🎤]   │
│ │ Type here...                    │         │
│ └─────────────────────────────────┘  [➤]   │
└─────────────────────────────────────────────┘
```

**Key changes from old flow:**
1. AI Message 1 = empathy + ONE qualifying question (duration). No second question, no branching.
2. Duration offered as quick-tap chips (< 1 year / 1-3 years / 3+ years) AND free text. Chips reduce typing friction.
3. AI Message 2 = curiosity bridge IMMEDIATELY. No additional follow-ups. Mirrors the user's own words ("2 saal se rishte aake tootna") for emotional resonance.
4. Birth details CTA appears within the same message — no separate step.
5. Total: 2 user inputs → at birth details form. ~60-90 seconds.

### S3.2: Chat UI Component Specs

| Component | Spec |
|-----------|------|
| **AI messages** | Left-aligned, soft cream/warm white background (#FFF8F0), rounded corners (16px), max-width 80% of screen |
| **User messages** | Right-aligned, saffron/warm orange tint (#FFF3E0), rounded corners, max-width 75% |
| **AI avatar** | Small circular avatar (32px) next to first message in a group. Warm, wise face — not robotic. Think: kind elder uncle/aunt |
| **Quick reply chips** | Appear inline within AI message bubble when AI offers choices. Tappable. Disappear after selection (replaced by user's choice as a sent message) |
| **Typing indicator** | Three animated dots in AI bubble style. Shows for **0.8-1.2 seconds** before AI response (shortened from 1-2s — faster pace matches compressed flow) |
| **Timestamps** | Small, grey, below message groups. Not on every message — grouped by minute |
| **Read receipts** | Single tick (sent), double tick (delivered). No blue ticks. |
| **Scroll** | Auto-scroll to bottom on new message. Pull down to see older messages |
| **Top bar** | Problem category tag (chip with emoji). Back arrow. Overflow menu (⋮) with: Share chat, Save, Clear history |

### S3.3: Chat Interaction Patterns

**Quick Reply Chips (Inline):**
AI offers structured choices to reduce typing friction. These appear as tappable chips inside the AI bubble.

For the qualifying question, duration chips are offered:
```
┌─────────────────────────────────────────┐
│ ...kab se yeh chal raha hai?            │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ < 1 saal │ │ 1-3 saal │ │ 3+ saal  │ │
│ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

User can tap a chip OR type their own answer. Both work.

**Voice Message:**
- Hold mic button → records → release → sends voice
- Voice is transcribed by AI and responded to as text
- Original voice bubble shown with play button + waveform

**Image/Document Sharing (Future):**
- Clip icon for sharing existing kundli images, hand photos (palmistry)
- MVP: disabled, shown as "Coming Soon"

### S3.4: Post-Diagnosis Deepening (NEW — Deeper Conversation After Value)

**The emotional deepening that was previously BEFORE diagnosis now happens AFTER.** This is the key architectural change. The user has already received their free diagnosis and free remedies. They're invested. Now the AI naturally deepens the conversation:

```
┌─────────────────────────────────────────┐
│                                         │
│  [Free diagnosis card shown above —     │
│   see S6]                               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Aapki analysis ke baare mein    │    │
│  │ kya lagta hai? Kya yeh problems │    │
│  │ match karti hain jo aap face    │    │
│  │ kar rahe hain?                  │    │
│  │                                 │    │
│  │ ┌───────────┐ ┌──────────────┐  │    │
│  │ │ Haan, sab │ │ Kuch aur bhi │  │    │
│  │ │ match kar │ │ hai jo nahi  │  │    │
│  │ │ raha hai  │ │ dikha        │  │    │
│  │ └───────────┘ └──────────────┘  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

If user says "Haan, match":
```
AI: "Achha, toh remedies start karne ka perfect time
hai. Kya aap free wale mantras aaj se shuru karna
chahenge? Main aapke tracker mein add kar deta hoon."
```

If user says "Kuch aur bhi hai":
```
AI: "Zaroor batayein — kya aur problems face ho rahi
hain? Shaadi ke alawa career ya health mein bhi
dikkat hai?"
```

This opens deeper exploration AFTER trust is established. AI can then:
- Ask about related life areas
- Ask about previous astrology experiences
- Explore emotional impact
- Recommend additional remedies (upsell naturally)
- Guide toward pandit consultation if needed

**Why this is better:**
- User received VALUE before being asked to open up more
- Trust is higher post-diagnosis than pre-diagnosis
- Deeper conversation now serves as engagement + upsell, not a barrier to value
- If user drops off after diagnosis, they still got something (unlike old flow where dropping mid-intake = got nothing)

### S3.5: The Qualifying Question Per Problem Type

The ONE question AI asks in Exchange 1 adapts to the problem type:

| Problem Chip | AI's Qualifying Question | Quick Chips |
|--------------|-------------------------|-------------|
| 💍 Marriage Delay | "Kab se yeh chal raha hai?" | < 1 yr / 1-3 yr / 3+ yr |
| 💼 Career Stuck | "Kab se same position mein hain?" | < 1 yr / 1-3 yr / 3+ yr |
| 💰 Money Problems | "Yeh sudden hua ya dheere dheere?" | Sudden / Gradually / Always been |
| 🏥 Health Issues | "Kab se yeh health issue hai?" | Recent / Few months / Long time |
| ⚖️ Legal Matters | "Kis type ka matter hai?" | Property / Family / Business / Other |
| 👨‍👩‍👧‍👦 Family Conflict | "Kab se yeh tension hai?" | Recent / Few months / Years |
| 📖 Get My Kundli | (No qualifying Q — skip directly to birth details) | — |
| 🔮 Something Else | "Thoda aur batayein — kya problem hai?" | (Free text only) |

**"Get My Kundli" is special:** User who taps this just wants their chart — no emotional intake needed. AI says: "Zaroor! Aapki kundli banane ke liye mujhe birth details chahiye." → Directly to birth details form.

### S3.6: Curiosity Bridge Variants (Per Problem Type)

The curiosity bridge message adapts to the specific problem:

**Marriage Delay:**
> "X saal se rishte aake tootna — yeh ek specific pattern hai. Aksar yeh tab hota hai jab koi planetary combination directly 7th house (marriage house) ko affect kar raha ho. Yeh permanent nahi hota — sahi remedies se iske effects significantly kam hote hain."

**Career Stuck:**
> "X saal se career mein rukawat — despite effort — yeh aksar tab hota hai jab 10th house (career house) ya uske lord pe koi graha pressure daal raha ho. Yeh temporary phase hota hai aur specific remedies se breakthrough possible hai."

**Money Problems:**
> "Financial instability ka pattern aksar 2nd house (wealth) ya 11th house (income) ke planets se juda hota hai. Kundli se pata chalta hai ki kaunsa graha pressure daal raha hai aur kaise fix karna hai."

**Health Issues:**
> "Health issues frequently connect to 6th house afflictions in the chart. Understanding which planet is causing this helps identify the most effective remedies — both spiritual and practical."

**Legal Matters:**
> "Legal disputes aksar 6th house (litigation) ya 8th house mein planetary combinations se linked hote hain. Kundli analysis se pata chalta hai ki kab favorable period aayega aur kaunsi remedies case ke outcome ko positively influence kar sakti hain."

**Family Conflict:**
> "Family mein ongoing tension aksar 4th house (domestic peace) pe graha influence se hoti hai. Specific remedies se ghar ka mahaul significantly improve ho sakta hai."

---

## 5. S4: Birth Details Capture (In-Chat)

Birth details are collected INSIDE the chat, not on a separate form screen. This maintains conversational flow.

### S4.1: Birth Details Card (In-Chat Widget)

```
┌─────────────────────────────────────────┐
│                                         │
│  📋 Birth Details                        │
│  ─────────────────                      │
│                                         │
│  Accurate kundli ke liye yeh details    │
│  zaroori hain:                          │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📅 Date of Birth               │    │
│  │ ┌─────────────────────────────┐ │    │
│  │ │ DD / MM / YYYY              │ │    │
│  │ └─────────────────────────────┘ │    │
│  │                                 │    │
│  │ 🕐 Time of Birth               │    │
│  │ ┌─────────────────────────────┐ │    │
│  │ │ HH : MM  ○AM ●PM           │ │    │
│  │ └─────────────────────────────┘ │    │
│  │ ☐ Exact time nahi pata?         │    │
│  │   (Approximate use karenge)     │    │
│  │                                 │    │
│  │ 📍 Place of Birth              │    │
│  │ ┌─────────────────────────────┐ │    │
│  │ │ 🔍 City/Town search...      │ │    │
│  │ └─────────────────────────────┘ │    │
│  │                                 │    │
│  │ ┌─────────────────────────────┐ │    │
│  │ │    ✨ Meri Kundli Banayein    │ │    │
│  │ │    Generate My Kundli        │ │    │
│  │ └─────────────────────────────┘ │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Component Specs:**

| Field | Spec |
|-------|------|
| **Date of Birth** | Date picker (native). DD/MM/YYYY format. Default: empty. Scrollable year picker going back to 1940 |
| **Time of Birth** | Time picker with AM/PM. Scrollable hours/minutes. Checkbox: "Exact time nahi pata" → switches to dropdown (Morning/Afternoon/Evening/Night/Don't Know) |
| **Place of Birth** | Autocomplete search. Uses Google Places API. Shows city + state + country. Supports Hindi and English input. Recent/popular cities shown as suggestions: Delhi, Mumbai, Lucknow, Jaipur, Varanasi, Kolkata, Chennai, Hyderabad, Patna, Bhopal |
| **Generate button** | Prominent, full-width, warm golden-orange (#FF8C00). Disabled until DOB + Place filled. Time optional (approximate used if unchecked) |

**Unknown Time Fallback:**
When user checks "Exact time nahi pata":

```
┌─────────────────────────────────┐
│ 🕐 Approximate Time              │
│                                  │
│ ○ Subah (6 AM - 12 PM)          │
│ ○ Dopahar (12 PM - 4 PM)        │
│ ○ Shaam (4 PM - 8 PM)           │
│ ○ Raat (8 PM - 6 AM)            │
│ ○ Bilkul nahi pata              │
│                                  │
│ Note: Approximate time se bhi    │
│ kundli banti hai, lekin exact    │
│ time se zyada accurate hoti hai. │
└─────────────────────────────────┘
```

### S4.2: Place Search Autocomplete

```
┌─────────────────────────────────────────┐
│ 📍 Place of Birth                       │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Luckn                            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📍 Lucknow, Uttar Pradesh, India    │ │
│ ├─────────────────────────────────────┤ │
│ │ 📍 Lucknow Cantonment, UP, India    │ │
│ ├─────────────────────────────────────┤ │
│ │ 📍 Luckeesarai, Bihar, India        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 6. S5: Kundli Generation Animation

After birth details submitted, a visually rich animation plays. This is a TRUST-BUILDING moment — it must feel like serious computation is happening.

### S5.1: Animation Sequence (8-12 seconds)

```
Phase 1 (0-3s): KUNDLI GENERATION
┌─────────────────────────────────────────┐
│                                         │
│         ✨ Generating your Kundli...      │
│                                         │
│         ┌───────────────────┐           │
│         │    ╱ ╲    ╱ ╲     │           │
│         │   ╱   ╲  ╱   ╲   │           │
│         │  ╱     ╲╱     ╲  │           │
│         │  ╲     ╱╲     ╱  │  ← Kundli │
│         │   ╲   ╱  ╲   ╱   │    wheel  │
│         │    ╲ ╱    ╲ ╱    │    drawing │
│         └───────────────────┘    itself  │
│                                         │
│      "Computing planetary positions     │
│       for 15 March 1995, 2:30 PM,       │
│       Lucknow..."                       │
│                                         │
└─────────────────────────────────────────┘

Phase 2 (3-6s): PLANET SCANNING
┌─────────────────────────────────────────┐
│                                         │
│         🔍 Scanning Planets...           │
│                                         │
│         [Kundli chart now visible]      │
│                                         │
│     Planets lighting up one by one:     │
│                                         │
│     ☀️ Surya (Sun) ........... 11th House│
│     🌙 Chandra (Moon) ........ 4th House │
│     ♂️ Mangal (Mars) ......... 7th House │ ← pulses red
│     ☿ Budh (Mercury) ........ 10th House│
│     ♃ Guru (Jupiter) ........ 2nd House │
│     ♀ Shukra (Venus) ........ 12th House│
│     ♄ Shani (Saturn) ........ 7th House │ ← pulses red
│     ☊ Rahu .................. 1st House │
│     ☋ Ketu .................. 7th House │ ← pulses red
│                                         │
│     "3 planets found in 7th house..."   │
│                                         │
└─────────────────────────────────────────┘

Phase 3 (6-9s): DOSHA DETECTION
┌─────────────────────────────────────────┐
│                                         │
│         ⚠️ Analyzing Doshas...           │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │  Checking Mangal Dosha...  ✅    │  │
│    │  Checking Shani Dosha...   ✅    │  │
│    │  Checking Rahu-Ketu Dosha. ✅    │  │
│    │  Checking Kaal Sarp Yog... ✅    │  │
│    │  Checking Pitra Dosha....  ✅    │  │
│    │  Analyzing Dasha periods.. ✅    │  │
│    │  Computing severity....... ✅    │  │
│    └─────────────────────────────────┘  │
│                                         │
│    Each line animates in with a brief   │
│    spinner → then checkmark             │
│                                         │
└─────────────────────────────────────────┘

Phase 4 (9-12s): RESULT READY
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│            ✅ Analysis Complete           │
│                                         │
│         "Aapki kundli analysis          │
│          tayyaar hai"                   │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │                                 │  │
│    │     🔍 View Your Diagnosis       │  │
│    │                                 │  │
│    └─────────────────────────────────┘  │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Animation Specs:**
- Background: dark, cosmic theme (deep navy/purple with subtle star particles)
- Kundli wheel: draws itself with golden lines, animated stroke
- Planet names: fade in one by one, each with a subtle glow
- Problem planets: pulse in red/orange to draw attention
- Dosha checklist: each item has a small spinner that resolves to checkmark
- Sound: optional subtle chime/bell on completion (can be muted)
- The entire sequence must feel like serious computation, not a loading spinner
- Progress ring around the kundli chart fills as phases complete

---

## 7. S6: Free Diagnosis Result (Redesigned — Empowerment Over Anxiety)

Displayed as a message card in the chat after the animation.

**Critical design change:** The old design showed "Severity: HIGH (78/100)" in red, then blurred ALL remedies behind a paywall. This creates anxiety-driven conversion — user feels scared, then pays to feel safe. This contradicts Upaya's ethical framework and generates negative reviews.

**New approach: Empowerment-based conversion.**
- User sees their problem → understands the cause (not scared)
- User gets 2-3 FREE actionable remedies they can start TODAY (empowered)
- User WANTS the complete plan because they see value in optimization — not because they're frightened
- The paywall sells "the BEST version" not "the ONLY solution"

### S6.1: Free Tier Result — Part 1: Diagnosis (Visible)

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌═══════════════════════════════════════┐  │
│  │  📊 YOUR KUNDLI DIAGNOSIS              │  │
│  │  ════════════════════════              │  │
│  │                                       │  │
│  │  🔍 Root Cause Identified              │  │
│  │  ──────────────────────               │  │
│  │  Mangal (Mars) + Shani (Saturn)       │  │
│  │  both in your 7th house (marriage     │  │
│  │  house)                               │  │
│  │                                       │  │
│  │  Currently running:                   │  │
│  │  Shani Mahadasha → Rahu Antardasha    │  │
│  │  (active until Oct 2027)              │  │
│  │                                       │  │
│  │  🎯 Impacted Areas                     │  │
│  │  ───────────────                      │  │
│  │  ● Marriage & Relationships (Primary) │  │
│  │  ● Mental Peace (Secondary)           │  │
│  │                                       │  │
│  │  📋 Dosha Assessment                   │  │
│  │  ─────────────────                    │  │
│  │                                       │  │
│  │  Dosha Level:  Significant            │  │
│  │                                       │  │
│  │  Commonly addressed?   ✅ YES          │  │
│  │  Responsive to         ✅ Highly       │  │
│  │  remedies?             responsive     │  │
│  │                                       │  │
│  │  "Yeh dosha bahut common hai — lakho  │  │
│  │  logon ne successfully iska remedy    │  │
│  │  kiya hai. Sahi approach se iske      │  │
│  │  effects 60-70% tak kam ho sakte      │  │
│  │  hain."                               │  │
│  │                                       │  │
│  └═══════════════════════════════════════┘  │
│                                             │
```

**Key change: "Dosha Assessment" replaces "Severity Score"**

| OLD (Anxiety-driven) | NEW (Empowerment-driven) |
|---------------------|--------------------------|
| "Severity: HIGH (78/100)" with red bar | "Dosha Level: Significant" — no scary number |
| Implied: "You're in trouble" | "Commonly addressed? YES" — normalizes it |
| Nothing actionable until you pay | "Responsive to remedies? Highly responsive" — gives hope |
| User feels: fear → pay to fix | User feels: understood → empowered → wants optimal plan |

### S6.2: Free Tier Result — Part 2: FREE Remedies (Visible — The Game Changer)

```
│  ┌═══════════════════════════════════════┐  │
│  │  🟢 START YOUR REMEDIES TODAY (FREE)  │  │
│  │  ══════════════════════════════════   │  │
│  │                                       │  │
│  │  "Yeh remedies aap aaj hi shuru kar   │  │
│  │  sakte hain — bilkul free. Inhe       │  │
│  │  shuru karne se planetary pressure    │  │
│  │  kam hona start hota hai."            │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  1. 📿 Mangal Mantra (Daily)    │  │  │
│  │  │                                 │  │  │
│  │  │  "Om Kraam Kreem Kraum Sah      │  │  │
│  │  │   Bhaumaaya Namah"              │  │  │
│  │  │                                 │  │  │
│  │  │  ॐ क्रां क्रीं क्रौं सः भौमाय नमः    │  │  │
│  │  │                                 │  │  │
│  │  │  108 times, every Tuesday       │  │  │
│  │  │  morning before 10 AM           │  │  │
│  │  │  Duration: 9 Tuesdays           │  │  │
│  │  │                                 │  │  │
│  │  │  [▶️ Listen to Pronunciation]    │  │  │
│  │  │  [➕ Add to Remedy Tracker]      │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  2. 🍽️ Tuesday Fasting          │  │  │
│  │  │                                 │  │  │
│  │  │  Every Tuesday, eat only after  │  │  │
│  │  │  sunset. Fruits allowed. Avoid  │  │  │
│  │  │  salt.                          │  │  │
│  │  │  Duration: 9 Tuesdays           │  │  │
│  │  │                                 │  │  │
│  │  │  [➕ Add to Remedy Tracker]      │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  3. 🧘 Hanuman Chalisa (Daily)  │  │  │
│  │  │                                 │  │  │
│  │  │  Read once daily, preferably    │  │  │
│  │  │  in the morning. Strengthens    │  │  │
│  │  │  Mars positively.               │  │  │
│  │  │                                 │  │  │
│  │  │  [▶️ Listen / Read Along]        │  │  │
│  │  │  [➕ Add to Remedy Tracker]      │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ✅ "Yeh aapka foundation hai. Inhe   │  │
│  │  aaj se shuru karein — planetary      │  │
│  │  pressure kam hona start hoga."       │  │
│  │                                       │  │
│  └═══════════════════════════════════════┘  │
│                                             │
```

**Why free remedies are the game changer:**

1. **User gets REAL value without paying.** They walk away with 3 actionable things to do today. This is not a teaser — it's genuine remedies from Vedic tradition.
2. **Builds trust massively.** "This app gave me real help for free" vs "This app scared me then asked for money."
3. **Creates shareable content.** User can tell friends: "Meri kundli mein Mangal Dosha mila, yeh mantra bataya — Om Kraam Kreem..." That's organic word-of-mouth. With old design (everything blurred), there was nothing to share.
4. **Users who add to tracker = retained users.** Even if they never pay, they open the app daily for mantra tracking. That's engagement you can monetize later.
5. **Conversion is HIGHER, not lower.** Users who trust you are more willing to pay. Fear-based conversion has higher initial rate but worse LTV, worse reviews, worse word-of-mouth.

### S6.3: Free Tier Result — Part 3: Complete Plan Upsell (Blurred)

```
│  ┌═══════════════════════════════════════┐  │
│  │  ✨ COMPLETE OPTIMIZED PLAN            │  │
│  │  ═══════════════════════════          │  │
│  │                                       │  │
│  │  "Aap free remedies shuru kar rahe    │  │
│  │  hain — great start! Complete plan    │  │
│  │  se aapko milega:"                    │  │
│  │                                       │  │
│  │  🔒 Detailed dosha analysis with      │  │
│  │     specific planetary positions      │  │
│  │                                       │  │
│  │  🔒 Marriage/career timeline — kab     │  │
│  │     tak pressure rahega, kab relief   │  │
│  │     aayega                            │  │
│  │                                       │  │
│  │  🔒 SPECIFIC temple recommendations   │  │
│  │     — kaunsa temple aapke chart ke    │  │
│  │     liye sabse powerful hai aur kyun  │  │
│  │                                       │  │
│  │  🔒 Best dates (muhurta) for maximum  │  │
│  │     effectiveness — exact din aur     │  │
│  │     samay                             │  │
│  │                                       │  │
│  │  🔒 Product recommendations matched   │  │
│  │     to your specific chart            │  │
│  │                                       │  │
│  │  🔒 Complete 9-week structured        │  │
│  │     protocol with weekly milestones   │  │
│  │                                       │  │
│  │  ─────────────────────────────────    │  │
│  │                                       │  │
│  │  👥 12,847 users with similar charts   │  │
│  │  unlocked their complete plan         │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  ✨ Unlock Complete Plan          │  │  │
│  │  │                                 │  │  │
│  │  │       ₹199  (₹499)              │  │  │
│  │  │                                 │  │  │
│  │  │  Includes: Temples + Timing +   │  │  │
│  │  │  Products + 9-Week Protocol     │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  🔒 100% Private · Encrypted Data     │  │
│  │                                       │  │
│  └═══════════════════════════════════════┘  │
│                                             │
```

**Key changes in upsell framing:**

| OLD | NEW |
|-----|-----|
| "Unlock Full Remedy Plan" | "Unlock Complete Plan" — implies they already HAVE a plan (free one), this is the COMPLETE version |
| Generic blurred items | Each locked item has a description of WHY it matters: "kaunsa temple aapke chart ke liye sabse powerful hai aur kyun" |
| "Limited period introductory offer" (urgency/scarcity) | Removed — urgency triggers feel manipulative in faith context. The value proposition is strong enough without fake scarcity |
| Nothing precedes the paywall | Free remedies precede the paywall — user already has value, paying is an UPGRADE not a gate |

### S6.4: AI Follow-Up After Diagnosis (Replaces Old Chat Continue)

```
│  AI continues in chat:                      │
│  ┌───────────────────────────────────────┐  │
│  │ "Aapka diagnosis clear hai. Maine 3   │  │
│  │ remedies free mein suggest ki hain    │  │
│  │ — aap aaj se shuru kar sakte hain.    │  │
│  │                                       │  │
│  │ Complete plan mein specific temples    │  │
│  │ aur timing bhi milega — jo results    │  │
│  │ ko aur powerful banata hai. Lekin     │  │
│  │ pehle free remedies se start karna    │  │
│  │ bhi bahut achha step hai."            │  │
│  │                                       │  │
│  │ ┌─────────────────────────────────┐   │  │
│  │ │ 📿 Add free remedies to         │   │  │
│  │ │    my tracker (start today)     │   │  │
│  │ └─────────────────────────────────┘   │  │
│  │                                       │  │
│  │ ┌─────────────────────────────────┐   │  │
│  │ │ ✨ Unlock complete plan ₹199     │   │  │
│  │ └─────────────────────────────────┘   │  │
│  │                                       │  │
│  │ ┌─────────────────────────────────┐   │  │
│  │ │ 💬 Kuch aur poochna hai         │   │  │
│  │ └─────────────────────────────────┘   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ── POST-DIAGNOSIS DEEPENING ──             │
│  (see S3.4 — deeper conversation            │
│   happens here, AFTER value delivery)       │
│                                             │
└─────────────────────────────────────────────┘
```

**Three clear paths:**
1. **Add free remedies to tracker** — User starts free, builds habit, may convert later. This is the RETENTION path.
2. **Unlock complete plan** — User pays now. This is the REVENUE path.
3. **Ask more questions** — Continues conversation. AI deepens understanding, may recommend pandit consultation. This is the ENGAGEMENT path.

All three paths are valuable. None require anxiety to drive action.

### S6.5: Share Card (Redesigned — Now Has Content to Share)

```
│  ── Share card (auto-generated): ──         │
│  ┌───────────────────────────────────────┐  │
│  │  📊 Meri kundli mein Mangal Dosha      │  │
│  │  mila — Mars + Saturn 7th house mein. │  │
│  │                                       │  │
│  │  Yeh mantra suggest hua:              │  │
│  │  "Om Kraam Kreem Kraum Sah            │  │
│  │   Bhaumaaya Namah" — 108x Tuesdays   │  │
│  │                                       │  │
│  │  Apni kundli bhi free mein check      │  │
│  │  karo: [Upaya link]                   │  │
│  │                        [📤 Share]     │  │
│  └───────────────────────────────────────┘  │
```

**Why this share card is 10x better than the old one:**
- OLD: "Meri kundli mein Mangal Dosha mila — check karo!" (vague, nothing to talk about)
- NEW: Includes the ACTUAL MANTRA. Friend reads it, thinks "interesting, let me check mine too." This is content-rich sharing — the mantra IS the hook. When someone shares a specific mantra on WhatsApp family groups, it sparks conversations. That's organic virality in the Hindi-belt demographic.

### S6.6: Design Specs (Updated)

| Element | Spec |
|---------|------|
| Diagnosis card | White card with subtle golden border (#D4A017, 1px). Elevated shadow (0 4px 16px rgba(0,0,0,0.08)). Rounded corners 16px |
| Dosha assessment | **No severity bar. No numerical score.** Text-based assessment: "Significant" / "Moderate" / "Mild" with green checkmarks for "Commonly addressed" and "Responsive to remedies" |
| Free remedies section | Green left border (#2E7D32, 3px). Slightly elevated from diagnosis card. Each remedy in its own sub-card with green top accent |
| Mantra text | Shown in both Roman transliteration AND Devanagari script. Important for users who can read Hindi but not Roman, and vice versa |
| Audio player | Inline mini-player within mantra card. Play/pause button, duration shown. Loads quickly (files < 1MB) |
| "Add to Tracker" button | Green outline button. On tap: filled green with checkmark + toast "Added to your remedy plan!" |
| Upsell section | Light grey background (#F5F5F5) to visually differentiate from free section. Locked items have 🔒 prefix with descriptive text (NOT blurred — readable but marked as locked) |
| Social proof | "12,847 users" — genuine count from backend. Not inflated |
| Unlock button | Golden gradient, 52px height, prominent but not desperate. No shimmer animation (felt too sales-y). No fake urgency/scarcity text |
| Privacy badge | Below unlock button. Lock icon + "100% Private · Encrypted Data" |
| Share card | Appears after scrolling past upsell. Pre-filled with dosha name + mantra text + referral link. Optimized for WhatsApp sharing |

### S6.7: Conversion Psychology — Old vs New

```
OLD FUNNEL:
User scared (severity HIGH) → Anxious → Pays to fix →
  Might feel manipulated → Mixed reviews → Low word-of-mouth

NEW FUNNEL:
User informed (dosha identified) → Empowered (free remedies!) →
  Starts remedies → Sees value → Wants optimal plan →
  Pays for complete version → Feels smart → Good reviews → Shares mantra

CONVERSION RATE COMPARISON (Expected):
OLD: ~12-15% to paid (fear-driven, higher short-term)
NEW: ~8-10% to paid (value-driven, lower short-term)

BUT:
NEW free-to-tracker: ~25-30% add remedies
NEW tracker-to-paid (within 30 days): ~15-20%
NEW total paid within 30 days: ~12-16% (MATCHES or BEATS old)
NEW 90-day retention: 3-5x higher (daily mantra habit)
NEW word-of-mouth: 3-5x higher (shareable mantra content)
NEW app store rating: Significantly better (no "scared me then asked for money" reviews)
```

**The math works:** Lower immediate conversion is offset by higher retention and organic growth. In a faith business, trust compounds. Short-term extraction destroys it.

---

## 8. S7: Paywall / Report Purchase

### S7.1: Payment Sheet (Bottom Sheet)

Triggered when user taps "Unlock Full Remedy Plan":

```
┌─────────────────────────────────────────────┐
│                                             │
│  [Dimmed chat behind]                       │
│                                             │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│  │                                        │  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ═══════════════════════════════════  │  │
│  │  (drag handle)                        │  │
│  │                                       │  │
│  │  ✨ Unlock Your Complete Remedy Plan    │  │
│  │                                       │  │
│  │  What you'll get:                     │  │
│  │  ✅ Detailed dosha analysis            │  │
│  │  ✅ Marriage/career timeline           │  │
│  │  ✅ 4-6 personalized remedies          │  │
│  │  ✅ Specific temple recommendations    │  │
│  │  ✅ Optimal timing for each remedy     │  │
│  │  ✅ Mantra with audio guidance         │  │
│  │  ✅ Downloadable PDF report            │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  ₹199         was ₹499         │  │  │
│  │  │  60% OFF — Introductory Price   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  [Login required — Phone OTP]         │  │
│  │  (See S16 for auth flow)              │  │
│  │                                       │  │
│  │  Pay with:                            │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│  │
│  │  │ UPI  │ │Google│ │ Card │ │ Net  ││  │
│  │  │      │ │ Pay  │ │      │ │Banking││  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘│  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │       Pay ₹199 Securely         │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  🔒 Secured by Razorpay               │  │
│  │  📄 No spam. Cancel anytime.           │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### S7.2: Payment Success

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              ✅                               │
│                                             │
│       Payment Successful!                   │
│       ₹199 paid                             │
│                                             │
│       Generating your complete              │
│       remedy plan...                        │
│                                             │
│       [Progress spinner]                    │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

Auto-transitions to full report in chat after 2-3 seconds.

---

## 9. S8: Full Paid Remedy Report

Delivered as a rich, scrollable card WITHIN the chat. Also saved to Profile for future access.

### S8.1: Report Delivery in Chat

```
┌─────────────────────────────────────────────┐
│ ← Upaya AI            💍 Marriage Delay  ⋮  │
├─────────────────────────────────────────────┤
│                                             │
│  AI message:                                │
│  ┌───────────────────────────────────────┐  │
│  │ "Aapka complete remedy plan tayyaar   │  │
│  │ hai. Yeh aapki kundli ke hisaab se    │  │
│  │ personalized hai. Dhyan se padhein    │  │
│  │ aur koi bhi sawal ho toh mujhse      │  │
│  │ poochein."                            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌═══════════════════════════════════════┐  │
│  │  📜 YOUR COMPLETE REMEDY PLAN         │  │
│  │  For: Mohit · DOB: 15 Mar 1995       │  │
│  │  Generated: 20 Feb 2026              │  │
│  │                                       │  │
│  │  ─────── SECTION 1 ───────           │  │
│  │  📊 DETAILED DOSHA ANALYSIS           │  │
│  │                                       │  │
│  │  1. Mangal Dosha (Severe)            │  │
│  │  Mars in 7th house creates direct    │  │
│  │  affliction on marriage prospects.   │  │
│  │  Severity: 8.2/10                    │  │
│  │  [Kundli chart highlighting 7th      │  │
│  │   house with Mars position]          │  │
│  │                                       │  │
│  │  2. Shani Dosha (Moderate)           │  │
│  │  Saturn conjunct Mars in 7th house   │  │
│  │  adds delays and obstacles.          │  │
│  │  Severity: 6.5/10                    │  │
│  │                                       │  │
│  │  3. Current Dasha Impact             │  │
│  │  Shani Mahadasha (2019-2038) with    │  │
│  │  Rahu Antardasha (2024-2027).        │  │
│  │  This is the PEAK difficulty period  │  │
│  │  for marriage. After Oct 2027,       │  │
│  │  pressure reduces significantly.     │  │
│  │                                       │  │
│  │         [See full report →]           │  │
│  └═══════════════════════════════════════┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### S8.2: Full Report Screen (Tapping "See full report")

Opens as a full-screen scrollable page with back button to return to chat.

```
┌─────────────────────────────────────────────┐
│ ← Report    💍 Marriage Delay  [📥 PDF] [📤]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │      📜 COMPLETE REMEDY PLAN          │  │
│  │      ═══════════════════════          │  │
│  │      Mohit · 15 Mar 1995             │  │
│  │      Lucknow, Uttar Pradesh          │  │
│  │      Report ID: UP-2026-0283         │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [Section tabs - horizontally scrollable]:  │
│  ┌────────┐┌──────────┐┌────────┐┌───────┐ │
│  │Analysis││ Remedies ││Temples ││Timeline│ │
│  └────────┘└──────────┘└────────┘└───────┘ │
│                                             │
│  ══════════════════════════════════════════  │
│  SECTION 1: DOSHA ANALYSIS                  │
│  ══════════════════════════════════════════  │
│                                             │
│  [Interactive Kundli Chart]                 │
│  ┌───────────────────────────────────────┐  │
│  │         ╱ 12 ╲   ╱ 1  ╲              │  │
│  │       ╱       ╲ ╱       ╲            │  │
│  │  11 ╱    ☊Rahu ╳  ☀️Sun   ╲ 2 ♃Guru  │  │
│  │     ╲         ╱ ╲         ╱          │  │
│  │       ╲     ╱     ╲     ╱            │  │
│  │  10 ☿  ╲ ╱    ASC   ╲ ╱  3          │  │
│  │         ╱ ╲         ╱ ╲              │  │
│  │       ╱     ╲     ╱     ╲            │  │
│  │  9  ╱         ╲ ╱   🌙    ╲ 4        │  │
│  │     ╲         ╱ ╲  Moon   ╱          │  │
│  │       ╲     ╱     ╲     ╱            │  │
│  │  8     ╲ ╱  7 ♂️♄☋  ╲ ╱  5          │  │
│  │         ╱  PROBLEM   ╲               │  │
│  │       ╱    ZONE       ╲  6 ♀         │  │
│  └───────────────────────────────────────┘  │
│  Tap any house to see details               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🔴 Primary: Mangal Dosha (8.2/10)    │  │
│  │ ────────────────────────────────────  │  │
│  │ Mars (Mangal) is placed in your 7th  │  │
│  │ house — the house of marriage and     │  │
│  │ partnerships. This is a classic       │  │
│  │ Mangal Dosha configuration.           │  │
│  │                                       │  │
│  │ Impact on your life:                  │  │
│  │ • Repeated breakdowns in marriage     │  │
│  │   talks at final stages               │  │
│  │ • Arguments or misunderstandings      │  │
│  │   with potential matches              │  │
│  │ • Feeling of invisible obstacles      │  │
│  │                                       │  │
│  │ Vedic Reference:                      │  │
│  │ "Kuje vyaye cha patale, saptame       │  │
│  │ ashtame tatha..."                     │  │
│  │ — Brihat Parashara Hora Shastra       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🟡 Secondary: Shani Influence (6.5/10)│  │
│  │ ────────────────────────────────────  │  │
│  │ Saturn conjunct Mars amplifies the   │  │
│  │ delays. Saturn's nature is to slow   │  │
│  │ things down — combined with Mars in  │  │
│  │ 7th, it creates a "double lock" on   │  │
│  │ marriage prospects.                   │  │
│  │                                       │  │
│  │ Current Dasha:                        │  │
│  │ Shani Mahadasha → Rahu Antardasha    │  │
│  │ (active until Oct 2027)               │  │
│  │                                       │  │
│  │ After Oct 2027, Jupiter Antardasha   │  │
│  │ begins — significantly more          │  │
│  │ favorable for marriage.               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ══════════════════════════════════════════  │
│  SECTION 2: YOUR REMEDY PLAN (9 weeks)      │
│  ══════════════════════════════════════════  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🟢 FREE REMEDIES (Start Today)        │  │
│  │ ════════════════════════════          │  │
│  │                                       │  │
│  │ 1. 📿 Mangal Mantra (Daily)           │  │
│  │    "Om Kraam Kreem Kraum Sah          │  │
│  │     Bhaumaaya Namah"                  │  │
│  │    Recite 108 times every Tuesday     │  │
│  │    morning before 10 AM.              │  │
│  │    Duration: 9 Tuesdays               │  │
│  │                                       │  │
│  │    [▶️ Listen to correct pronunciation]│  │
│  │    [➕ Add to my Remedy Tracker]       │  │
│  │                                       │  │
│  │ 2. 🍽️ Tuesday Fasting                 │  │
│  │    Observe fast every Tuesday.        │  │
│  │    Eat only after sunset.             │  │
│  │    Avoid salt. Fruits allowed.        │  │
│  │    Duration: 9 Tuesdays               │  │
│  │                                       │  │
│  │    [➕ Add to my Remedy Tracker]       │  │
│  │                                       │  │
│  │ 3. 🎁 Daan (Donation)                 │  │
│  │    Donate red masoor dal (lentils)    │  │
│  │    and red cloth to a temple on       │  │
│  │    Tuesdays. Even small amounts       │  │
│  │    are effective.                     │  │
│  │                                       │  │
│  │ 4. 🧘 Hanuman Chalisa (Daily)         │  │
│  │    Read Hanuman Chalisa once daily,   │  │
│  │    preferably in the morning.         │  │
│  │    This strengthens Mars positively.  │  │
│  │                                       │  │
│  │    [▶️ Listen / Read Along]            │  │
│  │    [➕ Add to my Remedy Tracker]       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🟡 RECOMMENDED PUJAS                  │  │
│  │ ════════════════════                  │  │
│  │                                       │  │
│  │ 1. 🛕 Mangal Shanti Puja              │  │
│  │    Best temple: Mangalnath Temple,    │  │
│  │    Ujjain (MP)                        │  │
│  │    This is THE temple for Mangal      │  │
│  │    Dosha specifically. Located at     │  │
│  │    the birthplace of Mars (Mangal).   │  │
│  │                                       │  │
│  │    Best date: Next Tuesday,           │  │
│  │    25 Feb 2026 (Mangal Hora)          │  │
│  │                                       │  │
│  │    Price: ₹1,100                      │  │
│  │    Includes: Video proof + Prasad     │  │
│  │                                       │  │
│  │    ┌─────────────────────────────┐    │  │
│  │    │  🛕 Book This Puja — ₹1,100  │    │  │
│  │    └─────────────────────────────┘    │  │
│  │                                       │  │
│  │ 2. 🛕 Shani Shanti Puja              │  │
│  │    Best temple: Shani Dev Temple,     │  │
│  │    Ujjain (MP)                        │  │
│  │    Saturday during Shani Hora.        │  │
│  │                                       │  │
│  │    Price: ₹1,500                      │  │
│  │                                       │  │
│  │    ┌─────────────────────────────┐    │  │
│  │    │  🛕 Book This Puja — ₹1,500  │    │  │
│  │    └─────────────────────────────┘    │  │
│  │                                       │  │
│  │ 3. 🛕 Navagraha Puja                  │  │
│  │    For overall planetary balance.     │  │
│  │    Recommended annually.              │  │
│  │    Any Navagraha temple.              │  │
│  │                                       │  │
│  │    Price: ₹2,100                      │  │
│  │                                       │  │
│  │    ┌─────────────────────────────┐    │  │
│  │    │  🛕 Book This Puja — ₹2,100  │    │  │
│  │    └─────────────────────────────┘    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🔵 RECOMMENDED PRODUCTS               │  │
│  │ ════════════════════════              │  │
│  │                                       │  │
│  │ 1. 💎 Red Coral (Moonga) Ring         │  │
│  │    Strengthens Mars. Wear on ring     │  │
│  │    finger, right hand, on a Tuesday.  │  │
│  │    Minimum 5 ratti, set in copper     │  │
│  │    or gold.                           │  │
│  │                                       │  │
│  │    [Product image]                    │  │
│  │    ₹2,500 — Certified, Pran          │  │
│  │    Pratistha done                     │  │
│  │                                       │  │
│  │    ┌──────────────────────────────┐   │  │
│  │    │  🛒 View in Siddha Store      │   │  │
│  │    └──────────────────────────────┘   │  │
│  │                                       │  │
│  │ 2. 📿 Hanuman Kavach                  │  │
│  │    Protective pendant. Wear daily.    │  │
│  │    ₹599 — Temple blessed             │  │
│  │                                       │  │
│  │    ┌──────────────────────────────┐   │  │
│  │    │  🛒 View in Siddha Store      │   │  │
│  │    └──────────────────────────────┘   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ══════════════════════════════════════════  │
│  SECTION 3: TIMELINE & EXPECTATIONS         │
│  ══════════════════════════════════════════  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 📅 YOUR 9-WEEK PROTOCOL              │  │
│  │                                       │  │
│  │  Week 1-3: Foundation Phase           │  │
│  │  • Start mantras + fasting            │  │
│  │  • Book Mangal Shanti Puja            │  │
│  │  • Begin Hanuman Chalisa daily        │  │
│  │                                       │  │
│  │  Week 4-6: Intensification            │  │
│  │  • Continue mantras (building power)  │  │
│  │  • Book Shani Shanti Puja             │  │
│  │  • Wear Red Coral if purchased        │  │
│  │                                       │  │
│  │  Week 7-9: Consolidation              │  │
│  │  • Complete all 9 Tuesdays            │  │
│  │  • Navagraha Puja for balance         │  │
│  │  • Full protocol review               │  │
│  │                                       │  │
│  │  After Protocol:                      │  │
│  │  "We'll check in with you to see      │  │
│  │  how things are progressing and       │  │
│  │  adjust if needed."                   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ⏳ IMPORTANT NOTE                     │  │
│  │                                       │  │
│  │ "Remedies work by reducing the        │  │
│  │ intensity of negative planetary       │  │
│  │ influences. They are traditional      │  │
│  │ Vedic practices performed with        │  │
│  │ faith and discipline. Results vary    │  │
│  │ by individual. This is not a          │  │
│  │ guarantee of specific outcomes."      │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Actions:                             │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  📿 Start My 9-Week Protocol     │  │  │
│  │  │  (Add all remedies to tracker)  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌────────────┐  ┌────────────────┐   │  │
│  │  │ 📥 Download │  │ 📤 Share with  │   │  │
│  │  │ PDF Report │  │ Family         │   │  │
│  │  └────────────┘  └────────────────┘   │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  💬 Ask AI about this report     │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ── Share card (auto-generated): ──         │
│  ┌───────────────────────────────────────┐  │
│  │  "Meri kundli mein Mangal Dosha       │  │
│  │  mila — aapki kundli bhi free mein   │  │
│  │  check karein!"                       │  │
│  │  [Upaya logo + link]                  │  │
│  │                        [📤 Share]     │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Specs:**

| Element | Spec |
|---------|------|
| Section tabs | Sticky at top when scrolling. Active tab = underlined golden |
| Kundli chart | Interactive — tap any house to see planets + meaning. 7th house highlighted red (problem zone) |
| Remedy cards | Green border (free), Yellow border (pujas), Blue border (products). Each clearly marked with price or "Free" |
| Audio player | Inline mini-player for mantra pronunciation. Play/pause + speed control (0.5x, 1x, 1.5x) |
| "Add to Tracker" | Adds specific remedy to the Remedies tab tracker. Confirmation toast: "Added to your remedy plan" |
| Book Puja button | Deep links to puja booking flow (S9) with temple + ritual pre-filled |
| Download PDF | Generates branded PDF with kundli chart, all remedies, temple info. Shareable via WhatsApp/email |
| Share card | Pre-written viral message. Opens native share sheet. Link includes referral code |
| Disclaimer | Always visible at bottom of remedies section. Non-dismissable |

---

## 10. S9: Puja Booking Flow

Triggered from Report → "Book This Puja" or from Explore tab → Temple/Puja catalog.

### S9.1: Puja Detail Screen

```
┌─────────────────────────────────────────────┐
│ ← Mangal Shanti Puja              [📤]     │
├─────────────────────────────────────────────┤
│                                             │
│  [Temple hero image — Mangalnath, Ujjain]   │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │   [Photo of temple with warm          │  │
│  │    evening light, diyas visible]      │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  🛕 Mangal Shanti Puja                      │
│  at Mangalnath Temple, Ujjain               │
│  ⭐ 4.8 (342 pujas completed)               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Why this temple?                      │  │
│  │ "Mangalnath is the birthplace of      │  │
│  │ Mars according to Vedic texts. Your   │  │
│  │ chart shows Mars in 7th house — this  │  │
│  │ is the most powerful temple for       │  │
│  │ this specific dosha."                 │  │
│  │ — Your AI Diagnosis                   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  What's included:                           │
│  ✅ Mangal Shanti Puja with full vidhi      │
│  ✅ Your name + gotra in sankalp            │
│  ✅ HD video of complete puja (3-5 min)     │
│  ✅ Photos of ritual                        │
│  ✅ Consecrated prasad shipped to you       │
│  ✅ Digital completion certificate          │
│                                             │
│  📸 Past puja videos:                       │
│  [Thumbnail] [Thumbnail] [Thumbnail]        │
│  (Tap to play sample video)                 │
│                                             │
│  Delivery:                                  │
│  📹 Video: 3-5 days after puja              │
│  📦 Prasad: 7-10 days (free shipping)       │
│                                             │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │   Book Puja — ₹1,100                  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### S9.2: Booking Form (After tapping "Book Puja")

```
┌─────────────────────────────────────────────┐
│ ← Book Mangal Shanti Puja                   │
├─────────────────────────────────────────────┤
│                                             │
│  Step 1 of 3: Sankalp Details               │
│  ════════════════════════════               │
│                                             │
│  These details are spoken during the puja   │
│  as your personal prayer (sankalp).         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Full Name (as per puja) *           │    │
│  │ ┌─────────────────────────────────┐ │    │
│  │ │ Mohit Chandak                   │ │    │
│  │ └─────────────────────────────────┘ │    │
│  │                                     │    │
│  │ Father's Name                       │    │
│  │ ┌─────────────────────────────────┐ │    │
│  │ │                                 │ │    │
│  │ └─────────────────────────────────┘ │    │
│  │                                     │    │
│  │ Gotra (if known)                    │    │
│  │ ┌─────────────────────────────────┐ │    │
│  │ │ Select or type...              │ │    │
│  │ └─────────────────────────────────┘ │    │
│  │ ☐ Don't know my gotra (general      │    │
│  │   sankalp will be used)             │    │
│  │                                     │    │
│  │ Your Wish / Sankalp *               │    │
│  │ ┌─────────────────────────────────┐ │    │
│  │ │ "Shaadi mein aa rahi rukavatein│ │    │
│  │ │ door hon, achha rishta aaye"   │ │    │
│  │ └─────────────────────────────────┘ │    │
│  │ Pre-filled based on your chat.      │    │
│  │ Edit if needed.                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │          Next: Select Date →         │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### S9.3: Date Selection

```
┌─────────────────────────────────────────────┐
│ ← Book Mangal Shanti Puja                   │
├─────────────────────────────────────────────┤
│                                             │
│  Step 2 of 3: Select Date                   │
│  ════════════════════════                   │
│                                             │
│  ⭐ AI Recommended Date:                    │
│  ┌───────────────────────────────────────┐  │
│  │ ✨ Tuesday, 25 Feb 2026                │  │
│  │ "Mangal Hora, Hasta Nakshatra —       │  │
│  │  most auspicious for Mangal Shanti"   │  │
│  │                           [Select ✓]  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Other available dates:                     │
│  ┌───────────────────────────────────────┐  │
│  │ ○ Tue, 4 Mar 2026  — Good muhurta    │  │
│  │ ○ Tue, 11 Mar 2026 — Good muhurta    │  │
│  │ ○ Tue, 18 Mar 2026 — Average muhurta │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Note: Mangal Shanti Puja is most          │
│  effective on Tuesdays during Mangal Hora.  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       Next: Review & Pay →           │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### S9.4: Review & Payment

```
┌─────────────────────────────────────────────┐
│ ← Book Mangal Shanti Puja                   │
├─────────────────────────────────────────────┤
│                                             │
│  Step 3 of 3: Review & Pay                  │
│  ══════════════════════════                 │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🛕 Mangal Shanti Puja                 │  │
│  │ Mangalnath Temple, Ujjain             │  │
│  │                                       │  │
│  │ Date: Tuesday, 25 Feb 2026            │  │
│  │ Name: Mohit Chandak                   │  │
│  │ Gotra: [Selected]                     │  │
│  │ Sankalp: "Shaadi mein aa rahi         │  │
│  │ rukavatein door hon..."               │  │
│  │                                       │  │
│  │ Deliverables:                         │  │
│  │ 📹 Puja video (3-5 days)              │  │
│  │ 📦 Prasad delivery (7-10 days)        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Puja Fee                    ₹1,100    │  │
│  │ Prasad Delivery               Free    │  │
│  │ ─────────────────────────────────     │  │
│  │ Total                       ₹1,100    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  📍 Prasad delivery address:                │
│  ┌─────────────────────────────────────┐    │
│  │ [Saved address or add new]          │    │
│  │ Mohit Chandak                       │    │
│  │ 42, Sector 15, Lucknow 226001      │    │
│  │                         [Change →]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │     🔒 Pay ₹1,100 Securely            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  🔒 Secured by Razorpay                     │
│  📞 Support: WhatsApp us anytime            │
│                                             │
└─────────────────────────────────────────────┘
```

### S9.5: Booking Confirmation

```
┌─────────────────────────────────────────────┐
│                                             │
│              ✅ Puja Booked!                 │
│                                             │
│  Mangal Shanti Puja                         │
│  Mangalnath Temple, Ujjain                  │
│  Tuesday, 25 Feb 2026                       │
│                                             │
│  Order ID: PJ-2026-0847                     │
│                                             │
│  What happens next:                         │
│  ──────────────────                         │
│  📅 25 Feb — Puja performed with your       │
│              sankalp                         │
│  📹 27-28 Feb — Puja video delivered        │
│                 (WhatsApp + App)             │
│  📦 3-7 Mar — Consecrated prasad arrives    │
│               at your address               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  📿 Continue with other remedies     │    │
│  │  from your plan                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌────────────┐  ┌────────────────────┐     │
│  │ 📋 View     │  │ 🏠 Back to Home    │     │
│  │ Order       │  │                    │     │
│  └────────────┘  └────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 11. S10: Pandit Consultation

Accessible from: Report → "Talk to a Pandit" or Explore tab → Pandit section.

### S10.1: Pandit Listing

```
┌─────────────────────────────────────────────┐
│ ← Talk to a Pandit                    🔍    │
├─────────────────────────────────────────────┤
│                                             │
│  AI Note:                                   │
│  ┌───────────────────────────────────────┐  │
│  │ 💡 "Based on your chart, I recommend  │  │
│  │ consulting a pandit who specializes   │  │
│  │ in Mangal Dosha and marriage          │  │
│  │ remedies."                            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Filter: [All] [Marriage] [Career] [Health] │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ [Photo]  Pandit Ramesh Shastri        │  │
│  │          ⭐ 4.9 (187 consultations)   │  │
│  │          Speciality: Marriage,        │  │
│  │          Mangal Dosha, Shani          │  │
│  │          Languages: Hindi, English    │  │
│  │          Experience: 15 years         │  │
│  │                                       │  │
│  │          🟢 Available Now              │  │
│  │                                       │  │
│  │  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ 💬 Chat  │  │ 📞 Call ₹15/min  │   │  │
│  │  │ ₹10/min  │  │                  │   │  │
│  │  └──────────┘  └──────────────────┘   │  │
│  │                                       │  │
│  │  ✨ AI-recommended for your chart      │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ [Photo]  Pandit Suresh Tripathi       │  │
│  │          ⭐ 4.7 (93 consultations)    │  │
│  │          Speciality: Career, Finance, │  │
│  │          Shani, Rahu-Ketu             │  │
│  │          Languages: Hindi             │  │
│  │          Experience: 22 years         │  │
│  │                                       │  │
│  │          ⏰ Next available: 4 PM today │  │
│  │                                       │  │
│  │  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ 💬 Chat  │  │ 📞 Schedule Call  │   │  │
│  │  │ ₹8/min   │  │   ₹12/min        │   │  │
│  │  └──────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### S10.2: Pre-Session AI Brief (Pandit Sees This)

Before the session, the pandit receives an AI-generated brief:

```
┌───────────────────────────────────────┐
│ 📋 Session Brief — Mohit C.           │
│                                       │
│ Problem: Marriage delay (2+ years)    │
│ Chart: Mangal + Shani in 7th house    │
│ Dasha: Shani Mahadasha, Rahu Antar    │
│ Severity: High (78/100)              │
│ Current remedies: Mangal mantra       │
│ (started), Mangalnath puja (booked)   │
│ User expectations: Specific timeline  │
│ guidance, additional remedy advice    │
│                                       │
│ Note: User has already seen AI        │
│ diagnosis. Session should build on    │
│ it, not contradict it.                │
└───────────────────────────────────────┘
```

### S10.3: Consultation Chat/Call Screen

```
┌─────────────────────────────────────────────┐
│ Pandit Ramesh Shastri     ⏱️ 04:32  ₹45    │
├─────────────────────────────────────────────┤
│                                             │
│  [Chat messages similar to AI chat]         │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Namaste Mohit ji. Maine aapki kundli │  │
│  │ dekhi. AI ne sahi analyze kiya hai — │  │
│  │ Mangal aur Shani dono 7th mein       │  │
│  │ hona kaafi challenging hai...         │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Top bar shows:                             │
│  - Timer (minutes:seconds)                  │
│  - Running cost (₹X/min × time)            │
│  - Pandit name + photo                      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ⚠️ Wallet balance: ₹200              │  │
│  │  Session will end at ₹0 unless       │  │
│  │  you recharge. [Recharge ₹100 →]     │  │
│  └───────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ [🎤] [📞]  │
│ │ Type here...                │      [End]  │
│ └─────────────────────────────┘             │
└─────────────────────────────────────────────┘
```

### S10.4: Post-Session Summary (AI-Generated)

```
┌─────────────────────────────────────────────┐
│ ← Session Summary                           │
├─────────────────────────────────────────────┤
│                                             │
│  Session with Pandit Ramesh Shastri         │
│  Duration: 12 min · Cost: ₹180              │
│  Date: 20 Feb 2026                          │
│                                             │
│  📋 AI Summary:                              │
│  ┌───────────────────────────────────────┐  │
│  │ Key points discussed:                 │  │
│  │ • Confirmed Mangal Dosha severity     │  │
│  │ • Additional remedy: Sunderkand path  │  │
│  │   on Saturdays for 7 weeks            │  │
│  │ • Pandit recommended Rahu-Ketu puja   │  │
│  │   at Kaal Bhairav temple, Varanasi    │  │
│  │ • Timeline: improvement expected      │  │
│  │   after June 2026 with remedies       │  │
│  │                                       │  │
│  │ New remedies suggested:               │  │
│  │ ┌─────────────────────────────────┐   │  │
│  │ │ ➕ Add Sunderkand Path to       │   │  │
│  │ │   Remedy Tracker                │   │  │
│  │ └─────────────────────────────────┘   │  │
│  │ ┌─────────────────────────────────┐   │  │
│  │ │ 🛕 Book Rahu-Ketu Puja at       │   │  │
│  │ │   Kaal Bhairav — ₹1,800        │   │  │
│  │ └─────────────────────────────────┘   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Rate your session:                         │
│  ⭐⭐⭐⭐⭐                                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 12. S11: Siddha Store (Commerce)

Accessible from: Bottom tab "Explore" → Store section, or from Report product recommendations.

### S11.1: Store Home

```
┌─────────────────────────────────────────────┐
│ 🛕 Explore                            🔍    │
├─────────────────────────────────────────────┤
│                                             │
│  [Tabs: Temples | Pujas | Store | Pandits]  │
│                     ═════                   │
│                                             │
│  ✨ Recommended for Your Chart               │
│  (Based on your Mangal + Shani diagnosis)   │
│                                             │
│  [Horizontally scrollable product cards:]   │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │    │
│  │ Red Coral│ │ Hanuman  │ │ Shani    │    │
│  │ Ring     │ │ Kavach   │ │ Yantra   │    │
│  │ ₹2,500   │ │ ₹599     │ │ ₹899     │    │
│  │ ⭐ 4.8    │ │ ⭐ 4.7    │ │ ⭐ 4.6    │    │
│  │ AI Pick  │ │ AI Pick  │ │ AI Pick  │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│  Categories:                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  💎      │ │  📿      │ │  🔱      │       │
│  │Gemstones│ │Rudraksha│ │ Yantras │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  📦      │ │  🪔      │ │  🎁      │       │
│  │ Remedy  │ │  Puja   │ │  Daan   │       │
│  │  Kits   │ │  Items  │ │  Seva   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│  🔥 Popular This Week                       │
│  ┌───────────────────────────────────────┐  │
│  │ [Image] Mangal Dosha Remedy Kit       │  │
│  │ Complete kit: Red coral + Hanuman     │  │
│  │ Kavach + Mangal Yantra + Red thread   │  │
│  │ ₹3,999 (₹5,500)  27% OFF            │  │
│  │ ⭐ 4.9 · 234 sold · Pran Pratistha ✓ │  │
│  │                          [Add to Cart]│  │
│  └───────────────────────────────────────┘  │
│                                             │
├───────────┬───────────┬───────────┬─────────┤
│  🏠 Home  │ 📿 Remedies│ 🛕 Explore │ 👤 Me  │
└───────────┴───────────┴───────────┴─────────┘
```

### S11.2: Product Detail

```
┌─────────────────────────────────────────────┐
│ ← Red Coral (Moonga) Ring          [📤]     │
├─────────────────────────────────────────────┤
│                                             │
│  [Product image carousel — swipeable]       │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │   [High-quality product photo]        │  │
│  │                                       │  │
│  │   ● ○ ○ ○  (4 images)                │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  💎 Red Coral (Moonga) Ring                  │
│  5 Ratti, Copper Setting                    │
│  ⭐ 4.8 (89 reviews)                        │
│                                             │
│  ₹2,500  (MRP ₹3,500)  29% OFF             │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ✨ Why this product (from your chart): │  │
│  │ "Red Coral strengthens Mars. With     │  │
│  │ Mars afflicted in your 7th house,     │  │
│  │ wearing Moonga can reduce the         │  │
│  │ intensity of Mangal Dosha effects."   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Trust signals:                             │
│  ✅ Pran Pratistha (energizing) done         │
│  ✅ Video certificate of authenticity        │
│  ✅ Lab certified gemstone                   │
│  ✅ 7-day return policy                      │
│  ✅ Free shipping                            │
│                                             │
│  Wearing instructions:                      │
│  • Finger: Ring finger, right hand          │
│  • Day: Tuesday morning, before 10 AM      │
│  • Mantra: "Om Kraam Kreem Kraum Sah       │
│    Bhaumaaya Namah" (recite 108 times       │
│    before wearing)                          │
│                                             │
│  📹 Pran Pratistha Video:                   │
│  [Video thumbnail — tap to play]            │
│                                             │
│  Reviews:                                   │
│  ┌───────────────────────────────────────┐  │
│  │ ⭐⭐⭐⭐⭐ Rahul S. · 2 weeks ago        │  │
│  │ "Quality bahut achhi hai. Pran        │  │
│  │ Pratistha ka video bhi mila."         │  │
│  └───────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │     🛒 Add to Cart — ₹2,500           │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 13. S12: Remedy Tracker Dashboard

The second tab — "Remedies". This is the retention engine.

### S12.1: Active Protocol View

```
┌─────────────────────────────────────────────┐
│ 📿 My Remedies                        ⋮     │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🔥 Day 14 of 63 — Keep Going!        │  │
│  │                                       │  │
│  │ ████████░░░░░░░░░░░░░░░░ 22%         │  │
│  │                                       │  │
│  │ Protocol: Mangal + Shani Dosha        │  │
│  │ Started: 7 Feb 2026                   │  │
│  │ Target completion: 10 Apr 2026        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Today's Tasks:                             │
│  ═════════════                              │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ☐ 📿 Mangal Mantra (108 times)       │  │
│  │   "Om Kraam Kreem Kraum Sah..."      │  │
│  │   🔥 Streak: 12 days                  │  │
│  │                                       │  │
│  │   [▶️ Start Guided Mantra]            │  │
│  │   [Mark as Done ✓]                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ☐ 🧘 Hanuman Chalisa (1 time)        │  │
│  │   🔥 Streak: 8 days                   │  │
│  │                                       │  │
│  │   [▶️ Read Along / Audio]             │  │
│  │   [Mark as Done ✓]                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ☐ 🍽️ Tuesday Fast                     │  │
│  │   (Today is Tuesday — fast day!)      │  │
│  │   Eat only after sunset.              │  │
│  │   🔥 Streak: 2 Tuesdays               │  │
│  │                                       │  │
│  │   [Mark as Done ✓]                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Puja Status:                               │
│  ═══════════                                │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ✅ Mangal Shanti Puja                  │  │
│  │   Mangalnath, Ujjain · 25 Feb 2026   │  │
│  │   Status: Completed ✓                 │  │
│  │   📹 [Watch Puja Video]               │  │
│  │   📦 Prasad: Shipped · Arriving 5 Mar │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ⏳ Shani Shanti Puja                   │  │
│  │   Shani Temple, Ujjain · 8 Mar 2026  │  │
│  │   Status: Scheduled                   │  │
│  │   [View Details →]                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Weekly Stats:                              │
│  ┌───────────────────────────────────────┐  │
│  │ Mo Tu We Th Fr Sa Su                  │  │
│  │ ✅ ✅ ✅ ✅ ✅ ✅ ○   ← This week        │  │
│  │ ✅ ✅ ✅ ✅ ✅ ✅ ✅   ← Last week        │  │
│  │                                       │  │
│  │ 🏆 Karma Points: 340                  │  │
│  │ 🔥 Current Streak: 12 days            │  │
│  │ 📊 Completion Rate: 89%               │  │
│  └───────────────────────────────────────┘  │
│                                             │
├───────────┬───────────┬───────────┬─────────┤
│  🏠 Home  │ 📿 Remedies│ 🛕 Explore │ 👤 Me  │
└───────────┴───────────┴───────────┴─────────┘
```

### S12.2: Guided Mantra Player

Triggered by "Start Guided Mantra":

```
┌─────────────────────────────────────────────┐
│ ← Mangal Mantra                             │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│   [Animated mala/rosary visualization]      │
│   Each bead lights up as count progresses   │
│                                             │
│              ○ ○ ○ ○ ○ ○                    │
│            ○             ○                  │
│           ○    42/108     ○                 │
│            ○             ○                  │
│              ● ● ● ● ● ●                   │
│                                             │
│   "Om Kraam Kreem Kraum Sah                │
│    Bhaumaaya Namah"                         │
│                                             │
│   [Devanagari script below]                 │
│   "ॐ क्रां क्रीं क्रौं सः भौमाय नमः"            │
│                                             │
│   Mode:                                     │
│   ○ Listen & Repeat (audio plays, you       │
│     tap after each recitation)              │
│   ● Self-paced (tap to count each one)      │
│   ○ Timer (set time, count approximate)     │
│                                             │
│   Speed: [0.5x] [1x] [1.5x]                │
│                                             │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │           [  TAP  ]                 │   │
│   │         to count next               │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌────────┐  ┌────────────────────────┐    │
│   │ ⏸ Pause│  │ ✅ Complete (108 done)  │    │
│   └────────┘  └────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 14. S13: Order Tracking

Accessible from: Remedies tab → Puja card, or Me tab → Orders.

### S13.1: Order Detail

```
┌─────────────────────────────────────────────┐
│ ← Order PJ-2026-0847                       │
├─────────────────────────────────────────────┤
│                                             │
│  🛕 Mangal Shanti Puja                      │
│  Mangalnath Temple, Ujjain                  │
│  Booked: 20 Feb 2026                        │
│                                             │
│  Status Timeline:                           │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │  ● Booked                20 Feb       │  │
│  │  │                                    │  │
│  │  ● Confirmed by Temple   21 Feb       │  │
│  │  │                                    │  │
│  │  ● Puja Performed ✅     25 Feb       │  │
│  │  │                                    │  │
│  │  ● Video Delivered ✅     27 Feb       │  │
│  │  │  📹 [Watch Video]                  │  │
│  │  │                                    │  │
│  │  ◐ Prasad Shipped        28 Feb       │  │
│  │  │  📦 Tracking: DLVR2834XZ           │  │
│  │  │  [Track on Delhivery →]            │  │
│  │  │                                    │  │
│  │  ○ Prasad Delivered      Est 5 Mar    │  │
│  │  │                                    │  │
│  │  ○ Protocol Complete                  │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Puja Video:                                │
│  ┌───────────────────────────────────────┐  │
│  │ [Video player]                        │  │
│  │ ▶️ Mangal Shanti Puja — Mohit Chandak │  │
│  │ Duration: 4:23                        │  │
│  │                                       │  │
│  │ [📥 Download] [📤 Share on WhatsApp]   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  📄 Digital Certificate:                    │
│  ┌───────────────────────────────────────┐  │
│  │ Certificate of Puja Completion        │  │
│  │ Mangal Shanti Puja performed for      │  │
│  │ Mohit Chandak at Mangalnath Temple    │  │
│  │ on 25 Feb 2026                        │  │
│  │ [📥 Download Certificate]             │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 📞 Need help? WhatsApp support        │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 15. S14: Transit Alerts & Notifications

### S14.1: Notification Types

| Type | Trigger | Example |
|------|---------|---------|
| **Transit Alert** | Planet changes house in user's chart | "Rahu entering your 7th house on 15 Mar — protective remedy available" |
| **Festival Remedy** | Major festival + chart relevance | "Maha Shivaratri in 5 days — Rudrabhishek would be powerful for your Shani dosha" |
| **Remedy Reminder** | Daily task pending | "Aaj ka Mangal Mantra baaki hai — 108 baar padhein" |
| **Streak Alert** | About to break streak | "12 din ka streak tootne wala hai! Aaj ka mantra complete karein" |
| **Puja Update** | Order status change | "Aapki puja ka video tayyaar hai — abhi dekhein" |
| **Prasad Shipping** | Delivery update | "Aapka prasad kal deliver hoga" |
| **Check-in** | 2-4 weeks after puja | "Aapki Mangalnath puja ko 3 weeks ho gaye. Kaisa chal raha hai?" |
| **Dasha Change** | Major dasha transition approaching | "Rahu Antardasha 6 months mein khatam — prepare karein" |

### S14.2: Transit Alert Detail Screen

```
┌─────────────────────────────────────────────┐
│ ← Transit Alert                             │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Rahu Transit Alert                      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ [Animated kundli showing Rahu         │  │
│  │  moving from 6th to 7th house]        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  What's happening:                          │
│  Rahu is transiting into your 7th house     │
│  on 15 March 2026. This joins Mars and      │
│  Saturn already in your 7th house,          │
│  creating additional pressure on marriage   │
│  prospects.                                 │
│                                             │
│  Duration: 15 Mar 2026 — 28 Sep 2027       │
│  Impact: Medium-High                        │
│                                             │
│  Recommended protective remedies:           │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 1. 🛕 Rahu Shanti Puja               │  │
│  │    Kaal Bhairav Temple, Varanasi      │  │
│  │    ₹1,800                             │  │
│  │    Best before 15 Mar                 │  │
│  │    [Book Now →]                       │  │
│  │                                       │  │
│  │ 2. 📿 Rahu Mantra (add to daily)     │  │
│  │    "Om Bhram Bhreem Bhroum Sah       │  │
│  │     Rahave Namah"                     │  │
│  │    [➕ Add to Tracker]                │  │
│  │                                       │  │
│  │ 3. 🎁 Donate black sesame (til)      │  │
│  │    on Saturdays for 7 weeks           │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  💬 Ask AI more about this transit   │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 16. S15: Profile & Kundli Vault

### S15.1: Me Tab

```
┌─────────────────────────────────────────────┐
│ 👤 Me                               ⚙️      │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ [Avatar]  Mohit Chandak             │    │
│  │           +91 98XXX XXXXX           │    │
│  │           Member since Feb 2026     │    │
│  │                                     │    │
│  │  🏆 Karma: 340  🔥 Streak: 12 days  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📊 My Kundli                               │
│  ┌─────────────────────────────────────┐    │
│  │ [Mini kundli chart]                 │    │
│  │ DOB: 15 Mar 1995 · Lucknow         │    │
│  │ Current Dasha: Shani-Rahu           │    │
│  │                      [View Full →]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  👨‍👩‍👧‍👦 Family Kundli Vault                    │
│  ┌─────────────────────────────────────┐    │
│  │ You  ·  [+ Add Family Member]       │    │
│  │                                     │    │
│  │ "Store your family's kundlis and    │    │
│  │ get cross-analysis insights"        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📜 My Reports                              │
│  ┌─────────────────────────────────────┐    │
│  │ 💍 Marriage Delay — 20 Feb 2026     │    │
│  │ 💼 Career Guidance — 10 Feb (Free)  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📦 My Orders                               │
│  ┌─────────────────────────────────────┐    │
│  │ 🛕 Mangal Shanti Puja — Completed   │    │
│  │ 🛕 Shani Shanti Puja — Scheduled    │    │
│  │ 💎 Red Coral Ring — Delivered        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  🎁 Refer & Earn                            │
│  ┌─────────────────────────────────────┐    │
│  │ Share Upaya with friends.            │    │
│  │ They get free kundli analysis.       │    │
│  │ You get ₹50 store credit per         │    │
│  │ friend who buys a report.            │    │
│  │                     [Share Now →]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  💬 Help & Support (WhatsApp)               │
│  📋 About Upaya                              │
│  🔒 Privacy Policy                          │
│  ⚙️ Settings                                │
│                                             │
├───────────┬───────────┬───────────┬─────────┤
│  🏠 Home  │ 📿 Remedies│ 🛕 Explore │ 👤 Me  │
└───────────┴───────────┴───────────┴─────────┘
```

### S15.2: Full Kundli View

```
┌─────────────────────────────────────────────┐
│ ← My Kundli                     [📤 Share]  │
├─────────────────────────────────────────────┤
│                                             │
│  [Tabs: Chart | Planets | Dashas | Yogas]   │
│  ═════                                      │
│                                             │
│  [Full interactive Kundli chart]            │
│  ┌───────────────────────────────────────┐  │
│  │         (Full D1 chart with all       │  │
│  │          planets marked, houses       │  │
│  │          numbered, tappable)          │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Planetary Positions:                       │
│  ┌───────────────────────────────────────┐  │
│  │ Planet    │ Sign     │ House │ Status │  │
│  │───────────┼──────────┼───────┼────────│  │
│  │ ☀️ Sun     │ Pisces   │ 11    │ Neutral│  │
│  │ 🌙 Moon    │ Cancer   │ 4     │ Strong │  │
│  │ ♂️ Mars    │ Libra    │ 7     │ ⚠️ Weak│  │
│  │ ☿ Mercury │ Capricorn│ 10    │ Strong │  │
│  │ ♃ Jupiter │ Taurus   │ 2     │ Neutral│  │
│  │ ♀ Venus   │ Pisces   │ 12    │ Exalted│  │
│  │ ♄ Saturn  │ Libra    │ 7     │ ⚠️ Aff.│  │
│  │ ☊ Rahu    │ Aries    │ 1     │ ⚠️ Aff.│  │
│  │ ☋ Ketu    │ Libra    │ 7     │ ⚠️ Aff.│  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Tap any planet for detailed analysis       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 17. S16: Authentication (Progressive)

Login is NEVER forced upfront. It appears only when the user tries to:
- Purchase a report
- Book a puja
- Save a report
- Access remedy tracker

### S16.1: Login Bottom Sheet

```
┌─────────────────────────────────────────────┐
│                                             │
│  [Dimmed content behind]                    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ═══════════════════════════════════  │  │
│  │                                       │  │
│  │  🔐 Sign in to continue               │  │
│  │                                       │  │
│  │  "Your kundli and remedies will be    │  │
│  │  saved securely to your account"      │  │
│  │                                       │  │
│  │  📱 Phone Number                      │  │
│  │  ┌─────┬─────────────────────────┐    │  │
│  │  │ +91 │ Enter mobile number     │    │  │
│  │  └─────┴─────────────────────────┘    │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │      Send OTP →                 │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ─── or ───                           │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  🔵 Continue with Google        │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  By continuing, you agree to our      │  │
│  │  Terms of Service and Privacy Policy  │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### S16.2: OTP Verification

```
┌───────────────────────────────────────┐
│                                       │
│  Enter OTP                            │
│  Sent to +91 98XXX XXXXX             │
│                                       │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ 4 │ │ 7 │ │ 2 │ │ 8 │ │   │ │   ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                       │
│  Auto-reading OTP...                  │
│                                       │
│  Didn't receive? Resend in 28s        │
│                                       │
└───────────────────────────────────────┘
```

---

## 18. S17: Settings

```
┌─────────────────────────────────────────────┐
│ ← Settings                                  │
├─────────────────────────────────────────────┤
│                                             │
│  🌐 Language                                │
│  ┌─────────────────────────────────────┐    │
│  │ Hindi                        [✓]    │    │
│  │ English                      [ ]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  🔔 Notifications                           │
│  ┌─────────────────────────────────────┐    │
│  │ Remedy Reminders          [●━━━━]   │    │
│  │ Transit Alerts            [●━━━━]   │    │
│  │ Festival Remedies         [●━━━━]   │    │
│  │ Puja Updates              [●━━━━]   │    │
│  │ Promotional               [━━━━○]   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ⏰ Reminder Time                            │
│  ┌─────────────────────────────────────┐    │
│  │ Morning Mantra Reminder: 6:30 AM    │    │
│  │ Evening Reminder: 7:00 PM           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  🔒 Privacy                                 │
│  ┌─────────────────────────────────────┐    │
│  │ Delete My Data               [→]    │    │
│  │ Download My Data             [→]    │    │
│  │ Birth Data Encryption: ON    [✓]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📞 Support                                 │
│  ┌─────────────────────────────────────┐    │
│  │ WhatsApp Support             [→]    │    │
│  │ FAQs                         [→]    │    │
│  │ Report a Problem             [→]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  App Version: 1.0.0                         │
│  Logout                                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 19. Chat AI Logic & Conversation Trees

### 19.1: Conversation Flow Architecture (Updated — Compressed 2-Exchange Flow)

```
                    ┌──────────────┐
                    │  USER OPENS  │
                    │     APP      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   LANGUAGE   │
                    │  SELECTION   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  ONBOARDING  │
                    │  (3 screens, │
                    │   skippable) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PROBLEM     │
                    │  SELECTION   │
                    │  (Chip/Text) │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │  EXCHANGE 1:            │
              │  AI Empathy + 1         │
              │  Qualifying Question    │
              │  (Duration/Type)        │
              │  ~30 seconds            │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  EXCHANGE 2:            │
              │  Curiosity Bridge       │
              │  (IMMEDIATE — no more   │
              │  follow-ups before this)│
              │  + Birth Details CTA    │
              │  ~30 seconds            │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   BIRTH DETAILS FORM    │
              │   (In-chat widget)      │
              │   ~60-90 seconds        │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   KUNDLI ANIMATION      │
              │   (5-7 seconds)         │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   FREE DIAGNOSIS        │
              │   + FREE REMEDIES       │
              │   (Mantra, Fasting,     │
              │    Hanuman Chalisa)     │
              └──────┬────┬────┬────────┘
                     │    │    │
          ┌──────────▼┐ ┌▼────▼──────────┐
          │ PATH A:   │ │ PATH B:        │
          │ PAYS ₹199 │ │ ADDS FREE      │
          │           │ │ REMEDIES TO    │
          │Full Report│ │ TRACKER        │
          │Puja recs  │ │                │
          │Products   │ │ Daily habit    │
          │9-wk plan  │ │ formed →       │
          │           │ │ converts later │
          └───────────┘ └──────┬─────────┘
                               │
                    ┌──────────▼──────────┐
                    │ PATH C:             │
                    │ DEEPENING CHAT      │
                    │ (Post-diagnosis     │
                    │  emotional          │
                    │  conversation)      │
                    │                     │
                    │ AI: "Kya match      │
                    │ karta hai? Aur      │
                    │ batayein..."        │
                    │                     │
                    │ Explores related    │
                    │ problems, upsells   │
                    │ naturally           │
                    └─────────────────────┘

TOTAL TIME TO FIRST VALUE: ~2 minutes
(vs 4-6 minutes in old flow)
```

### 19.2: AI Personality & Tone Rules

| Rule | Detail |
|------|--------|
| **Empathy first** | Always acknowledge the problem before offering solutions. "Main samajh sakta hoon..." |
| **Never clinical** | Don't sound like a medical report. Sound like a wise, caring elder |
| **Bilingual naturally** | Mix Hindi-English (Hinglish) naturally based on user's language choice. If user types in Hindi, respond in Hindi. If English, respond in English with key terms in Hindi/Sanskrit |
| **No fear-mongering** | NEVER say "danger", "cursed", "terrible", "disaster". Use: "challenging period", "temporary blockage", "areas needing attention" |
| **Always hopeful** | Every diagnosis must end with positive framing: "Yeh solvable hai", "Remedies se effects kam honge", "Yeh phase temporary hai" |
| **Concise** | Keep messages under 4-5 lines. Users won't read long paragraphs in chat |
| **Ask one question at a time** | Never bombard with multiple questions. One question per message |
| **Use the user's own words** | If user says "shaadi nahi ho rahi", use that phrase back — not "marriage delay" |

### 19.3: Sample Conversation (Hindi — Marriage Delay) — COMPRESSED

```
USER taps: 💍 शादी में देरी

── EXCHANGE 1: Empathy + One Question ──

AI:  🙏 Shaadi mein deri — main samajh sakta hoon yeh
     kitna mushkil hai, aapke liye bhi aur family ke
     liye bhi.

     Mujhe thoda aur batayein — kab se yeh chal
     raha hai?

     [< 1 saal] [1-3 saal] [3+ saal]

USER: (taps "1-3 saal") OR types: "2 saal se rishte aa
      rahe hain but kuch final nahi ho raha"

── EXCHANGE 2: Curiosity Bridge (IMMEDIATE) ──

AI:  2 saal se rishte aake tootna — yeh ek specific
     pattern hai jo bahut cases mein dikhta hai.

     💡 Aksar yeh tab hota hai jab koi planetary
     combination directly 7th house (marriage house)
     ko affect kar raha ho. Yeh permanent nahi hota
     — sahi remedies se iske effects significantly
     kam hote hain.

     Main aapki exact kundli se confirm kar sakta
     hoon ki kaunsa graha yeh kar raha hai aur
     kya remedy sabse effective hogi.

     ┌──────────────────────────────────┐
     │ 📋 Apni Birth Details Dein →      │
     │ (2 minute mein kundli tayyaar)   │
     └──────────────────────────────────┘

USER fills birth details → Submit

AI:  Dhanyavaad! Aapki kundli generate kar raha hoon...

     [KUNDLI ANIMATION PLAYS - 10 seconds]

AI:  Aapki analysis tayyaar hai.

     [FREE DIAGNOSIS CARD — see S6]

AI:  Aapki kundli mein clear pattern dikh raha hai.
     Mangal aur Shani dono 7th house mein hain —
     yeh specific combination marriage mein significant
     delay karta hai.

     Lekin good news yeh hai ki yeh solvable hai.
     Targeted remedies se 60-70% tak impact kam
     ho sakta hai.

     Full remedy plan mein specific temples, mantras,
     timing, aur products sab hoga. Dekhna chahenge?

     [Haan, show karo ₹199] [Pehle kuch aur poochna hai]
```

### 19.4: Sample Conversation (English — Career) — COMPRESSED

```
USER taps: 💼 Career Stuck

── EXCHANGE 1: Empathy + One Question ──

AI:  I understand how frustrating career stagnation can
     be — especially when you know you're capable of
     more.

     How long have you been stuck in this situation?

     [< 1 year] [1-3 years] [3+ years]

USER: (taps "1-3 years") OR types: "Been in the same
      role for 3 years. Applied everywhere, nothing
      works out."

── EXCHANGE 2: Curiosity Bridge (IMMEDIATE) ──

AI:  3 years of effort with no movement — despite being
     qualified. That's a pattern I see very often.

     💡 When someone capable keeps hitting invisible
     walls, it usually means a specific planetary
     period is creating a temporary blockage in their
     10th house (career house).

     The good news: these periods ARE temporary, and
     targeted remedies can significantly reduce their
     intensity.

     Let me analyze your birth chart to identify exactly
     which planet is doing this and what remedy would
     be most effective for you.

     ┌──────────────────────────────────┐
     │ 📋 Enter Birth Details →          │
     │ (Chart ready in 2 minutes)       │
     └──────────────────────────────────┘

USER fills birth details → Submit

AI:  Thank you! Generating your chart now...

     [KUNDLI ANIMATION PLAYS - 6 seconds]

AI:  Your analysis is ready.

     [FREE DIAGNOSIS + FREE REMEDIES CARD — see S6]

── POST-DIAGNOSIS DEEPENING (after value delivered) ──

AI:  Looking at your chart, does this resonate with
     what you've been experiencing?

     [Yes, it matches] [There's more to it]

     (If "There's more to it" → AI explores related
     issues, other life areas affected, may recommend
     pandit consultation or additional analysis)
```

### 19.5: Edge Case Handling

| Scenario | AI Response |
|----------|-------------|
| **User mentions suicide/self-harm** | "Main samajh sakta hoon aap bahut mushkil daur se guzar rahe hain. Please ek important baat — AASRA helpline: 9820466726 (24/7). Professional help bahut zaroori hai. Main aapke saath hoon, lekin trained counselors aur zyada madad kar sakte hain." → Pause remedy flow, show helpline prominently |
| **User asks about health condition** | "Main spiritual guidance de sakta hoon, lekin health issues ke liye please qualified doctor se zaroor milein. Astrology remedies medical treatment ki jagah nahi le sakte." |
| **User angry about "it didn't work"** | "Main samajhta hoon aapki frustration. Remedies planetary influences ko reduce karte hain — har insaan ka experience alag hota hai. Kya hum aapke protocol ko review karein aur adjust karein?" → Offer pandit consultation |
| **User asks for lottery/gambling predictions** | "Main specific predictions jaise lottery numbers nahi de sakta. Astrology life ke patterns aur tendencies dikhata hai, specific events nahi. Kya main aapki financial situation ke liye remedies suggest karun?" |
| **User enters gibberish** | "Main aapki baat samajh nahi paaya. Kya aap dobara bata sakte hain — aapko kis cheez ki chinta hai?" |
| **User asks about death prediction** | "Astrology mein ayu ka analysis hota hai, lekin specific death predictions dena appropriate nahi hai aur accurate bhi nahi hota. Main aapke health aur longevity ke positive aspects bata sakta hoon." |

---

## 20. Notification Strategy

### 20.1: Push Notification Schedule

| Time | Notification | Purpose |
|------|-------------|---------|
| 6:30 AM | "Subah ka mantra time — aaj ka [mantra name] 108 baar padhein 🙏" | Daily remedy reminder |
| 7:00 PM | "Aaj ka mantra complete hua? Streak mat tootne dein! 🔥" | Streak protection |
| (Event-based) | "Aapki puja ka video aa gaya — abhi dekhein 📹" | Order update |
| (Weekly) | "Aapka weekly progress: 89% complete. Bahut achha! 📊" | Engagement |
| (Transit-based) | "Important: [Planet] transit alert for your chart ⚠️" | Re-engagement + upsell |
| (Festival) | "[Festival] in 3 days — special puja for your chart 🛕" | Re-engagement + revenue |

### 20.2: WhatsApp Integration Points

| Touch Point | What Gets Sent |
|-------------|----------------|
| After diagnosis | Shareable card with ACTUAL MANTRA: "Meri kundli mein [dosha] mila. Yeh mantra suggest hua: [mantra text]. Apni kundli bhi free mein check karo: [link]" |
| After report purchase | PDF report via WhatsApp |
| After puja booking | Booking confirmation |
| Puja video ready | Video file + completion certificate |
| Prasad shipped | Tracking link |
| Transit alert | Alert with remedy CTA |
| Mantra audio | Audio file for daily practice |

---

## 21. Screen State Matrix

### 21.1: User States & What They See

| State | Home Tab | Remedies Tab | Explore Tab | Me Tab |
|-------|----------|-------------|-------------|--------|
| **New (no chat)** | Problem chips + illustration | "Start your first analysis to see remedies here" | Full browse (temples, pujas, products) | Basic profile setup prompt |
| **Chatted (no report)** | Chat history + "Continue" | "Get your remedy plan to start tracking" | Full browse | Kundli visible (if birth details given) |
| **Report purchased** | Chat + report card + "New problem" | Remedy plan (if added to tracker) | Personalized recommendations | Kundli + reports + orders |
| **Puja booked** | Chat + active order card | Puja status + daily remedies | Personalized recommendations | Orders list |
| **Active protocol** | Progress card + alerts + chat | Full tracker dashboard | AI-recommended products | Full profile + history |
| **Returning (protocol done)** | Transit alerts + "New problem" + history | Completed protocol stats | Personalized recommendations | Full history vault |

### 21.2: Empty States

Every screen must have a meaningful empty state with clear CTA:

| Screen | Empty State |
|--------|------------|
| Remedies tab (no protocol) | Illustration + "Your remedy tracker will appear here after your first analysis. Start by telling me what's worrying you." → CTA: "Start Chat →" |
| Orders (no orders) | "No orders yet. When you book a puja or buy a product, track it here." |
| Family vault (no family) | "Add your family members' birth details for cross-analysis and family-level remedies." → CTA: "+ Add Family Member" |
| Reports (no reports) | "Your purchased reports will be saved here for future reference." |

---

## 22. Design System Summary

### 22.1: Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Saffron | #FF8C00 | CTAs, highlights, active states |
| Deep Maroon | #4A0E0E | Headers, premium sections |
| Warm Cream | #FFF8F0 | AI message bubbles, card backgrounds |
| User Bubble | #FFF3E0 | User message bubbles |
| Gold Accent | #D4A017 | Premium features, achievements, badges |
| Alert Red | #D32F2F | Severity high, problem planets |
| Success Green | #2E7D32 | Completed, streaks, positive |
| Text Primary | #1A1A1A | Main body text |
| Text Secondary | #666666 | Timestamps, labels, hints |
| Background | #FAFAFA | App background |
| Card White | #FFFFFF | Cards, sheets |

### 22.2: Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | Noto Sans / Noto Sans Devanagari | 24px | Bold | Screen titles |
| H2 | Noto Sans / Noto Sans Devanagari | 20px | SemiBold | Section headers |
| H3 | Noto Sans / Noto Sans Devanagari | 16px | SemiBold | Card titles |
| Body | Noto Sans / Noto Sans Devanagari | 14px | Regular | Chat messages, body text |
| Caption | Noto Sans / Noto Sans Devanagari | 12px | Regular | Timestamps, labels |
| Button | Noto Sans / Noto Sans Devanagari | 16px | SemiBold | CTAs |

**Why Noto Sans:** Supports both Latin and Devanagari natively. Free. Consistent rendering across Android devices.

### 22.3: Key UI Patterns

| Pattern | Implementation |
|---------|---------------|
| **Cards** | 12px border radius, 1px border #E0E0E0, subtle shadow (0 2px 8px rgba(0,0,0,0.08)) |
| **Buttons (Primary)** | Full-width, 48px height, 12px radius, saffron gradient, white text |
| **Buttons (Secondary)** | Full-width, 48px height, 12px radius, white bg, saffron border + text |
| **Chips** | 8px radius, 36px height, cream bg, dark text, emoji prefix |
| **Bottom sheets** | Drag handle, 16px top radius, dimmed backdrop |
| **Loading states** | Skeleton screens (not spinners) for content. Animated dots for chat typing indicator |
| **Transitions** | Shared element transitions between screens. Slide-up for bottom sheets. Fade for tab switches |
| **Haptics** | Light tap feedback on chips, medium on buttons, success on completion |

---

## 23. Technical MVP Scope Summary

### What to build for launch:

| Must Have (V1.0) | Nice to Have (V1.1) | Later (V2.0) |
|-------------------|---------------------|---------------|
| Language selection | Voice input in chat | Family kundli vault |
| AI chat with emotional intake | Guided mantra player with counter | Group remedy events |
| Birth details in-chat form | Mantra audio files | Subscription plans |
| Kundli generation + animation | Product reviews/ratings | Muhurta planner |
| Free diagnosis card | Push notifications | Astrologer protocol marketplace |
| Blur paywall + payment | Transit alerts engine | Multi-language (Tamil/Telugu) |
| Full paid report | Streak gamification | Offline kiosk mode |
| Puja booking flow (3-step) | Share/referral cards | NRI pricing tier |
| Puja order tracking | Daan/seva booking | Temple CMS |
| Basic remedy tracker (checklist) | PDF report download | Live streaming |
| Pandit listing + chat | Post-session AI summary | |
| Siddha Store (10-15 SKUs) | Family member add | |
| Profile + saved kundli | WhatsApp delivery of videos | |
| Phone OTP login | | |
| Settings (language, notifications) | | |

### Screen Count (V1.0): ~22 unique screens
### Estimated Dev Time: 6-8 weeks with 2 engineers + AI tools

---

*This document serves as the complete UI/UX specification for Upaya MVP. All screens are designed mobile-first for Android with responsive web as secondary target. Every interaction prioritizes emotional warmth, progressive trust-building, and natural conversational flow.*
