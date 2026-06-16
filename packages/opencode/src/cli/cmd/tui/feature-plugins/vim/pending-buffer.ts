/**
 * Pending-key buffer for double-key sequences (dd, cc, gg, dw, cw, db).
 *
 * Stores the first key of a potential sequence and auto-clears after
 * `SEQUENCE_TIMEOUT_MS` milliseconds.
 */

import { SEQUENCE_TIMEOUT_MS } from "./types"

export interface PendingBuffer {
  /** Store a key as the pending first-half of a sequence. */
  set(key: string): void
  /** Read the pending key (or null if nothing is pending). */
  get(): string | null
  /** Clear the pending key and cancel the timeout. */
  clear(): void
}

export function createPendingBuffer(): PendingBuffer {
  let pending: string | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  return {
    set(key: string) {
      // Clear any previous pending state
      if (timer !== null) clearTimeout(timer)
      pending = key
      timer = setTimeout(() => {
        pending = null
        timer = null
      }, SEQUENCE_TIMEOUT_MS)
    },

    get(): string | null {
      return pending
    },

    clear() {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      pending = null
    },
  }
}
