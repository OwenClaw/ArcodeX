declare global {
  const ARCODEX_VERSION: string
  const ARCODEX_CHANNEL: string
}

export const InstallationVersion = typeof ARCODEX_VERSION === "string" ? ARCODEX_VERSION : "local"
export const InstallationChannel = typeof ARCODEX_CHANNEL === "string" ? ARCODEX_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
