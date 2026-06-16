/**
 * Vim keybinding plugin — shared types and constants.
 */

// ── Modes ──────────────────────────────────────────────

export type VimMode = "normal" | "insert" | "visual" | "visual-line"

export const MODE_LABELS: Record<VimMode, string> = {
  normal: "NORMAL",
  insert: "INSERT",
  visual: "VISUAL",
  "visual-line": "VISUAL LINE",
}

// ── Timing ─────────────────────────────────────────────

/** Timeout in ms before a pending double-key sequence (dd, cc, gg) expires. */
export const SEQUENCE_TIMEOUT_MS = 1000

// ── Cursor styles ──────────────────────────────────────

export const CURSOR_BLOCK = { style: "block" as const, blinking: false }
export const CURSOR_LINE = { style: "line" as const, blinking: true }

// ── Key event helpers ───────────────────────────────────

/** Raw key event shape (shared across handlers). */
export interface KeyEventLike {
  name: string
  ctrl: boolean
  shift: boolean
  meta: boolean
  super?: boolean
}

/**
 * Normalise a raw key name + shift modifier into the "logical" Vim character.
 *
 * Handles:
 * - shift+letter → uppercase (e.g. shift+g → "G")
 * - shift+4 → "$"
 * - shift+6 → "^"
 */
export function resolveKey(name: string, shift: boolean): string {
  if (shift) {
    if (name.length === 1 && name >= "a" && name <= "z") {
      return name.toUpperCase()
    }
    if (name === "4") return "$"
    if (name === "6") return "^"
  }
  return name
}
