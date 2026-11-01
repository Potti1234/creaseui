import type { Html, HtmlBuilder } from 'foldkit/html'

import lintMigration from '../../generated/02/lint-02.txt?raw'
import lintStrict from '../../generated/02/lint-02-strict.txt?raw'
import receipt from '../../generated/02/receipt.json'
import { terminal } from '../../shared/artifacts'
import { screenshot } from '../../shared/early'
import { segmented } from '../../shared/prose'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

type Artifact = Readonly<{
  id: string
  files: ReadonlyArray<Readonly<{ path: string; role: string; raw: boolean }>>
  exports: ReadonlyArray<
    Readonly<{ name: string; contract: string; visibility: string }>
  >
}>

const ARTIFACTS = (receipt as Readonly<{ artifacts: ReadonlyArray<Artifact> }>)
  .artifacts

const GROUPS: ReadonlyArray<
  Readonly<{ title: string; test: (id: string) => boolean }>
> = [
  {
    title: 'Components (src/ui)',
    test: id => !id.startsWith('crease/lib-') && !id.startsWith('crease/setup'),
  },
  {
    title: 'Implementations (src/lib)',
    test: id => id.startsWith('crease/lib-'),
  },
  { title: 'Setup', test: id => id.startsWith('crease/setup') },
]

const shortName = (id: string): string => id.replace(/^crease\/(lib-)?/u, '')

/* ---- The receipt ------------------------------------------------------- */

export const receiptExplorer = (h: H, model: Model): Html => {
  const chosen =
    ARTIFACTS.find(artifact => artifact.id === model.artifact) ?? ARTIFACTS[0]!
  const shown = chosen.exports.slice(0, 8)
  return h.div(
    [h.Class('grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]')],
    [
      h.div(
        [h.Class('flex flex-col gap-3')],
        GROUPS.map(group =>
          h.div(
            [],
            [
              h.div(
                [
                  h.Class(
                    'mb-1.5 text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
                  ),
                ],
                [group.title],
              ),
              h.div(
                [
                  h.Role('group'),
                  h.AriaLabel(group.title),
                  h.Class('flex flex-wrap gap-1'),
                ],
                ARTIFACTS.filter(artifact => group.test(artifact.id)).map(
                  artifact =>
                    h.button(
                      [
                        h.Type('button'),
                        h.AriaPressed(
                          artifact.id === chosen.id ? 'true' : 'false',
                        ),
                        h.OnClick(M.ChoseArtifact({ id: artifact.id })),
                        h.Class(
                          `rounded-md px-2 py-0.5 font-mono text-[12px] ${artifact.id === chosen.id ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
                        ),
                      ],
                      [shortName(artifact.id)],
                    ),
                ),
              ),
            ],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            'flex min-w-0 flex-col gap-3 rounded-xl bg-background p-4 text-[13px] shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.div(
            [h.Class('font-mono text-[13px] font-semibold text-foreground')],
            [chosen.id],
          ),
          h.div(
            [h.Class('flex flex-col gap-1')],
            chosen.files.map(file =>
              h.div(
                [h.Class('flex flex-wrap items-baseline gap-x-2')],
                [
                  h.span(
                    [h.Class('font-mono text-[12px] text-foreground')],
                    [file.path],
                  ),
                  h.span(
                    [h.Class('text-muted-foreground')],
                    [`role ${file.role}`],
                  ),
                  h.span(
                    [
                      h.Class(
                        `rounded px-1.5 text-[11.5px] font-medium ${file.raw ? 'bg-amber-100 text-amber-900' : 'bg-muted text-muted-foreground'}`,
                      ),
                    ],
                    [file.raw ? 'may draw raw HTML' : 'no raw HTML'],
                  ),
                ],
              ),
            ),
          ),
          chosen.exports.length === 0
            ? h.p(
                [h.Class('text-muted-foreground')],
                ['No render exports: this file only holds data or helpers.'],
              )
            : h.table(
                [h.Class('w-full text-left')],
                [
                  h.thead(
                    [],
                    [
                      h.tr(
                        [],
                        ['export', 'contract', 'visibility'].map(cell =>
                          h.th(
                            [
                              h.Class(
                                'pb-1 text-[11.5px] font-medium text-muted-foreground',
                              ),
                            ],
                            [cell],
                          ),
                        ),
                      ),
                    ],
                  ),
                  h.tbody(
                    [],
                    shown.map(each =>
                      h.tr(
                        [],
                        [
                          h.td(
                            [
                              h.Class(
                                'py-0.5 pr-3 font-mono text-[12px] text-foreground',
                              ),
                            ],
                            [each.name],
                          ),
                          h.td(
                            [
                              h.Class(
                                'py-0.5 pr-3 font-mono text-[12px] text-foreground/80',
                              ),
                            ],
                            [each.contract],
                          ),
                          h.td(
                            [
                              h.Class(
                                `py-0.5 text-[12px] ${each.visibility === 'implementation' ? 'text-amber-800' : 'text-emerald-800'}`,
                              ),
                            ],
                            [each.visibility],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
          ...(chosen.exports.length > shown.length
            ? [
                h.p(
                  [h.Class('text-muted-foreground')],
                  [
                    `… and ${chosen.exports.length - shown.length} more exports.`,
                  ],
                ),
              ]
            : []),
        ],
      ),
    ],
  )
}

/* ---- The slice ---------------------------------------------------------- */

const SCREENS = {
  all: { file: 'chapter-02-all.png', label: 'All issues' },
  mine: { file: 'chapter-02-mine.png', label: 'My issues' },
  search: { file: 'chapter-02-search.png', label: 'Search for “issue”' },
} as const

export const slice = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      segmented(
        h,
        'View',
        [
          { value: 'all' as const, label: 'All issues' },
          { value: 'mine' as const, label: 'My issues' },
          { value: 'search' as const, label: 'Search' },
        ],
        model.screen,
        screen => M.ChoseScreen({ screen }),
      ),
      screenshot(
        h,
        `/shots/${SCREENS[model.screen].file}`,
        `Crease Tasks at chapter 2: ${SCREENS[model.screen].label}`,
        `creaseui-demo · chapter-02 · ${SCREENS[model.screen].label}`,
      ),
    ],
  )

/* ---- The same findings, two modes ---------------------------------------- */

export const lintModes = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      segmented(
        h,
        'Preset',
        [
          { value: 'migration' as const, label: "preset: 'migration'" },
          { value: 'strict' as const, label: "preset: 'strict'" },
        ],
        model.lintMode,
        mode => M.ChoseLintMode({ mode }),
      ),
      terminal(
        h,
        'npx eslint src',
        model.lintMode === 'migration' ? lintMigration : lintStrict,
        /problems/u,
      ),
    ],
  )
