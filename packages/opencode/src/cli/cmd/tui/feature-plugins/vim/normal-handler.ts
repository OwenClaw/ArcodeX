/**
 * Normal mode key handler.
 *
 * Dispatches Normal-mode keypresses to the appropriate commands.
 * Handles pending double-key sequences (dd, cc, gg, dw, cw, db).
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { Editor } from "./commands"
import type { VimModeController } from "./vim-mode"
import type { PendingBuffer } from "./pending-buffer"
import type { ClipboardManager } from "./clipboard"
import { resolveKey, type KeyEventLike } from "./types"
import {
  insertAtLineStart,
  insertAtLineEnd,
  insertAfterCursor,
  openLineBelow,
  openLineAbove,
  deleteToEndAndYank,
  deleteLineAndYank,
  deleteWordForwardAndYank,
  deleteWordBackwardAndYank,
  changeWord,
  joinLines,
  yankLine,
  pasteBefore,
  moveWordEnd,
} from "./commands"

export interface NormalHandlerContext {
  event: KeyEventLike
  editor: Editor
  api: TuiPluginApi
  vimMode: VimModeController
  pending: PendingBuffer
  clipboard: ClipboardManager
}

/**
 * Handle a key event in Normal mode.
 * Returns `true` if the key was consumed (caller should `ctx.consume()`).
 */
export function handleNormalKey(ctx: NormalHandlerContext): boolean {
  const { event, editor, api, vimMode, pending, clipboard } = ctx
  const { name, ctrl, shift, meta, super: sup } = event

  // ── Ctrl / Meta combos ────────────────────────────────
  if (ctrl || meta || sup) {
    // Ctrl+R → redo (Vim convention)
    if (ctrl && name === "r") {
      api.keymap.runCommand("input.redo")
      return true
    }
    // Ctrl+C → treat as Esc → stay in Normal (no-op)
    if (ctrl && name === "c") {
      // Already in Normal; just consume
      return true
    }
    // All other Ctrl/Meta/Super combos pass through to the app
    return false
  }

  // ── Resolve key name (shift combos) ───────────────────
  const key = resolveKey(name, shift)

  // ── Check pending buffer (double-key sequences) ────────
  const pendingKey = pending.get()
  if (pendingKey !== null) {
    const result = resolvePendingSequence(pendingKey, key, editor, api, vimMode, clipboard)
    pending.clear()
    return result
  }

  // ── Potential pending-key starters ─────────────────────
  // Lowercase d, c, g without shift are sequence starters.
  // Shifted variants (D, C, G) are single-key operations.
  if (isSequenceStarter(key)) {
    pending.set(key)
    return true
  }

  // ── Dispatch to shared handler ─────────────────────────
  return dispatchKey(key, editor, api, vimMode, clipboard)
}

// ── Helpers ──────────────────────────────────────────────

/** Keys that start a double-key sequence when pressed alone. */
function isSequenceStarter(key: string): boolean {
  return key === "d" || key === "c" || key === "g" || key === "y"
}

/**
 * Resolve a completed (or failed) double-key sequence.
 * Returns true if the key was consumed.
 */
function resolvePendingSequence(
  pendingKey: string,
  currentKey: string,
  editor: Editor,
  api: TuiPluginApi,
  vimMode: VimModeController,
  clipboard: ClipboardManager,
): boolean {
  // ── dd — delete line ──
  if (pendingKey === "d" && currentKey === "d") {
    deleteLineAndYank(editor, api, clipboard)
    return true
  }

  // ── cc — delete line and enter Insert ──
  if (pendingKey === "c" && currentKey === "c") {
    deleteLineAndYank(editor, api, clipboard)
    vimMode.setMode("insert")
    return true
  }

  // ── gg — go to buffer home ──
  if (pendingKey === "g" && currentKey === "g") {
    api.keymap.runCommand("input.buffer.home")
    return true
  }

  // ── dw — delete word forward ──
  if (pendingKey === "d" && currentKey === "w") {
    deleteWordForwardAndYank(editor, api, clipboard)
    return true
  }

  // ── cw — change word ──
  if (pendingKey === "c" && currentKey === "w") {
    changeWord(editor, api, vimMode.setMode, clipboard)
    return true
  }

  // ── db — delete word backward ──
  if (pendingKey === "d" && currentKey === "b") {
    deleteWordBackwardAndYank(editor, api, clipboard)
    return true
  }

  // ── yy — yank current line (without deleting) ──
  if (pendingKey === "y" && currentKey === "y") {
    yankLine(editor, api, clipboard)
    return true
  }

  // ── yw — yank to end of word ──
  if (pendingKey === "y" && currentKey === "w") {
    const cursor = editor.logicalCursor
    const nextWord = editor.editBuffer.getNextWordBoundary()
    const text = editor.editBuffer.getTextRange(cursor.offset, nextWord.offset)
    clipboard.yankText(text, api)
    return true
  }

  // ── Sequence failed — discard pending, re-evaluate currentKey ──
  // e.g., user pressed 'd' then 'a' — 'd' is discarded, 'a' enters Insert.
  return dispatchKey(currentKey, editor, api, vimMode, clipboard)
}

/**
 * Top-level dispatch for a single resolved key in Normal mode.
 * Covers mode transitions, movement, editing, and fallback.
 * Shared by both direct key handling and pending-sequence fallback.
 */
function dispatchKey(
  key: string,
  editor: Editor,
  api: TuiPluginApi,
  vimMode: VimModeController,
  clipboard: ClipboardManager,
): boolean {
  // ── Mode transitions ───────────────────────────────────
  switch (key) {
    case "i":
      vimMode.setMode("insert")
      return true
    case "I":
      insertAtLineStart(editor, vimMode.setMode)
      return true
    case "a":
      insertAfterCursor(editor, vimMode.setMode)
      return true
    case "A":
      insertAtLineEnd(editor, vimMode.setMode)
      return true
    case "o":
      openLineBelow(editor, vimMode.setMode)
      return true
    case "O":
      openLineAbove(editor, vimMode.setMode)
      return true
    case "v":
      enterVisual(editor, vimMode)
      return true
    case "V":
      enterVisualLine(editor, vimMode)
      return true
  }

  // ── Movement ───────────────────────────────────────────
  if (handleMovement(key, editor, api)) return true

  // ── Editing ────────────────────────────────────────────
  if (handleEditing(key, editor, api, vimMode, clipboard)) return true

  // ── Escape (no-op in Normal, but consume it) ───────────
  if (key === "escape") return true

  // ── Unknown key → consume (Normal mode never types characters) ──
  // Only Ctrl/Meta combos pass through (handled earlier in handleNormalKey).
  return true
}

/** Handle movement commands. Returns true if handled. */
function handleMovement(key: string, editor: Editor, api: TuiPluginApi): boolean {
  switch (key) {
    case "h": api.keymap.runCommand("input.move.left"); return true
    case "j": api.keymap.runCommand("input.move.down"); return true
    case "k": api.keymap.runCommand("input.move.up"); return true
    case "l": api.keymap.runCommand("input.move.right"); return true
    case "w": api.keymap.runCommand("input.word.forward"); return true
    case "b": api.keymap.runCommand("input.word.backward"); return true
    case "e": moveWordEnd(editor); return true
    case "0": api.keymap.runCommand("input.line.home"); return true
    case "$": api.keymap.runCommand("input.line.end"); return true
    // NOTE: In real Vim, ^ goes to the first non-blank character, not column 0.
    // The host editor has no "firstNonBlank" API, so we fall back to line home.
    case "^": api.keymap.runCommand("input.line.home"); return true
    case "G": api.keymap.runCommand("input.buffer.end"); return true
    case "left": api.keymap.runCommand("input.move.left"); return true
    case "right": api.keymap.runCommand("input.move.right"); return true
    // Up/Down intentionally NOT mapped — keep history navigation
    default: return false
  }
}

/** Handle editing commands. Returns true if handled. */
function handleEditing(
  key: string,
  editor: Editor,
  api: TuiPluginApi,
  vimMode: VimModeController,
  clipboard: ClipboardManager,
): boolean {
  switch (key) {
    case "x": editor.deleteChar(); return true
    case "X": editor.deleteCharBackward(); return true
    case "s": editor.deleteChar(); vimMode.setMode("insert"); return true
    case "S":
      deleteLineAndYank(editor, api, clipboard)
      vimMode.setMode("insert")
      return true
    case "D": deleteToEndAndYank(editor, api, clipboard); return true
    case "C":
      deleteToEndAndYank(editor, api, clipboard)
      vimMode.setMode("insert")
      return true
    case "u": api.keymap.runCommand("input.undo"); return true
    case "p": paste(editor, api, clipboard); return true
    case "P": pasteBefore(editor, api, clipboard); return true
    case "J": joinLines(editor); return true
    default: return false
  }
}

/** Paste helper — delegates to commands.paste. */
function paste(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  clipboard.pasteFromRegister(editor, api)
}

/** Enter Visual (character-wise) mode. */
function enterVisual(editor: Editor, vimMode: VimModeController): void {
  vimMode.setMode("visual")
  // Initiate selection by selecting the character under cursor
  // The select.* commands will extend from here
  editor.moveCursorRight({ select: true })
}

/** Enter VisualLine (line-wise) mode. */
function enterVisualLine(editor: Editor, vimMode: VimModeController): void {
  vimMode.setMode("visual-line")
  // Select the entire current line
  const cursor = editor.logicalCursor
  const lineStart = editor.editBuffer.getLineStartOffset(cursor.row)
  const nextLineStart = editor.editBuffer.getLineStartOffset(cursor.row + 1)
  editor.setSelection(lineStart, nextLineStart)
}
