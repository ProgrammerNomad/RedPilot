---
description: "Use when working on RedPilot - a Plasmo Chrome Extension targeting Reddit. Covers tech stack conventions, DOM inspection workflow, safety rules, and proactive idea expectations."
applyTo: "**"
---

# RedPilot Project Instructions

## Tech Stack

- **Framework:** [Plasmo](https://www.plasmo.com/) (do not suggest plain CRX or Webpack setups)
- **Language:** TypeScript - always strict, no `any` unless unavoidable
- **UI:** React (functional components, hooks only - no class components)
- **Target platform:** Reddit (new Reddit SPA at reddit.com)
- **AI backend:** OpenAI `gpt-4o-mini` by default; suggest `gpt-4o` only for quality-critical paths

## DOM Selector Workflow

**Never guess Reddit selectors.** Reddit's DOM changes frequently.

When selector work is needed:
1. Use `mcp_io_github_chr_take_snapshot` on the live Reddit page to get the accessibility tree
2. Use `mcp_io_github_chr_evaluate_script` to test `querySelector` calls directly in Chrome
3. Confirm the selector works before writing it into code

If Chrome DevTools MCP tools are unavailable, explicitly tell the user to open DevTools and inspect manually rather than hardcoding a potentially stale selector.

## Proactive Ideas

When completing any task, add a clearly labeled section:

> **Copilot ideas (optional):** ...

List 2-4 concrete, actionable extras that go beyond the request. Keep them short. The user will decide whether to include them.

## Safety - Non-Negotiable

RedPilot is a **human-assisted** tool, never a bot. These rules apply to all code suggestions:

- Never suggest auto-submitting, auto-clicking the Post button, or auto-liking
- Never suggest `setInterval` or cron jobs that post/comment without user action
- Always leave the human as the final actor before any content reaches Reddit
- If asked to implement automation, redirect toward a "draft + user confirms" pattern instead

## API Key Handling

- Never hardcode API keys in committed code - always use a placeholder like `"YOUR_OPENAI_API_KEY"` with a comment
- When suggesting API key storage, prefer the Plasmo storage API (`@plasmohq/storage`) for extension-scoped secrets
- In Phase 2 (backend), keys must live server-side only - never in the extension bundle

## Code Style

- Keep content script functions small and single-purpose (`injectButtons`, `generateReply`, `insertIntoTextarea` are separate)
- Use early returns to avoid nested `if` blocks
- Add `// SAFETY:` comments on any line that touches Reddit's DOM to make review easy
- Prefer `const` over `let`; avoid `var`

## Writing Style (Docs, Comments, UI Text)

- No emojis anywhere - not in docs, not in UI button text, not in comments
- Use `-` instead of `-` (no em dash, no en dash) in all written text
- Use `-` instead of `->`, `=>`, `->`, or other arrow characters in prose
- Keep tone plain and direct - no filler phrases, no hype
- No AI buzzwords: leverage, utilize, seamlessly, robust, comprehensive, foster, delve
- No hedging phrases: "It's worth noting", "It's important to remember", "One might consider"
- No filler transitions: "Additionally", "Furthermore", "Moreover", "In conclusion"
- Do not summarize at the end of a section - stop when the point is made
- Take a clear stance when there is one - do not hedge every opinion with "both sides"
- Vary sentence length - short and long sentences mixed, not all the same rhythm

## File Ownership

| File | What goes here |
|---|---|
| `contents/reddit.tsx` | All Reddit DOM logic and API calls |
| `background/index.ts` | Service worker messaging only |
| `popup/index.tsx` | Settings UI (API key, persona, tone) |

Do not put API call logic in the popup or background script - keep it in the content script.

## Documentation

Docs live in `/docs/`. When adding a new feature, note it in:
- `docs/features.md` (implementation detail)
- `docs/roadmap.md` (status checkbox)

Do not create new markdown files for individual changes unless the user asks.
