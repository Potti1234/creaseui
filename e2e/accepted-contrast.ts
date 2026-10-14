import type { AxeResults } from 'axe-core'

// Palettes keep matching shadcn (owner decision, docs/reliability-ledger.md), so
// these shadcn text/background pairs stay accepted. Any other pair still fails.
export const ACCEPTED_SHADCN_CONTRAST: ReadonlyArray<
  Readonly<{ foreground: string; background: string; source: string }>
> = [
  {
    foreground: '#737373',
    background: '#f5f5f5',
    source:
      'root:light:muted-foreground/muted (palette-contrast-baseline.json)',
  },
  {
    foreground: '#737373',
    background: '#f3f3f3',
    source:
      'root:light muted-foreground on the shadcn choice card bg-primary/5',
  },
  ...['#fde6e7', '#fde5e7'].map(background => ({
    foreground: '#e7000b',
    background,
    source:
      'root:light shadcn Badge destructive: text-destructive on bg-destructive/10',
  })),
]

const isAccepted = (node: AxeResults['violations'][number]['nodes'][number]) =>
  node.any.some(check => {
    const data = check.data as
      | { fgColor?: string; bgColor?: string }
      | null
      | undefined
    return ACCEPTED_SHADCN_CONTRAST.some(
      pair =>
        data?.fgColor === pair.foreground && data.bgColor === pair.background,
    )
  })

export const withoutAcceptedContrast = (
  violations: AxeResults['violations'],
): AxeResults['violations'] =>
  violations.flatMap(violation => {
    if (violation.id !== 'color-contrast') return [violation]
    const nodes = violation.nodes.filter(node => !isAccepted(node))
    return nodes.length === 0 ? [] : [{ ...violation, nodes }]
  })
