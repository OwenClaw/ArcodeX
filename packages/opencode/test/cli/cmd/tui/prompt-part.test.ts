import { describe, expect, test } from "bun:test"
import type { PromptInfo } from "../../../../src/cli/cmd/tui/component/prompt/history"
import { assign, strip, reconstructPromptFromParts } from "../../../../src/cli/cmd/tui/component/prompt/part"

describe("prompt part", () => {
  test("strip removes persisted ids from reused file parts", () => {
    const part = {
      id: "prt_old",
      sessionID: "ses_old",
      messageID: "msg_old",
      type: "file" as const,
      mime: "image/png",
      filename: "tiny.png",
      url: "data:image/png;base64,abc",
    }

    expect(strip(part)).toEqual({
      type: "file",
      mime: "image/png",
      filename: "tiny.png",
      url: "data:image/png;base64,abc",
    })
  })

  test("assign overwrites stale runtime ids", () => {
    const part = {
      id: "prt_old",
      sessionID: "ses_old",
      messageID: "msg_old",
      type: "file" as const,
      mime: "image/png",
      filename: "tiny.png",
      url: "data:image/png;base64,abc",
    } as PromptInfo["parts"][number]

    const next = assign(part)

    expect(next.id).not.toBe("prt_old")
    expect(next.id.startsWith("prt_")).toBe(true)
    expect(next).toMatchObject({
      type: "file",
      mime: "image/png",
      filename: "tiny.png",
      url: "data:image/png;base64,abc",
    })
  })

  test("reconstructs text-only prompt from parts", () => {
    const parts = [
      { type: "text" as const, id: "prt_1", messageID: "msg_1", sessionID: "ses_1", text: "hello world", synthetic: false },
    ]
    expect(reconstructPromptFromParts(parts as any)).toEqual({ input: "hello world", parts: [] })
  })

  test("skips synthetic text parts", () => {
    const parts = [
      { type: "text" as const, id: "prt_1", messageID: "msg_1", sessionID: "ses_1", text: "real", synthetic: false },
      { type: "text" as const, id: "prt_2", messageID: "msg_1", sessionID: "ses_1", text: "injected", synthetic: true },
    ]
    expect(reconstructPromptFromParts(parts as any)).toEqual({ input: "real", parts: [] })
  })

  test("includes file parts", () => {
    const parts = [
      { type: "text" as const, id: "prt_1", messageID: "msg_1", sessionID: "ses_1", text: "describe ", synthetic: false },
      { type: "file" as const, id: "prt_2", messageID: "msg_1", sessionID: "ses_1", mime: "image/png", filename: "a.png", url: "data:image/png;base64,AAA" },
    ]
    const result = reconstructPromptFromParts(parts as any)
    expect(result.input).toBe("describe ")
    expect(result.parts).toHaveLength(1)
    expect(result.parts[0]).toMatchObject({ type: "file", filename: "a.png" })
  })

  test("concatenates multiple text parts", () => {
    const parts = [
      { type: "text" as const, id: "prt_1", messageID: "msg_1", sessionID: "ses_1", text: "hello ", synthetic: false },
      { type: "text" as const, id: "prt_2", messageID: "msg_1", sessionID: "ses_1", text: "world", synthetic: false },
    ]
    expect(reconstructPromptFromParts(parts as any)).toEqual({ input: "hello world", parts: [] })
  })

  test("ignores non-text non-file parts", () => {
    const parts = [
      { type: "text" as const, id: "prt_1", messageID: "msg_1", sessionID: "ses_1", text: "hi", synthetic: false },
      { type: "tool" as const, id: "prt_2", messageID: "msg_1", sessionID: "ses_1", tool: "bash", state: { status: "completed", input: {}, output: "ok", title: "bash" } },
    ]
    expect(reconstructPromptFromParts(parts as any)).toEqual({ input: "hi", parts: [] })
  })

  test("returns empty for empty parts array", () => {
    expect(reconstructPromptFromParts([])).toEqual({ input: "", parts: [] })
  })
})
