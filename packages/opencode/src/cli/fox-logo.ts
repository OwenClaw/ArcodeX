import { RGBA } from "@opentui/core"

const DARK: [number, number, number] = [26, 26, 46]
const ORANGE: [number, number, number] = [255, 107, 53]
const CREAM: [number, number, number] = [255, 245, 238]

const _D = DARK
const _O = ORANGE
const _C = CREAM

const logoPixels: ReadonlyArray<ReadonlyArray<[number, number, number]>> = [
  [_D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _O, _O, _D, _D, _O, _O, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _O, _O, _D, _D, _O, _O, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _O, _O, _O, _O, _O, _O, _O, _O, _D, _D, _D, _D],
  [_D, _D, _D, _D, _O, _O, _D, _O, _O, _D, _O, _O, _D, _D, _D, _D],
  [_D, _D, _D, _D, _O, _O, _O, _D, _D, _O, _O, _O, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _O, _O, _O, _O, _O, _O, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _O, _O, _O, _O, _O, _O, _D, _O, _C, _D, _D],
  [_D, _D, _D, _D, _D, _O, _C, _C, _C, _C, _O, _O, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _O, _C, _C, _C, _C, _O, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _D, _D, _O, _O, _D, _D, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D],
  [_D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D, _D],
]

export const FOX_WIDTH = 16
export const FOX_HALF_ROWS = 8

export type FoxTone = { t: string; fg: RGBA; bg?: RGBA }

function isDark(c: [number, number, number]): boolean {
  return c[0] === 26 && c[1] === 26 && c[2] === 46
}

function rgba(c: [number, number, number]): RGBA {
  return RGBA.fromInts(c[0], c[1], c[2])
}

const GRADIENT_LEFT: [number, number, number] = [255, 160, 50]
const GRADIENT_RIGHT: [number, number, number] = [255, 60, 160]

function gradientRgb(x: number): [number, number, number] {
  const t = x / (FOX_WIDTH - 1)
  return [
    Math.round(GRADIENT_LEFT[0] + (GRADIENT_RIGHT[0] - GRADIENT_LEFT[0]) * t),
    Math.round(GRADIENT_LEFT[1] + (GRADIENT_RIGHT[1] - GRADIENT_LEFT[1]) * t),
    Math.round(GRADIENT_LEFT[2] + (GRADIENT_RIGHT[2] - GRADIENT_LEFT[2]) * t),
  ]
}

function darken(c: [number, number, number], factor: number): [number, number, number] {
  return [
    Math.round(c[0] * factor),
    Math.round(c[1] * factor),
    Math.round(c[2] * factor),
  ]
}

function isOrange(c: [number, number, number]): boolean {
  return c[0] === 255 && c[1] === 107 && c[2] === 53
}

function isCream(c: [number, number, number]): boolean {
  return c[0] === 255 && c[1] === 245 && c[2] === 238
}

function applyGradient(c: [number, number, number], x: number): [number, number, number] {
  if (isOrange(c)) return gradientRgb(x)
  if (isCream(c)) return c
  return c
}

const OUTLINE_FACTOR = 0.35

function isOutlinePixel(x: number, y: number): boolean {
  if (y < 0 || y >= logoPixels.length || x < 0 || x >= FOX_WIDTH) return false
  if (!isDark(logoPixels[y]![x]!)) return false
  const neighbors: [number, number][] = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
  for (const [nx, ny] of neighbors) {
    if (ny >= 0 && ny < logoPixels.length && nx >= 0 && nx < FOX_WIDTH) {
      if (!isDark(logoPixels[ny]![nx]!)) return true
    }
  }
  return false
}

function isConnected(x: number, y: number): boolean {
  if (y < 0 || y >= logoPixels.length || x < 0 || x >= FOX_WIDTH) return false
  if (!isDark(logoPixels[y]![x]!)) return true
  return isOutlinePixel(x, y)
}

function boxChar(x: number, y: number): string {
  const u = isConnected(x, y - 1)
  const d = isConnected(x, y + 1)
  const l = isConnected(x - 1, y)
  const r = isConnected(x + 1, y)
  if (u && d && l && r) return "\u253C"
  if (u && d && r) return "\u251C"
  if (u && d && l) return "\u2524"
  if (l && r && d) return "\u252C"
  if (l && r && u) return "\u2534"
  if (u && d) return "\u2502"
  if (l && r) return "\u2500"
  if (r && d) return "\u250C"
  if (l && d) return "\u2510"
  if (r && u) return "\u2514"
  if (l && u) return "\u2518"
  if (u || d) return "\u2502"
  return "\u2500"
}

function buildGradientOutlineHalfBlock(): FoxTone[][] {
  const transparent = RGBA.fromInts(0, 0, 0, 0)
  const rows: FoxTone[][] = []

  for (let y = 0; y < logoPixels.length; y += 2) {
    const row: FoxTone[] = []
    const topSrc = logoPixels[y]!
    const botSrc = logoPixels[y + 1]

    for (let x = 0; x < FOX_WIDTH; x++) {
      const origTop = topSrc[x]!
      const origBot = botSrc ? botSrc[x]! : DARK
      const topIsContent = !isDark(origTop)
      const botIsContent = !isDark(origBot)
      const topIsOutline = !topIsContent && isOutlinePixel(x, y)
      const botIsOutline = !botIsContent && isOutlinePixel(x, y + 1)

      if (topIsContent && botIsContent) {
        row.push({ t: "\u2584", fg: rgba(applyGradient(origBot, x)), bg: rgba(applyGradient(origTop, x)) })
      } else if (topIsContent && botIsOutline) {
        row.push({ t: "\u2580", fg: rgba(applyGradient(origTop, x)), bg: rgba(darken(gradientRgb(x), OUTLINE_FACTOR)) })
      } else if (topIsContent) {
        row.push({ t: "\u2580", fg: rgba(applyGradient(origTop, x)) })
      } else if (topIsOutline && botIsContent) {
        row.push({ t: "\u2584", fg: rgba(applyGradient(origBot, x)), bg: rgba(darken(gradientRgb(x), OUTLINE_FACTOR)) })
      } else if (topIsOutline && botIsOutline) {
        row.push({ t: boxChar(x, y), fg: rgba(darken(gradientRgb(x), OUTLINE_FACTOR)) })
      } else if (topIsOutline) {
        row.push({ t: boxChar(x, y), fg: rgba(darken(gradientRgb(x), OUTLINE_FACTOR)) })
      } else if (botIsContent) {
        row.push({ t: "\u2584", fg: rgba(applyGradient(origBot, x)) })
      } else if (botIsOutline) {
        row.push({ t: boxChar(x, y + 1), fg: rgba(darken(gradientRgb(x), OUTLINE_FACTOR)) })
      } else {
        row.push({ t: " ", fg: transparent })
      }
    }
    rows.push(row)
  }
  return rows
}

function buildHalfBlockRows(): FoxTone[][] {
  const transparent = RGBA.fromInts(0, 0, 0, 0)
  const rows: FoxTone[][] = []
  for (let y = 0; y < logoPixels.length; y += 2) {
    const row: FoxTone[] = []
    const topRow = logoPixels[y]!
    const botRow = logoPixels[y + 1]
    for (let x = 0; x < FOX_WIDTH; x++) {
      const top = topRow[x]!
      const bot = botRow ? botRow[x]! : DARK
      const topD = isDark(top)
      const botD = isDark(bot)
      if (topD && botD) {
        row.push({ t: " ", fg: transparent })
      } else if (topD) {
        row.push({ t: "\u2584", fg: rgba(bot) })
      } else if (botD) {
        row.push({ t: "\u2580", fg: rgba(top) })
      } else {
        row.push({ t: "\u2584", fg: rgba(bot), bg: rgba(top) })
      }
    }
    rows.push(row)
  }
  return rows
}

function buildPlainTextRows(): string[] {
  const rows: string[] = []
  for (let y = 0; y < logoPixels.length; y += 2) {
    let line = ""
    const topRow = logoPixels[y]!
    const botRow = logoPixels[y + 1]
    for (let x = 0; x < FOX_WIDTH; x++) {
      const top = topRow[x]!
      const bot = botRow ? botRow[x]! : DARK
      const topD = isDark(top)
      const botD = isDark(bot)
      if (topD && botD) line += " "
      else if (topD) line += "\u2584"
      else if (botD) line += "\u2580"
      else line += "\u2588"
    }
    rows.push(line)
  }
  return rows
}

export const FOX_HALF_BLOCK: ReadonlyArray<ReadonlyArray<FoxTone>> = buildHalfBlockRows()
export const FOX_GRADIENT_OUTLINE: ReadonlyArray<ReadonlyArray<FoxTone>> = buildGradientOutlineHalfBlock()
export const FOX_PLAIN_TEXT: ReadonlyArray<string> = buildPlainTextRows()

function trimTransparentRows(rows: ReadonlyArray<ReadonlyArray<FoxTone>>): ReadonlyArray<ReadonlyArray<FoxTone>> {
  const transparent = (t: FoxTone) => t.t === " "
  return rows.filter((row) => !row.every(transparent))
}

export const FOX_HALF_BLOCK_TRIMMED: ReadonlyArray<ReadonlyArray<FoxTone>> = trimTransparentRows(FOX_HALF_BLOCK)
export const FOX_GRADIENT_OUTLINE_TRIMMED: ReadonlyArray<ReadonlyArray<FoxTone>> = trimTransparentRows(FOX_GRADIENT_OUTLINE)
export const FOX_VISIBLE_ROWS = FOX_HALF_BLOCK_TRIMMED.length
export const FOX_OUTLINE_ROWS = FOX_GRADIENT_OUTLINE_TRIMMED.length

export const LOGO_ASCII: readonly string[] = [
  " █████╗ ██████╗  ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗",
  "██╔══██╗██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝",
  "███████║██████╔╝██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ ",
  "██╔══██║██╔══██╗██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ ",
  "██║  ██║██║  ██║╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗",
  "╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝",
]

export const LOGO_ASCII_WIDTH = 57
export const LOGO_ASCII_ROWS = 6

const FOX_GRADIENT_LEFT: [number, number, number] = [255, 160, 50]
const FOX_GRADIENT_RIGHT: [number, number, number] = [255, 60, 160]
const FOX_OUTLINE_FACTOR = 0.35

const TEXT_GRADIENT_START: [number, number, number] = [100, 220, 220]
const TEXT_GRADIENT_END: [number, number, number] = [80, 130, 255]

const TAGLINE_GRADIENT_START: [number, number, number] = [0, 255, 230]
const TAGLINE_GRADIENT_END: [number, number, number] = [50, 100, 255]

export { FOX_GRADIENT_LEFT, FOX_GRADIENT_RIGHT, FOX_OUTLINE_FACTOR, TEXT_GRADIENT_START, TEXT_GRADIENT_END, TAGLINE_GRADIENT_START, TAGLINE_GRADIENT_END }

export function buildAnsiGradientFoxLines(): string[] {
  const reset = '\x1b[0m'
  return FOX_GRADIENT_OUTLINE_TRIMMED.map(row => {
    let line = ''
    let visibleCount = 0
    for (const tone of row) {
      if (tone.t === ' ') {
        line += ' '
      } else {
        const fr = Math.round(tone.fg.r * 255)
        const fg = Math.round(tone.fg.g * 255)
        const fb = Math.round(tone.fg.b * 255)
        let code = `\x1b[38;2;${fr};${fg};${fb}m`
        if (tone.bg) {
          const br = Math.round(tone.bg.r * 255)
          const bg = Math.round(tone.bg.g * 255)
          const bb = Math.round(tone.bg.b * 255)
          code += `\x1b[48;2;${br};${bg};${bb}m`
        }
        line += `${code}${tone.t}${reset}`
      }
      visibleCount += 1
    }
    if (visibleCount < FOX_WIDTH) {
      line += ' '.repeat(FOX_WIDTH - visibleCount)
    }
    return line
  })
}

export function buildAnsiGradientTextLines(): string[] {
  const reset = '\x1b[0m'
  return LOGO_ASCII.map(line => {
    let result = ''
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!
      if (ch === ' ') {
        result += ' '
      } else {
        const t = LOGO_ASCII_WIDTH > 1 ? i / (LOGO_ASCII_WIDTH - 1) : 0
        const r = Math.round(TEXT_GRADIENT_START[0] + (TEXT_GRADIENT_END[0] - TEXT_GRADIENT_START[0]) * t)
        const g = Math.round(TEXT_GRADIENT_START[1] + (TEXT_GRADIENT_END[1] - TEXT_GRADIENT_START[1]) * t)
        const b = Math.round(TEXT_GRADIENT_START[2] + (TEXT_GRADIENT_END[2] - TEXT_GRADIENT_START[2]) * t)
        result += `\x1b[38;2;${r};${g};${b}m${ch}${reset}`
      }
    }
    return result
  })
}
