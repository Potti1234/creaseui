import type { Html, HtmlBuilder } from 'foldkit/html'

import ruleBroken from '../../generated/11/rule-broken.txt?raw'
import ruleTests from '../../generated/11/rule-tests.txt?raw'
import testSource from '../../generated/11/one-primary-action.test.ts.txt?raw'
import { terminal } from '../../shared/artifacts'
import { inline, segmented } from '../../shared/prose'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

/* The six RuleTester cases, read from the test file at chapter-11. Each
   case's `name` and `code` are template or string literals in that file. */
type Case = Readonly<{ name: string; code: string; flagged: boolean }>

const HEADER = "import { button } from '@/ui/button'\n"

const unquote = (literal: string): string =>
  literal
    .slice(1, -1)
    .replaceAll('${header}', HEADER)
    .replaceAll('\\n', '\n')
    .replaceAll("\\'", "'")

const CASES: ReadonlyArray<Case> = [
  ...testSource.matchAll(
    /name: (['"`])((?:(?!\1).|\\\1)*)\1,\s*code: (`[^`]*`|"[^"]*")/gu,
  ),
].map(match => ({
  name: (match[2] ?? '').replaceAll("\\'", "'"),
  code: unquote(match[3] ?? ''),
  flagged: testSource.indexOf(match[0]) > testSource.indexOf('invalid: ['),
}))

const resultLine = (output: string, name: string): string =>
  output
    .split('\n')
    .find(line => line.includes(name))
    ?.trim()
    .slice(0, 1) ?? '?'

export const cases = (h: H, model: Model): Html => {
  const chosen = CASES[model.caseIndex] ?? CASES[0]!
  const output = model.isRuleBroken ? ruleBroken : ruleTests
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center justify-between gap-3')],
        [
          segmented(
            h,
            'Rule',
            [
              { value: 'working' as const, label: 'The rule' },
              {
                value: 'broken' as const,
                label: 'The rule with its report removed',
              },
            ],
            model.isRuleBroken ? 'broken' : 'working',
            () => M.ToggledRule(),
          ),
          h.span(
            [h.Class('text-[12.5px] text-muted-foreground')],
            inline(h, 'RuleTester results from `npx vitest run test/rules`'),
          ),
        ],
      ),
      h.div(
        [h.Class('grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]')],
        [
          h.div(
            [
              h.Role('group'),
              h.AriaLabel('Test cases'),
              h.Class('flex flex-col gap-1.5'),
            ],
            CASES.map((each, index) => {
              const mark = resultLine(output, each.name)
              return h.button(
                [
                  h.Type('button'),
                  h.AriaPressed(index === model.caseIndex ? 'true' : 'false'),
                  h.OnClick(M.ChoseCase({ index })),
                  h.Class(
                    `flex items-start gap-2 rounded-lg px-3 py-2 text-left text-[13px] leading-snug transition-colors ${index === model.caseIndex ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
                  ),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        `font-mono font-semibold ${mark === '✓' ? 'text-emerald-600' : 'text-rose-600'}`,
                      ),
                    ],
                    [mark === '✓' ? '✓' : '✕'],
                  ),
                  h.span(
                    [],
                    [
                      `${each.flagged ? 'Must flag' : 'Must pass'}: ${each.name}`,
                    ],
                  ),
                ],
              )
            }),
          ),
          h.div(
            [
              h.Class(
                'flex min-w-0 flex-col gap-2 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
              ),
            ],
            [
              h.pre(
                [
                  h.Class(
                    'overflow-x-auto font-mono text-[12px] leading-[1.6] text-foreground/85',
                  ),
                ],
                [chosen.code],
              ),
              h.p(
                [h.Class('text-[13.5px] text-foreground/90')],
                [
                  chosen.flagged
                    ? 'The rule must report the second primary button.'
                    : 'The rule must stay silent.',
                  ' ',
                  resultLine(output, chosen.name) === '✓'
                    ? h.span(
                        [h.Class('font-semibold text-emerald-700')],
                        ['The test passes.'],
                      )
                    : h.span(
                        [h.Class('font-semibold text-rose-700')],
                        ['The test fails.'],
                      ),
                ],
              ),
            ],
          ),
        ],
      ),
      terminal(h, 'npx vitest run test/rules --reporter=verbose', output),
    ],
  )
}
