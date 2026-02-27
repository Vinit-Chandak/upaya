# Upaya — Design Philosophy

> This document defines the visual language, icon system, and design principles for Upaya.
> It should be consulted before any UI work is done.

---

## The Core Identity

Upaya is not an astrology app. It is a **spiritual problem-solving companion** — the first time
someone's journey from "I have a problem" to "here's proof your remedy was performed" happens
in one place.

The person using Upaya is in distress. They are not browsing. They are not entertained.
They are a 28-year-old whose marriage has been delayed for three years, or a father whose
business is failing, or a mother whose son can't find a job. They have come to Upaya as a
last resort or a trusted companion.

**Every design decision must honor that moment.**

---

## The Central Tension

Upaya sits at the intersection of two worlds that almost never meet:

```
ANCIENT                          MODERN
─────────────────────────────────────────
Vedic astrology (5000 years)     AI / smartphone
Sanskrit / Devanagari            English / Roman
Temple stone & flame             Clean interfaces
Reverence, ritual                Speed, precision
Oral tradition                   Structured data
```

Our design does not choose one side. It fuses both — cleanly, without kitsch.

**The visual metaphor:** A beautifully maintained temple with clean stone floors, gold lamp flame,
and open sky. Simple. Intentional. Sacred. Every element is there for a reason.

---

## The Five Pillars

### 1. Sacred Minimalism

Clean layouts. Deep breathing room. No visual noise.

A temple does not have billboards on its walls. Neither does Upaya.
- Information is revealed progressively — not dumped on screen
- One primary action per screen
- Generous padding. Users should feel calm, not overwhelmed
- Cards, sections, and text blocks should feel like deliberate compositions, not assembled lists

**What this rules out:** Feature carousels, cluttered dashboards, competing CTAs on the same screen,
badge counts on everything.

---

### 2. Earned Gold

Saffron and gold are sacred colors. They should feel that way in the product.

If everything is saffron, nothing is saffron. These colors are reserved:
- **Saffron (`#FF8C00`):** The one primary action on a screen. CTA buttons, the send arrow,
  the "Generate Kundli" button. One fire per screen.
- **Gold (`#D4A017`):** Revelation moments. Diagnosis results. Remedy titles. Premium insights.
  The moment when the AI speaks truth to the user.
- **Maroon (`#4A0E0E`):** Foundation. Navigation titles, header text, trust-bearing UI elements.
  The stone of the temple.
- **Cream (`#FFF8F0`):** The sacred space where conversation happens. AI message bubbles,
  card backgrounds, soft containers.
- **Deep Space (`#1A0A2E`):** The cosmic backdrop. Kundli animation, full-screen immersive
  moments, night sky. Used only where it earns its weight.

Everything else is neutral — greys and whites. They exist to make the above colors matter.

---

### 3. The Icon Language

**The current problem:** The app uses 35+ generic emojis as icons. This makes Upaya look like
a WhatsApp group, not a trusted platform. Emojis carry no brand identity. They are inconsistent
across Android versions. They signal "I used what was easy."

**The rule:** There are exactly two types of visual symbols in Upaya.

#### Type A — Functional UI Icons
For navigation, form fields, controls, and actions.
These should be **vector line icons** — thin stroke (1.5px), rounded ends, consistent sizing.
Think Material Symbols (outlined) or Phosphor Icons. Clean, neutral, precise.

| Current (emoji) | Replace with |
|---|---|
| `←` back arrow | Line icon: arrow-left |
| `⋮` menu | Line icon: dots-three-vertical |
| `📅` date field | Line icon: calendar |
| `🕐` time field | Line icon: clock |
| `📍` location | Line icon: map-pin |
| `🔔` notification | Line icon: bell |
| `🌐` language | Line icon: globe |
| `👤` profile | Line icon: person |
| `🔒` paywall lock | Line icon: lock |
| `➤` send button | Line icon: arrow-right or paper-plane |

These icons are **invisible when they work**. The user should never notice them —
they should just understand where to look.

#### Type B — Spiritual Identity Icons
For the AI avatar, problem types, remedy types, and spiritual moments.
These should be **custom stylized symbols** drawn from Vedic visual tradition.
Not clipart. Not emojis. Intentional, simplified forms.

| Element | Visual Direction |
|---|---|
| AI Avatar (currently 🙏) | A stylized diya flame — flame above a small base. Simple 2-tone. |
| Mantra remedy | Om symbol (ॐ) in gold, not 📿 prayer beads |
| Fasting remedy | A simple sun arc — dawn to dusk |
| Daan remedy | Cupped hands receiving — simple line form |
| Kundli / chart | Yantra grid — square-within-square with a dot center |
| Marriage problem | Interlocked circles (not 💍 ring) |
| Career problem | An ascending step/ladder (not 💼 briefcase) |
| Money problem | A rising line within a circle (not 💰 bag) |
| Temple | Shikara arch form (not 🛕 emoji) |
| Completion / success | Lotus in bloom (not ✓ or 🌟) |

In Phase 1, these can be implemented as SVG components or unicode substitutes.
The important thing is the direction — not 🔮 crystal ball for "something else."

---

### 4. Typography as Voice

Upaya speaks in two registers:

**Hindi (Devanagari):** Authoritative, warm, like a wise pandit.
- Use medium/semibold weight. Thin Devanagari looks weak and untrustworthy.
- Line height: 1.6–1.8× for Devanagari (it needs more room than Latin text)
- Never shrink Hindi to fit an English-designed layout. Design the layout for the Hindi text.

**English (Latin):** Clean, calm, precise.
- Use regular/medium weight for body, semibold for headings
- Not technical, not casual — measured

**The mix is intentional.** When the AI says "शादी में देरी — मैं समझता हूँ" with "समझता" in
Devanagari and "delay" in Roman, that is how modern Hindi-speaking Indians actually think and
speak. Mirror their voice. Don't force one script.

---

### 5. Motion as Ritual

Animation is not decoration. In Upaya, motion should feel like ritual — deliberate, meaningful,
never rushed.

| Moment | Motion Direction |
|---|---|
| Kundli generation | Slow celestial — wheels turn like planets orbit. Already correct. |
| Diagnosis reveal | Fade-in progressive — like pulling back a veil, not a pop-in |
| Message arrival | Gentle slide from below — 200ms, ease-out. Not bounce. |
| Screen transitions | Push (not slide) — like turning a page of a sacred text |
| CTA tap feedback | Subtle saffron pulse — 150ms. Confirms the action was received. |
| Error states | No shake/jitter — a quiet red border. The tone is calm even in failure. |

**What this rules out:** Bounce animations. Confetti effects. Spinning loaders with no context.
Anything that feels like a game.

---

## What Upaya Is NOT Visually

This is as important as what it is.

| Not this | Because |
|---|---|
| Purple + stars + moon (Western astrology aesthetic) | We are Vedic, not Western. Saffron and gold, not purple and silver. |
| Busy festival decoration | Diwali graphics belong at Diwali. Our user is in distress, not celebration. |
| Generic fintech / healthtech | Cold blues and clean whites signal banking or medicine. Not what we are. |
| Spiritual kitsch (lots of deities, incense smoke GIFs) | Reverence comes from restraint, not abundance of religious imagery. |
| Trendy startup aesthetic (gradient blobs, 3D icons) | This needs to feel trusted across generations — from 25 to 65. |

---

## Screens Reference

### Light Mode (Conversation / Action spaces)
- Background: `#FFFFFF` (pure white) or `#FFF8F0` (cream)
- Text: `colors.neutral.grey800` (`#1C1C1E`) for body, `colors.secondary.maroon` for headings
- Interactive: `colors.primary.saffron`
- Used for: Chat, birth details form, home screen, diagnosis cards

### Dark Mode (Immersive / Cosmic spaces)
- Background: `#1A0A2E` (deep cosmic)
- Text: `rgba(255,255,255,0.9)` for primary, `rgba(255,255,255,0.6)` for secondary
- Interactive: `colors.accent.gold`
- Used for: Kundli animation, full-screen reveals — sparingly

### Diagnosis / Results
- Background: `#FFFFFF` with gold left-border accents
- Dosha level colors:
  - Significant: `#FF6B00` (saffron-orange)
  - Moderate: `#F59E0B` (amber)
  - Mild: `#10B981` (sage green)
- Remedy cards: Cream background `#FFF8F0` with gold top border

---

## Implementation Priority

| Priority | What | Impact |
|---|---|---|
| 1 — Immediate | Replace 🙏 AI avatar with a diya icon component | Every screen, high brand impact |
| 2 — Immediate | Replace form field emojis (📅 🕐 📍 📋) with line icons | Chat + forms |
| 3 — Near-term | Replace problem type emojis with custom symbols | Home screen |
| 4 — Near-term | Replace remedy type emojis with Vedic symbols | Diagnosis screen |
| 5 — Later | Refine color usage — consolidate hardcoded values into tokens | Codebase hygiene |
| 6 — Later | Typography audit — Devanagari line heights and weights | Hindi readability |

---

## The Test

Before shipping any screen, ask:

1. **Does it feel calm?** The user is in distress. The design should not add to that.
2. **Does it feel trusted?** Would a 55-year-old in Lucknow trust this? Would a 28-year-old engineer in Bangalore?
3. **Does it feel Indian?** Not generic. Not Western-astrology. Not generic-Indian-festival.
   Specifically Vedic, specifically warm, specifically ours.
4. **Is gold earning its place?** If everything is gold, nothing is gold.
5. **Would this feel at home in a well-designed temple?** Sacred minimalism.
   If yes — proceed.
