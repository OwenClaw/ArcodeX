import { PartID } from "@/session/schema"
import type { Part } from "@opencode-ai/sdk/v2"
import type { PromptInfo } from "./history"

type Item = PromptInfo["parts"][number]

export function strip(part: Item & { id: string; messageID: string; sessionID: string }): Item {
  const { id: _id, messageID: _messageID, sessionID: _sessionID, ...rest } = part
  return rest
}

export function assign(part: Item): Item & { id: PartID } {
  return {
    ...part,
    id: PartID.ascending(),
  }
}

export function expandPastedTextPlaceholders(text: string, parts: PromptInfo["parts"]) {
  return parts.reduce((result, part) => {
    if (part.type !== "text" || !part.source?.text) return result
    return result.replace(part.source.text.value, part.text)
  }, text)
}

export function reconstructPromptFromParts(parts: Part[]): PromptInfo {
  return parts.reduce(
    (agg, part) => {
      if (part.type === "text") {
        if (!part.synthetic) agg.input += part.text
      }
      if (part.type === "file") agg.parts.push(part)
      return agg
    },
    { input: "", parts: [] as PromptInfo["parts"] },
  )
}
