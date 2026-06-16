/** @jsxImportSource @opentui/solid */

/**
 * Mode indicator — a SolidJS slot component that renders the current
 * Vim mode label in the `session_prompt_right` and `home_prompt_footer_right`
 * slot positions.
 */

import { createSignal, type JSX } from "solid-js"
import type { VimMode } from "./types"
import { MODE_LABELS } from "./types"
import type { VimModeController } from "./vim-mode"

/** Mode → foreground color mapping (using standard terminal 256-color codes). */
const MODE_COLORS: Record<VimMode, string> = {
  normal: "#61afef",      // blue
  insert: "#98c379",      // green
  visual: "#e5c07b",      // yellow
  "visual-line": "#e5c07b", // yellow
}

export interface ModeIndicatorProps {
  vimMode: VimModeController
}

/**
 * Create and return a TuiSlotPlugin that renders the mode indicator.
 * Registers both `session_prompt_right` (for conversation page) and
 * `home_prompt_footer_right` (for home page footer row) slots.
 *
 * Call `dispose()` to unsubscribe from mode changes (in onDispose).
 */
export function createModeIndicatorSlot(
  vimMode: VimModeController,
): {
  order: number
  slots: {
    session_prompt_right(ctx: { theme: unknown }, props: { session_id: string }): JSX.Element
    home_prompt_inside_right(ctx: { theme: unknown }, props: Record<string, never>): JSX.Element
  }
  /** Unsubscribe from mode changes. Call in plugin onDispose. */
  dispose: () => void
} {
  const [currentMode, setCurrentMode] = createSignal<VimMode>(vimMode.mode())
  const unsubscribe = vimMode.onModeChange((mode) => setCurrentMode(mode))

  // Shared renderer — reused by both slots.
  // IMPORTANT: SolidJS component functions run once. Signal reads MUST be
  // inside JSX expressions so the compiler generates reactive getters.
  // Doing `const mode = currentMode()` captures a static value — it will
  // never update. Instead, call currentMode() directly in the JSX.
  function ModeIndicator() {
    return (
      <text fg={MODE_COLORS[currentMode()]} attributes={1 /* bold */}>
        {" -- "}
        {MODE_LABELS[currentMode()]}
        {" -- "}
      </text>
    )
  }

  return {
    order: 50,
    slots: {
      session_prompt_right(_ctx, _props) {
        return <ModeIndicator />
      },
      home_prompt_inside_right(_ctx, _props) {
        return <ModeIndicator />
      },
    },
    dispose: unsubscribe,
  }
}
