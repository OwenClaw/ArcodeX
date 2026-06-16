import { createSignal } from "solid-js"

// Login is optional. This signal controls whether the ArcodeX onboarding page
// (HUAWEI account sign-in / other model provider configuration) is shown over
// the conversation. Defaults to false — the app launches straight in.
const [showLogin, setShowLogin] = createSignal(false)

export { showLogin }

export function dismissLogin() {
  setShowLogin(false)
}
