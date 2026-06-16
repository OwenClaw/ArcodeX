import { For, createMemo, Show } from "solid-js";
import { RGBA } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/solid";
import { useTheme } from "@tui/context/theme";
import { FOX_GRADIENT_OUTLINE_TRIMMED, FOX_WIDTH, FOX_OUTLINE_ROWS, LOGO_ASCII, LOGO_ASCII_WIDTH, LOGO_ASCII_ROWS, type FoxTone } from "@/cli/fox-logo";

/** Home / onboarding horizontal inset subtracted from terminal width for banner width (0 = full terminal). */
export const BANNER_HOME_CONTENT_INSET = 0;

/** Shared max width for banner, prompt, and onboarding body. */
export const HOME_CONTENT_MAX_WIDTH = 110;

/** Max horizontal padding for home onboarding body (wide terminals). */
export const HOME_CONTENT_PAD_X_MAX = 15;

/**
 * Home onboarding horizontal padding; shrinks on narrow terminals so copy keeps usable width.
 * Wide: aligns under centered banner tagline; narrow: minimal side margin.
 */
export function homeContentPadX(terminalWidth: number): number {
  const w = Math.max(0, Math.floor(terminalWidth));
  if (w >= 110) return HOME_CONTENT_PAD_X_MAX;
  if (w >= 90) return 12;
  if (w >= 72) return 8;
  if (w >= 56) return 4;
  if (w >= 40) return 2;
  return 0;
}

/** Maximum rows for the region below the banner when the terminal is tall enough. */
export const HOME_BODY_MAX_ROWS = 18;

/** @deprecated Use {@link HOME_BODY_MAX_ROWS}. */
export const HOME_BODY_MIN_ROWS = HOME_BODY_MAX_ROWS;

/** Preferred minimum body slot rows; may shrink further when the terminal is very short. */
export const HOME_BODY_SLOT_FLOOR_ROWS = 8;

/** Gap between banner and body slot (terminal rows). */
export const HOME_BODY_GAP_ROWS = 1;

const FOX_GAP = 2;
const FOX_SHOW_MIN_WIDTH = 80;

const GRADIENT_START: [number, number, number] = [100, 220, 220];
const GRADIENT_END: [number, number, number] = [80, 130, 255];

function gradientColor(col: number): RGBA {
  const t = LOGO_ASCII_WIDTH > 1 ? col / (LOGO_ASCII_WIDTH - 1) : 0;
  const r = Math.round(GRADIENT_START[0] + (GRADIENT_END[0] - GRADIENT_START[0]) * t);
  const g = Math.round(GRADIENT_START[1] + (GRADIENT_END[1] - GRADIENT_START[1]) * t);
  const b = Math.round(GRADIENT_START[2] + (GRADIENT_END[2] - GRADIENT_START[2]) * t);
  return RGBA.fromInts(r, g, b);
}

/** Logo row (fox + text) + tagline + padding. */
export const HOME_BANNER_ESTIMATE_ROWS = 1 + Math.max(FOX_OUTLINE_ROWS, LOGO_ASCII_ROWS) + 1 + 1;

/** Reserved rows for `home_footer` and outer vertical breathing room. */
export const HOME_LAYOUT_FOOTER_ROWS = 2;
export const HOME_LAYOUT_MARGIN_ROWS = 2;

/** Body slot rows from terminal height: capped at {@link HOME_BODY_MAX_ROWS}, shrinks when space is tight. */
export function homeBodySlotRows(terminalHeight: number): number {
  const h = Math.max(0, Math.floor(terminalHeight));
  const reserved =
    HOME_BANNER_ESTIMATE_ROWS + HOME_BODY_GAP_ROWS + HOME_LAYOUT_FOOTER_ROWS + HOME_LAYOUT_MARGIN_ROWS;
  const available = h - reserved;
  if (available <= HOME_BODY_SLOT_FLOOR_ROWS) {
    return Math.max(4, available);
  }
  return Math.min(HOME_BODY_MAX_ROWS, available);
}

/** Max textarea rows on the home prompt when the body slot is tall. */
export const HOME_PROMPT_MAX_TEXTAREA_ROWS = 4;

/** Min textarea rows on the home prompt when the terminal is short. */
export const HOME_PROMPT_MIN_TEXTAREA_ROWS = 2;

/** Rows used by home prompt border + idle footer (not the textarea). */
export const HOME_PROMPT_CHROME_ROWS = 3;

/** Rows reserved for `home_bottom` tips when estimating prompt height. */
export const HOME_PROMPT_TIPS_RESERVE_ROWS = 4;

/** Home prompt textarea rows from the shared body slot height. */
export function homePromptTextareaRows(
  bodySlotHeight: number,
  tipsReserveRows: number = HOME_PROMPT_TIPS_RESERVE_ROWS,
): number {
  const inner = Math.max(0, bodySlotHeight - HOME_BODY_GAP_ROWS);
  const available = inner - HOME_PROMPT_CHROME_ROWS - Math.max(0, tipsReserveRows);
  if (available <= HOME_PROMPT_MIN_TEXTAREA_ROWS) {
    return Math.max(1, available);
  }
  return Math.min(HOME_PROMPT_MAX_TEXTAREA_ROWS, available);
}

export function Banner(props?: { contentInset?: number }) {
  const { theme } = useTheme();
  const dimensions = useTerminalDimensions();

  const width = createMemo(() => {
    const inset = props?.contentInset ?? 0;
    return Math.max(0, Math.floor(dimensions().width) - inset);
  });

  const showFox = createMemo(() => width() >= FOX_SHOW_MIN_WIDTH);
  const stripeTransparent = RGBA.fromInts(0, 0, 0, 0);

  const contentWidth = createMemo(() => {
    const foxPart = showFox() ? FOX_WIDTH + FOX_GAP : 0;
    return foxPart + LOGO_ASCII_WIDTH;
  });

  const centerPadLeft = createMemo(() => Math.max(0, Math.floor((width() - contentWidth()) / 2)));

  const textPadTop = 0;
  const foxPadTop = 0;

  const TAGLINE_GRADIENT_START: [number, number, number] = [0, 255, 230];
  const TAGLINE_GRADIENT_END: [number, number, number] = [50, 100, 255];

  function taglineGradientColor(idx: number, len: number): RGBA {
    const t = len > 1 ? idx / (len - 1) : 0;
    return RGBA.fromInts(
      Math.round(TAGLINE_GRADIENT_START[0] + (TAGLINE_GRADIENT_END[0] - TAGLINE_GRADIENT_START[0]) * t),
      Math.round(TAGLINE_GRADIENT_START[1] + (TAGLINE_GRADIENT_END[1] - TAGLINE_GRADIENT_START[1]) * t),
      Math.round(TAGLINE_GRADIENT_START[2] + (TAGLINE_GRADIENT_END[2] - TAGLINE_GRADIENT_START[2]) * t),
    );
  }

  const paddedLogoLines = [
    ...Array(textPadTop).fill(" "),
    ...LOGO_ASCII,
    ...Array(foxPadTop).fill(" "),
  ];

  const taglineA = "Collaborate with ";
  const taglineB = "ArcodeX.";
  const taglineC = " An open-source AI agent for HarmonyOS application development";
  const taglineLen = taglineA.length + taglineB.length + taglineC.length;
  const taglinePadLeft = createMemo(() => Math.max(0, Math.floor((width() - taglineLen) / 2)));

  return (
    <box flexDirection="column" width={width()} backgroundColor={stripeTransparent}>
      <box
        flexDirection="row"
        gap={FOX_GAP}
        paddingLeft={centerPadLeft()}
        backgroundColor={stripeTransparent}
        alignItems="center"
      >
        <Show when={showFox()}>
          <box flexDirection="column" width={FOX_WIDTH}>
            <For each={FOX_GRADIENT_OUTLINE_TRIMMED}>
              {(row) => (
                <text bg={stripeTransparent} selectable={false}>
                  <For each={row}>
                    {(tone: FoxTone) => <span style={{ fg: tone.fg, bg: tone.bg }}>{tone.t}</span>}
                  </For>
                </text>
              )}
            </For>
          </box>
        </Show>
        <box flexDirection="column" paddingTop={1}>
          <For each={paddedLogoLines}>
            {(line) => (
              <text bg={stripeTransparent} selectable={false}>
                <For each={line.split("")}>
                  {(char, idx) => (
                    <span style={{ fg: gradientColor(idx()), bold: true }}>{char}</span>
                  )}
                </For>
              </text>
            )}
          </For>
        </box>
      </box>
      <box width={width()} paddingTop={1}>
        <text bg={stripeTransparent} selectable={false} wrapMode="none">
          <span style={{ fg: theme.textMuted }}>{`${" ".repeat(taglinePadLeft())}${taglineA}`}</span>
          <For each={taglineB.split("")}>
            {(char, idx) => (
              <span style={{ fg: taglineGradientColor(idx(), taglineB.length), bold: true }}>{char}</span>
            )}
          </For>
          <span style={{ fg: theme.textMuted }}>{taglineC}</span>
        </text>
      </box>
    </box>
  );
}
