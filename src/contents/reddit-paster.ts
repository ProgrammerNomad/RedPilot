import type { PlasmoCSConfig } from "plasmo"

// Paste logic moved to script-tag injection in reddit.tsx.
// Parcel's module wrapper emits `var e,t` at global scope in world:"MAIN",
// which conflicts with Reddit's own top-level `let`/`const e` declarations
// and throws a SyntaxError before any listener is registered.
// Running this file in the default isolated world avoids that conflict.
export const config: PlasmoCSConfig = {
  matches: ["https://www.reddit.com/*"]
}
