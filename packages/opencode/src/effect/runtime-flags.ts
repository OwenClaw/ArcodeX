import { Config, ConfigProvider, Context, Effect, Layer } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const boolTrue = (name: string) => Config.boolean(name).pipe(Config.withDefault(true));
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("ARCODEX_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: bool(name) }).pipe(Config.map((flags) => flags.experimental || flags.enabled))

export class Service extends ConfigService.Service<Service>()("@opencode/RuntimeFlags", {
  autoShare: bool("ARCODEX_AUTO_SHARE"),
  pure: bool("ARCODEX_PURE"),
  disableDefaultSkills: bool("ARCODEX_DISABLE_DEFAULT_SKILLS"),
  disableDefaultPlugins: bool("ARCODEX_DISABLE_DEFAULT_PLUGINS"),
  disableChannelDb: bool("ARCODEX_DISABLE_CHANNEL_DB"),
  disableEmbeddedWebUi: bool("ARCODEX_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("ARCODEX_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("ARCODEX_DISABLE_LSP_DOWNLOAD"),
  skipMigrations: bool("ARCODEX_SKIP_MIGRATIONS"),
  disableClaudeCodePrompt: Config.all({
    broad: boolTrue("ARCODEX_DISABLE_CLAUDE_CODE"),
    direct: boolTrue("ARCODEX_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: boolTrue("ARCODEX_DISABLE_CLAUDE_CODE"),
    direct: boolTrue("ARCODEX_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("ARCODEX_ENABLE_EXA"),
    legacy: bool("ARCODEX_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("ARCODEX_ENABLE_PARALLEL"),
    legacy: bool("ARCODEX_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("ARCODEX_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("ARCODEX_ENABLE_QUESTION_TOOL"),
  experimentalScout: enabledByExperimental("ARCODEX_EXPERIMENTAL_SCOUT"),
  experimentalBackgroundSubagents: enabledByExperimental("ARCODEX_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("ARCODEX_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("ARCODEX_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("ARCODEX_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("ARCODEX_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("ARCODEX_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("ARCODEX_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("ARCODEX_EXPERIMENTAL_ICON_DISCOVERY"),
  exploreTaskRoute: boolTrue("ARCODEX_ENABLE_EXPLORE_TASK_ROUTE"),
  outputTokenMax: positiveInteger("ARCODEX_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("ARCODEX_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: enabledByExperimental("ARCODEX_EXPERIMENTAL_NATIVE_LLM"),
  client: Config.string("ARCODEX_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export * as RuntimeFlags from "./runtime-flags"
