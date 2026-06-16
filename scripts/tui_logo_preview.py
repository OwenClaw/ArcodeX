#!/usr/bin/env python3
"""ArcodeX TUI Logo 效果预览 - 所有设计均可直接在终端 TUI 中实现"""

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.box import Box, ASCII, HEAVY, ROUNDED, SQUARE, MINIMAL, DOUBLE

console = Console()

NAME = "ArcodeX"
SUBTITLE = "AI-Powered Coding Agent"


# ─────────────────────────────────────────────
# Style 1: 极简 ASCII 字符画 - 纯 █ 块风格
# ─────────────────────────────────────────────
STYLE1_BLOCKS = r"""
 █████╗ ██████╗  ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗
██╔══██╗██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝
███████║██████╔╝██║     ██║   ██║██║  ██║█████╗   ╚███╔╝
██╔══██║██╔══██╗██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗
██║  ██║██║  ██║╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
"""


def style1_ascii_blocks():
    """Style 1: 经典 FIGlet 风格 - 大字 ASCII 块"""
    return Panel(
        Text(STYLE1_BLOCKS, style="bold cyan"),
        title="Style 1 — Classic ASCII Blocks",
        border_style="cyan",
        box=ROUNDED,
    )


# ─────────────────────────────────────────────
# Style 2: 双层框线 Logo
# ─────────────────────────────────────────────
def style2_double_frame():
    """Style 2: 双层框线 + 居中大字"""
    outer = Panel(
        Panel(
            Text(NAME, style="bold white on blue", justify="center"),
            border_style="bright_blue",
            box=HEAVY,
            padding=(1, 4),
        ),
        title="Style 2 — Double Frame",
        border_style="blue",
        box=DOUBLE,
        padding=(0, 2),
    )
    return outer


# ─────────────────────────────────────────────
# Style 3: 终端窗口标题栏风格
# ─────────────────────────────────────────────
STYLE3_WINDOW = r"""
┌─ ArcodeX ──────────────────────────────────────────── ─┐
│                                                        │
│    █████╗ ██████╗  ██████╗██████╗ ██████╗ ███████╗     │
│   ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝     │
│   ███████║██████╔╝██║     ██║  ██║██║  ██║█████╗       │
│   ██╔══██║██╔══██╗██║     ██║  ██║██║  ██║██╔══╝       │
│   ██║  ██║██║  ██║╚██████╗██████╔╝██████╔╝███████╗     │
│   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═════╝ ╚═════╝ ╚══════╝     │
│                                                        │
│        AI-Powered Coding Agent  v2.0.0                 │
│                                                        │
└────────────────────────────────────────────────────────┘
"""


def style3_terminal_window():
    """Style 3: 终端窗口标题栏风格 - 模拟终端窗口"""
    return Panel(
        Text(STYLE3_WINDOW, style="bold green"),
        title="Style 3 — Terminal Window",
        border_style="green",
        box=ROUNDED,
    )


# ─────────────────────────────────────────────
# Style 4: 极简无框 - 仅文字排版
# ─────────────────────────────────────────────
def style4_minimal():
    """Style 4: 极简无框 - 纯文字排版，适合轻量 TUI"""
    inner = Text()
    inner.append("ArcodeX", style="bold bright_cyan underline")
    inner.append("\n")
    inner.append(SUBTITLE, style="dim italic")
    return Panel(
        inner,
        title="Style 4 — Minimal",
        border_style="bright_black",
        box=MINIMAL,
        padding=(1, 3),
    )


# ─────────────────────────────────────────────
# Style 5: 纯 ██ 像素块大字
# ─────────────────────────────────────────────
STYLE5_PIXEL = r"""
   █████╗   ██████╗    ██████╗   ██████╗  ██████╗   ███████╗ ██╗  ██╗
  ██╔══██╗  ██╔══██╗  ██╔════╝  ██╔═══██╗ ██╔══██╗  ██╔════╝ ╚██╗██╔╝
  ███████║  ██████╔╝  ██║       ██║   ██║ ██║  ██║  █████╗    ╚███╔╝
  ██╔══██║  ██╔══██╗  ██║       ██║   ██║ ██║  ██║  ██╔══╝    ██╔██╗
  ██║  ██║  ██║  ██║  ╚██████╗  ╚██████╔╝ ██████╔╝  ███████╗ ██╔╝ ██╗
  ╚═╝  ╚═╝  ╚═╝  ╚═╝   ╚═════╝   ╚═════╝  ╚═════╝   ╚══════╝ ╚═╝  ╚═╝

   █████╗ ██╗      ██████╗  ██████╗ ██████╗ ███████╗██╗  ██╗
  ██╔══██╗██║     ██╔═══██╗██╔════╝██╔═══██╗██╔════╝╚██╗██╔╝
  ███████║██║     ██║   ██║██║     ██║   ██║█████╗   ╚███╔╝
  ██╔══██║██║     ██║   ██║██║     ██║   ██║██╔══╝   ██╔██╗
  ██║  ██║███████╗╚██████╔╝╚██████╗╚██████╔╝███████╗██╔╝ ██╗
  ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
"""


def style5_pixel_blocks():
    """Style 5: 双行像素块大字 - 上下两行，更有冲击力"""
    return Panel(
        Text(STYLE5_PIXEL, style="bold bright_magenta"),
        title="Style 5 — Double Pixel Blocks",
        border_style="magenta",
        box=HEAVY,
    )


# ─────────────────────────────────────────────
# Style 6: 简洁框线 + 状态栏
# ─────────────────────────────────────────────
def style6_status_bar():
    """Style 6: 状态栏风格 - 带状态信息，适合 CLI 工具 loading 界面"""
    tb = Table(box=MINIMAL, show_header=False, expand=False, padding=(0, 2))
    tb.add_column(style="bold cyan", justify="center")
    tb.add_row(NAME)
    tb.add_row("─" * 24)
    tb.add_row(SUBTITLE)

    info = Table(box=MINIMAL, show_header=False, expand=False, padding=(0, 1))
    info.add_column(style="dim", width=14)
    info.add_column(style="bold green", width=12)
    info.add_row("Version", "v2.0.0")
    info.add_row("Mode", "TUI")
    info.add_row("Engine", "Claude 4")
    info.add_row("Status", "● Ready")

    outer = Table(box=HEAVY, show_header=False, expand=False,
                  border_style="bright_blue")
    outer.add_column(justify="center")
    outer.add_row(tb)
    outer.add_row("")
    outer.add_row(info)

    return Panel(
        outer,
        title="Style 6 — Status Bar",
        border_style="blue",
        box=ROUNDED,
    )


# ─────────────────────────────────────────────
# Style 7: 彩虹渐变线条
# ─────────────────────────────────────────────
RUNES = [
    ("A", "bright_red"),
    ("r", "red"),
    ("c", "yellow"),
    ("o", "green"),
    ("d", "cyan"),
    ("e", "blue"),
    ("x", "magenta"),
]


def style7_rainbow():
    """Style 7: 彩虹渐变 - 每个字母不同色"""
    inner = Text()
    for ch, color in RUNES:
        inner.append(ch, style=f"bold {color}")
    inner.append("\n")
    inner.append(SUBTITLE, style="dim italic")

    return Panel(
        inner,
        title="Style 7 — Rainbow Gradient",
        border_style="bright_black",
        box=ROUNDED,
        padding=(1, 4),
    )


# ─────────────────────────────────────────────
# Style 8: 系统信息面板 (neofetch 风格)
# ─────────────────────────────────────────────
ASCII_ART_LOGO = r"""
      :---:
    .=*%@@%*=.
  :*@@@@@@@@@*:
 :%@@#-   -#@@%:
 *@@*       *@@*
 *@@*       *@@*
 :%@@#-   -#@@%:
  :*@@@@@@@@@*:
    .=*%@@%*=.
      :---:
"""


def style8_neofetch():
    """Style 8: neofetch 风格 - 左图右信息"""
    logo_lines = ASCII_ART_LOGO.strip("\n").split("\n")

    info_lines = [
        (" OS     ", "ArcodeX Terminal"),
        (" Kernel ", "Claude 4 + TUI"),
        (" Shell  ", "bash 5.2"),
        (" Uptime ", "∞"),
        (" Theme  ", "Dark Cyber"),
        ("", ""),
        ("", "▁▂▃▄▅▆▇█"),
    ]

    max_logo = max(len(l) for l in logo_lines)
    rows = max(len(logo_lines), len(info_lines))

    tb = Table(box=None, show_header=False, expand=False, padding=(0, 1))
    tb.add_column(style="cyan", justify="left", no_wrap=True, width=max_logo)
    tb.add_column(style="dim", justify="left", no_wrap=True)
    tb.add_column(style="green", justify="left")
    for i in range(rows):
        logo = logo_lines[i] if i < len(logo_lines) else ""
        lbl, val = info_lines[i] if i < len(info_lines) else ("", "")
        tb.add_row(logo, lbl, val)

    return Panel(
        tb,
        title="Style 8 — Neofetch",
        border_style="cyan",
        box=ROUNDED,
    )


# ─────────────────────────────────────────────
# Style 9: 极简 header bar（Rust ratatui 风格）
# ─────────────────────────────────────────────
def style9_header_bar():
    """Style 9: 顶栏 Header - 典型 TUI 应用标题栏"""
    inner = Text()
    inner.append(" ArcodeX ", style="bold black on bright_cyan")
    inner.append("  ")
    inner.append(SUBTITLE, style="dim bright_cyan")
    inner.append("  ")
    inner.append("[v2.0.0]", style="italic bright_black")

    return Panel(
        inner,
        title="Style 9 — Header Bar",
        border_style="bright_cyan",
        box=HEAVY,
        padding=(0, 2),
    )


# ─────────────────────────────────────────────
# Style 10: 粗框纯英文大字
# ─────────────────────────────────────────────
def style10_bold_frame():
    """Style 10: 粗框 + 大字 - 简约粗犷"""
    inner = Text()
    inner.append("\n", style="")
    inner.append("  A R C O D E X  \n", style="bold bright_white on dark_blue")
    inner.append("\n")
    inner.append("  AI-Powered Coding Agent  \n", style="dim italic cyan")
    inner.append("\n")

    return Panel(
        inner,
        title="Style 10 — Bold Frame",
        border_style="bright_blue",
        box=HEAVY,
        padding=(0, 2),
    )


# ─────────────────────────────────────────────
def main():
    console.print()
    console.print(Panel(
        Text("ArcodeX — TUI Logo 效果预览", style="bold white", justify="center"),
        border_style="bright_cyan",
        box=DOUBLE,
        padding=(0, 8),
    ))
    console.print()

    styles = [
        style1_ascii_blocks,
        style2_double_frame,
        style3_terminal_window,
        style4_minimal,
        style5_pixel_blocks,
        style6_status_bar,
        style7_rainbow,
        style8_neofetch,
        style9_header_bar,
        style10_bold_frame,
    ]

    for fn in styles:
        console.print(fn())
        console.print()

    console.print(Panel(
        Text("以上 10 种风格均使用标准 ANSI/Unicode 字符，可直接在任何 TUI 框架中实现",
             style="dim", justify="center"),
        border_style="bright_black",
        box=MINIMAL,
    ))


if __name__ == "__main__":
    main()