import { buildAnsiGradientFoxLines, buildAnsiGradientTextLines } from "./fox-logo"

const FOX_LEFT_BASE = buildAnsiGradientFoxLines()

const SEPARATOR = "  " + "\u22EF".repeat(150)

const FOX_RIGHT_BASE = [
  ...buildAnsiGradientTextLines(),
  "",
  "",
  "",
  "",
  SEPARATOR,
  "",
  "",
]

const LOGO_HEIGHT = Math.max(FOX_LEFT_BASE.length, FOX_RIGHT_BASE.length)

const FOX_LEFT = [...FOX_LEFT_BASE, ...Array(Math.max(0, LOGO_HEIGHT - FOX_LEFT_BASE.length)).fill("")]
const FOX_RIGHT = [...FOX_RIGHT_BASE, ...Array(Math.max(0, LOGO_HEIGHT - FOX_RIGHT_BASE.length)).fill("")]

export const logo = {
  left: FOX_LEFT,
  right: FOX_RIGHT,
}

export const go = {
  left: FOX_LEFT.slice(0, 3),
  right: FOX_RIGHT.slice(0, 3),
}

export const marks = "\x00"
