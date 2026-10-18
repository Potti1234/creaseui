export type LintDiagnostic = Readonly<{
  ruleId: string
  message: string
  line: number
  column: number
  endLine: number
  endColumn: number
}>
