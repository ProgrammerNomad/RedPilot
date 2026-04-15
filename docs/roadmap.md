# Roadmap – RedPilot

## Phase 1 – MVP (Day 1)

**Goal:** Working extension, usable on Reddit today.

- [x] Plasmo project scaffold (React + TypeScript)
- [x] Content script injecting AI Reply buttons on comments
- [x] OpenAI `gpt-4o-mini` integration (direct from extension)
- [x] Auto-fill comment textarea with generated reply
- [x] Copy reply to clipboard as fallback
- [x] Floating Post Idea Generator button
- [x] 2-second polling loop for dynamic Reddit SPA

---

## Phase 2 – Polish (Week 1–2)

**Goal:** Make it feel like a real product.

- [ ] Multiple reply options UI — show both AI replies, let user pick
- [ ] Reply style selector — Short / Detailed
- [ ] Tone selector — Casual / Expert / Technical
- [ ] Styled buttons (match Reddit's design language)
- [ ] Loading spinner instead of "Thinking..." text
- [ ] Error handling with user-visible feedback
- [ ] Popup settings panel (API key input, persona config)
- [ ] User-defined persona injected into system prompt

---

## Phase 3 – Security & Scale (Month 1)

**Goal:** Protect the API key, support multiple users.

- [ ] Node.js / Hono backend to proxy OpenAI requests
- [ ] API key moved server-side (never exposed in extension)
- [ ] User authentication (Clerk or Supabase Auth)
- [ ] Per-user rate limiting
- [ ] Usage tracking per user
- [ ] Deploy backend to Railway or Fly.io

---

## Phase 4 – Intelligence (Month 2–3)

**Goal:** Context-aware replies that feel more human.

- [ ] Pull subreddit rules and inject them into the system prompt automatically
- [ ] Analyze comment thread context (not just the single comment) for better replies
- [ ] Detect post topic and adjust tone automatically
- [ ] "Remember my style" — learn from replies the user keeps vs. discards
- [ ] Reply history to avoid repeating similar content

---

## Phase 5 – Tracking & Dashboard (Month 3+)

**Goal:** Understand your Reddit presence and grow it.

- [ ] Keyword tracker — monitor mentions of topics you care about
- [ ] Subreddit activity dashboard — where are you posting most?
- [ ] Upvote rate tracking — which AI-assisted replies perform best?
- [ ] Notification system — alert when tracked keywords appear in threads
- [ ] Weekly digest email with performance summary

---

## Phase 6 – Monetization (When Ready)

**Goal:** Make RedPilot sustainable.

Options to evaluate:

| Model | Notes |
|---|---|
| Freemium | Free tier (10 replies/day), Pro tier unlimited |
| Subscription | $9–19/month for full access |
| API key passthrough | User brings their own key (free to run) |
| One-time purchase | Via Gumroad or LemonSqueezy |

Chrome Web Store listing required for public distribution.

---

## Ideas Backlog (Nice to Have)

These are good ideas that don't fit current phases but are worth keeping:

- **Reddit trend detector** — surface rising posts in tracked subreddits before they get crowded
- **Competitor mention alerts** — notify when a brand or topic you track is mentioned
- **Auto-draft mode** — generate a reply draft in the background as you read a thread, ready when you reach the bottom
- **Subreddit persona library** — save different tones per subreddit (e.g., formal in r/law, casual in r/gaming)
- **Export replies** — download a CSV of all generated replies for review
- **Firefox port** — extend beyond Chrome using WebExtensions API

---

## Current Milestone

**Phase 1 – MVP**

Build it. Use it. Ship it.
