# Architecture - RedPilot

## Overview

RedPilot is a Chrome Extension built with the [Plasmo](https://www.plasmo.com/) framework using React and TypeScript. The goal is to keep the architecture as simple as possible on Day 1 and evolve it only when necessary.

---

## Day 1 Architecture (MVP)

```
+------------------------------------+
|         Chrome Extension           |
|                                    |
|  /contents/reddit.tsx              |
|   - injectButtons()                |
|   - generateReply()                |
|   - generateIdeas()                |
|   - insertIntoTextarea()           |
|   - copyToClipboard()              |
+------------------------------------+
             |
          fetch()
             |
             v
+------------------------------------+
|         OpenAI API                 |
|  https://api.openai.com/v1/chat/   |
|  Model: gpt-4o-mini                |
+------------------------------------+
```

- **No backend.** API calls go directly from the content script to OpenAI.
- **API key** is stored in the extension for now (see [api-reference.md](api-reference.md) for risks and mitigation).
- **No data is stored** on any server or database.

---

## Data Flow

```
Reddit page loads
       |
       v
Content script injects (setInterval every 2s)
       |
       v
Detects comment elements
       |
       v
Injects [RedPilot] button if not already present
       |
  User clicks button
       |
       v
Sends comment text to OpenAI API
       |
       v
Returns 2 reply options
       |
       v
Inserts reply[0] into textarea + copies to clipboard
       |
  User edits - posts manually
```

---

## Phase 2 Architecture (Planned)

When you need to protect the API key or add user accounts, introduce a lightweight backend.

```
+------------------------------------+
|         Chrome Extension           |
+------------------------------------+
             |
          fetch (with auth token)
             |
             v
+------------------------------------+
|   Node.js Backend (Express/Hono)   |
|   - validates user token           |
|   - proxies request to OpenAI      |
|   - rate-limits per user           |
+------------------------------------+
             |
             v
+------------------------------------+
|         OpenAI API                 |
+------------------------------------+
```

Recommended backend stack:
- **Runtime:** Node.js / Bun
- **Framework:** Hono (lightweight, edge-friendly)
- **Auth:** Clerk or Supabase Auth
- **Hosting:** Railway, Render, or Fly.io

---

## File Responsibilities

| File | Responsibility |
|---|---|
| `contents/reddit.tsx` | All core logic - inject, generate, insert |
| `background/index.ts` | Service worker for future messaging or alarms |
| `popup/index.tsx` | Settings UI (API key input, tone selector) |
| `docs/` | Project documentation |

---

## Extension Manifest (Plasmo auto-generates)

Key permissions needed:

```json
{
  "permissions": ["clipboardWrite", "activeTab"],
  "host_permissions": ["https://www.reddit.com/*", "https://old.reddit.com/*"]
}
```

Plasmo handles `manifest.json` generation from `package.json` metadata - you do not edit it directly.
