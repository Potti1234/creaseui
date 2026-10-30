import type { Html, HtmlBuilder } from 'foldkit/html'

import pleatButton from '../../generated/01/button-pleat-full.txt?raw'
import stylexButton from '../../generated/01/button-stylex-full.txt?raw'
import tailwindButton from '../../generated/01/button-ui-full.txt?raw'
import { codeBlock } from '../../shared/artifacts'
import { screenshot } from '../../shared/early'
import { inline, segmented } from '../../shared/prose'
import {
  type Layer,
  type Message,
  Message as M,
  type Model,
  type Renderer,
  type Screen,
} from './model'

type H = HtmlBuilder<Message>

/* The three layers of the guide-series plan, with the files of Crease Tasks
   that belong to each at chapter-14. */

const LAYERS: ReadonlyArray<
  Readonly<{
    id: Layer
    name: string
    crease: string
    you: string
    files: ReadonlyArray<string>
  }>
> = [
  {
    id: 'foundation',
    name: 'Foundation',
    crease:
      'Components, their accessible behaviour, the theme base, the lint and its CLI.',
    you: 'Which components you install, and the renderer.',
    files: [
      'src/ui/*.ts (22 components)',
      'src/lib/*.ts (14 implementations)',
      'src/styles.css (crease theme)',
      'vendor/creaseui-lint-0.1.0.tgz',
    ],
  },
  {
    id: 'system',
    name: 'Product system',
    crease:
      'The preset compiler, the receipt format, the strict lint policy, examples like this guide.',
    you: 'The theme values, the variants your components accept, the patterns, the rules and their exceptions.',
    files: [
      'src/theme/tokens.css, geometry.css, mode.ts',
      'src/design/*.ts (11 patterns and the glyphs)',
      'crease.lock.json (allowed values)',
      'eslint.config.js, policy/product-policy.js',
      'tooling/eslint-plugin-crease-tasks (one custom rule)',
      'design-system/*.md (decisions, patterns, change records)',
      'AGENTS.md',
    ],
  },
  {
    id: 'application',
    name: 'Application',
    crease: 'The checks that keep this layer inside the system.',
    you: 'Domain data, state, features, and how they are composed within the rules above.',
    files: [
      'src/domain.ts',
      'src/model.ts',
      'src/storage.ts',
      'src/features/*.ts (5 views)',
      'src/view.ts',
      'src/main.ts',
    ],
  },
]

export const layers = (h: H, model: Model): Html => {
  const chosen = LAYERS.find(layer => layer.id === model.layer) ?? LAYERS[0]!
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      h.div(
        [h.Class('grid gap-2 sm:grid-cols-3')],
        LAYERS.map((layer, index) =>
          h.button(
            [
              h.Type('button'),
              h.AriaPressed(layer.id === chosen.id ? 'true' : 'false'),
              h.OnClick(M.ChoseLayer({ layer: layer.id })),
              h.Class(
                `flex flex-col items-start gap-0.5 rounded-xl px-4 py-3 text-left ${layer.id === chosen.id ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
              ),
            ],
            [
              h.span(
                [h.Class('text-[11.5px] opacity-70')],
                [`Layer ${index + 1}`],
              ),
              h.span([h.Class('text-[15px] font-semibold')], [layer.name]),
            ],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            'grid gap-4 rounded-xl bg-background p-4 text-[14px] leading-[1.6] shadow-[0_0_0_1px_var(--border)] sm:grid-cols-3',
          ),
        ],
        [
          column(h, 'crease supplies', [h.p([], inline(h, chosen.crease))]),
          column(h, 'You own', [h.p([], inline(h, chosen.you))]),
          column(h, 'In Crease Tasks', [
            h.ul(
              [
                h.Class(
                  'flex flex-col gap-1 font-mono text-[12px] text-foreground/85',
                ),
              ],
              chosen.files.map(file => h.li([], [file])),
            ),
          ]),
        ],
      ),
    ],
  )
}

const column = (h: H, title: string, body: ReadonlyArray<Html>): Html =>
  h.div(
    [h.Class('flex flex-col gap-1.5')],
    [
      h.div(
        [
          h.Class(
            'text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
          ),
        ],
        [title],
      ),
      ...body,
    ],
  )

const SOURCES: Readonly<
  Record<Renderer, Readonly<{ file: string; code: string }>>
> = {
  tailwind: { file: 'src/ui/button.ts (101 lines)', code: tailwindButton },
  stylex: { file: 'src/stylex/button.ts (321 lines)', code: stylexButton },
  pleat: { file: 'src/pleat/button.ts (307 lines)', code: pleatButton },
}

export const renderers = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      segmented(
        h,
        'Renderer',
        [
          { value: 'tailwind' as const, label: 'Tailwind' },
          { value: 'stylex' as const, label: 'StyleX' },
          { value: 'pleat' as const, label: 'Pleat' },
        ],
        model.renderer,
        renderer => M.ChoseRenderer({ renderer }),
      ),
      codeBlock(
        h,
        SOURCES[model.renderer].file,
        SOURCES[model.renderer].code.trimEnd(),
        true,
      ),
    ],
  )

const SCREENS: Readonly<
  Record<Screen, Readonly<{ label: string; alt: string }>>
> = {
  list: { label: 'All issues', alt: 'All issues as a list grouped by status' },
  board: {
    label: 'Team board',
    alt: "The Engineering team's issues as a board with one column per status",
  },
  composer: {
    label: 'Command menu',
    alt: 'The Ctrl+K command menu over the list, filtered by a search',
  },
}

export const finishedApp = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      segmented(
        h,
        'Screen',
        (['list', 'board', 'composer'] as const).map(value => ({
          value,
          label: SCREENS[value].label,
        })),
        model.screen,
        screen => M.ChoseScreen({ screen }),
      ),
      screenshot(
        h,
        `/shots/01/final-${model.screen}.png`,
        SCREENS[model.screen].alt,
        'creaseui-demo · chapter-14',
      ),
    ],
  )
