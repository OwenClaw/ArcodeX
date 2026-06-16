/**
 * Vim mode state machine — the single source of truth for the current mode.
 *
 * Pure TypeScript (no SolidJS dependency) so it can be used safely inside
 * the `intercept("key")` callback which runs outside reactive scope.
 */

import type { VimMode } from "./types"

export interface VimModeController {
  /** Read the current mode. */
  mode(): VimMode
  /** Transition to a new mode and notify listeners. */
  setMode(next: VimMode): void
  /** Register a listener that fires on every mode change. Returns an unsubscribe function. */
  onModeChange(fn: (mode: VimMode) => void): () => void
}

export function createVimMode(): VimModeController {
  let current: VimMode = "normal"
  const listeners: Array<(mode: VimMode) => void> = []

  return {
    mode() {
      return current
    },

    setMode(next: VimMode) {
      if (next === current) return
      current = next
      for (const fn of listeners) fn(current)
    },

    onModeChange(fn) {
      listeners.push(fn)
      return () => {
        const idx = listeners.indexOf(fn)
        if (idx !== -1) listeners.splice(idx, 1)
      }
    },
  }
}
