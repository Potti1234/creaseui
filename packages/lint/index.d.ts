import type { ESLint, Linter, Rule } from 'eslint'

export type Severity = 'off' | 'warn' | 'error' | 0 | 1 | 2

export interface ComponentContract {
  pattern: string
  allow?: string[]
  deny?: string[]
  message?: string
}

export interface CommonOptions {
  files?: string[]
  ignores?: string[]
  severity?: Severity
  componentImports?: string[]
  ignoreImports?: string[]
}

export interface TailwindOptions extends CommonOptions {
  allow?: string[]
  contracts?: ComponentContract[]
  arbitraryValueAllow?: string[]
  arbitraryValues?: boolean
  inlineStyles?: 'allow' | 'forbid'
  note?: string
  rawColors?: boolean
  restyle?: boolean
  staticClasses?: boolean
}

export interface StyleXOptions extends CommonOptions {
  allowCreateIn?: string[]
  allowPropsIn?: string[]
  inlineStyles?: 'allow' | 'forbid'
  layoutProperties?: string[]
  propLimits?: Record<string, unknown>
  styleResolution?: 'application-order' | 'property-specificity'
}

export interface PleatOptions extends CommonOptions {
  inlineStyles?: 'allow' | 'forbid'
  layoutConstructors?: string[]
  layoutProperties?: string[]
  propLimits?: Record<string, unknown>
  tokenFiles?: string[]
}

export interface ConstrainedStyleXOptions {
  files?: string[]
}

export const rules: Record<string, Rule.RuleModule>
export const plugin: ESLint.Plugin
export const tailwind: (options?: TailwindOptions) => Linter.Config
export const stylex: (options?: StyleXOptions) => Linter.Config
export const pleat: (options?: PleatOptions) => Linter.Config
export const constrainedStylex: (
  options?: ConstrainedStyleXOptions,
) => Linter.Config

export default plugin

export type StrictRenderer = 'tailwind' | 'stylex' | 'pleat'
export type CreaseFileRole =
  | 'renderer'
  | 'behavior'
  | 'theme'
  | 'adapter'
  | 'setup'

export interface CreaseReceiptExport {
  file: string
  name: string
  contract?: string
  renderKind?: 'helper' | 'submodel' | 'non-rendering'
  visibility?: 'public' | 'implementation'
  propsArgument?: number
  builderArgument?: number
  variants?: Record<string, string[]>
}

export interface CreaseReceipt {
  schemaVersion: 1
  policyVersion: 'crease-default-v1'
  renderer: StrictRenderer
  artifacts: Array<{
    id: string
    version?: string
    files: Array<{ path: string; role: CreaseFileRole; rawRendering?: boolean }>
    exports?: CreaseReceiptExport[]
  }>
}

export interface CreaseExtension {
  id: string
  reason: string
  role: CreaseFileRole
  files: string[]
  contract?: string
  rawRendering?: boolean
  exports?: Array<Omit<CreaseReceiptExport, 'file'> & { file: string }>
}

export interface CreaseUIOptions {
  /** Absolute project root; ownership paths resolve against it. */
  rootDir: string
  renderer?: StrictRenderer
  preset?: 'strict' | 'migration'
  /** Legacy files linted at warning level; required for `preset: 'migration'`. */
  migrationFiles?: string[]
  files?: string[]
  tsconfig?: string | string[]
  manifest?: string | CreaseReceipt
  policy?: 'crease-default-v1'
  extensions?: CreaseExtension[]
}

export declare const STRICT_RULE_IDS: readonly [
  'no-raw-controls',
  'no-raw-composition',
  'no-unapproved-renderer',
  'no-application-styles',
  'component-contract',
  'no-unverifiable-ui',
]
export declare class CreaseConfigError extends Error {
  readonly problems: string[]
}
export declare const createStrictContext: (
  options: CreaseUIOptions & { typeInformation?: 'required' | 'syntactic' },
) => unknown
export declare const creaseui: (options: CreaseUIOptions) => Linter.Config[]
