/**
 * Visual / VisualLine mode key handler.
 *
 * - Visual (`v`): character-wise selection using `input.select.*` commands.
 * - VisualLine (`V`): line-wise selection using setSelection + select.up/down.
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { Editor } from "./commands"
import type { VimModeController } from "./vim-mode"
import type { ClipboardManager } from "./clipboard"
import type { VimMode } from "./types"
import { resolveKey, type KeyEventLike } from "./types"
import {
  deleteSelectionAndYank,
  yankSelection,
  changeSelection,
  selectCurrentLine,
  moveWordEnd,
} from "./commands"

export interface VisualHandlerContext {
  event: KeyEventLike
  editor: Editor
  api: TuiPluginApi
  vimMode: VimModeController
  clipboard: ClipboardManager
  mode: "visual" | "visual-line"
}

/**
 * Handle a key event in Visual or VisualLine mode.
 * Returns `true` if the key was consumed.
 */
export function handleVisualKey(ctx: VisualHandlerContext): boolean {
  const { event, editor, api, vimMode, clipboard, mode } = ctx
  const { name, ctrl, shift, meta, super: sup } = event

  // ── Ctrl / Meta combos ────────────────────────────────
  if (ctrl || meta || sup) {
    // Ctrl+C → exit to Normal
    if (ctrl && name === "c") {
      exitVisual(editor, vimMode)
      return true
    }
    // Other combos pass through
    return false
  }

  const key = resolveKey(name, shift)

  // ── Mode exit / switch ─────────────────────────────────
  if (key === "escape") {
    exitVisual(editor, vimMode)
    return true
  }

  // `v` toggles Visual: if already in Visual → Normal; if in VisualLine → Visual
  if (key === "v") {
    if (mode === "visual") {
      exitVisual(editor, vimMode)
    } else {
      // Switch from VisualLine to Visual (character-wise)
      vimMode.setMode("visual")
    }
    return true
  }

  // `V` toggles VisualLine: if in VisualLine → Normal; if in Visual → VisualLine
  if (key === "V") {
    if (mode === "visual-line") {
      exitVisual(editor, vimMode)
    } else {
      // Switch from Visual to VisualLine
      // Re-select the current line
      selectCurrentLine(editor)
      vimMode.setMode("visual-line")
    }
    return true
  }

  // ── Actions on selection ───────────────────────────────
  if (key === "d" || key === "x") {
    deleteSelectionAndYank(editor, api, clipboard)
    vimMode.setMode("normal")
    return true
  }

  if (key === "c") {
    changeSelection(editor, api, vimMode.setMode, clipboard)
    return true
  }

  if (key === "y") {
    yankSelection(editor, api, clipboard)
    vimMode.setMode("normal")
    return true
  }

  // ── Movement (extends selection) ───────────────────────
  if (mode === "visual") {
    return handleVisualMovement(key, editor, api)
  } else {
    return handleVisualLineMovement(key, editor, api)
  }
}

/** Handle movement in Visual (character-wise) mode. */
function handleVisualMovement(key: string, editor: Editor, api: TuiPluginApi): boolean {
  switch (key) {
    case "h": case "left":
      api.keymap.runCommand("input.select.left"); return true
    case "j": case "down":
      api.keymap.runCommand("input.select.down"); return true
    case "k": case "up":
      api.keymap.runCommand("input.select.up"); return true
    case "l": case "right":
      api.keymap.runCommand("input.select.right"); return true
    case "w":
      api.keymap.runCommand("input.select.word.forward"); return true
    case "b":
      api.keymap.runCommand("input.select.word.backward"); return true
    case "e":
      moveWordEnd(editor, true /* select */); return true
    case "0":
      api.keymap.runCommand("input.select.line.home"); return true
    case "$":
      api.keymap.runCommand("input.select.line.end"); return true
    case "G":
      api.keymap.runCommand("input.select.buffer.end"); return true
    default:
      // Unknown key in visual mode → consume (don't type characters)
      return true
  }
}

/**
 * Handle movement in VisualLine (line-wise) mode.
 * Only j/k move by lines; other movement keys are treated as j/k.
 */
function handleVisualLineMovement(key: string, _editor: Editor, api: TuiPluginApi): boolean {
  switch (key) {
    case "j": case "down":
      api.keymap.runCommand("input.select.down"); return true
    case "k": case "up":
      api.keymap.runCommand("input.select.up"); return true
    case "0":
      api.keymap.runCommand("input.select.line.home"); return true
    case "$":
      api.keymap.runCommand("input.select.line.end"); return true
    case "G":
      api.keymap.runCommand("input.select.buffer.end"); return true
    // h/l/w/b/e → no-op in VisualLine (line granularity only)
    case "h": case "l": case "w": case "b": case "e":
      return true
    default:
      // Unknown key → consume (don't type characters)
      return true
  }
}

/** Exit Visual mode: clear selection and return to Normal. */
function exitVisual(editor: Editor, vimMode: VimModeController): void {
  editor.clearSelection()
  vimMode.setMode("normal")
}
