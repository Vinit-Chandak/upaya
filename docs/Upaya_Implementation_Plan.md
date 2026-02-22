# Upaya — Phased Implementation Plan

### Document Version: 1.0 | February 2026
### Path: Bootstrap (Founder + 1 Engineer, ₹7-10L for 6 months)
### Platform: Android + iOS (React Native) primary, Web (Next.js) secondary
### Tech Stack: React Native + Next.js + Node.js (Express) + PostgreSQL + Swiss Ephemeris + Firebase Auth + Razorpay + LLM (Claude/OpenAI/Gemini)

---

## Table of Contents

1. [Phase 0: Foundation & Pre-Development (Weeks 1-2)](#phase-0-foundation--pre-development-weeks-1-2)
2. [Phase 1: Core MVP — Chat to Paid Report (Weeks 3-8)](#phase-1-core-mvp--chat-to-paid-report-weeks-3-8)
3. [Phase 2: Puja Booking & Fulfillment (Weeks 9-14)](#phase-2-puja-booking--fulfillment-weeks-9-14)
4. [Phase 3: Retention Engine — Tracker, Alerts, Pandit (Months 4-5)](#phase-3-retention-engine--tracker-alerts-pandit-months-4-5)
5. [Phase 4: Commerce & Monetization Expansion (Months 5-7)](#phase-4-commerce--monetization-expansion-months-5-7)
6. [Phase 5: Growth & Scale Features (Months 7-10)](#phase-5-growth--scale-features-months-7-10)
7. [Phase 6: Series A Readiness (Months 10-14)](#phase-6-series-a-readiness-months-10-14)
8. [Technical Architecture](#technical-architecture)
9. [Monthly Cost Projections](#monthly-cost-projections)
10. [Risk Mitigation Checklist](#risk-mitigation-checklist)

---

## Phase 0: Foundation & Pre-Development (Weeks 1-2)

**Goal:** Set up project infrastructure, finalize architecture decisions, begin temple scouting in parallel with dev setup.

**Team:** Founder + 1 Engineer (both working simultaneously — founder on business/temple side, engineer on tech setup)

### 0.1 Technical Foundation

| Task | Owner | Details |
|------|-------|---------|
| Initialize monorepo | Engineer | Set up Turborepo/Nx monorepo with: `apps/mobile` (React Native), `apps/web` (Next.js), `packages/api` (Node.js Express), `packages/shared` (types, utils) |
| React Native project | Engineer | Init with Expo (managed workflow for faster dev). Configure for Android + iOS. Set up Noto Sans + Noto Sans Devanagari fonts |
| Next.js web app | Engineer | Init Next.js 14+ with App Router. This serves as secondary web target and admin dashboard host |
| Node.js API server | Engineer | Express + TypeScript. Set up project structure: routes, controllers, services, middleware |
| PostgreSQL setup | Engineer | Provision PostgreSQL (Supabase hosted or Railway for cost efficiency). Design initial schema (users, kundlis, chats, reports, orders) |
| Firebase Auth | Engineer | Configure Firebase project. Enable Phone OTP + Google Sign-In. Integrate with React Native and API server |
| Razorpay sandbox | Engineer | Create Razorpay test account. Integrate SDK in React Native. Set up webhook endpoint in API |
| CI/CD pipeline | Engineer | GitHub Actions: lint, test, build for both mobile and API. EAS Build for React Native (Expo Application Services) |
| LLM abstraction layer | Engineer | Build provider-agnostic LLM service that supports Anthropic Claude, OpenAI GPT, and Google Gemini. Config-driven provider switching |
| Swiss Ephemeris integration | Engineer | Compile Swiss Ephemeris C library with Node.js bindings (node-addon-api or swisseph npm package). Validate accuracy against known kundli charts |

### 0.2 Design & Content

| Task | Owner | Details |
|------|-------|---------|
| Design system setup | Founder/Designer | Define color palette (Primary Saffron #FF8C00, Deep Maroon #4A0E0E, Warm Cream #FFF8F0, Gold #D4A017, etc.), typography (Noto Sans family), spacing, component library in Figma |
| Splash screen + logo | Founder | Upaya logo, animated Om/Lotus symbol, gradient background (deep saffron #FF6B00 → dark maroon #4A0E0E) |
| Onboarding illustrations | Founder | Commission 3 warm watercolor-style illustrations for onboarding screens (emotional hook, process, social proof) |
| Hindi + English copy | Founder | Write all UI strings in both Hindi (primary) and English (secondary). Prioritize: onboarding, chat prompts, problem chips, diagnosis templates, error messages |
| AI prompt engineering | Founder | Draft system prompts for: emotional intake chat, curiosity bridge generation, diagnosis output formatting, remedy recommendation. Test across all 8 problem types |

### 0.3 Temple Scouting (Founder — parallel with dev)

| Task | Details | Target |
|------|---------|--------|
| Research from home | Google Maps + YouTube + JustDial. Identify 30 temples across Ujjain, Varanasi, Haridwar. Focus on dosha-specific temples (Shani, Mangal, Rahu-Ketu, Navagraha) | 30 temples identified |
| Cold calls | Call 20 temples/pujaris. Use Hindi script: "Main ek app bana raha hoon jisse door-door ke bhakt online puja book kar sakein..." | 8-10 "come visit" responses |
| Prepare demo | Build quick prototype showing: AI chat → kundli → diagnosis → "recommends puja at YOUR temple, pujari ji" on phone | Working demo on phone |

### 0.4 Business Setup

| Task | Details |
|------|---------|
| Company registration | Register LLP or Private Limited (₹10-15K via Vakilsearch/Cleartax) |
| Privacy policy + Terms | Draft privacy policy (birth data handling, DPDP Act compliance), terms of service, refund policy |
| Razorpay live account | KYC, bank account linkage, go live for payments |
| Domain + hosting | Register upaya.app or similar. Set up Vercel (Next.js), Railway/Render (API), Supabase (PostgreSQL) |
| Analytics setup | Integrate Mixpanel or Amplitude for event tracking. PostHog as self-hosted alternative |

### 0.5 Phase 0 Deliverables

- [ ] Monorepo with all apps scaffolded and building
- [ ] PostgreSQL schema v1 deployed
- [ ] Firebase Auth working (Phone OTP + Google)
- [ ] Swiss Ephemeris generating accurate kundli data via API
- [ ] LLM abstraction returning structured diagnosis from test prompts
- [ ] Razorpay sandbox processing test payments
- [ ] 30 temples researched, 8-10 phone conversations done
- [ ] All UI copy written in Hindi + English
- [ ] Design system + key screen mockups ready

---

## Phase 1: Core MVP — Chat to Paid Report (Weeks 3-8)

**Goal:** Ship the core user journey: open app → AI chat → kundli generation → free diagnosis + free remedies → paid report unlock. This is the minimum viable product that generates revenue from Day 1.

**Revenue target:** First 200+ reports sold (₹199 each = ₹40K+ revenue)

**Screens to build:** ~10 screens (Splash, Language, Onboarding x3, Home/Chat, Birth Details, Kundli Animation, Free Diagnosis, Paywall, Full Report)

### 1.1 Splash & Language Selection (S1)

| Task | Details | Priority |
|------|---------|----------|
| Splash screen | Animated Upaya logo (scale up + fade in), golden particle effect, gradient background (saffron → maroon). Auto-transition after 1.5s. If returning user: skip language, go to Home | Must have |
| Language selection | Two options: Hindi (primary), English (secondary). Tamil/Telugu shown as "Coming Soon" (greyed out). Store selection locally. Each option shows language in own script + other language below | Must have |
| Returning user detection | Check local storage for `language_selected` and `onboarding_completed` flags. Skip accordingly | Must have |
| Haptic feedback | Gentle vibration on language selection tap | Nice to have |

### 1.2 Value Onboarding (S1.3) — 3 Swipeable Screens

| Task | Details | Priority |
|------|---------|----------|
| Screen 1: Emotional hook | Testimonial card (Priya, 28, Lucknow — marriage delay story). Warm illustration of worried → hopeful transformation. Cream background card with golden left border | Must have |
| Screen 2: How it works | 4-step vertical journey: Tell problem → AI kundli analysis → Personalized remedy → Temple puja + video proof. Connected by dotted line. Staggered 200ms fade-in animation | Must have |
| Screen 3: Social proof + CTA | 6 trust badges in 3x2 grid (Kundlis analyzed, Temples verified, Video proof, Prasad delivered, 100% Private, Pandit verified). Mini testimonial. Golden "Shuru Karein" CTA button | Must have |
| Skip link | Top-right on all screens. Skips directly to Home/Chat | Must have |
| Dot indicators | Bottom-center. Active = saffron filled, Inactive = grey outline | Must have |
| Swipe gestures | Horizontal page swipe between screens. Velocity-sensitive | Must have |
| Persistence | Store `onboarding_completed = true` locally. Never show again | Must have |
| Analytics events | Track: `screen_viewed`, `screen_skipped`, `skip_tapped`, `get_started_tapped`, `time_per_screen` | Must have |
| Bilingual content | All text in selected language (Hindi or English). Stories must feel native, not translated | Must have |

### 1.3 Home / Chat Entry (S2)

| Task | Details | Priority |
|------|---------|----------|
| First-time user view | Warm illustration (changes by time of day: morning sunrise, evening diya, night moon). Main prompt: "आज आपको क्या परेशान कर रहा है?" Bilingual. Problem chips below | Must have |
| Problem chips | 8 chips in horizontally scrollable rows of 3: Marriage Delay, Career Stuck, Money Problems, Health Issues, Legal Matters, Family Conflict, Get My Kundli, Something Else. Each with emoji + Hindi primary + English secondary | Must have |
| "Get My Kundli" chip | Different styling (golden border). Skips emotional intake, goes directly to birth details | Must have |
| Text input bar | Bottom-pinned. Placeholder: "अपनी बात यहाँ लिखें..." Send button appears when text entered | Must have |
| Voice input | Tap mic → recording overlay → speech-to-text (Google Speech API / Whisper) → fills text box → user confirms and sends | V1.1 |
| Returning user view | Welcome back message with name. Active remedy plan progress card (if exists). Transit alert card (if pending). Recent chat sessions list. "Continue last chat" / "New Problem" buttons | Must have |
| Bottom tab bar | 4 tabs: Home (Chat), Remedies (Tracker), Explore (Store/Temples), Me (Profile). Home active by default. Tab bar persists on all primary screens | Must have |
| Global top bar | Left: Back arrow or Upaya logo. Center: contextual title. Right: notification bell + language switcher | Must have |

### 1.4 AI Emotional Intake Chat (S3) — Compressed 2-Exchange Flow

| Task | Details | Priority |
|------|---------|----------|
| Chat UI layout | AI messages: left-aligned, cream bubble (#FFF8F0), 80% max-width. User messages: right-aligned, saffron tint (#FFF3E0), 75% max-width. 16px rounded corners | Must have |
| AI avatar | Small circular (32px) warm, wise face next to first message in group. Not robotic — kind elder aesthetic | Must have |
| Exchange 1: Empathy + 1 question | AI acknowledges problem empathetically + asks ONE qualifying question. Duration chips offered inline: "< 1 saal" / "1-3 saal" / "3+ saal". User can tap chip OR type freely | Must have |
| Qualifying question variants | Different question per problem type (8 variants). Marriage → duration. Career → duration. Money → sudden/gradual. Health → duration. Legal → type. Family → duration. Kundli → skip to birth details. Something Else → free text | Must have |
| Exchange 2: Curiosity bridge | AI responds IMMEDIATELY with partial insight mirroring user's words + birth details CTA button. No additional follow-ups. 6 variants (one per problem type) referencing specific Vedic house logic | Must have |
| Typing indicator | Three animated dots in AI bubble style. Show for 0.8-1.2 seconds before AI response | Must have |
| Quick reply chips | Appear inline within AI bubble. Tappable. Disappear after selection, replaced by user's choice as sent message | Must have |
| Timestamps | Small, grey, below message groups. Grouped by minute | Must have |
| Read receipts | Single tick (sent), double tick (delivered). No blue ticks | Nice to have |
| Auto-scroll | Scroll to bottom on new message. Pull down for older messages | Must have |
| Top bar context | Problem category chip with emoji (e.g., "💍 Marriage Delay"). Back arrow. Overflow menu with: Share chat, Save, Clear history | Must have |
| Chat persistence | Save all chat messages to PostgreSQL. Associate with anonymous session ID (pre-login) or user ID (post-login) | Must have |

### 1.5 Birth Details Capture — In-Chat Widget (S4)

| Task | Details | Priority |
|------|---------|----------|
| In-chat form card | Rendered as special message card within chat. Fields: Date of Birth, Time of Birth, Place of Birth | Must have |
| Date picker | Native date picker. DD/MM/YYYY format. Scrollable year picker going back to 1940 | Must have |
| Time picker | Scrollable hours/minutes with AM/PM. Checkbox: "Exact time nahi pata?" → switches to approximate time dropdown | Must have |
| Approximate time fallback | 5 options: Subah (6AM-12PM), Dopahar (12PM-4PM), Shaam (4PM-8PM), Raat (8PM-6AM), Bilkul nahi pata | Must have |
| Place autocomplete | Google Places API integration. Supports Hindi + English input. Shows city + state + country. Popular cities as default suggestions: Delhi, Mumbai, Lucknow, Jaipur, Varanasi, Kolkata, Chennai, Hyderabad, Patna, Bhopal | Must have |
| Generate button | Full-width, golden-orange (#FF8C00). Disabled until DOB + Place filled. Time optional | Must have |
| Validation | DOB required, Place required. Time optional with clear messaging about accuracy difference | Must have |

### 1.6 Kundli Generation Animation (S5) — 8-12 Seconds

| Task | Details | Priority |
|------|---------|----------|
| Phase 1 (0-3s): Kundli generation | "Generating your Kundli..." Animated kundli wheel draws itself with golden lines. Shows user's birth details. Dark cosmic background (deep navy/purple with star particles) | Must have |
| Phase 2 (3-6s): Planet scanning | "Scanning Planets..." Each planet name fades in one by one with house position. Problem planets pulse in red/orange | Must have |
| Phase 3 (6-9s): Dosha detection | "Analyzing Doshas..." Checklist animation: Mangal Dosha, Shani Dosha, Rahu-Ketu Dosha, Kaal Sarp Yog, Pitra Dosha, Dasha periods, Severity. Each shows spinner → checkmark | Must have |
| Phase 4 (9-12s): Result ready | "Analysis Complete" with "Aapki kundli analysis tayyaar hai". Button: "View Your Diagnosis" | Must have |
| Progress ring | Circular progress around kundli chart fills as phases complete | Nice to have |
| Sound | Optional subtle chime/bell on completion (respects system mute) | Nice to have |
| Backend: Kundli calculation | Swiss Ephemeris: compute all 9 planetary positions (Sun through Ketu), 12 house cusps, Lahiri Ayanamsa. Calculate Vimshottari Dasha periods. Detect doshas (Mangal, Shani, Kaal Sarp, Pitra, Rahu-Ketu) via rule engine | Must have |
| Backend: LLM diagnosis | Send kundli data + user problem + emotional context to LLM. Receive structured JSON: root dosha, severity, impacted areas, dasha analysis. Rule engine validates output against classical Vedic texts | Must have |

### 1.7 Free Diagnosis Result (S6) — Empowerment-Based Design

| Task | Details | Priority |
|------|---------|----------|
| Part 1: Diagnosis card (visible) | Root cause identified (planets + house). Current dasha period with end date. Impacted areas (primary + secondary). Dosha assessment: Level (Significant/Moderate/Mild), "Commonly addressed? YES", "Responsive to remedies? Highly responsive". Positive framing message | Must have |
| Part 2: FREE remedies (visible) | 2-3 actionable free remedies user can start today. Each remedy card with: name, mantra text (Roman + Devanagari), frequency, duration. "Listen to Pronunciation" audio button. "Add to Remedy Tracker" button | Must have |
| Part 3: Complete plan upsell (locked) | Light grey section. 6 locked items with descriptions (detailed dosha analysis, timeline, temple recommendations, muhurta timing, product recommendations, 9-week protocol). Social proof: "X users with similar charts unlocked". Golden "Unlock Complete Plan ₹199 (₹499)" button | Must have |
| AI follow-up message | Three clear CTA paths: "Add free remedies to tracker" (retention), "Unlock complete plan ₹199" (revenue), "Kuch aur poochna hai" (engagement) | Must have |
| Share card | Pre-filled: dosha name + actual mantra text + referral link. Optimized for WhatsApp. Referral code included | Must have |
| Design: No severity score | NO numerical severity bar. NO red scary indicators. Text-based: "Significant" / "Moderate" / "Mild" with green checkmarks | Must have |
| Design: No fake urgency | No "limited period", no countdown timer, no scarcity text. Value proposition is strong enough | Must have |
| Mantra audio files | Pre-recorded audio for each common mantra (Mangal, Shani, Rahu, Hanuman Chalisa). Files < 1MB each. Inline mini-player | V1.1 |

### 1.8 Paywall / Report Purchase (S7)

| Task | Details | Priority |
|------|---------|----------|
| Payment bottom sheet | Triggered on "Unlock Full Remedy Plan" tap. Dimmed chat behind. Drag handle. List of what's included (7 items with checkmarks). Price: ₹199 (struck-through ₹499, 60% OFF) | Must have |
| Progressive auth trigger | Login required before payment. Phone OTP + Google Sign-In bottom sheet (see S16). After auth, return to payment flow | Must have |
| Login bottom sheet (S16) | "Sign in to continue" — Phone number with +91 prefix → Send OTP. OR "Continue with Google". OTP verification: 6-digit input, auto-read, resend timer (30s) | Must have |
| Payment methods | UPI (primary), Google Pay, Card, Net Banking. Razorpay checkout integration | Must have |
| Payment success | Checkmark animation. "Payment Successful! ₹199 paid. Generating your complete remedy plan..." Progress spinner. Auto-transition to full report in 2-3s | Must have |
| Payment failure | Retry option. "Payment nahi hua? Dobara try karein." Support WhatsApp link | Must have |
| Receipt | Digital receipt via email/WhatsApp. Razorpay handles this | Must have |

### 1.9 Full Paid Remedy Report (S8)

| Task | Details | Priority |
|------|---------|----------|
| Report delivery in chat | AI message + rich scrollable card within chat. "Aapka complete remedy plan tayyaar hai" | Must have |
| Full report screen | Opens as full-screen scrollable page. Section tabs (horizontally scrollable): Analysis, Remedies, Temples, Timeline | Must have |
| Section 1: Dosha analysis | Interactive kundli chart (tap house for details). Primary dosha card (severity X/10, impact, Vedic reference). Secondary dosha card. Current dasha analysis with end date and what comes next | Must have |
| Section 2: Remedy plan | FREE remedies (green border): mantras with audio + Devanagari, fasting, daan, daily practices. RECOMMENDED PUJAS (yellow border): specific temple + date + price + "Book This Puja" CTA. RECOMMENDED PRODUCTS (blue border): gemstones, kavach, yantra + "View in Siddha Store" CTA | Must have |
| Section 3: Timeline | 9-week protocol: Week 1-3 Foundation, Week 4-6 Intensification, Week 7-9 Consolidation. Post-protocol check-in promise | Must have |
| Disclaimer | "Remedies work by reducing the intensity of negative planetary influences... Results vary by individual. This is not a guarantee of specific outcomes." Always visible, non-dismissable | Must have |
| Actions | "Start My 9-Week Protocol" (add all to tracker). Download PDF. Share with Family. "Ask AI about this report" | Must have |
| PDF generation | Branded PDF with kundli chart, all remedies, temple info, timing. Downloadable + shareable via WhatsApp | Must have |
| Report persistence | Save to user profile. Accessible from Me tab → My Reports | Must have |
| Share card | "Meri kundli mein [dosha] mila — aapki kundli bhi free mein check karein!" + Upaya link + referral code | Must have |

### 1.10 Backend Services for Phase 1

| Service | Details |
|---------|---------|
| **Auth service** | Firebase Auth integration. Phone OTP + Google Sign-In. JWT token generation. Anonymous → authenticated session migration (preserve chat/kundli data) |
| **Chat service** | Store chat sessions + messages. Associate with problem type. Support anonymous users. Real-time message delivery (WebSocket or polling) |
| **Kundli service** | Swiss Ephemeris wrapper. Input: DOB, TOB, POB (lat/long from Google Places). Output: planetary positions, house cusps, dasha periods, dosha detection. Cache results per birth details |
| **Diagnosis service** | LLM orchestration. Build prompt from: kundli data + problem type + user's emotional context + qualifying answer. Parse structured JSON response. Rule engine validation. Store diagnosis |
| **Report service** | Generate full remedy plan from diagnosis. Template-based: free remedies + paid remedies (temple-specific pujas, products, timing). PDF generation (Puppeteer or react-pdf) |
| **Payment service** | Razorpay integration. Order creation, payment verification via webhook, receipt generation. Link payment to user + report |
| **Referral service** | Generate unique referral codes. Track shares, installs, conversions. Credit ₹50 store credit per referral conversion |

### 1.11 Database Schema (Phase 1 Core Tables)

```
users (id, phone, email, name, language, firebase_uid, created_at)
kundlis (id, user_id, dob, tob, pob_name, pob_lat, pob_lng, planetary_data, dasha_data, dosha_data, created_at)
chat_sessions (id, user_id, session_id, problem_type, language, status, created_at)
chat_messages (id, session_id, role, content, message_type, metadata, created_at)
diagnoses (id, kundli_id, chat_session_id, root_dosha, severity, impacted_areas, dasha_analysis, free_remedies, full_remedies, llm_provider, created_at)
reports (id, user_id, diagnosis_id, type, status, pdf_url, created_at)
payments (id, user_id, report_id, razorpay_order_id, razorpay_payment_id, amount, status, created_at)
referrals (id, referrer_user_id, code, referred_user_id, conversion_status, credit_applied, created_at)
```

### 1.12 Phase 1 Deliverables

- [ ] Complete flow: Splash → Language → Onboarding → Home → Chat → Birth Details → Kundli Animation → Free Diagnosis → Paywall → Full Report
- [ ] AI chat working in Hindi + English with empathetic tone, 2-exchange compressed flow
- [ ] Kundli generation accurate (validated against 10+ known charts)
- [ ] Free diagnosis with 2-3 actionable remedies visible
- [ ] Payment flow working (Razorpay live)
- [ ] Progressive auth (login only at payment)
- [ ] PDF report generation + download
- [ ] Share card with referral code
- [ ] Android + iOS builds via Expo EAS
- [ ] Basic analytics tracking (screen views, funnel events, chat engagement)
- [ ] First 200+ reports sold

### 1.13 Phase 1 Milestones (Founder — Parallel)

| Task | Details | Target |
|------|---------|--------|
| Temple visits: Ujjain | 3-4 days. Visit 8-10 temples. Pitch 5-6 with working demo on phone | 3-4 verbal agreements |
| Temple visits: Varanasi | 3-4 days. Same approach | 3-4 more agreements |
| Temple visits: Haridwar | 2-3 days + follow-up calls | 2-3 more + 5 formal partnerships |
| Formalize partnerships | Revenue split: temple 65-70%, Upaya 30-35%. Video via WhatsApp, prasad packing by temple, shipping via Shiprocket/Delhivery | 8-12 temple partnerships |
| Pandit recruitment | Identify 10-15 pandits via astrology forums, LinkedIn, local referrals. Background verify, sample consultation review | 10-15 verified pandits |
| Content marketing | Start SEO blog: "free kundli", "marriage delay remedy", "Shani dosha solution". Hindi + English | 10+ articles published |
| Soft launch | Product Hunt, Reddit r/india, WhatsApp groups, Instagram astrology accounts | First 1,000 users |

---

## Phase 2: Puja Booking & Fulfillment (Weeks 9-14)

**Goal:** Enable the full puja booking loop — from AI-recommended temple puja to booking, payment, video delivery, prasad shipping, and order tracking. Also build the lightweight Temple CMS for partner temples.

**Revenue target:** ₹1-3L MRR from reports + puja bookings combined. 100+ pujas booked.

**Screens to build:** ~6 screens (Puja Detail, Booking Form 3-step, Booking Confirmation, Order Tracking, Temple CMS admin)

### 2.1 Puja Booking Flow (S9)

| Task | Details | Priority |
|------|---------|----------|
| Puja detail screen | Temple hero image. Puja name + temple name + rating + pujas completed count. "Why this temple?" box (AI-generated reason from diagnosis). What's included (6 items: full vidhi, sankalp, HD video, photos, prasad, certificate). Past puja video thumbnails. Delivery timelines. "Book Puja — ₹X" CTA | Must have |
| Step 1: Sankalp details | Full name (pre-filled from profile), Father's name, Gotra (select or type, "Don't know" option), Sankalp/Wish (pre-filled from chat context, editable) | Must have |
| Step 2: Date selection | AI-recommended date highlighted with astrological reasoning (e.g., "Mangal Hora, Hasta Nakshatra"). 3-4 alternate dates with muhurta quality rating (Good/Average). Note about why this day of week is optimal | Must have |
| Step 3: Review & Pay | Order summary: puja + temple + date + name + gotra + sankalp. Price breakdown (puja fee + prasad delivery free). Delivery address (saved or add new). Razorpay payment. "Secured by Razorpay" + "WhatsApp support" badges | Must have |
| Booking confirmation | Checkmark animation. Order ID. "What happens next" timeline: Puja date → Video delivery (3-5 days) → Prasad delivery (7-10 days). CTAs: Continue with other remedies, View Order, Back to Home | Must have |
| Auth gate | If user not logged in, trigger login bottom sheet before booking (same as report purchase) | Must have |
| Pre-fill from report | When user taps "Book This Puja" from report, pre-fill: temple, puja type, recommended date, sankalp from chat. Reduce friction to minimum | Must have |

### 2.2 Order Tracking (S13)

| Task | Details | Priority |
|------|---------|----------|
| Order detail screen | Status timeline with 7 stages: Booked → Confirmed by Temple → Puja Performed → Video Delivered → Prasad Shipped → Prasad Delivered → Protocol Complete. Each stage with date + status icon (filled/half/empty) | Must have |
| Puja video player | Embedded video player. Download button. "Share on WhatsApp" button | Must have |
| Digital certificate | "Certificate of Puja Completion" — puja name, user name, temple, date. Downloadable PDF | Must have |
| Prasad tracking | Shipping tracking number. Link to Delhivery/Shiprocket tracking page. Estimated delivery date | Must have |
| Order history | List view in Me tab → My Orders. Filter by status: Active, Completed, All | Must have |
| WhatsApp notifications | Send via WhatsApp Business API: booking confirmation, puja video ready, prasad shipped, prasad delivered | Must have |
| Push notifications | Puja confirmed, video ready, prasad shipped, prasad delivered, delivery ETA | Must have |

### 2.3 Temple CMS (Admin Tool)

| Task | Details | Priority |
|------|---------|----------|
| Temple admin dashboard | Web-based (Next.js). Temple login. View incoming puja bookings with sankalp details. Accept/confirm bookings | Must have |
| Booking management | List of bookings by date. Status update: Confirmed, Puja Performed, Video Uploaded. Sankalp details (name, gotra, wish) visible for each | Must have |
| Video upload | Upload puja video (from phone recording). WhatsApp upload flow OR web upload. Compress + store in cloud (S3/Cloudflare R2) | Must have |
| Prasad dispatch | Mark prasad as packed. Enter shipping tracking number. Auto-notify user | Must have |
| Puja catalog management | Temple can: add new puja types, set pricing, set available dates, mark unavailable dates, upload temple photos | Must have |
| Revenue dashboard | Total bookings, total revenue (temple's share), monthly summary, payment history | Nice to have |
| Self-onboarding | Future: temples can sign up, add their details, and go live after Upaya verification. For now: manual onboarding by founder | Phase 4 |

### 2.4 Backend Services for Phase 2

| Service | Details |
|---------|---------|
| **Puja catalog service** | CRUD for pujas: temple, puja type, price, description, inclusions, available dates, muhurta data. AI-recommended puja matching based on diagnosis |
| **Booking service** | Create booking, assign to temple, track status through 7-stage lifecycle. Sankalp data storage. Payment integration |
| **Temple notification service** | Notify temple admin of new booking via WhatsApp + email + CMS push. Reminders for upcoming pujas |
| **Video service** | Handle video upload (temple → cloud storage), transcoding, delivery to user. WhatsApp delivery via Business API |
| **Shipping service** | Shiprocket/Delhivery API integration. Create shipment, track status, auto-update order. Estimated delivery calculation |
| **Certificate service** | Generate branded PDF certificate per completed puja. Store + deliver via app and WhatsApp |
| **WhatsApp Business API** | Template messages for: booking confirmation, video delivery, prasad shipping, transit alerts, remedy reminders. Provider: Gupshup or Wati |

### 2.5 Database Schema Additions (Phase 2)

```
temples (id, name, city, state, lat, lng, description, images, contact_phone, contact_email, revenue_share_pct, status, created_at)
temple_admins (id, temple_id, name, phone, email, firebase_uid, role, created_at)
puja_catalog (id, temple_id, name, deity, dosha_type, description, inclusions, price, available_days, muhurta_data, images, status, created_at)
bookings (id, user_id, puja_catalog_id, temple_id, sankalp_name, sankalp_father_name, sankalp_gotra, sankalp_wish, booking_date, status, payment_id, created_at)
booking_status_log (id, booking_id, status, notes, updated_by, created_at)
puja_videos (id, booking_id, video_url, thumbnail_url, duration, uploaded_at)
puja_certificates (id, booking_id, pdf_url, created_at)
shipping_orders (id, booking_id, provider, tracking_number, status, estimated_delivery, delivery_address, created_at)
addresses (id, user_id, name, line1, line2, city, state, pincode, phone, is_default, created_at)
```

### 2.6 Phase 2 Deliverables

- [ ] Puja detail screen with AI reasoning for temple recommendation
- [ ] 3-step booking flow (Sankalp → Date → Review & Pay)
- [ ] Order tracking with 7-stage timeline
- [ ] Video player + download + WhatsApp share
- [ ] Digital completion certificate
- [ ] Prasad shipping tracking (Shiprocket/Delhivery integration)
- [ ] Temple CMS: booking management, video upload, prasad dispatch
- [ ] WhatsApp Business API: booking confirmation, video delivery, prasad tracking
- [ ] Push notifications for order status updates
- [ ] 8-12 temples live and accepting bookings
- [ ] 100+ pujas booked through platform

---

## Phase 3: Retention Engine — Tracker, Alerts, Pandit (Months 4-5)

**Goal:** Build the features that drive daily engagement and repeat purchases — remedy tracker with streaks, transit alerts, pandit consultations, and the guided mantra player. This is the retention engine that transforms one-time buyers into long-term users.

**Revenue target:** ₹3-5L MRR. 25+ temple partnerships. 3,000+ paying users. 20%+ repeat rate.

### 3.1 Remedy Tracker Dashboard (S12) — The Retention Core

| Task | Details | Priority |
|------|---------|----------|
| Active protocol view | Protocol name + day counter + progress bar (%). Start date, target completion date. Today's tasks list | Must have |
| Daily task cards | Each remedy as a card: checkbox + name + details + streak count. "Start Guided Mantra" button for mantras. "Mark as Done" button for all | Must have |
| Streak tracking | Track consecutive days of completion per remedy. Fire emoji + day count. "Streak about to break" warning if not completed by evening | Must have |
| Puja status cards | Completed pujas: status + watch video link + prasad tracking. Scheduled pujas: date + "View Details". Color-coded: green (done), yellow (scheduled), grey (pending) | Must have |
| Weekly stats grid | 7-day grid (Mo-Su) with checkmarks/circles for each day. Current week + last week visible. Karma points total. Current streak. Completion rate % | Must have |
| Empty state | "Your remedy tracker will appear here after your first analysis. Start by telling me what's worrying you." → CTA: "Start Chat →" | Must have |
| Add remedies | From report: "Start My 9-Week Protocol" adds all remedies. Individual "Add to Tracker" buttons on each remedy card | Must have |
| Gamification | Karma points: +10 per daily task, +50 per puja completion, +100 per week streak. Completion badges at milestones (7-day, 21-day, 63-day) | Must have |

### 3.2 Guided Mantra Player (S12.2)

| Task | Details | Priority |
|------|---------|----------|
| Mala visualization | Animated rosary/mala circle. Each bead lights up as count progresses. Center shows current count / total (e.g., 42/108) | Must have |
| Mantra display | Roman transliteration + Devanagari script displayed prominently below mala | Must have |
| Counting modes | 3 modes: "Listen & Repeat" (audio plays, tap after each), "Self-paced" (tap to count), "Timer" (set time, approximate count) | Must have |
| Audio playback | Pre-recorded mantra audio. Speed control: 0.5x, 1x, 1.5x. Clear pronunciation | Must have |
| Controls | TAP button (large, center) to count. Pause button. Complete button (enabled at 108). Progress auto-saves if interrupted | Must have |
| Completion | Celebration animation on reaching 108. Karma points awarded. Auto-mark daily task as done. Streak updated | Must have |

### 3.3 Transit Alerts & Notifications (S14)

| Task | Details | Priority |
|------|---------|----------|
| Transit calculation engine | Backend service: compute planetary transits for each user's chart. Detect when planets change houses. Evaluate impact severity based on user's natal chart | Must have |
| Transit alert screen | Planet transit visualization (animated kundli showing movement). "What's happening" explanation. Duration + impact level. Recommended protective remedies with "Book Now" and "Add to Tracker" CTAs | Must have |
| Festival-linked alerts | Calendar of major Hindu festivals. Match festival to user's chart: "Maha Shivaratri in 5 days — Rudrabhishek would be powerful for your Shani dosha" | Must have |
| Notification types | Transit alerts, Festival remedies, Remedy reminders (daily), Streak alerts (about to break), Puja updates (order status), Prasad shipping, Check-in (2-4 weeks after puja), Dasha changes | Must have |
| Push notification schedule | 6:30 AM: Morning mantra reminder. 7:00 PM: Streak protection reminder. Event-based: order updates. Weekly: progress summary. Transit/festival: as triggered | Must have |
| Notification settings | Per-type toggle: Remedy Reminders, Transit Alerts, Festival Remedies, Puja Updates, Promotional. Custom reminder times | Must have |

### 3.4 Pandit Consultation (S10)

| Task | Details | Priority |
|------|---------|----------|
| Pandit listing | AI note recommending speciality based on user's chart. Filter by speciality: Marriage, Career, Health, etc. Pandit card: photo, name, rating, speciality, languages, experience, availability, chat/call pricing | Must have |
| Pre-session AI brief | Before consultation, pandit receives: problem summary, chart highlights, severity, current remedies, user expectations. "Session should build on AI diagnosis, not contradict it" | Must have |
| Chat consultation | Real-time chat interface (similar to AI chat UI). Timer showing duration + running cost. Wallet balance warning with recharge CTA | Must have |
| Call consultation | In-app voice call (WebRTC or Agora SDK). Same timer + cost display. Call recording for AI summary | V1.1 |
| Wallet system | Pre-load wallet balance. Minimum ₹100. Auto-deduct per minute. Low balance warning. Quick recharge options: ₹100, ₹200, ₹500 | Must have |
| Post-session AI summary | AI-generated summary: key points discussed, new remedies suggested, timeline guidance. "Add to Tracker" buttons for new remedies. "Book Puja" CTAs for recommended pujas. Rating prompt (5-star) | Must have |
| Pandit admin | Pandit availability management. Session history + earnings. AI brief viewer before sessions | Must have |

### 3.5 Post-Diagnosis Deepening Chat (S3.4)

| Task | Details | Priority |
|------|---------|----------|
| Deepening after value | After free diagnosis, AI asks: "Kya yeh problems match karti hain?" with chips: "Haan, sab match" / "Kuch aur bhi hai" | Must have |
| If match | AI guides to starting free remedies or upgrading to complete plan | Must have |
| If more to share | AI explores related life areas (career, health, family alongside primary problem). May recommend additional analysis or pandit consultation. Natural upsell | Must have |
| Edge case: suicide/self-harm | Detect keywords. Show AASRA helpline 9820466726 (24/7) prominently. Pause remedy flow. Advise professional help. Never more remedies | Must have |
| Edge case: health condition | "Main spiritual guidance de sakta hoon, lekin health ke liye qualified doctor se zaroor milein" | Must have |
| Edge case: lottery/gambling | Redirect to financial situation remedies. No specific predictions | Must have |
| Edge case: anger about results | Empathize + offer protocol adjustment + pandit consultation escalation | Must have |

### 3.6 Database Schema Additions (Phase 3)

```
remedy_protocols (id, user_id, report_id, name, start_date, end_date, total_days, status, created_at)
remedy_tasks (id, protocol_id, name, type, description, frequency, mantra_text, mantra_audio_url, target_count, created_at)
remedy_completions (id, task_id, user_id, completed_date, count, duration_seconds, karma_points, created_at)
streaks (id, user_id, task_id, current_streak, longest_streak, last_completed_date, created_at)
karma_points (id, user_id, points, source, source_id, created_at)
transit_alerts (id, user_id, kundli_id, planet, from_house, to_house, transit_date, impact_level, remedies_json, read, created_at)
notifications (id, user_id, type, title, body, data_json, read, sent_at, created_at)
pandits (id, name, photo_url, specialities, languages, experience_years, rating, total_consultations, price_per_min_chat, price_per_min_call, availability_json, status, created_at)
pandit_sessions (id, user_id, pandit_id, type, start_time, end_time, duration_minutes, cost, ai_brief_json, ai_summary_json, rating, status, created_at)
wallets (id, user_id, balance, created_at, updated_at)
wallet_transactions (id, wallet_id, type, amount, description, reference_id, created_at)
```

### 3.7 Phase 3 Deliverables

- [ ] Remedy tracker with daily tasks, streak tracking, karma points, weekly stats
- [ ] Guided mantra player with mala visualization and 3 counting modes
- [ ] Transit alert engine computing per-user planetary transits
- [ ] Push notifications for remedy reminders, streak warnings, transit alerts, order updates
- [ ] Festival-linked remedy recommendations
- [ ] Pandit listing with AI-recommended speciality matching
- [ ] Pre-session AI brief for pandits
- [ ] Real-time chat consultation with wallet + per-minute billing
- [ ] Post-session AI-generated summary with actionable CTAs
- [ ] Post-diagnosis deepening conversation in chat
- [ ] Edge case handling (mental health, medical, gambling, anger)
- [ ] 25+ temple partnerships
- [ ] 3,000+ paying users
- [ ] 20%+ repeat purchase rate

---

## Phase 4: Commerce & Monetization Expansion (Months 5-7)

**Goal:** Launch the Siddha Store (spiritual e-commerce), subscriptions (9-week protocols), Daan Seva, family kundli vault, and Muhurta planner. Expand from single-product revenue to multi-stream monetization.

**Revenue target:** ₹15-20L MRR. 50+ temples. 5,000+ cumulative paying users.

### 4.1 Siddha Store — Spiritual Commerce (S11)

| Task | Details | Priority |
|------|---------|----------|
| Store home (Explore tab) | Tabs: Temples, Pujas, Store, Pandits. "Recommended for Your Chart" personalized section. Category grid: Gemstones, Rudraksha, Yantras, Remedy Kits, Puja Items, Daan Seva. "Popular This Week" featured products | Must have |
| Product detail screen | Image carousel (4 images). Product name, weight/size, rating + reviews. Price with MRP strikethrough + discount. "Why this product (from your chart)" AI reasoning box. Trust signals: Pran Pratistha done, lab certified, 7-day return, free shipping. Wearing/usage instructions. Pran Pratistha video. Customer reviews. "Add to Cart" CTA | Must have |
| AI-personalized recommendations | Products recommended based on user's kundli diagnosis. "AI Pick" badge. Explanation of why this product helps their specific dosha | Must have |
| Cart + checkout | Standard e-commerce cart. Address selection/add. Razorpay payment. Order confirmation with estimated delivery | Must have |
| Product catalog management | Admin panel: add products with images, descriptions, pricing, certifications. Inventory tracking. Mark out-of-stock | Must have |
| Pran Pratistha certification | Each product has video certificate of energizing ritual. Displayed on product page as trust signal | Must have |
| Remedy kits | Pre-bundled kits: "Mangal Dosha Remedy Kit" (Red Coral + Hanuman Kavach + Mangal Yantra + Red thread). AI-generated per dosha. Kit discount vs individual | Must have |
| Initial catalog | Start with 10-15 curated SKUs: 3-4 gemstones, 3-4 rudraksha varieties, 2-3 yantras, 2-3 remedy kits. Quality > quantity. Source from verified suppliers with Pran Pratistha | Must have |

### 4.2 Daan Seva

| Task | Details | Priority |
|------|---------|----------|
| Seva catalog | Categories: Gau Seva (₹151-501), Brahman Bhoj (₹251-1,100), Vastra Daan (₹201-501), Anna Daan (₹151-351). At specific temples | Must have |
| Seva booking | Select seva type → select temple → pay. Similar to puja booking but simpler (no date selection, no video). Photo proof of seva performed + receipt | Must have |
| AI integration | Remedy reports recommend specific daan based on dosha. "Donate red masoor dal and red cloth on Tuesdays" → CTA to book Vastra Daan at temple | Must have |

### 4.3 Subscription Plans — 9-Week Remedy Protocols

| Task | Details | Priority |
|------|---------|----------|
| Protocol subscription | AI-prescribed 9-week plan: weekly pujas + daily mantras + products + daan. Single upfront payment at discount: ₹999-2,999/month | Must have |
| Subscription management | Auto-schedule weekly pujas. Tracker auto-populated with all tasks. Progress milestones at weeks 3, 6, 9. Mid-protocol check-in by AI | Must have |
| Subscription tiers | Basic (₹999/mo): mantra + free remedies tracking only. Standard (₹1,999/mo): + 1 puja/month + 1 product. Premium (₹2,999/mo): + 2 pujas/month + remedy kit + pandit consultation | Must have |

### 4.4 Family Kundli Vault (S15)

| Task | Details | Priority |
|------|---------|----------|
| Add family member | Name, relationship, DOB, TOB, POB. Generate kundli for each | Must have |
| Family vault view | List of family members with mini kundli preview. Tap to view full chart | Must have |
| Cross-analysis | "Your daughter's chart shows delayed marriage — here are family remedies together." Family-level transit alerts | Nice to have |
| Household lock-in | One user's family data = massive switching cost. Multiple kundlis = multiple remedy plans = multiple revenue streams | Strategic |

### 4.5 Muhurta Planner

| Task | Details | Priority |
|------|---------|----------|
| Query interface | "When should I [sign this deal / schedule wedding / start new job / buy property]?" Free text + category selection | Must have |
| AI analysis | Chart + panchang + current transits → optimal dates. Show 3-5 recommended dates with quality rating (Excellent/Good/Average) and reasoning | Must have |
| Pricing | ₹199-499 per query. Or included in Premium subscription | Must have |

### 4.6 Profile & Settings Enhancements (S15, S17)

| Task | Details | Priority |
|------|---------|----------|
| Complete Me tab | Avatar + name + phone + member since. Karma points + streak. My Kundli (mini chart + current dasha + "View Full"). Family Kundli Vault. My Reports. My Orders. Refer & Earn (₹50 credit per referral). Help & Support (WhatsApp). About, Privacy Policy, Settings | Must have |
| Full kundli view | Interactive chart. Tabs: Chart, Planets, Dashas, Yogas. Planetary positions table (Planet, Sign, House, Status). Tap any planet for detailed analysis | Must have |
| Settings screen | Language toggle. Notification toggles per type. Reminder time customization. Privacy: Delete Data, Download Data, Encryption toggle. Support: WhatsApp, FAQs, Report Problem. Logout | Must have |
| Refer & Earn | Share Upaya link with unique code. Friend gets free kundli. User gets ₹50 store credit when friend buys report. Track referrals and credits | Must have |

### 4.7 Temple CMS Self-Onboarding

| Task | Details | Priority |
|------|---------|----------|
| Temple registration | Self-serve sign-up: temple name, city, deity, pujari name, phone, photos. Upaya reviews and approves | Must have |
| Onboarding wizard | Step-by-step: Add temple details → Add puja catalog → Set pricing → Upload photos → Go live after verification | Must have |
| Revenue dashboard | Monthly earnings, bookings completed, ratings, payout history | Must have |
| Pujari referral loop | "Kya aapke parichit hain doosre mandir mein?" In-CMS referral. Incentive: ₹500 per referred temple that goes live | Must have |

### 4.8 Database Schema Additions (Phase 4)

```
products (id, name, category, description, images, price, mrp, discount_pct, weight, specifications, wearing_instructions, pran_pratistha_video_url, certification, stock, rating, review_count, status, created_at)
product_reviews (id, product_id, user_id, rating, review_text, created_at)
cart_items (id, user_id, product_id, quantity, created_at)
product_orders (id, user_id, total_amount, shipping_address_id, payment_id, status, created_at)
product_order_items (id, order_id, product_id, quantity, price, created_at)
seva_catalog (id, temple_id, type, name, description, price, photo_proof, created_at)
seva_bookings (id, user_id, seva_catalog_id, temple_id, payment_id, status, proof_url, created_at)
subscriptions (id, user_id, tier, protocol_id, start_date, end_date, status, payment_id, created_at)
family_members (id, user_id, name, relationship, kundli_id, created_at)
muhurta_queries (id, user_id, query_text, category, recommended_dates_json, payment_id, created_at)
```

### 4.9 Phase 4 Deliverables

- [ ] Siddha Store live with 10-15 curated SKUs + AI-personalized recommendations
- [ ] Remedy kits bundled per dosha type
- [ ] Pran Pratistha certification on all products
- [ ] Cart + checkout + order tracking for products
- [ ] Daan Seva catalog with photo proof delivery
- [ ] Subscription plans (Basic/Standard/Premium) with 9-week protocols
- [ ] Family Kundli Vault — add members, generate charts
- [ ] Muhurta Planner — AI-recommended auspicious dates
- [ ] Complete Me tab with all sections
- [ ] Full interactive kundli view
- [ ] Settings screen with all toggles
- [ ] Refer & Earn system with store credits
- [ ] Temple CMS self-onboarding wizard
- [ ] 50+ temple partnerships
- [ ] ₹15-20L MRR

---

## Phase 5: Growth & Scale Features (Months 7-10)

**Goal:** Launch NRI tier (USD pricing), regional languages (Tamil, Telugu), community features, advanced AI capabilities, and SEO/content moat. This phase is about widening the funnel and deepening engagement.

**Revenue target:** ₹42-55L MRR. 100+ temples. 10,000+ monthly paying users.

### 5.1 NRI Premium Tier

| Task | Details | Priority |
|------|---------|----------|
| USD pricing | Separate pricing for NRI users (detected by phone country code or manual selection). Reports: $9-19. Pujas: $15-99. Products: $20-299. Subscriptions: $29-99/month | Must have |
| English-first experience | Default English for NRI users. Sanskrit/Hindi terms preserved with English explanations | Must have |
| International prasad shipping | Partner with international courier (DHL, FedEx). Higher shipping cost absorbed into puja pricing. Estimated 10-15 day delivery | Must have |
| NRI marketing | Target Indian diaspora in USA, UK, UAE, Canada, Singapore. Facebook/Instagram ads to Indian communities abroad. Partnership with NRI temple associations | Must have |
| Payment gateway | Razorpay international or Stripe for USD payments | Must have |

### 5.2 Regional Languages

| Task | Details | Priority |
|------|---------|----------|
| Tamil support | Full app translation: UI strings, AI chat, diagnosis, remedy reports. Native Tamil, not translated. Tamil astrological terminology. Tamil Nadu temple partnerships | Must have |
| Telugu support | Same as Tamil for Telugu. Andhra Pradesh + Telangana temple partnerships | Must have |
| Language architecture | i18n framework (react-intl or i18next). All strings externalized. LLM prompts per language. Language-specific content variants | Must have |
| Marathi + Bengali | Prepare for Phase 6. Maharashtra + West Bengal have high spiritual demand | Planned |

### 5.3 Community Features

| Task | Details | Priority |
|------|---------|----------|
| Anonymous community stats | "23,847 people doing Shani remedies this week." Shown on remedy tracker and home screen. Builds belonging | Must have |
| Success stories | Anonymized user testimonials: "After completing 9-week Mangal protocol, marriage talks progressed." User-submitted, curated by team | Must have |
| Group remedy events | Community pujas: "Join 500 others for collective Navagraha puja this Saturday." ₹199-499 per participant. Live-streamed from temple | Must have |
| Festival community rituals | Major festivals: collective puja with all active users. Special pricing. Shared video delivery | Nice to have |

### 5.4 Advanced AI Capabilities

| Task | Details | Priority |
|------|---------|----------|
| Outcome feedback loop | Post-remedy check-in: "How are things since your puja?" User reports improvement/no change. Feed into remedy knowledge graph | Must have |
| Improved recommendations | Use outcome data to improve remedy recommendations. "Users with similar charts who did X reported Y% improvement" | Must have |
| Adaptive complexity | Data-oriented users: full charts, planetary positions, technical analysis. Elderly/anxious users: simple progress bars, positive framing, milestone-based | Must have |
| Voice input in chat | Speech-to-text for Hindi/English. Critical for 35+ demographic. Google Speech API or Whisper | Must have |
| Image sharing (future prep) | Clip icon for sharing existing kundli images, hand photos. Shown as "Coming Soon" in V1, enabled in V2 | Planned |

### 5.5 WhatsApp Deep Integration

| Task | Details | Priority |
|------|---------|----------|
| Shareable remedy reports | After diagnosis: WhatsApp share card with ACTUAL MANTRA text. Content-rich sharing drives organic virality | Must have |
| PDF report delivery | Full report sent via WhatsApp after purchase | Must have |
| Mantra audio delivery | Daily mantra audio file via WhatsApp for offline practice | Must have |
| Transit alerts via WhatsApp | For users who don't open app regularly, critical alerts via WhatsApp | Must have |
| WhatsApp chatbot (basic) | Simple: "Type KUNDLI to get your free analysis" → link to app. Helps with non-app users | Nice to have |

### 5.6 SEO & Content Moat

| Task | Details | Priority |
|------|---------|----------|
| Free kundli web tool | Next.js web page: enter birth details → get basic kundli + dosha summary for free. Massive SEO play — "free kundli" has millions of monthly searches | Must have |
| Problem-specific pages | "Marriage delay remedy astrology", "Shani dosha solution", "Mangal dosha puja" — 50+ long-form SEO pages in Hindi + English | Must have |
| YouTube shorts | Astrology explainers: "Your Shani is in 7th house — here's what it means." 30-60 second videos. Link to app | Must have |
| Blog/content hub | Weekly articles on remedies, transits, festivals, dosha explainers. Hindi + English | Must have |

### 5.7 Phase 5 Deliverables

- [ ] NRI tier with USD pricing, Stripe/Razorpay intl, international shipping
- [ ] Tamil language fully supported (UI + AI + reports)
- [ ] Telugu language fully supported
- [ ] Community stats ("X people doing this remedy")
- [ ] Anonymized success stories
- [ ] Group remedy events with live streaming
- [ ] Outcome feedback loop feeding remedy knowledge graph
- [ ] Voice input in chat (Hindi + English)
- [ ] WhatsApp deep integration (reports, mantras, alerts)
- [ ] Free kundli web tool (SEO)
- [ ] 50+ SEO pages published
- [ ] YouTube shorts content program started
- [ ] 100+ temple partnerships
- [ ] ₹42-55L MRR

---

## Phase 6: Series A Readiness (Months 10-14)

**Goal:** Achieve metrics that justify a ₹15-25 Cr Series A at ₹100-150 Cr valuation. Launch remaining features from the vision docs: Emergency Remedy, Astrologer Protocol Marketplace, Temple Wish Tracker, and advanced analytics. Prepare for Series A fundraise.

**Revenue target:** ₹75-90L MRR. ₹9-11 Cr ARR run-rate. 150,000 MAU. 15,000+ monthly paying users.

### 6.1 Emergency Remedy

| Task | Details | Priority |
|------|---------|----------|
| Emergency flow | "Crisis at 11 PM, court date tomorrow." Instant AI diagnosis + same-day/next-day puja booking at available temple. Premium pricing: ₹999-2,999 | Must have |
| Priority queue | Temples opt-in to emergency availability. Higher revenue share for urgent requests. Puja performed within 24 hours | Must have |
| 24/7 AI availability | AI chat always available. Pandit on-call roster for emergency consultations | Must have |

### 6.2 Astrologer Protocol Marketplace (UGC)

| Task | Details | Priority |
|------|---------|----------|
| Protocol publishing | Experienced astrologers/pandits publish curated remedy protocols on Upaya. Structure: problem type → diagnosis criteria → remedy steps → timeline | Nice to have |
| Royalty model | Astrologer earns royalty per user who follows their protocol. Revenue share: 70% Upaya, 30% astrologer | Nice to have |
| Quality curation | Upaya team reviews and approves protocols before publishing. Rating system. Top protocols featured | Nice to have |

### 6.3 Temple Wish Tracker

| Task | Details | Priority |
|------|---------|----------|
| Sankalp tracking | User makes wish (sankalp) when booking puja. Track it: "You made this wish 3 months ago. How's it going?" | Must have |
| Outcome capture | Positive → collect testimonial (anonymized). Negative → offer intensified protocol or pandit consultation. Neutral → suggest patience + continued practice | Must have |
| Testimonial engine | Convert positive outcomes into social proof: "87% of users who completed full Mangal protocol reported improvement." Feed to onboarding + diagnosis screens | Must have |

### 6.4 Remedy Guarantee

| Task | Details | Priority |
|------|---------|----------|
| Money-back credit | If user completes full protocol and feels no benefit → store credit (not refund). Signals confidence. Retention loop (they spend credit, stay engaged) | Nice to have |
| Eligibility | Must complete 100% of protocol tasks for 9 weeks. Verified via tracker data | Nice to have |

### 6.5 Advanced Analytics & Data

| Task | Details | Priority |
|------|---------|----------|
| Remedy knowledge graph | Now in PostgreSQL with JSON: Planet → Dosha → Problem → Remedy → Temple → Outcome. Enriched with outcome feedback data from 10,000+ remedy completions | Must have |
| Recommendation engine | ML model: given kundli + problem + location → rank remedies by predicted effectiveness (based on outcome data from similar charts) | Must have |
| Business dashboards | Revenue by stream, cohort retention, funnel conversion rates, temple performance, product sales, subscription churn, NRI vs domestic ARPU | Must have |
| User analytics | Session depth, chat engagement, tracker adherence, payment conversion, repeat rates, referral virality coefficient | Must have |

### 6.6 Scaling Operations

| Task | Details | Priority |
|------|---------|----------|
| Hire temple ops lead | Dedicated person for temple partnerships, field ops, quality management. Hindi + regional language fluency | Must have |
| Hire customer support | WhatsApp support agent. Handle: order issues, puja complaints, product returns, general queries | Must have |
| Hire content + growth | SEO writer, social media, YouTube content in Hindi/English. Growth hacking | Must have |
| Hire engineer #2 | Backend focus: data engineering, analytics, recommendation engine, scaling | Must have |
| Pandit quality system | Verification process: sample consultation review. AI pre-briefs standardize quality. Post-session ratings. Remove low-rated pandits | Must have |

### 6.7 Series A Preparation

| Task | Details | Priority |
|------|---------|----------|
| Metrics package | MAU: 150K. Paying users: 15K/month. MRR: ₹75-90L. ARR: ₹9-11 Cr. Temples: 100+. Repeat rate: 35%+. LTV:CAC > 12x | Must have |
| Pitch deck | Market ($350B faith market, 1.5% online), problem (fragmented remedies), solution (full-stack AI spiritual platform), traction, unit economics, competitive moat, team, ask | Must have |
| Target investors | India Quotient, 100X.VC, Titan Capital, Elevation Capital, Blume Ventures. Faith/spiritual-aligned angels. AstroTalk/Sri Mandir investor syndicate | Must have |
| Data room | Financials, incorporation docs, IP assignments, employee agreements, privacy policy, temple contracts, product metrics, cohort analysis | Must have |
| Target raise | ₹15-25 Cr at ₹100-150 Cr pre-money valuation | Target |

### 6.8 Phase 6 Deliverables

- [ ] Emergency Remedy with premium pricing and 24-hour fulfillment
- [ ] Temple Wish Tracker with outcome feedback loop
- [ ] Remedy Guarantee (money-back credit for full protocol completion)
- [ ] Advanced recommendation engine using outcome data
- [ ] Business + user analytics dashboards
- [ ] Team scaled to 8-10 people
- [ ] Pandit quality verification system
- [ ] Series A pitch deck + data room ready
- [ ] 150,000 MAU
- [ ] 15,000+ monthly paying users
- [ ] ₹75-90L MRR (₹9-11 Cr ARR)
- [ ] 100+ temple partnerships
- [ ] 35%+ repeat purchase rate
- [ ] Series A raise completed: ₹15-25 Cr

---

## Technical Architecture

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                   │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │  React Native     │    │  Next.js Web      │                    │
│  │  (Android + iOS)  │    │  (PWA + SEO pages  │                    │
│  │  Expo Managed     │    │   + Temple CMS     │                    │
│  │                   │    │   + Admin Panel)    │                    │
│  └────────┬──────────┘    └────────┬───────────┘                    │
│           │                        │                                │
└───────────┼────────────────────────┼────────────────────────────────┘
            │                        │
            ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                  │
│                   (Nginx / AWS ALB / Vercel Edge)                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    NODE.JS API SERVER (Express)                    │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Auth         │  │ Chat        │  │ Kundli      │              │
│  │ Middleware   │  │ Controller  │  │ Controller  │              │
│  │ (Firebase    │  │             │  │             │              │
│  │  JWT verify) │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Diagnosis   │  │ Report      │  │ Booking     │              │
│  │ Controller  │  │ Controller  │  │ Controller  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Commerce    │  │ Pandit      │  │ Notification│              │
│  │ Controller  │  │ Controller  │  │ Controller  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└──────┬──────────────┬──────────────┬─────────────────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼───────────────┐
│ LLM SERVICE │ │ ASTRO      │ │ EXTERNAL SERVICES  │
│             │ │ ENGINE     │ │                    │
│ Anthropic   │ │ Swiss      │ │ Razorpay (payments)│
│ OpenAI      │ │ Ephemeris  │ │ Firebase (auth)    │
│ Gemini      │ │ (C/Node    │ │ Google Places (geo)│
│             │ │  bindings) │ │ Shiprocket (ship)  │
│ Provider-   │ │            │ │ WhatsApp Business  │
│ agnostic    │ │ Dosha      │ │ FCM (push notif)   │
│ abstraction │ │ Rule       │ │ Google Speech (STT)│
│ layer       │ │ Engine     │ │ Cloudflare R2 (CDN)│
└──────┬──────┘ └─────┬──────┘ └────┬───────────────┘
       │              │              │
┌──────▼──────────────▼──────────────▼─────────────────────────────┐
│                      DATA LAYER                                    │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                      │
│  │ PostgreSQL        │  │ Redis             │                      │
│  │ (Supabase/Railway)│  │ (Cache + Sessions │                      │
│  │                   │  │  + Rate Limiting)  │                      │
│  │ • Users           │  │                   │                      │
│  │ • Kundlis         │  └──────────────────┘                      │
│  │ • Chat sessions   │                                            │
│  │ • Diagnoses       │  ┌──────────────────┐                      │
│  │ • Reports         │  │ Cloudflare R2     │                      │
│  │ • Bookings        │  │ / AWS S3          │                      │
│  │ • Orders          │  │                   │                      │
│  │ • Products        │  │ • Puja videos     │                      │
│  │ • Temples         │  │ • Product images  │                      │
│  │ • Pandits         │  │ • Mantra audio    │                      │
│  │ • Subscriptions   │  │ • PDF reports     │                      │
│  │ • Analytics       │  │ • Certificates    │                      │
│  └──────────────────┘  └──────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile** | React Native (Expo) | Cross-platform Android + iOS. Expo managed workflow for faster dev. OTA updates without app store approval |
| **Web** | Next.js 14+ (App Router) | SEO pages (free kundli tool, blog), Temple CMS, Admin panel. Server-side rendering for SEO |
| **API** | Node.js + Express + TypeScript | Same language as frontend. Fast development. Strong ecosystem |
| **Database** | PostgreSQL (Supabase/Railway) | Reliable, scalable, good JSON support for flexible data. Start with one DB, shard later if needed |
| **Cache** | Redis (Upstash) | Session management, rate limiting, kundli calculation cache, LLM response cache |
| **Auth** | Firebase Auth | Phone OTP + Google Sign-In out of box. Free tier generous. React Native SDK |
| **Payments** | Razorpay (India) + Stripe (NRI) | UPI, cards, net banking, wallets. Stripe for USD payments |
| **LLM** | Claude / GPT / Gemini (abstracted) | Provider-agnostic service. Switch based on cost, quality, availability. Prompt templates per provider |
| **Astrology** | Swiss Ephemeris (C + Node bindings) | Gold standard for planetary calculations. Open source. Accurate to birth-minute. Lahiri Ayanamsa |
| **Storage** | Cloudflare R2 / AWS S3 | Videos, images, audio, PDFs. R2 for zero egress cost |
| **Push** | Firebase Cloud Messaging (FCM) | Free. Works on Android + iOS. Rich notifications |
| **WhatsApp** | Gupshup / Wati | WhatsApp Business API. Template messages for transactional notifications |
| **Shipping** | Shiprocket / Delhivery API | Prasad + product shipping. Tracking integration. Pan-India coverage |
| **Analytics** | Mixpanel / PostHog | Event tracking, funnels, cohorts, retention. PostHog self-hosted for cost savings |
| **CI/CD** | GitHub Actions + EAS Build | Automated lint, test, build. Expo Application Services for mobile builds |
| **Hosting** | Vercel (web) + Railway (API) + Supabase (DB) | Low cost, auto-scaling, managed services. Total ~₹5-10K/month to start |

### LLM Abstraction Layer Design

```typescript
// Provider-agnostic interface
interface LLMProvider {
  generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput>;
  generateRemedyPlan(input: RemedyInput): Promise<RemedyOutput>;
  generateChatResponse(input: ChatInput): Promise<ChatOutput>;
  generateSessionSummary(input: SessionInput): Promise<SummaryOutput>;
}

// Config-driven provider selection
// config: { provider: "anthropic" | "openai" | "gemini", model: "...", fallback: "..." }
// Automatic fallback if primary provider fails
// Cost tracking per request for optimization
```

### Dosha Rule Engine Design

```
Input: Planetary positions (9 planets × 12 houses)

Rules (seeded from classical texts):
- Mangal Dosha: Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house
- Kaal Sarp Yog: All planets between Rahu and Ketu
- Shani Dosha: Saturn afflicting key houses (7th for marriage, 10th for career)
- Pitra Dosha: Sun + Rahu/Ketu conjunction or specific house placements
- Rahu-Ketu Dosha: Rahu/Ketu in 1st, 4th, 7th, 10th houses

Output: { dosha_name, severity (1-10), affected_houses, affected_life_areas, remedies[] }

Validation: Rule engine output validates LLM diagnosis.
If LLM claims a dosha that rules don't support → flag for review.
If rules detect a dosha LLM missed → add to diagnosis.
```

---

## Monthly Cost Projections (Bootstrap Path)

### Phase 0-1 (Months 1-2): Build MVP

| Item | Monthly Cost |
|------|-------------|
| Founder (no salary or minimal) | ₹0-50K |
| 1 Full-stack engineer | ₹80K-1.2L |
| LLM API costs (Claude/GPT/Gemini) | ₹10-20K |
| Hosting (Vercel + Railway + Supabase) | ₹5-10K |
| Swiss Ephemeris | ₹0 (open source) |
| Firebase Auth (free tier) | ₹0 |
| Domain + tools (GitHub, Figma, etc.) | ₹5K |
| Temple travel (founder) | ₹15-20K |
| **Total monthly burn** | **₹1.2-1.7L** |
| **Phase cost (2 months)** | **₹2.5-3.5L** |

### Phase 2-3 (Months 3-5): Growth

| Item | Monthly Cost |
|------|-------------|
| Founder (minimal salary) | ₹30-50K |
| 1 Engineer | ₹80K-1.2L |
| LLM API costs (growing usage) | ₹20-40K |
| Hosting (scaling) | ₹10-20K |
| Razorpay fees (2% of revenue) | ₹2-6K |
| WhatsApp Business API | ₹5-10K |
| Shiprocket/Delhivery | Per-order |
| Temple travel | ₹10-15K |
| Marketing (SEO tools, minimal ads) | ₹10-20K |
| **Total monthly burn** | **₹1.7-2.8L** |
| **Phase cost (3 months)** | **₹5-8.5L** |

### Phase 4-6 (Months 5-14): Scale

| Item | Monthly Cost (M5-8) | Monthly Cost (M9-14) |
|------|---------------------|----------------------|
| Founder | ₹50K | ₹80K |
| Engineer #1 | ₹1.2L | ₹1.2L |
| Engineer #2 (from M10) | — | ₹1L |
| Temple ops lead (from M6) | ₹60-80K | ₹60-80K |
| Content + growth (from M6) | ₹40-60K | ₹40-60K |
| Customer support (from M8) | — | ₹25-35K |
| LLM API | ₹40-80K | ₹80K-1.5L |
| Hosting | ₹20-40K | ₹40-60K |
| WhatsApp API | ₹10-20K | ₹20-40K |
| Marketing | ₹20-50K | ₹50K-1L |
| **Total monthly burn** | **₹3.5-5.5L** | **₹5.5-8L** |

### Total 14-Month Cost Estimate

| Period | Duration | Total Cost |
|--------|----------|------------|
| Phase 0-1 | 2 months | ₹2.5-3.5L |
| Phase 2-3 | 3 months | ₹5-8.5L |
| Phase 4-6 | 9 months | ₹35-60L |
| **Total** | **14 months** | **₹42-72L** |

**Note:** Revenue starts from Month 2 (report sales at ₹199). By Month 6, revenue should cover 30-50% of costs. By Month 12, revenue should exceed costs (operating break-even).

### Revenue Projections (Conservative)

| Month | MAU | Paying Users | MRR (₹) |
|-------|-----|-------------|----------|
| M2 | 1,000 | 50 | 15,000 |
| M3 | 3,000 | 200 | 60,000 |
| M4 | 8,000 | 600 | 2,00,000 |
| M6 | 25,000 | 2,000 | 9,00,000 |
| M8 | 55,000 | 5,000 | 22,00,000 |
| M10 | 90,000 | 9,000 | 42,00,000 |
| M12 | 150,000 | 15,000 | 85,00,000 |

---

## Risk Mitigation Checklist

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| **LLM gives inaccurate astrology** | Rule engine validates all AI output. Confidence scoring (High/Medium/Low). Human pandit review for paid reports in early months. Classical text cross-reference. Never claim 100% accuracy |
| **Swiss Ephemeris calculation errors** | Validate against 20+ known kundli charts (from established tools like Jagannatha Hora). Automated test suite comparing output with reference data |
| **Scalability bottleneck** | Start with managed services (Supabase, Railway, Vercel) that auto-scale. Monitor performance from Day 1. Cache kundli calculations (same DOB/TOB/POB = same result) |
| **App store rejection** | Follow Apple/Google guidelines for astrology apps. Include clear disclaimers. Don't make health claims. Submit early for review feedback |
| **Data breach (birth data is sensitive)** | Encrypt PII at rest (PostgreSQL pgcrypto) and in transit (TLS). Firebase Auth for secure authentication. DPDP Act compliance from Day 1. Minimal data retention policy |

### Business Risks

| Risk | Mitigation |
|------|-----------|
| **AstroTalk launches AI + remedies** | Speed: ship MVP in 6 weeks. Lock temple partnerships. Their innovator's dilemma buys 12-18 months (AI cannibalizes per-minute revenue, astrologer revolt) |
| **Temples refuse partnerships** | Start with mid-tier temples hungry for incremental revenue. Free Temple CMS as hook. Show case studies (Utsav: 400, DevDham: 5,000). Revenue share favors temple (65-70%) |
| **Low conversion free → paid** | A/B test extensively. Empowerment-based (not fear-based) conversion. Free remedies build trust first. Introductory ₹99 for first report. Social proof ("X users with similar charts") |
| **"Remedy didn't work" backlash** | Never promise outcomes. Frame as "reducing intensity of negative influences." Post-remedy check-in with empathy. Offer adjusted protocol. "Spiritual Health Score" shows holistic trend |
| **Founder burnout** | Hire ops lead by Month 6. Temple partnerships cannot depend on one person. Prioritize ruthlessly — ship minimal features, iterate based on data |

### Ethical Risks

| Risk | Mitigation |
|------|-----------|
| **Fear-mongering** | AI tone rules: NEVER say "danger", "cursed", "terrible", "disaster". Use: "challenging period", "temporary blockage". Always end with hope |
| **Exploiting distressed users** | Spending caps: AI won't recommend >₹10,000 total without human review. Transparent pricing upfront. No hidden charges. No pressure to upgrade mid-session |
| **Mental health crisis** | Detect suicide/self-harm keywords → show AASRA helpline (9820466726). Pause remedy flow. Advise professional help. Health issues → always recommend doctor |
| **Fake products** | Pran Pratistha video for every product. Lab certification for gemstones. 7-day return policy. Start with curated suppliers — quality > quantity |
| **Regulatory action** | Self-regulate proactively. Publish "Remedy Ethics Framework." No health/legal claims. Compliance with Consumer Protection Act, DPDP Act. Partner with consumer trust advisory |

### Operational Risks

| Risk | Mitigation |
|------|-----------|
| **Temple quality issues** | Mystery puja audits. User ratings per temple. Video proof verification. Remove temples with <4.0 rating |
| **Prasad shipping damage** | Proper packaging guidelines for temples. Insurance on high-value shipments. Replacement policy for damaged items |
| **Pandit quality inconsistency** | Sample consultation review during onboarding. AI pre-briefs standardize sessions. Post-session ratings. Remove pandits below 4.0 after 10+ sessions |
| **Commerce returns/fraud** | 7-day return policy. COD not offered initially (UPI/card only). Photo proof of product condition on return. Start small (10-15 SKUs) to maintain quality |

---

## Appendix: Complete Screen Inventory

| Phase | Screen | Type | Priority |
|-------|--------|------|----------|
| 1 | Splash | Full screen | Must have |
| 1 | Language Selection | Full screen | Must have |
| 1 | Onboarding (3 screens) | Full screen, swipeable | Must have |
| 1 | Home / Chat Entry (first-time) | Tab screen | Must have |
| 1 | Home / Chat Entry (returning) | Tab screen | Must have |
| 1 | AI Chat | Full screen | Must have |
| 1 | Birth Details (in-chat widget) | In-chat card | Must have |
| 1 | Kundli Animation | Full screen overlay | Must have |
| 1 | Free Diagnosis Result | In-chat cards | Must have |
| 1 | Paywall Bottom Sheet | Bottom sheet | Must have |
| 1 | Login Bottom Sheet | Bottom sheet | Must have |
| 1 | OTP Verification | Bottom sheet | Must have |
| 1 | Payment (Razorpay) | External | Must have |
| 1 | Payment Success | Full screen | Must have |
| 1 | Full Paid Report | Full screen, scrollable | Must have |
| 2 | Puja Detail | Full screen | Must have |
| 2 | Booking Step 1: Sankalp | Full screen | Must have |
| 2 | Booking Step 2: Date | Full screen | Must have |
| 2 | Booking Step 3: Review & Pay | Full screen | Must have |
| 2 | Booking Confirmation | Full screen | Must have |
| 2 | Order Tracking | Full screen | Must have |
| 3 | Remedy Tracker Dashboard | Tab screen | Must have |
| 3 | Guided Mantra Player | Full screen | Must have |
| 3 | Transit Alert Detail | Full screen | Must have |
| 3 | Pandit Listing | Full screen | Must have |
| 3 | Pandit Chat/Call | Full screen | Must have |
| 3 | Post-Session Summary | Full screen | Must have |
| 4 | Siddha Store Home | Tab sub-screen | Must have |
| 4 | Product Detail | Full screen | Must have |
| 4 | Cart + Checkout | Full screen | Must have |
| 4 | Subscription Plans | Full screen | Must have |
| 4 | Family Vault | Full screen | Must have |
| 4 | Muhurta Planner | Full screen | Must have |
| 4 | Full Kundli View | Full screen | Must have |
| 4 | Me / Profile | Tab screen | Must have |
| 4 | Settings | Full screen | Must have |
| **Total** | **~35 unique screens** | | |

---

## Appendix: Key Decisions Log

| Decision | Chosen | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| Funding path | Bootstrap first (₹7-10L) | Earn the right to raise. Better valuation at ₹3-5L MRR. 10-15% equity saved | ₹3 Cr seed (too much dilution pre-traction), ₹25-50L angel (viable fallback) |
| Platform | Android + iOS (React Native) | User's primary devices in India. React Native for cross-platform efficiency | Web-first PWA (faster to ship but worse UX), Android-only (misses iOS NRI users) |
| Backend | Node.js (Express) | Same language as React Native/Next.js. Easier for 2-person team | FastAPI Python (better for ML, but adds language complexity), Next.js API routes (simpler but less scalable) |
| Database | PostgreSQL only | Start simple. JSON columns for flexible data. Add Neo4j only when knowledge graph complexity warrants it | PostgreSQL + Neo4j (premature for MVP), Supabase BaaS (too constrained) |
| LLM | Multi-provider abstraction | Flexibility to switch based on cost, quality, availability. No vendor lock-in | Single provider (risky if pricing changes or quality degrades) |
| Kundli engine | Self-hosted Swiss Ephemeris | Full control, zero per-request cost, no dependency on third-party uptime. Open source | Third-party API (faster to integrate but per-request cost and dependency) |
| Auth | Firebase Auth | Phone OTP + Google built-in. Free tier generous. Good React Native SDK | Supabase Auth (good but less mature mobile SDKs), Custom OTP (unnecessary complexity) |
| Temple supply | Build CMS early | Long-term moat. Self-serve onboarding enables scaling beyond personal visits. Khatabook playbook for temples | Manual-only onboarding (doesn't scale), Aggregate from others (no control) |

---

*This implementation plan synthesizes all requirements from: Upaya Business Plan, MVP UI Flow Specification, Competitor Analysis, Market Research, Strategic Playbook, Bootstrap Strategy, and Temple Onboarding Playbook. Every feature, screen, and decision traces back to these source documents.*

*Estimated total development timeline: 14 months from kickoff to Series A readiness.*
*Estimated total cost (bootstrap path): ₹42-72L over 14 months, offset by growing revenue from Month 2+.*
