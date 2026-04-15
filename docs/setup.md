# Setup Guide – RedPilot

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| VS Code | Latest | https://code.visualstudio.com |
| Google Chrome | Latest | https://www.google.com/chrome |

---

## Step 1 – Scaffold the Project

```bash
npm create plasmo
```

When prompted:

- **Project name:** `redpilot`
- **Template:** React + TypeScript

---

## Step 2 – Install & Run Dev Mode

```bash
cd redpilot
npm install
npm run dev
```

Plasmo will build the extension into `build/chrome-mv3-dev` and watch for changes.

---

## Step 3 – Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the folder: `redpilot/build/chrome-mv3-dev`

The RedPilot extension icon will appear in your toolbar.

---

## Step 4 – Add Your OpenAI API Key

Open `contents/reddit.tsx` and replace the placeholder:

```ts
const API_KEY = "sk-..."  // your OpenAI key here
```

> **Warning:** Never commit your API key to Git. Add a `.gitignore` entry or use environment variables. See [api-reference.md](api-reference.md) for secure handling.

---

## Step 5 – Test on Reddit

1. Navigate to any Reddit thread (e.g., `reddit.com/r/learnprogramming`)
2. Wait ~2 seconds for the content script to inject
3. You should see a **RedPilot** button under each comment
4. Click it — a reply will be generated and inserted into the comment box

---

## VS Code Recommended Extensions

Install these for the best dev experience:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — optional
- **GitHub Copilot** — for selector hunting and bug fixes

---

## Build for Production

```bash
npm run build
```

Output goes to `build/chrome-mv3-prod`. Zip this folder to submit to the Chrome Web Store.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Buttons not appearing | Reload the extension in `chrome://extensions`, then hard-refresh Reddit |
| API errors | Check your API key is valid and has billing set up |
| `textarea` not found | Reddit may have updated its DOM — use DevTools to find the new selector |
| Extension not loading | Make sure you selected the correct `build/chrome-mv3-dev` folder |

---

## Environment Variables (Phase 2)

When you add a backend, use a `.env` file:

```
OPENAI_API_KEY=sk-...
```

And reference it with `process.env.OPENAI_API_KEY` in your Node.js server. Never put `.env` in the extension itself.
