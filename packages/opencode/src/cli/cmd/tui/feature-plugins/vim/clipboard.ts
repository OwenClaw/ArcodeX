/**
 * Clipboard (yank / paste) operations.
 *
 * - Yank: uses the renderer's built-in OSC 52 clipboard support.
 * - Paste: uses an internal "unnamed register" (last yanked text).
 *   No external npm dependency required.
 *
 * Uses the factory pattern to avoid module-level mutable state leaking
 * across plugin instances.
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"

export interface ClipboardManager {
  /** Yank (copy) text to both the internal register and system clipboard. */
  yankText(text: string, api: TuiPluginApi): void
  /** Paste from the internal unnamed register into the editor. */
  pasteFromRegister(editor: { insertText(text: string): void }, api: TuiPluginApi): void
  /** Get the current unnamed register content. */
  getRegisterContent(): string
  /** Clear the register (called on dispose). */
  clear(): void
}

export function createClipboard(): ClipboardManager {
  let unnamedRegister: string = ""

  return {
    yankText(text: string, api: TuiPluginApi) {
      if (!text) return
      unnamedRegister = text

      // Try OSC 52 clipboard; if the terminal doesn't support it that's okay —
      // the internal register still works for paste within this session.
      try {
        api.renderer.copyToClipboardOSC52(text)
      } catch {
        // Silently ignore — internal register is the fallback
      }
    },

    pasteFromRegister(
      editor: { insertText(text: string): void },
      _api: TuiPluginApi,
    ) {
      if (unnamedRegister) {
        editor.insertText(unnamedRegister)
      }
    },

    getRegisterContent(): string {
      return unnamedRegister
    },

    clear() {
      unnamedRegister = ""
    },
  }
}
