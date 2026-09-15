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

export interface ConstrainedStyleXOptions {
  files?: string[]
}

export const rules: Record<string, Rule.RuleModule>
export const plugin: ESLint.Plugin
export const tailwind: (options?: TailwindOptions) => Linter.Config
export const stylex: (options?: StyleXOptions) => Linter.Config
export const constrainedStylex: (
  options?: ConstrainedStyleXOptions,
) => Linter.Config

export default plugin
