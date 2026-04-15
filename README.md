# RedPilot - Reddit AI Copilot

> A Chrome Extension that helps you write better Reddit replies faster - powered by AI, built for humans.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Chrome-yellow)
![Stack](https://img.shields.io/badge/stack-Plasmo%20%7C%20React%20%7C%20TypeScript-blueviolet)

---

## What is RedPilot?

RedPilot is a Chrome extension that sits on Reddit and gives you an AI-powered reply button under every comment. It generates human-like, contextually relevant replies using OpenAI - you review, edit slightly, and post. That's it.

This is **not a bot**. It is a **thinking assistant** - you stay in full control of every post.

---

## Goals

- Generate human-like replies that feel native to each subreddit
- Help you post faster without automating the posting itself
- Suggest fresh post ideas per subreddit
- Stay completely safe from Reddit bans

---

## Quick Start

```bash
# Prerequisites: Node.js, VS Code, Chrome
npm create plasmo
# Select: React + TypeScript
# Name: redpilot

cd redpilot
npm run dev
```

Then load the `build/chrome-mv3-dev` folder as an unpacked extension in Chrome.

See [docs/setup.md](docs/setup.md) for the full setup guide.

---

## Architecture

```
RedPilot (Chrome Extension)
   |
Content Script - runs on Reddit pages
   |
OpenAI API - gpt-4o-mini (direct, no backend on Day 1)
```

No backend required to get started. See [docs/architecture.md](docs/architecture.md) for the full diagram and upgrade path.

---

## Project Structure

```
/contents/reddit.tsx      - main logic (inject buttons, call API)
/background/index.ts      - optional service worker
/popup/index.tsx          - optional settings UI
/docs/                    - full project documentation
```

---

## Core Features

| Feature | Status |
|---|---|
| AI Reply Button on every comment | MVP |
| Auto-fill comment textarea | MVP |
| Copy reply to clipboard | MVP |
| Floating Post Idea Generator | MVP |
| Reply style selector (short / detailed) | Planned |
| Tone selector (casual / expert) | Planned |
| Multiple reply options UI | Planned |
| Backend key protection | Planned |
| Keyword tracking dashboard | Future |

See [docs/features.md](docs/features.md) for implementation details.

---

## Safety Rules

| Never | Always |
|---|---|
| Auto-comment | Edit replies slightly before posting |
| Auto-post | Keep the human touch |
| Reuse the same reply | Vary your language per thread |

See [docs/safety.md](docs/safety.md) for full guidelines.

---

## Documentation

| File | Description |
|---|---|
| [docs/setup.md](docs/setup.md) | Installation & dev environment |
| [docs/architecture.md](docs/architecture.md) | System design & upgrade path |
| [docs/features.md](docs/features.md) | Feature breakdown with code |
| [docs/api-reference.md](docs/api-reference.md) | OpenAI API usage reference |
| [docs/safety.md](docs/safety.md) | Reddit safety & ban prevention |
| [docs/roadmap.md](docs/roadmap.md) | MVP to next level plan |

---

## Daily Workflow

1. Open Reddit
2. Click **RedPilot** under any comment
3. Get an AI-generated reply
4. Edit slightly to make it yours
5. Post

Fast. Safe. Scalable.

---

## License

MIT
