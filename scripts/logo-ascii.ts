const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const DIM = "\x1b[2m"
const CYAN = "\x1b[36m"
const BRIGHT_CYAN = "\x1b[96m"

export const LOGO_ASCII = [
  " █████╗ ██████╗  ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗",
  "██╔══██╗██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝",
  "███████║██████╔╝██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ ",
  "██╔══██║██╔══██╗██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ ",
  "██║  ██║██║  ██║╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗",
  "╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝",
]

export const LOGO_ASCII_PLAIN = LOGO_ASCII.join("\n")

export function renderLogo(color: "cyan" | "bright_cyan" = "cyan"): string {
  const c = color === "bright_cyan" ? BRIGHT_CYAN : CYAN
  return BOLD + c + LOGO_ASCII_PLAIN + RESET
}

export function renderLogoWithSubtitle(
  subtitle: string = "AI-Powered HarmonyOS Development Tool",
  color: "cyan" | "bright_cyan" = "cyan",
): string {
  const c = color === "bright_cyan" ? BRIGHT_CYAN : CYAN
  const lines: string[] = []
  lines.push("")
  lines.push(BOLD + c + LOGO_ASCII_PLAIN + RESET)
  lines.push("")
  lines.push(DIM + subtitle + RESET)
  lines.push("")
  return lines.join("\n")
}

if (import.meta.main) {
  const color = (process.argv[2] as "cyan" | "bright_cyan") ?? "cyan"
  const withSubtitle = process.argv.includes("--subtitle")
  const output = withSubtitle ? renderLogoWithSubtitle(undefined, color) : renderLogo(color)
  console.log(output)
}