import z from "zod"
import { EOL } from "os"
import { Schema } from "effect"
import { NamedError } from "@opencode-ai/core/util/error"
import {
  buildAnsiGradientFoxLines,
  buildAnsiGradientTextLines,
  LOGO_ASCII_ROWS,
  FOX_OUTLINE_ROWS,
} from "./fox-logo"

export namespace UI {
  export const CancelledError = NamedError.create("UICancelledError", Schema.Void)

  export const Style = {
    TEXT_HIGHLIGHT: "\x1b[96m",
    TEXT_HIGHLIGHT_BOLD: "\x1b[96m\x1b[1m",
    TEXT_DIM: "\x1b[90m",
    TEXT_DIM_BOLD: "\x1b[90m\x1b[1m",
    TEXT_NORMAL: "\x1b[0m",
    TEXT_NORMAL_BOLD: "\x1b[1m",
    TEXT_WARNING: "\x1b[93m",
    TEXT_WARNING_BOLD: "\x1b[93m\x1b[1m",
    TEXT_DANGER: "\x1b[91m",
    TEXT_DANGER_BOLD: "\x1b[91m\x1b[1m",
    TEXT_SUCCESS: "\x1b[92m",
    TEXT_SUCCESS_BOLD: "\x1b[92m\x1b[1m",
    TEXT_INFO: "\x1b[94m",
    TEXT_INFO_BOLD: "\x1b[94m\x1b[1m",
  }

  export function println(...message: string[]) {
    print(...message)
    process.stderr.write(EOL)
  }

  export function print(...message: string[]) {
    blank = false
    process.stderr.write(message.join(" "))
  }

  let blank = false
  export function empty() {
    if (blank) return
    println("" + Style.TEXT_NORMAL)
    blank = true
  }

  export function logo(pad?: string) {
    const foxLines = buildAnsiGradientFoxLines()
    const textLines = buildAnsiGradientTextLines()
    const result: string[] = []

    const FOX_GAP = 2
    const maxRows = Math.max(FOX_OUTLINE_ROWS, LOGO_ASCII_ROWS)

    for (let i = 0; i < maxRows; i++) {
      let line = ""
      if (pad) line += pad
      const foxLine = foxLines[i] ?? ""
      line += foxLine + " ".repeat(FOX_GAP)
      line += textLines[i] ?? ""
      result.push(line)
    }

    return result.join(EOL)
  }

  export async function input(prompt: string): Promise<string> {
    const readline = require("readline")
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise((resolve) => {
      rl.question(prompt, (answer: string) => {
        rl.close()
        resolve(answer.trim())
      })
    })
  }

  export function error(message: string) {
    if (message.startsWith("Error: ")) {
      message = message.slice("Error: ".length)
    }
    println(Style.TEXT_DANGER_BOLD + "Error: " + Style.TEXT_NORMAL + message)
  }

  export function markdown(text: string): string {
    return text
  }
}