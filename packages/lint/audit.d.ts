export declare const AUDIT_SCHEMA_VERSION: 1
export declare const AUDIT_ENGINE: Readonly<{ name: string; version: string }>
export type AuditRule =
  | 'accessible-name'
  | 'label-reference'
  | 'form-association'
  | 'document-overflow'
  | 'overlay-bounds'
  | 'target-size'
  | 'text-contrast'
  | 'numeric-text'
  | 'unsupported-content'
export declare const AUDIT_RULES: ReadonlyArray<AuditRule>

/** Minimal page surface used by state callbacks (Playwright's Page satisfies it). */
export interface AuditPage {
  click(selector: string): Promise<void>
  locator(selector: string): unknown
  evaluate<R>(fn: () => R | Promise<R>): Promise<R>
}

export type AuditThemeSetup =
  | { kind: 'class'; value: string; target?: 'html' | 'body' }
  | {
      kind: 'attribute'
      name: string
      value?: string
      target?: 'html' | 'body'
    }
  | {
      kind: 'storage'
      key: string
      value?: string
      storage?: 'local' | 'session'
    }

export interface AuditState {
  name: string
  /** Performs the transition; must be paired with `expect`. */
  run?: (page: AuditPage) => Promise<void> | void
  /** Asserts the transition reached the declared state; throw or return false. */
  expect?: (page: AuditPage) => Promise<boolean | void> | boolean | void
}

export interface AuditCase {
  id: string
  url: string
  /** Selector that must be visible before measuring. Defaults to `body`. */
  ready?: string
  directions?: ReadonlyArray<'ltr' | 'rtl'>
  motion?: 'reduce' | 'no-preference'
  states?: ReadonlyArray<AuditState>
}

export interface AuditException {
  rule: AuditRule
  selector: string
  reason: string
  owner: string
  /** Case id or '*'. */
  scope?: string
}

export interface AuditConfig {
  policy?: 'crease-default-v1'
  renderer?: 'tailwind' | 'stylex' | 'pleat'
  failOn?: 'error' | 'warning'
  minimumTarget?: number
  timeout?: number
  artifactsDir?: string
  ready?: string
  directions?: ReadonlyArray<'ltr' | 'rtl'>
  motion?: 'reduce' | 'no-preference'
  viewports?: ReadonlyArray<{ name: string; width: number; height: number }>
  themes?: ReadonlyArray<{ name: string; apply?: AuditThemeSetup }>
  cases: ReadonlyArray<AuditCase>
  exceptions?: ReadonlyArray<AuditException>
}

export interface AuditFinding {
  case: string
  url: string
  renderer?: string
  theme: string
  viewport: string
  direction: 'ltr' | 'rtl'
  state: string
  rule: AuditRule
  severity: 'error' | 'warning'
  selector: string
  region: string | null
  measured: string
  expected: string
  fix: string
}

export interface AuditCoverage {
  checked: number
  failed: number
  unresolved: number
  unsupported: number
  unvisited: number
  /** Combinations measured with unresolved or unsupported required content. */
  incomplete: number
  /** Every configured combination; each one has a recorded outcome. */
  expected: number
  /** True only when every combination was visited and fully measured. */
  complete: boolean
  excluded: number
}

export interface AuditReport {
  schemaVersion: 1
  engine: { name: string; version: string; host: string }
  policy: string
  renderer?: string
  failOn: 'error' | 'warning'
  reportOnly: boolean
  /** 0 complete and passing, 1 findings, 2 incomplete or invalid setup. */
  exitCode: 0 | 1 | 2
  coverage: AuditCoverage
  findings: ReadonlyArray<AuditFinding>
  results: ReadonlyArray<Record<string, unknown>>
  interactions: ReadonlyArray<{
    case: string
    state: string
    assertion: 'passed'
  }>
  exceptions: {
    used: ReadonlyArray<AuditException>
    unused: ReadonlyArray<AuditException>
  }
}

export declare class AuditSetupError extends Error {}
export declare const normalizeAuditConfig: (config: AuditConfig) => unknown
export declare const loadAuditConfig: (file: string) => Promise<AuditConfig>
export declare const runAudit: (
  config: AuditConfig,
  options?: { reportOnly?: boolean; searchFrom?: ReadonlyArray<string> },
) => Promise<AuditReport>
