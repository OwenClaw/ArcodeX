import { test, expect } from "bun:test"
import { RGBA } from "@opentui/core"
import { paintGradientBorder } from "./border"

const makeBox = (border: unknown, width: number, height: number) => ({
  border,
  width,
  height,
  screenX: 0,
  screenY: 0,
})

const makeBuffer = (width: number, height: number) => {
  const fg = new Uint16Array(width * height * 4)
  return { buffer: { buffers: { fg }, width }, fg }
}

const rgbAt = (fg: Uint16Array, width: number, x: number, y: number) => {
  const off = (y * width + x) * 4
  return [fg[off], fg[off + 1], fg[off + 2]]
}

test("对角渐变：左上角为主色，右下角为主题色，内部不被动", () => {
  const width = 10
  const height = 3
  const { buffer, fg } = makeBuffer(width, height)
  paintGradientBorder(
    buffer as never,
    makeBox(["top", "right", "bottom", "left"], width, height) as never,
    RGBA.fromInts(255, 0, 0),
    RGBA.fromInts(0, 0, 255),
  )

  expect(rgbAt(fg, width, 0, 0)).toEqual([255, 0, 0]) // 左上 t=0 → 主色 红
  expect(rgbAt(fg, width, 9, 2)).toEqual([0, 0, 255]) // 右下 t=1 → 主题色 蓝
  expect(rgbAt(fg, width, 5, 1)).toEqual([0, 0, 0]) // 非边框 cell 保持不动
})

test("角处颜色连续：左上角与其正下方竖线顶端无突变", () => {
  const width = 10
  const height = 10
  const { buffer, fg } = makeBuffer(width, height)
  paintGradientBorder(
    buffer as never,
    makeBox(["top", "right", "bottom", "left"], width, height) as never,
    RGBA.fromInts(255, 0, 0),
    RGBA.fromInts(0, 0, 255),
  )

  const corner = rgbAt(fg, width, 0, 0) // 左上角
  const below = rgbAt(fg, width, 0, 1) // 紧邻其下的竖线顶端
  // 相邻 cell 的 t 差极小，红色通道差距应远小于旧的顺时针方案（旧方案会从 255 跳到 0）
  expect(Math.abs(corner[0] - below[0])).toBeLessThan(30)
})

test("切换主题色（to）改变渐变终点", () => {
  const width = 6
  const height = 3
  const { buffer, fg } = makeBuffer(width, height)
  paintGradientBorder(
    buffer as never,
    makeBox(["top", "right", "bottom", "left"], width, height) as never,
    RGBA.fromInts(255, 0, 0),
    RGBA.fromInts(0, 255, 0),
  )

  expect(rgbAt(fg, width, 0, 0)).toEqual([255, 0, 0]) // 主色 红
  expect(rgbAt(fg, width, 5, 2)).toEqual([0, 255, 0]) // 主题色 绿
})

test("单边竖线（session 左栏）仍沿纵向渐变", () => {
  const width = 8
  const height = 4
  const { buffer, fg } = makeBuffer(width, height)
  paintGradientBorder(
    buffer as never,
    makeBox(["left"], width, height) as never,
    RGBA.fromInts(255, 0, 0),
    RGBA.fromInts(0, 0, 255),
  )

  // 越往下 t 越大 → 越偏主题色（蓝），蓝色通道递增
  expect(rgbAt(fg, width, 0, 1)[2]).toBeLessThan(rgbAt(fg, width, 0, 2)[2])
})
