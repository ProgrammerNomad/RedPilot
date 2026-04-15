// Service worker - handles paste injection into Reddit's Lexical editor.
// chrome.scripting.executeScript with world:"MAIN" bypasses Reddit's CSP
// because the script comes from the extension, not inline page code.

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.action !== "redpilot-paste") return
  const tabId = sender?.tab?.id
  if (!tabId || typeof msg.text !== "string") return

  const text: string = msg.text
  const targetId: string = msg.targetId || ""

  // SAFETY: func runs in main world - DataTransfer is accessible to Lexical
  chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: (pasteText: string, tId: string) => {
      let root: Document | Element = document

      // Find the specific comment container if tagged
      if (tId) {
        const targetContainer = document.querySelector<HTMLElement>(`[data-redpilot-target="${tId}"]`)
        if (targetContainer) {
          root = targetContainer
          targetContainer.removeAttribute("data-redpilot-target")
        }
      }

      const all = Array.from(
        root.querySelectorAll<HTMLElement>(
          '[contenteditable="true"][data-lexical-editor="true"]'
        )
      )
      
      let editor =
        all.find((el) => {
          const r = el.getBoundingClientRect()
          const p = el.getAttribute("aria-placeholder") ?? ""
          return r.width > 0 && p.toLowerCase().includes("reply")
        }) ?? all.find((el) => el.getBoundingClientRect().width > 0)

      // Fallback to searching the whole document if the editor rendered outside the comment block (e.g. portal)
      if (!editor && root !== document) {
         const globalAll = Array.from(document.querySelectorAll<HTMLElement>('[contenteditable="true"][data-lexical-editor="true"]'));
         editor = globalAll.find(el => el.getBoundingClientRect().width > 0);
      }

      if (!editor) return

      editor.focus()
      const dt = new DataTransfer()
      dt.setData("text/plain", pasteText)
      editor.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: dt
        })
      )
      editor.scrollIntoView({ behavior: "smooth", block: "nearest" })
    },
    args: [text, targetId]
  })
})
