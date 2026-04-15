import { Storage } from "@plasmohq/storage"
import { useEffect, useState } from "react"

const storage = new Storage()

function IndexPopup() {
  const [key, setKey] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    storage.get("openai_key").then((val) => {
      if (val) setKey(val as string)
    })
  }, [])

  async function save() {
    const trimmed = key.trim()
    if (!trimmed) return
    await storage.set("openai_key", trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function clear() {
    await storage.remove("openai_key")
    setKey("")
    setSaved(false)
  }

  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      width: 320,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      <div style={{ fontWeight: 700, fontSize: 15 }}>RedPilot</div>
      <div style={{ fontSize: 13, color: "#555" }}>
        Your key is stored only in this browser. It is never sent anywhere except
        directly to OpenAI.
      </div>
      <label style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>
        OpenAI API Key
      </label>
      <input
        type="password"
        value={key}
        onChange={(e) => { setKey(e.target.value); setSaved(false) }}
        placeholder="sk-..."
        style={{
          padding: "8px 10px",
          border: "1px solid #ccc",
          borderRadius: 4,
          fontSize: 13,
          fontFamily: "monospace"
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={save}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "#ff4500",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer"
          }}>
          {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={clear}
          style={{
            padding: "8px 12px",
            background: "transparent",
            color: "#999",
            border: "1px solid #ddd",
            borderRadius: 4,
            fontSize: 13,
            cursor: "pointer"
          }}>
          Clear
        </button>
      </div>
      {key && !saved && (
        <div style={{ fontSize: 11, color: "#888" }}>
          Key loaded - click Save to update.
        </div>
      )}
    </div>
  )
}

export default IndexPopup
