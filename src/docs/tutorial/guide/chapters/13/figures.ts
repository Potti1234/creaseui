import type { Html, HtmlBuilder } from 'foldkit/html'

import { inline, segmented } from '../../shared/prose'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

export const boardFlip = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      segmented(
        h,
        'Stage',
        [
          { value: 'proposal' as const, label: 'The proposal (chapter 12)' },
          { value: 'adopted' as const, label: 'After review (chapter 13)' },
        ],
        model.stage,
        stage => M.ChoseStage({ stage }),
      ),
      h.img([
        h.Attribute(
          'src',
          model.stage === 'proposal'
            ? '/shots/12/board.png'
            : '/shots/13/board-1280.png',
        ),
        h.Attribute(
          'alt',
          model.stage === 'proposal'
            ? 'The proposed board at 1280 pixels, with two columns cut off'
            : 'The adopted board at 1280 pixels, all five columns visible',
        ),
        h.Class('w-full rounded-lg shadow-[0_0_0_1px_var(--border)]'),
      ]),
    ],
  )

type Step = Readonly<{ who: string; what: string; artifact: string }>

const STEPS: ReadonlyArray<Step> = [
  {
    who: 'Feature agent',
    what: 'Gets "Add a board view to team pages". `patterns.md` names no board.',
    artifact: 'A ticket the vocabulary cannot answer',
  },
  {
    who: 'Feature agent',
    what: 'Builds `IssueBoard`, `IssueCard` and a change record inside the feature task, edits decision D3, and asks whether it should have.',
    artifact: 'A proposal (11 files)',
  },
  {
    who: 'Design-system owner',
    what: 'Reviews the proposal against the decisions and the screen. Writes four notes.',
    artifact: 'R1 to R4',
  },
  {
    who: 'Design-system owner',
    what: 'Writes a system-change task: the decision, what may change, what must not, what to run.',
    artifact: 'The brief (Figure 4)',
  },
  {
    who: 'System-change agent',
    what: 'Resolves the notes, restores D3, adds D12, six browser steps and six tests, and confirms a new step fails with the old column width.',
    artifact: 'A reviewable change (10 files)',
  },
  {
    who: 'Design-system owner',
    what: 'Runs every check in the main repository, updates `verification.md`, adopts the change.',
    artifact: '`chapter-13`',
  },
]

export const process = (h: H, model: Model): Html => {
  const step = STEPS[model.step] ?? STEPS[0]!
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      h.ol(
        [h.Class('grid grid-cols-3 gap-1.5 sm:grid-cols-6')],
        STEPS.map((each, index) =>
          h.li(
            [],
            [
              h.button(
                [
                  h.Type('button'),
                  h.AriaPressed(index === model.step ? 'true' : 'false'),
                  h.OnClick(M.ChoseStep({ step: index })),
                  h.Class(
                    `flex h-full w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors ${index === model.step ? 'bg-foreground text-background' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
                  ),
                ],
                [
                  h.span(
                    [h.Class('font-mono text-[11px] opacity-70')],
                    [String(index + 1)],
                  ),
                  h.span(
                    [h.Class('text-[12.5px] leading-tight font-semibold')],
                    [each.who],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            'flex flex-col gap-2 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.p(
            [h.Class('text-[14.5px] leading-[1.6] text-foreground/90')],
            inline(h, step.what),
          ),
          h.div(
            [h.Class('text-[12.5px] text-muted-foreground')],
            ['Produces: ', ...inline(h, step.artifact)],
          ),
        ],
      ),
    ],
  )
}

const NOTES: ReadonlyArray<
  Readonly<{ id: string; note: string; resolution: string }>
> = [
  {
    id: 'R1',
    note: 'At 1280px In Review is cut off and Done is not visible, with no sign that more columns exist.',
    resolution:
      'Columns share the width equally down to 176px. At 1280px each is 192px and all five fit. Below about 1200px only the board scrolls; the page never does.',
  },
  {
    id: 'R2',
    note: "The card's wrapping title is an exception to D1, and the proposal changed D3 inside a feature task.",
    resolution:
      "D3 is back to its `chapter-12` wording. D12 in `principles.md`: a card has the row's parts in the row's order on three lines; its title and labels may wrap.",
  },
  {
    id: 'R3',
    note: 'The browser check does not cover the board.',
    resolution:
      "Six browser steps and six more tests (five Story tests, one unit test). With the proposal's fixed 272px columns put back, the 1280px step fails.",
  },
  {
    id: 'R4',
    note: 'The Board link and the Layout button are two routes to a board; they must lead to the same view. No drag and drop.',
    resolution:
      'Both send the Message the sidebar sends, through one helper, and a Story test compares the two results. The missing drag and drop is named in the change record.',
  },
]

export const notes = (h: H): Html =>
  h.div(
    [
      h.Class(
        'overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--border)]',
      ),
    ],
    [
      h.table(
        [h.Class('w-full text-left text-[13px]')],
        [
          h.thead(
            [h.Class('bg-muted/40 text-[12px] text-muted-foreground')],
            [
              h.tr(
                [],
                [
                  h.th([h.Class('px-4 py-2 font-medium')], []),
                  h.th([h.Class('px-4 py-2 font-medium')], ['Review note']),
                  h.th([h.Class('px-4 py-2 font-medium')], ['Resolution']),
                ],
              ),
            ],
          ),
          h.tbody(
            [h.Class('divide-y divide-border/60')],
            NOTES.map(row =>
              h.tr(
                [],
                [
                  h.td(
                    [
                      h.Class(
                        'px-4 py-2.5 align-top font-mono text-[12px] font-semibold',
                      ),
                    ],
                    [row.id],
                  ),
                  h.td(
                    [h.Class('px-4 py-2.5 align-top text-foreground')],
                    inline(h, row.note),
                  ),
                  h.td(
                    [h.Class('px-4 py-2.5 align-top text-foreground/85')],
                    inline(h, row.resolution),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  )
