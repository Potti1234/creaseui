import type { AuditException, AuditFinding, AuditRule } from './audit.js'

/** Only the page methods the SDK uses, so any Playwright version works. */
export interface UIPage {
  url(): string
  evaluate<Result, Argument>(
    fn: (argument: Argument) => Result | Promise<Result>,
    argument: Argument,
  ): Promise<Result>
}

export interface UIException {
  rule: AuditRule
  selector: string
  owner: string
  reason: string
}

export interface UIPolicy {
  minimumTarget: number
  failOn: 'error' | 'warning'
  exceptions: ReadonlyArray<UIException>
}

export interface UICoverageItem {
  rule: AuditRule
  selector: string
  reason: string
}

export interface UIReport {
  engine: { name: string; version: string; host: 'page' }
  state: string
  url: string
  failOn: 'error' | 'warning'
  findings: ReadonlyArray<
    Pick<
      AuditFinding,
      | 'rule'
      | 'severity'
      | 'selector'
      | 'region'
      | 'measured'
      | 'expected'
      | 'fix'
    >
  >
  coverage: {
    checked: Record<string, number>
    unresolved: ReadonlyArray<UICoverageItem>
    unsupported: ReadonlyArray<UICoverageItem>
    excluded: ReadonlyArray<UICoverageItem & { exception: number }>
    /** False when any measurement was unresolved or unsupported. */
    complete: boolean
  }
  /** `incomplete` takes precedence over findings and never passes. */
  outcome: 'passed' | 'failed' | 'incomplete'
  exceptions: { used: ReadonlyArray<UIException> }
}

export interface UIAuditOptions {
  policy?: Partial<UIPolicy>
  state?: string
  timeout?: number
}

export declare const renderedRuleIds: ReadonlyArray<AuditRule>
export declare function createUIPolicy(overrides?: Partial<UIPolicy>): UIPolicy
/** Measures the current document and state; the caller owns navigation, themes and interactions. */
export declare function auditUI(
  page: UIPage,
  options?: UIAuditOptions,
): Promise<UIReport>
/** Throws unless the report is complete and has no blocking findings. */
export declare function assertUI(report: UIReport): void
export declare function expectUI(
  page: UIPage,
  testInfo: {
    attach(
      name: string,
      options: { body: string; contentType: string },
    ): Promise<unknown>
  },
  options?: UIAuditOptions,
): Promise<void>

export type { AuditException }
