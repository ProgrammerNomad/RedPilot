# Features - RedPilot

All core logic lives in `contents/reddit.tsx`.

---

## Feature 1 - AI Reply Button

### What it does
Injects a **RedPilot** button under every Reddit comment. On click, it sends the comment text to OpenAI and generates a contextual reply, then inserts it directly into the textarea.

### Code

```ts
import { useEffect } from "react"

const API_KEY = "YOUR_OPENAI_API_KEY"

async function generateReply(text: string, subreddit: string): Promise<string[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      n: 2,
      messages: [
        {
          role: "system",
          content: `You are replying on Reddit (r/${subreddit}).

Rules:
- 2-3 lines
- No emojis
- Natural human tone
- Add small personal touch
- Be helpful, not generic`
        },
        { role: "user", content: text }
      ]
    })
  })

  const data = await res.json()
  return data.choices.map((c: any) => c.message.content)
}

function injectButtons() {
  const subreddit = window.location.pathname.split("/")[2]
  const comments = document.querySelectorAll("div[data-testid='comment']")

  comments.forEach((el) => {
    if (el.querySelector(".ai-btn")) return

    const btn = document.createElement("button")
    btn.innerText = "RedPilot"
    btn.className = "ai-btn"
    btn.style.marginTop = "6px"

    btn.onclick = async () => {
      const text = el.innerText.slice(0, 1000)
      btn.innerText = "Thinking..."

      const replies = await generateReply(text, subreddit)
      const selected = replies[0]

      copyToClipboard(selected)
      insertIntoTextarea(selected)

      btn.innerText = "Ready - done"
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
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Generate 5 engaging Reddit post ideas for r/${subreddit}.
Make them feel natural and discussion-driven.`
        }
      ]
    })
  })

  const data = await res.json()
  return data.choices[0].message.content
}

// Mount the floating button
const ideaBtn = document.createElement("button")
ideaBtn.innerText = "Ideas"
ideaBtn.style.position = "fixed"
ideaBtn.style.bottom = "20px"
ideaBtn.style.right = "20px"
ideaBtn.style.zIndex = "99999"
ideaBtn.style.padding = "10px 16px"
ideaBtn.style.borderRadius = "8px"
ideaBtn.style.background = "#ff4500"
ideaBtn.style.color = "#fff"
ideaBtn.style.border = "none"
ideaBtn.style.cursor = "pointer"
ideaBtn.style.fontWeight = "bold"

ideaBtn.onclick = async () => {
  const subreddit = window.location.pathname.split("/")[2]
  const ideas = await generateIdeas(subreddit)
  alert(ideas) // replace with a proper modal in Phase 2
}

document.body.appendChild(ideaBtn)
```

---

## Planned Features

### Reply Style Selector
A small UI (in the popup or inline) letting you pick:
- **Short** - 1-2 sentences
- **Detailed** - full paragraph with context

### Tone Selector
- **Casual** - conversational, relaxed
- **Expert** - authoritative, cite-heavy

### Multiple Reply Options UI
Instead of auto-picking `replies[0]`, show both replies in a small card and let the user click the one they want.

### Smart Prompt Customization
Allow users to set a persistent "persona" in the popup (e.g., "software engineer who likes hiking") that gets injected into the system prompt for more personalized replies.
