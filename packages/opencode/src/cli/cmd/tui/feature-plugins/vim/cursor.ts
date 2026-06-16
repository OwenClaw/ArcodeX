/**
 * Cursor style management — switches between block (Normal/Visual)
 * and line (Insert) cursor based on the current Vim mode.
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import { CURSOR_BLOCK, CURSOR_LINE } from "./types"
import type { VimMode } from "./types"
import type { Editor } from "./commands"

export interface CursorManager {
  /** Sync the cursor style to match the given mode. */
  sync(mode: VimMode): void
  /** Restore the default cursor style. */
  dispose(): void
}

export function createCursorManager(api: TuiPluginApi): CursorManager {
  const getEditor = (): Editor | null =>
    api.renderer.currentFocusedEditor as Editor | null

  return {
    sync(mode: VimMode) {
      const editor = getEditor()
      if (!editor) return

      editor.cursorStyle = mode === "insert" ? CURSOR_LINE : CURSOR_BLOCK
    },

    dispose() {
      const editor = getEditor()
      if (!editor) return
      editor.cursorStyle = CURSOR_LINE
    },
  }
}
