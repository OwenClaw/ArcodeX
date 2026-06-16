/**
 * High-level Vim command implementations.
 *
 * Each function composes one or more EditBufferRenderable API calls to
 * implement a complete Vim editing operation (delete-line, yank-selection,
 * open-line-above, etc.).
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { VimMode } from "./types"
import type { VimModeController } from "./vim-mode"
import type { ClipboardManager } from "./clipboard"

// ── Type alias for the editor instance ─────────────────
// EditBufferRenderable from @opentui/core — we use duck-typing to avoid
// importing the exact type which lives inside node_modules.
export interface Editor {
  cursorStyle: unknown
  readonly logicalCursor: { row: number; col: number; offset: number }
  readonly plainText: string
  lineCount: number
  readonly editBuffer: {
    getLineStartOffset(row: number): number
    positionToOffset(row: number, col: number): number
    offsetToPosition(offset: number): { row: number; col: number } | null
    getEOL(): { row: number; col: number; offset: number }
    getNextWordBoundary(): { row: number; col: number; offset: number }
    getPrevWordBoundary(): { row: number; col: number; offset: number }
    getTextRange(start: number, end: number): string
  }
  moveCursorLeft(options?: { select?: boolean }): boolean
  moveCursorRight(options?: { select?: boolean }): boolean
  moveCursorUp(options?: { select?: boolean }): boolean
  moveCursorDown(options?: { select?: boolean }): boolean
  moveWordForward(options?: { select?: boolean }): boolean
  moveWordBackward(options?: { select?: boolean }): boolean
  gotoLineHome(options?: { select?: boolean }): boolean
  gotoLineEnd(options?: { select?: boolean }): boolean
  gotoBufferHome(options?: { select?: boolean }): boolean
  gotoBufferEnd(options?: { select?: boolean }): boolean
  gotoLine(line: number): void
  setCursor(row: number, col: number): void
  insertText(text: string): void
  insertChar(char: string): void
  deleteChar(): boolean
  deleteCharBackward(): boolean
  deleteLine(): boolean
  deleteToLineEnd(): boolean
  deleteToLineStart(): boolean
  deleteRange(startLine: number, startCol: number, endLine: number, endCol: number): void
  deleteSelection(): boolean
  deleteWordForward(): boolean
  deleteWordBackward(): boolean
  newLine(): boolean
  selectAll(): boolean
  setSelection(start: number, end: number): void
  setSelectionInclusive(start: number, end: number): void
  getSelection(): { start: number; end: number } | null
  getSelectedText(): string
  hasSelection(): boolean
  clearSelection(): boolean
  getTextRange(start: number, end: number): string
  undo(): boolean
  redo(): boolean
}

// ── Mode-switch helpers ────────────────────────────────

type SetMode = VimModeController["setMode"]

// ── Insert-mode entry commands ─────────────────────────

/** `I` — move to line home, then enter Insert mode. */
export function insertAtLineStart(editor: Editor, setMode: SetMode): void {
  editor.gotoLineHome()
  setMode("insert")
}

/** `A` — move to line end, then enter Insert mode. */
export function insertAtLineEnd(editor: Editor, setMode: SetMode): void {
  editor.gotoLineEnd()
  setMode("insert")
}

/** `a` — move cursor right, then enter Insert mode. */
export function insertAfterCursor(editor: Editor, setMode: SetMode): void {
  editor.moveCursorRight()
  setMode("insert")
}

/** `o` — open a new line below and enter Insert mode. */
export function openLineBelow(editor: Editor, setMode: SetMode): void {
  editor.gotoLineEnd()
  editor.newLine()
  setMode("insert")
}

/** `O` — open a new line above and enter Insert mode. */
export function openLineAbove(editor: Editor, setMode: SetMode): void {
  editor.gotoLineHome()
  editor.newLine()
  editor.moveCursorUp()
  setMode("insert")
}

// ── Delete + Yank commands ─────────────────────────────

/** `D` — delete from cursor to end of line, yank the deleted text. */
export function deleteToEndAndYank(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  const cursor = editor.logicalCursor
  const eol = editor.editBuffer.getEOL()
  const text = editor.editBuffer.getTextRange(cursor.offset, eol.offset)
  clipboard.yankText(text, api)
  editor.deleteToLineEnd()
}

/** `dd` — delete entire current line, yank it. */
export function deleteLineAndYank(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  const cursor = editor.logicalCursor
  const lineStart = editor.editBuffer.getLineStartOffset(cursor.row)
  const nextLineStart = editor.editBuffer.getLineStartOffset(cursor.row + 1)
  const text = editor.editBuffer.getTextRange(lineStart, nextLineStart)
  clipboard.yankText(text, api)
  editor.deleteLine()
}

/** `dw` — delete from cursor to next word boundary, yank it. */
export function deleteWordForwardAndYank(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  const cursor = editor.logicalCursor
  const nextWord = editor.editBuffer.getNextWordBoundary()
  const text = editor.editBuffer.getTextRange(cursor.offset, nextWord.offset)
  clipboard.yankText(text, api)
  editor.deleteWordForward()
}

/** `db` — delete from cursor to previous word boundary, yank it. */
export function deleteWordBackwardAndYank(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  const cursor = editor.logicalCursor
  const prevWord = editor.editBuffer.getPrevWordBoundary()
  const text = editor.editBuffer.getTextRange(prevWord.offset, cursor.offset)
  clipboard.yankText(text, api)
  editor.deleteWordBackward()
}

/** `cw` — delete to next word boundary, yank, then enter Insert mode. */
export function changeWord(editor: Editor, api: TuiPluginApi, setMode: SetMode, clipboard: ClipboardManager): void {
  const cursor = editor.logicalCursor
  const nextWord = editor.editBuffer.getNextWordBoundary()
  const text = editor.editBuffer.getTextRange(cursor.offset, nextWord.offset)
  clipboard.yankText(text, api)
  editor.deleteWordForward()
  setMode("insert")
}

/** `J` — join current line with the next line, inserting a space. */
export function joinLines(editor: Editor): void {
  editor.gotoLineEnd()
  editor.deleteChar() // delete the newline character
  editor.insertChar(" ") // insert a space between joined lines
}

// ── Selection commands (Visual mode) ───────────────────

/** Visual `d` / `x` — delete the current selection, yank it, return to Normal. */
export function deleteSelectionAndYank(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  if (!editor.hasSelection()) return
  const text = editor.getSelectedText()
  clipboard.yankText(text, api)
  editor.deleteSelection()
}

/** Visual `y` — yank the current selection, clear selection, return to Normal. */
export function yankSelection(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  if (!editor.hasSelection()) return
  const text = editor.getSelectedText()
  clipboard.yankText(text, api)
  editor.clearSelection()
}

/** Visual `c` — delete selection, yank it, then enter Insert mode. */
export function changeSelection(
  editor: Editor,
  api: TuiPluginApi,
  setMode: SetMode,
  clipboard: ClipboardManager,
): void {
  if (!editor.hasSelection()) return
  const text = editor.getSelectedText()
  clipboard.yankText(text, api)
  editor.deleteSelection()
  setMode("insert")
}

/** `yy` — yank current line without deleting. */
export function yankLine(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  const cursor = editor.logicalCursor
  const lineStart = editor.editBuffer.getLineStartOffset(cursor.row)
  const nextLineStart = editor.editBuffer.getLineStartOffset(cursor.row + 1)
  const text = editor.editBuffer.getTextRange(lineStart, nextLineStart)
  clipboard.yankText(text, api)
}

/** `p` — paste from the unnamed register after cursor. */
export function paste(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  clipboard.pasteFromRegister(editor, api)
}

/** `P` — paste from the unnamed register before cursor. */
export function pasteBefore(editor: Editor, api: TuiPluginApi, clipboard: ClipboardManager): void {
  // Move cursor left so the text is inserted at the current position
  editor.moveCursorLeft()
  clipboard.pasteFromRegister(editor, api)
}

// ── Smart word movement ───────────────────────────────

/**
 * `e` (word-end) — move cursor to the end of the current or next word.
 *
 * No `input.word.end` command exists in the host editor, so we implement
 * it manually by scanning the text.
 *
 * Algorithm:
 *  1. Advance past the current character
 *  2. Skip whitespace (including newlines)
 *  3. Skip non-whitespace characters (the word body)
 *  4. Land on the last character of that word (offset − 1)
 */
export function moveWordEnd(editor: Editor, select?: boolean): void {
  const text = editor.plainText
  let offset = editor.logicalCursor.offset

  // Step 1: advance past current character
  if (offset >= text.length) return
  offset++

  // Step 2: skip whitespace (spaces, tabs, newlines)
  while (offset < text.length && /\s/.test(text[offset])) offset++

  // Step 3: skip word characters (non-whitespace)
  while (offset < text.length && !/\s/.test(text[offset])) offset++

  // Step 4: position at last char of the word
  const targetOffset = offset - 1
  if (targetOffset > editor.logicalCursor.offset) {
    const pos = editor.editBuffer.offsetToPosition(targetOffset)
    if (pos) {
      if (select) {
        // Visual mode: extend selection to include the target character
        const sel = editor.getSelection()
        if (sel) {
          // setSelection end is exclusive → +1 to include the target char
          editor.setSelection(sel.start, targetOffset + 1)
        }
      } else {
        editor.setCursor(pos.row, pos.col)
      }
    }
  }
}

// ── VisualLine helpers ─────────────────────────────────

/**
 * Initialize a line-wise selection covering the current line.
 * Called when entering VisualLine mode (`V`).
 */
export function selectCurrentLine(editor: Editor): void {
  const cursor = editor.logicalCursor
  const lineStart = editor.editBuffer.getLineStartOffset(cursor.row)
  const nextLineStart = editor.editBuffer.getLineStartOffset(cursor.row + 1)
  // Use the range [lineStart, nextLineStart) which includes the newline
  editor.setSelection(lineStart, nextLineStart)
}
