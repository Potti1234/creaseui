import type { Html } from '@effect/ui/html'

import { CodeBlock } from '#components'
import { LINT_CASES } from '../../../../src/docs/lint/cases'
import { LINT_CLI_CASES } from '../../../../src/docs/lint/cli-cases'
import { findLintRule, LINT_RULE_GROUPS } from '../../../../src/docs/lint/rules'
import type { DocsGuide, DocsMessage } from '../types'
import { section } from './setup'

const renderer =
  import.meta.env.MODE === 'stylex' || import.meta.env.MODE === 'pleat'
    ? import.meta.env.MODE
    : 'tailwind'
const code = (
  h: Html.H<DocsMessage>,
  id: string,
  source: string,
  language = 'typescript',
) =>
  CodeBlock(h, {
    id,
    language,
    props: { code: source },
    width: '100%',
    container: 'section',
  })
const ruleLink = (id: string) =>
  id === 'css' || id === 'theme' || id === 'doctor' || id === 'scope'
    ? `/docs/lint/${id}`
    : `/docs/lint/${id}`
const overview: DocsGuide = {
  title: 'Lint rules',
  description:
    'Every rule Crease UI adds, with the bad UI pattern it catches, the diagnostic it reports and the pattern to use instead.',
  view: h =>
    h.div.children(
      ...LINT_RULE_GROUPS.map(group =>
        section(
          h,
          group.id,
          group.label,
          h.p.class('docs-muted').children(group.description),
          h.ul
            .class('docs-compact-list')
            .children(
              group.rules.map(rule =>
                h.li
                  .key(rule.id)
                  .children(
                    h.a
                      .class('docs-inline-link')
                      .attr('href', ruleLink(rule.id))
                      .children(rule.title),
                    h.span.class('docs-muted').children(` ${rule.summary}`),
                  ),
              ),
            ),
        ),
      ),
    ),
}
const detail = (ruleId: string): DocsGuide | undefined => {
  const rule = findLintRule(ruleId)
  if (rule === undefined) return undefined
  const cases = LINT_CASES.filter(
    item => item.rule === ruleId && item.renderers.includes(renderer as never),
  )
  const cliCases = LINT_CLI_CASES.filter(item => item.check === ruleId)
  return {
    title: rule.title,
    description: `${rule.group.label} — ${rule.summary}`,
    view: h =>
      h.div.children(
        h.nav
          .class('docs-breadcrumb')
          .attr('aria-label', 'Breadcrumb')
          .children(
            h.a.attr('href', '/docs/lint').children('Lint rules'),
            h.span.attr('aria-hidden', 'true').children('/'),
            h.span.attr('aria-current', 'page').children(rule.title),
          ),
        ...cases.map(item =>
          section(
            h,
            item.id,
            item.title,
            h.p.class('docs-muted').children(item.description),
            h.h3.children('Bad'),
            code(
              h,
              `${item.id}-bad`,
              item.bad
                .trimStart()
                .replaceAll('foldkit/html', '@effect/ui/html')
                .replaceAll('Foldkit', 'Effect UI')
                .replaceAll('foldkit', 'effect-ui'),
            ) as never,
            h.h3.children('Good'),
            code(
              h,
              `${item.id}-good`,
              item.good
                .trimStart()
                .replaceAll('foldkit/html', '@effect/ui/html')
                .replaceAll('Foldkit', 'Effect UI')
                .replaceAll('foldkit', 'effect-ui'),
            ) as never,
            h.p.children(
              'Expected diagnostic target: ',
              h.code.children(item.expect),
            ),
          ),
        ),
        ...cliCases.map(item =>
          section(
            h,
            item.id,
            item.title,
            h.p.class('docs-muted').children(item.description),
            h.p.children(
              'Command: ',
              h.code.children(`npx creaseui-lint ${item.command.join(' ')}`),
            ),
            h.h3.children('Bad'),
            h.p.class('docs-muted').children(h.code.children(item.bad.path)),
            code(
              h,
              `${item.id}-bad`,
              item.bad.contents.trimStart(),
              item.bad.path.endsWith('.css') ? 'css' : 'typescript',
            ) as never,
            h.h3.children('Good'),
            h.p.class('docs-muted').children(h.code.children(item.good.path)),
            code(
              h,
              `${item.id}-good`,
              item.good.contents.trimStart(),
              item.good.path.endsWith('.css') ? 'css' : 'typescript',
            ) as never,
            h.p.children(
              'Expected diagnostic target: ',
              h.code.children(item.expect),
            ),
          ),
        ),
        cases.length === 0 && cliCases.length === 0
          ? h.p
              .class('docs-muted')
              .children(
                'No renderer-specific example has been generated for this rule yet.',
              )
          : undefined,
      ),
  }
}
const lintEntries: Record<string, DocsGuide> = { '/docs/lint': overview }
for (const group of LINT_RULE_GROUPS) {
  for (const rule of group.rules) {
    const guide = detail(rule.id)
    if (guide !== undefined) lintEntries[`/docs/lint/${rule.id}`] = guide
  }
}
export const lintGuides: Readonly<Record<string, DocsGuide>> = lintEntries
