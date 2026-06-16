import { type BoxRenderable, type OptimizedBuffer, type RGBA } from "@opentui/core"

export const EmptyBorder = {
  topLeft: "",
  bottomLeft: "",
  vertical: "",
  topRight: "",
  bottomRight: "",
  horizontal: " ",
  bottomT: "",
  topT: "",
  cross: "",
  leftT: "",
  rightT: "",
}

export const SplitBorder = {
  border: ["left" as const, "right" as const],
  customBorderChars: {
    ...EmptyBorder,
    vertical: "┃",
  },
}

type GradientSides = { top: boolean; right: boolean; bottom: boolean; left: boolean }

function resolveBorderSides(border: boolean | string[]): GradientSides {
  if (border === true) return { top: true, right: true, bottom: true, left: true }
  if (Array.isArray(border)) {
    return {
      top: border.includes("top"),
      right: border.includes("right"),
      bottom: border.includes("bottom"),
      left: border.includes("left"),
    }
  }
  return { top: false, right: false, bottom: false, left: false }
}

/**
 * Rewrites each border cell's foreground, interpolated from `from` to `to`.
 * opentui's native box border is a single color (the FFI `bufferDrawBox` takes
 * one `borderColor`), so this is what gives the prompt a real 主色→主题色 stroke.
 *
 * Call from the box's `renderAfter` hook, after the base border is drawn and
 * before children paint (children are scissored inside the border, so they never
 * touch these cells). Only the foreground channel is rewritten — the border
 * character and background from the base class are preserved.
 *
 * The interpolation factor is diagonal: `t` blends the cell's horizontal and
 * vertical position. That keeps `t` continuous between any two neighbouring
 * cells, so there is no colour seam at the corners — a perimeter-ordered
 * gradient would jump from the start colour straight to the end colour between
 * the top-left corner and the cell directly below it.
 */
export function paintGradientBorder(buffer: OptimizedBuffer, box: BoxRenderable, from: RGBA, to: RGBA) {
  const sides = resolveBorderSides(box.border)
  if (!sides.top && !sides.right && !sides.bottom && !sides.left) return
  const width = box.width
  const height = box.height
  if (width < 2 || height < 2) return

  const x0 = box.screenX
  const y0 = box.screenY
  const denomX = width > 1 ? width - 1 : 1
  const denomY = height > 1 ? height - 1 : 1
  const fromRgb = from.toInts()
  const toRgb = to.toInts()
  const fg = buffer.buffers.fg
  const bufferWidth = buffer.width

  const paint = (cx: number, cy: number) => {
    // Horizontal edges (top/bottom): t = diagonal blend so corners stay continuous.
    // Vertical edges (left/right): t = pure vertical position so the full from→to
    // range is used and the gradient feels smooth along the rail, not halved.
    const t = (cx === x0 || cx === x0 + width - 1)
      ? (cy - y0) / denomY
      : ((cx - x0) / denomX + (cy - y0) / denomY) / 2
    const off = (cy * bufferWidth + cx) * 4
    fg[off] = Math.round(fromRgb[0] + (toRgb[0] - fromRgb[0]) * t)
    fg[off + 1] = Math.round(fromRgb[1] + (toRgb[1] - fromRgb[1]) * t)
    fg[off + 2] = Math.round(fromRgb[2] + (toRgb[2] - fromRgb[2]) * t)
    fg[off + 3] = 255
  }

  if (sides.top) for (let i = 0; i < width; i++) paint(x0 + i, y0)
  if (sides.bottom) for (let i = 0; i < width; i++) paint(x0 + i, y0 + height - 1)
  if (sides.left) for (let i = 0; i < height; i++) paint(x0, y0 + i)
  if (sides.right) for (let i = 0; i < height; i++) paint(x0 + width - 1, y0 + i)
}
