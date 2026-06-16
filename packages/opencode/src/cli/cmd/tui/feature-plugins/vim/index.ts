/**
 * Vim keybinding — built-in TUI plugin.
 *
 * Orchestrates all modules: mode state machine, pending buffer, cursor
 * manager, clipboard, mode indicator, and the central key interceptor.
 *
 * Integrated from vim-opencode (https://github.com/user/vim-opencode).
 */

import type { TuiPlugin, KeyEvent } from "@opencode-ai/plugin/tui"
import type { KeyInputContext } from "@opentui/keymap"
import type { InternalTuiPlugin } from "../../plugin/internal"
import { createVimMode } from "./vim-mode"
import { createPendingBuffer } from "./pending-buffer"
import { createCursorManager } from "./cursor"
import { createClipboard } from "./clipboard"
import { handleNormalKey } from "./normal-handler"
import { handleVisualKey } from "./visual-handler"
import { createModeIndicatorSlot } from "./mode-indicator"
import type { Editor } from "./commands"
import type { KeyEventLike } from "./types"

const id = "internal:vim"

/**
 * Check if the current route and focused editor are valid for vim interception.
 * Vim should only be active on home/session pages with the main prompt editor focused.
 */
function isPromptEditor(api: { route: { current: { name: string } }; renderer: { currentFocusedEditor: unknown } }): boolean {
  const routeName = api.route.current.name
  if (routeName !== "home" && routeName !== "session") return false

  const editor = api.renderer.currentFocusedEditor as { traits?: { owner?: string; role?: string } } | null
  if (!editor) return false

  const traits = editor.traits
  return traits?.owner === "opencode" && traits?.role === "prompt"
}

/**
 * Extract a KeyEventLike from the intercept context's raw event.
 * The raw event may include a `super` property not present on the base type.
 */
function toKeyEventLike(event: { name: string; ctrl: boolean; shift: boolean; meta: boolean; super?: boolean }): KeyEventLike {
  return {
    name: event.name,
    ctrl: event.ctrl,
    shift: event.shift,
    meta: event.meta,
    super: event.super,
  }
}

// CliRenderer extends EventEmitter which lacks typed overloads.
// "focused_editor" is emitted at runtime but not declared in the type union.
const FOCUSED_EDITOR_EVENT = "focused_editor" as const
// Narrow cast — only safe for known event names that exist at runtime
// but are missing from the EventEmitter type definition.
type FocusedEditorEvent = typeof FOCUSED_EDITOR_EVENT & string

const tui: TuiPlugin = async (api) => {
  // ── 1. Create state ──────────────────────────────────
  const vimMode = createVimMode()
  const pending = createPendingBuffer()
  const cursorManager = createCursorManager(api)
  const clipboard = createClipboard()

  // ── 2. Mode indicator slot ───────────────────────────
  const indicatorSlot = createModeIndicatorSlot(vimMode)
  api.slots.register(indicatorSlot)

  // ── 3. Sync cursor on mode change ────────────────────
  vimMode.onModeChange((mode) => {
    cursorManager.sync(mode)
  })

  // ── 4. Sync cursor on focus change ───────────────────
  // When an editor gains focus, apply the correct cursor style.
  // NOTE: "focused_editor" is a runtime event from CliRenderer not
  // reflected in the EventEmitter type union — hence the narrow cast.
  api.renderer.on(
    FOCUSED_EDITOR_EVENT as FocusedEditorEvent,
    (editor: unknown) => {
      if (editor && isPromptEditor(api)) {
        cursorManager.sync(vimMode.mode())
      }
    },
  )

  // ── 5. Central key interceptor ───────────────────────
  api.keymap.intercept("key", (ctx: KeyInputContext<KeyEvent>) => {
    if (!isPromptEditor(api)) return

    const editor = api.renderer.currentFocusedEditor as Editor | null
    if (!editor) return

    const mode = vimMode.mode()
    const keyEvent = toKeyEventLike(ctx.event)

    // ── Insert mode: only intercept Esc and Ctrl+C ──
    if (mode === "insert") {
      const { name, ctrl } = ctx.event
      if (name === "escape" || (name === "c" && ctrl)) {
        vimMode.setMode("normal")
        ctx.consume()
        return
      }
      // All other keys pass through to the textarea for normal typing
      return
    }

    // ── Normal mode ──
    if (mode === "normal") {
      const consumed = handleNormalKey({
        event: keyEvent,
        editor,
        api,
        vimMode,
        pending,
        clipboard,
      })
      if (consumed) ctx.consume()
      return
    }

    // ── Visual / VisualLine mode ──
    if (mode === "visual" || mode === "visual-line") {
      const consumed = handleVisualKey({
        event: keyEvent,
        editor,
        api,
        vimMode,
        clipboard,
        mode,
      })
      if (consumed) ctx.consume()
      return
    }
  })

  // ── 6. Set initial cursor style ──────────────────────
  if (isPromptEditor(api)) {
    cursorManager.sync(vimMode.mode())
  }

  // ── 7. Cleanup on plugin deactivation ────────────────
  api.lifecycle.onDispose(() => {
    indicatorSlot.dispose()
    cursorManager.dispose()
    clipboard.clear()
    pending.clear()
  })
}

const plugin: InternalTuiPlugin = {
  id,
  tui,
  enabled: false,
}

export default plugin
