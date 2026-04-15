# API Reference - RedPilot

## OpenAI API

RedPilot uses the OpenAI Chat Completions endpoint.

### Endpoint

```
POST https://api.openai.com/v1/chat/completions
```

### Authentication

```
Authorization: Bearer YOUR_API_KEY
```

---

## Request - Reply Generation

```json
{
  "model": "gpt-4o-mini",
  "n": 2,
  "messages": [
    {
      "role": "system",
      "content": "You are replying on Reddit (r/subreddit).\n\nRules:\n- 2-3 lines\n- No emojis\n- Natural human tone\n- Add small personal touch\n- Be helpful, not generic"
    },
    {
      "role": "user",
      "content": "<comment text, max 1000 chars>"
    }
  ]
}
```

| Parameter | Value | Notes |
|---|---|---|
| `model` | `gpt-4o-mini` | Fast and cheap. Upgrade to `gpt-4o` for better quality. |
| `n` | `2` | Returns 2 reply candidates |
| `max_tokens` | *(not set)* | Add `"max_tokens": 150` to cap reply length |
| `temperature` | *(default 1.0)* | Lower to `0.7` for more consistent replies |

---

## Request - Post Idea Generation

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Generate 5 engaging Reddit post ideas for r/subreddit.\nMake them feel natural and discussion-driven."
    }
  ]
}
```

---

## Response Shape

```json
{
  "id": "chatcmpl-...",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Reply text here"
      },
      "finish_reason": "stop"
    },
    {
      "index": 1,
      "message": {
        "role": "assistant",
        "content": "Alternative reply text"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 95,
    "completion_tokens": 48,
    "total_tokens": 143
  }
}
```

Access replies with:
```ts
const replies = data.choices.map((c) => c.message.content)
```

---

## Recommended Prompt Engineering

The system prompt is the most important part. Use this structure:

```
Write like a real Reddit user.
- Avoid AI tone
- Be slightly opinionated
- Add light personal touch
- Give value quickly
```

Tuning tips:

| Goal | Change |
|---|---|
| Shorter replies | Add `"Keep it under 2 sentences."` |
| More technical | Add `"r/${subreddit} is a technical community."` |
| More casual | Add `"Speak casually, like a friend texting."` |
| Avoid fluff | Add `"Never start with 'Great question!' or similar."` |

---

## Model Comparison

| Model | Cost | Quality | Speed | Recommended for |
|---|---|---|---|---|
| `gpt-4o-mini` | Very low | Good | Fast | MVP / Day 1 |
| `gpt-4o` | Medium | Excellent | Medium | Phase 2 / Pro tier |
| `gpt-3.5-turbo` | Lowest | Fair | Fast | Budget fallback |

---

## API Key Security

### Day 1 (Extension only)

The API key lives in the extension code. Risks:

- Anyone who unpacks the `.crx` can read the key
- No per-user rate limiting

Mitigation for now:
- Set a **monthly spend limit** in the OpenAI dashboard
- Restrict the key to only the `chat.completions` endpoint if possible

### Phase 2 (With backend)

Move the key to a Node.js backend:

```
Extension -> your server (with user auth) -> OpenAI
```

The extension never sees the raw key. The server rate-limits per user. See [architecture.md](architecture.md) for the Phase 2 diagram.

---

## Error Handling (Recommended Additions)

```ts
async function generateReply(text: string, subreddit: string) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      // ...
    })

    if (!res.ok) {
      console.error("OpenAI error:", res.status, await res.text())
      return ["Could not generate reply. Check your API key."]
    }

    const data = await res.json()
    return data.choices.map((c: any) => c.message.content)
  } catch (err) {
    console.error("Network error:", err)
    return ["Network error. Are you online?"]
  }
}
```

Always handle failures gracefully - show a fallback message rather than leaving the button stuck on "Thinking...".
