// Background service worker.
// Runs chrome.scripting.executeScript with world:"MAIN" so it can
// trigger Lexical's paste handler (trusted events from page JS world).

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.action !== "redpilot-paste") return true
  const tabId = sender?.tab?.id
  console.log("[RedPilot BG] received paste message, tabId:", tabId, "text:", msg.text?.substring(0, 30), "uid:", msg.uid)
  if (!tabId || typeof msg.text !== "string") {
    console.warn("[RedPilot BG] missing tabId or text — aborting")
    return true
  }

  const text: string = msg.text
  const uid: string = msg.uid || ""

  chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: (pasteText: string, editorUid: string) => {
      console.log("[RedPilot MAIN] executeScript running, uid:", editorUid)

      // Find the tagged editor (set by content script via data-rp-uid)
      let editor: HTMLElement | null = null

      if (editorUid) {
        editor = document.querySelector<HTMLElement>(`[data-rp-uid="${editorUid}"]`)
        editor?.removeAttribute("data-rp-uid")
        console.log("[RedPilot MAIN] found by uid:", !!editor)
      }

      // Fallback: first visible div[role="textbox"] or contenteditable
      if (!editor) {
        const SELECTOR = 'div[role="textbox"], [contenteditable="true"]:not(input):not([role="combobox"]), textarea'
        editor = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR))
          .find((e) => {
            const r = e.getBoundingClientRect()
            return r.width > 0 && r.height > 0
          }) ?? null
        console.log("[RedPilot MAIN] found by selector:", !!editor, editor?.tagName, editor?.getAttribute("role"))
      }

      if (!editor) {
        console.warn("[RedPilot MAIN] no editor found!")
        return
      }

      editor.focus()
      editor.click()

      // Try execCommand — works reliably in MAIN world with focused editor
      const ok = document.execCommand("insertText", false, pasteText)
      console.log("[RedPilot MAIN] execCommand result:", ok)
      if (ok) {
        editor.scrollIntoView({ behavior: "smooth", block: "nearest" })
        return
      }

      // Fallback: ClipboardEvent from MAIN world (Lexical listens here)
      console.log("[RedPilot MAIN] trying ClipboardEvent paste")
      const dt = new DataTransfer()
      dt.setData("text/plain", pasteText)
      editor.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        })
      )

      editor.scrollIntoView({ behavior: "smooth", block: "nearest" })
    },
    args: [text, uid],
  }).then(() => {
    console.log("[RedPilot BG] executeScript completed OK")
  }).catch((err) => {
    console.error("[RedPilot BG] executeScript FAILED:", err)
  })

  return true
})
