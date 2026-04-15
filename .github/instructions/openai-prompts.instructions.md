---
description: "Use when writing or editing OpenAI API calls, system prompts, or AI-generated content in RedPilot. Covers the standard voice, prompt structure, and model selection rules."
applyTo: "contents/**"
---

# OpenAI Prompt Standards – RedPilot

## Core Voice (Apply to Every System Prompt)

All system prompts must produce replies that feel written by a real Reddit user, not an AI assistant. Always include these directives:

```
Write like a real Reddit user.
- Avoid AI tone
- Be slightly opinionated
- Add light personal touch
- Give value quickly
- No emojis
- 2-3 lines max unless the user selects "detailed"
- Never start with "Great question!", "Certainly!", or similar filler phrases
```

## Reply Prompt Template

Use this as the base for all reply-generation prompts. Customize only the variables in `{{ }}`:

```ts
{
  role: "system",
  content: `You are replying on Reddit (r/${subreddit}).

Write like a real Reddit user.
- Avoid AI tone
- Be slightly opinionated  
- Add light personal touch
- Give value quickly
- No emojis
- 2-3 lines
- Never start with filler like "Great question!" or "Certainly!"
{{TONE_OVERRIDE}}
{{STYLE_OVERRIDE}}`
}
```

Where:
- `{{TONE_OVERRIDE}}` — e.g. `"- Speak casually, like a friend texting."` or `"- Be authoritative and reference-driven."`
- `{{STYLE_OVERRIDE}}` — e.g. `"- Keep it under 2 sentences."` or `"- Write a full paragraph with context."`

Leave these blank when using defaults (casual tone, short style).

## Post Idea Prompt Template

```ts
{
  role: "system",
  content: `Generate 5 engaging Reddit post ideas for r/${subreddit}.
- Make them feel natural and discussion-driven
- No listicles or generic takes
- Each idea should invite genuine replies
- Format: one idea per line, no numbering`
}
```

## Model Selection Rules

| Use Case | Model | Reason |
|---|---|---|
| Reply generation | `gpt-4o-mini` | Fast, cheap, good enough |
| Post idea generation | `gpt-4o-mini` | Low complexity task |
| Quality-critical paths (future) | `gpt-4o` | Only when user explicitly upgrades |
| Fallback / budget mode | `gpt-3.5-turbo` | Do not default to this |

Never upgrade the model without a comment explaining why, e.g.:
```ts
// Using gpt-4o here for higher-quality persona matching (Phase 2 Pro tier)
model: "gpt-4o"
```

## Parameters

Always include these unless there is a specific reason not to:

```ts
{
  model: "gpt-4o-mini",
  n: 2,              // always get 2 options for reply generation
  max_tokens: 200,   // cap to avoid runaway outputs
  temperature: 0.85  // slightly creative but consistent
}
```

For idea generation, use `n: 1` — one well-crafted response is enough.

## Input Sanitization

Always slice comment text before sending to the API:

```ts
const text = el.innerText.slice(0, 1000)
```

Never send raw `innerHTML` — use `innerText` only to avoid injecting markup.

## Error Handling (Required on Every API Call)

```ts
if (!res.ok) {
  console.error("RedPilot API error:", res.status)
  return ["Could not generate reply. Check your API key."]
}
```

Always return a fallback string array so callers never crash on a failed response.
