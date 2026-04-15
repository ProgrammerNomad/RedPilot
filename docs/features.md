# Features - RedPilot

All core logic lives in `contents/reddit.tsx`.

---

## Shared Utilities (Single Source of Truth)

These functions exist once and are used by every feature. Never duplicate their logic inline.

### callOpenAI

All API calls go through this one function. Adding a new feature that needs the API means calling this, not writing a new `fetch` block.

The key is read at call time from `chrome.storage.local` via `@plasmohq/storage`. No key is ever hardcoded.

```ts
const storage = new Storage()

async function getApiKey(): Promise<string> {
  const key = await storage.get("openai_key")
  return (key as string) ?? ""
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  n = 1
): Promise<string[]> {
  const apiKey = await getApiKey()
  if (!apiKey) {
    return ["No API key set. Click the RedPilot icon in your toolbar to add one."]
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      n,
      max_tokens: 200,
      temperature: 0.9,
      messages
    })
  })

  if (!res.ok) {
    console.error("RedPilot API error:", res.status)
    return ["Could not generate reply. Check your API key."]
  }

  const data = await res.json()
  return data.choices.map((c: any) => c.message.content)
}
```

### getSubreddit

One place to read the subreddit from the URL. If Reddit ever changes its URL structure, fix it here and everything else works.

```ts
function getSubreddit(): string {
  return window.location.pathname.split("/")[2] ?? ""
}
```

### createButton

One place for button DOM creation. Consistent class and base styles across all injected buttons.

```ts
function createButton(label: string, className: string): HTMLButtonElement {
  const btn = document.createElement("button")
  btn.innerText = label
  btn.className = className
  btn.style.marginTop = "6px"
  btn.style.cursor = "pointer"
  return btn
}
```

---

## Feature 1 - AI Reply Button

### What it does
Injects a **RedPilot** button under every Reddit comment. On click, it sends the comment text to OpenAI and generates a contextual reply, then inserts it directly into the textarea.

### Code

```ts
import { useEffect } from "react"

async function generateReply(text: string, subreddit: string): Promise<string[]> {
  return callOpenAI(
    [
      {
        role: "system",
        content: `You are replying on Reddit (r/${subreddit}). Write like a person, not an assistant.

- Jump straight into the point
- 2-3 lines max
- No emojis
- Be slightly opinionated
- Never use filler like "Great question!" or "Certainly!"`
      },
      { role: "user", content: text }
    ],
    2 // n=2 to get two reply options
  )
}

function injectButtons() {
  const subreddit = getSubreddit()
  const comments = document.querySelectorAll("div[data-testid='comment']")

  comments.forEach((el) => {
    if (el.querySelector(".ai-btn")) return

    // SAFETY: button is injected into Reddit's DOM
    const btn = createButton("RedPilot", "ai-btn")

    btn.onclick = async () => {
      const text = el.innerText.slice(0, 1000)
      btn.innerText = "Thinking..."

      const replies = await generateReply(text, subreddit)
      const selected = replies[0]

      copyToClipboard(selected)
      insertIntoTextarea(selected, el)

      btn.innerText = "Ready"
    }

    el.appendChild(btn)
  })
}
```

### Why `n: 2`?
Requesting 2 completions gives you options to pick from. Currently `replies[0]` is used automatically. The planned Multiple Reply UI will let you pick.

---

## Feature 2 - Auto-Fill Textarea

### What it does
Inserts the generated reply directly into Reddit's comment textarea, so you can review and post immediately.

```ts
function insertIntoTextarea(text: string) {
  const textarea = document.querySelector("textarea")

  if (textarea) {
    textarea.value = text
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
  }
}
```

> The `dispatchEvent` call is required to trigger React's synthetic event system on Reddit's textarea. Without it, the submit button stays disabled.

### Selector note
Reddit's DOM changes occasionally. If `textarea` stops working, open DevTools on Reddit, click in the comment box, and inspect the element to find the updated selector.

---

## Feature 3 - Copy to Clipboard

```ts
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
```

Both copy and insert happen simultaneously. The clipboard acts as a backup in case the textarea insertion fails.

---

## Feature 4 - Polling Loop (Dynamic DOM)

Reddit is a React SPA - comments load without full page reloads. The injection loop handles this:

```ts
export default function () {
  useEffect(() => {
    setInterval(injectButtons, 2000)
  }, [])

  return null
}
```

Every 2 seconds, `injectButtons` checks for new comment elements and skips any that already have a `.ai-btn` button.

---

## Feature 5 - Post Idea Generator (Floating Button)

### What it does
A fixed floating button appears on any subreddit page. Click it to get 5 fresh post ideas tailored to that community.

```ts
async function generateIdeas(subreddit: string): Promise<string> {
  const results = await callOpenAI([
    {
      role: "system",
      content: `Generate 5 Reddit post ideas for r/${subreddit}.
- Write them as a real user would think of them, not as a content strategist
- No listicles, no generic takes
- Each idea should start a real argument or share something specific
- One idea per line, no numbering`
    }
  ])
  return results[0]
}

// SAFETY: floating button appended to Reddit's body
const ideaBtn = createButton("Ideas", "redpilot-idea-btn")
ideaBtn.style.position = "fixed"
ideaBtn.style.bottom = "20px"
ideaBtn.style.right = "20px"
ideaBtn.style.zIndex = "99999"
ideaBtn.style.padding = "10px 16px"
ideaBtn.style.borderRadius = "8px"
ideaBtn.style.background = "#ff4500"
ideaBtn.style.color = "#fff"
ideaBtn.style.border = "none"
ideaBtn.style.fontWeight = "bold"

ideaBtn.onclick = async () => {
  const ideas = await generateIdeas(getSubreddit())
  alert(ideas) // replace with a proper modal in Phase 2
}

document.body.appendChild(ideaBtn)
```
}

document.body.appendChild(ideaBtn)
```

---

## Planned Features

### Multiple Reply Options UI (Priority 1)

Instead of auto-picking `replies[0]`, show both replies in a small inline card:

```
+---------------------------+
| Option A                  |
| [reply text...]           |
| [Insert]                  |
+---------------------------+
| Option B                  |
| [reply text...]           |
| [Insert]                  |
+---------------------------+
```

This is the single biggest quality upgrade - the user sees both and picks the better one.

### Better Insert Targeting (Priority 2)

The current `querySelector('textarea')` grabs the first textarea on the page, which may not be the right comment box. The fix is to scope the search to the comment element that was clicked:

```ts
function insertIntoTextarea(text: string, commentEl: Element) {
  // SAFETY: scope search to the clicked comment, not the whole page
  const textarea = commentEl.querySelector("textarea")
    ?? commentEl.closest("[data-testid='comment']")?.querySelector("textarea")

  if (!textarea) return
  textarea.value = text
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
}
```

Use MCP `evaluate_script` on a live Reddit thread to verify the correct scoping before finalizing selectors.

### Subreddit Tone Override (Priority 3)

A configurable map that adjusts the system prompt tone per subreddit:

```ts
const SUBREDDIT_TONES: Record<string, string> = {
  programming: "Be technical and direct. Skip social filler.",
  india: "Keep it casual and conversational.",
  investing: "Be measured. Reference data when possible.",
  // user can add more in popup settings
}
```

Inject the matching string as `{{TONE_OVERRIDE}}` in the system prompt.

### Quick Improve Button

A second button that appears when the user has already typed something in a comment box. Click it to rewrite what they typed - not generate from scratch, but improve their existing draft.

```ts
async function improveExistingReply(draft: string, subreddit: string) {
  // uses same API call but different system prompt:
  // "Rewrite this Reddit comment to sound more natural and less AI-written.
  //  Keep the same point. Do not change the meaning."
}
```

### Reply Style Selector

A small UI letting you pick before generating:
- **Short** - 1-2 sentences
- **Detailed** - full paragraph with context

### Smart Prompt Customization

Allow users to set a persistent persona in the popup (e.g., "software engineer who likes hiking") that gets injected into the system prompt for more personalized replies.
