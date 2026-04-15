import { Storage } from "@plasmohq/storage"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.reddit.com/*", "https://old.reddit.com/*"]
}

// ─── single source of truth ──────────────────────────────────────────────────

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
    console.error("RedPilot API error:", res.status, await res.text())
    return ["Could not generate reply. Check your API key."]
  }

  const data = await res.json()
  return data.choices.map((c: any) => c.message.content as string)
}

function getSubreddit(): string {
  return window.location.pathname.split("/")[2] ?? ""
}

function createButton(label: string, className: string): HTMLButtonElement {
  const btn = document.createElement("button")
  btn.innerText = label
  btn.className = className
  btn.style.cssText = `
    margin-top: 6px;
    margin-right: 6px;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid #ff4500;
    background: transparent;
    color: #ff4500;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  `
  return btn
}

// ─── reply generation ─────────────────────────────────────────────────────────

async function generateReply(
  text: string,
  subreddit: string
): Promise<string[]> {
  return callOpenAI(
    [
      {
        role: "system",
        content: `You are replying on Reddit (r/${subreddit}). Write like a person, not an assistant.

- Jump straight into the point - no setup sentence
- 2-3 lines max
- No emojis
- Be slightly opinionated rather than perfectly neutral
- Add a personal angle when it fits naturally
- Fine to only partially answer - do not feel the need to cover everything
- Never say: Great question, Certainly, Absolutely, Of course, It is worth noting
- Never use: leverage, utilize, seamlessly, robust, comprehensive
- No summary sentence at the end
- Mix short and longer sentences`
      },
      { role: "user", content: text }
    ],
    2
  )
}

// ─── insert / copy ────────────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    console.error("RedPilot: clipboard write failed")
  })
}

function insertIntoTextarea(text: string, commentEl: Element) {
  // SAFETY: scope to the clicked comment element first, fall back to page
  const textarea =
    commentEl.querySelector<HTMLTextAreaElement>("textarea") ??
    document.querySelector<HTMLTextAreaElement>("textarea")

  if (!textarea) return
  textarea.focus()
  textarea.value = text
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
  textarea.dispatchEvent(new Event("change", { bubbles: true }))
}

// ─── reply UI card ────────────────────────────────────────────────────────────

function showReplyCard(
  replies: string[],
  commentEl: Element,
  anchorBtn: HTMLButtonElement
) {
  // remove any existing card
  document.querySelector(".redpilot-card")?.remove()

  const card = document.createElement("div")
  card.className = "redpilot-card"
  card.style.cssText = `
    margin-top: 8px;
    padding: 10px;
    border: 1px solid #ff4500;
    border-radius: 6px;
    background: #fff;
    max-width: 540px;
    font-family: inherit;
    font-size: 13px;
    z-index: 9999;
    position: relative;
  `

  replies.forEach((reply, i) => {
    const label = document.createElement("div")
    label.innerText = `Option ${i + 1}`
    label.style.cssText = "font-weight: 700; margin-bottom: 4px; color: #333;"

    const text = document.createElement("div")
    text.innerText = reply
    text.style.cssText = "margin-bottom: 6px; color: #222; line-height: 1.5;"

    const insertBtn = createButton("Insert", `redpilot-insert-${i}`)
    insertBtn.onclick = () => {
      // SAFETY: inserts into Reddit's comment textarea
      insertIntoTextarea(reply, commentEl)
      copyToClipboard(reply)
      card.remove()
      anchorBtn.innerText = "RedPilot"
    }

    const sep = document.createElement("hr")
    sep.style.cssText = "border: none; border-top: 1px solid #eee; margin: 8px 0;"

    card.appendChild(label)
    card.appendChild(text)
    card.appendChild(insertBtn)
    if (i < replies.length - 1) card.appendChild(sep)
  })

  // SAFETY: card injected after the button in Reddit's DOM
  anchorBtn.insertAdjacentElement("afterend", card)
}

// ─── button injection ─────────────────────────────────────────────────────────

function injectButtons() {
  const subreddit = getSubreddit()

  // SAFETY: querying Reddit's comment elements
  const comments = document.querySelectorAll(
    "div[data-testid='comment'], shreddit-comment"
  )

  comments.forEach((el) => {
    if (el.querySelector(".redpilot-btn")) return

    // SAFETY: button appended into Reddit's comment DOM
    const btn = createButton("RedPilot", "redpilot-btn")

    btn.onclick = async () => {
      document.querySelector(".redpilot-card")?.remove()
      btn.innerText = "Thinking..."
      btn.style.opacity = "0.6"

      const text = (el as HTMLElement).innerText.slice(0, 1000)
      const replies = await generateReply(text, subreddit)

      btn.innerText = "RedPilot"
      btn.style.opacity = "1"

      showReplyCard(replies, el, btn)
    }

    el.appendChild(btn)
  })
}

// ─── post idea generator ──────────────────────────────────────────────────────

async function generateIdeas(subreddit: string): Promise<string> {
  const results = await callOpenAI([
    {
      role: "system",
      content: `Generate 5 Reddit post ideas for r/${subreddit}.
- Write them as a real user would think of them, not a content strategist
- No listicles, no generic takes
- Each idea should start a real argument or share something specific
- One idea per line, no numbering, no labels`
    }
  ])
  return results[0]
}

function injectIdeaButton() {
  if (document.querySelector(".redpilot-idea-btn")) return

  // SAFETY: floating button appended to Reddit's body
  const btn = createButton("Ideas", "redpilot-idea-btn")
  btn.style.cssText += `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    padding: 10px 16px;
    border-radius: 8px;
    background: #ff4500;
    color: #fff;
    border: none;
    font-weight: bold;
    font-size: 13px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `

  btn.onclick = async () => {
    btn.innerText = "Loading..."
    const ideas = await generateIdeas(getSubreddit())
    btn.innerText = "Ideas"
    alert(ideas) // Phase 2: replace with a proper modal
  }

  document.body.appendChild(btn)
}

// ─── main loop ────────────────────────────────────────────────────────────────

export default function RedPilot() {
  useEffect(() => {
    injectIdeaButton()
    const interval = setInterval(injectButtons, 2000)
    return () => clearInterval(interval)
  }, [])

  return null
}
