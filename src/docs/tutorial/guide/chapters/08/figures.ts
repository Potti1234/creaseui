import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineView } from 'foldkit/submodel'

import * as App from '../../snapshots/chapter-08/model'
import { view as appPage } from '../../snapshots/chapter-08/view'
import { inline, segmented } from '../../shared/prose'
import { type Flow, type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

/* ---- Two flows, step by step --------------------------------------------- */

type Step = Readonly<{ name: string; what: string; model: string }>

const FLOWS: Readonly<Record<Flow, ReadonlyArray<Step>>> = {
  picker: [
    {
      name: 'Open',
      what: "A click on the status glyph of `CRE-131` sends `GotPickerMessage` with the menu's own `Opened` message.",
      model:
        "picker: null → { key: 'CRE-131--status', menu: { isOpen: true, … } }",
    },
    {
      name: 'Choose',
      what: "Choosing In Progress sends the menu's `SelectedItem`. `DropdownMenu.update` answers with the OutMessage `Selected { value: 'in_progress' }`.",
      model: 'picker.menu.isOpen: true → false',
    },
    {
      name: 'Commit',
      what: "update applies the value to the issue at once with `withProperty`. There is no draft: the chosen status is the issue's status.",
      model: "issues[CRE-131].status: 'todo' → 'in_progress'",
    },
    {
      name: 'Save',
      what: 'The same update returns `SaveIssues({ issues, nextNumber })`. The list already shows the issue in In Progress; storing it happens after.',
      model: 'commands: [FocusTrigger, SaveIssues]',
    },
    {
      name: 'Confirm',
      what: 'The Command answers `SucceededSave`, or `FailedSave`, which shows the SaveNotice with Retry. Focus is back on the glyph.',
      model: "save: 'saved' (or 'failed')",
    },
  ],
  composer: [
    {
      name: 'Open',
      what: '`ClickedNewIssue` calls `Dialog.open`. The dialog focuses the title field.',
      model: 'composer.isOpen: false → true',
    },
    {
      name: 'Type',
      what: 'Each keystroke sends `ChangedDraftTitle`. It changes `draft`, a field of the page Model. The issue list does not change.',
      model: "draft.title: '' → 'Show a toast after creating an issue'",
    },
    {
      name: 'Close',
      what: 'Escape closes the dialog. The draft stays in the Model, and the header button reads New issue (draft).',
      model: 'composer.isOpen: true → false; draft unchanged',
    },
    {
      name: 'Create',
      what: '`SubmittedComposer` validates the title. Empty, it sets `titleError` and focuses the title. Valid, it adds the issue, clears the draft and closes the dialog.',
      model: 'issues: [CRE-143, …]; nextNumber: 143 → 144; draft: emptyDraft',
    },
    {
      name: 'Save',
      what: 'The same `SaveIssues` Command a status change uses. One way to store, whatever changed.',
      model: "commands: [the dialog's closing Commands, SaveIssues]",
    },
  ],
}

export const stepper = (h: H, model: Model): Html => {
  const steps = FLOWS[model.flow]
  const current = steps[model.step] ?? steps[0]!
  return h.div(
    [h.Class('flex flex-col gap-4')],
    [
      segmented(
        h,
        'Flow',
        [
          { value: 'picker' as const, label: 'Change a status' },
          { value: 'composer' as const, label: 'Create an issue' },
        ],
        model.flow,
        flow => M.ChoseFlow({ flow }),
      ),
      h.ol(
        [h.Class('grid grid-cols-5 gap-1.5')],
        steps.map((step, index) =>
          h.li(
            [],
            [
              h.button(
                [
                  h.Type('button'),
                  h.AriaPressed(index === model.step ? 'true' : 'false'),
                  h.OnClick(M.ChoseStep({ step: index })),
                  h.Class(
                    `flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors ${index === model.step ? 'bg-foreground text-background' : index < model.step ? 'bg-primary/10 text-foreground' : 'bg-background text-foreground ring-1 ring-border hover:ring-foreground/30'}`,
                  ),
                ],
                [
                  h.span(
                    [h.Class('font-mono text-[11px] opacity-70')],
                    [String(index + 1)],
                  ),
                  h.span([h.Class('text-[13.5px] font-semibold')], [step.name]),
                ],
              ),
            ],
          ),
        ),
      ),
      h.div(
        [
          h.Class(
            'flex flex-col gap-3 rounded-xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]',
          ),
        ],
        [
          h.p(
            [h.Class('text-[14.5px] leading-[1.6] text-foreground/90')],
            inline(h, current.what),
          ),
          h.div(
            [
              h.Class(
                'rounded-lg bg-muted/50 px-3 py-2 font-mono text-[12px] text-foreground/85',
              ),
            ],
            [
              h.span([h.Class('mr-2 text-muted-foreground')], ['Model']),
              current.model,
            ],
          ),
          h.div(
            [h.Class('flex justify-between')],
            [
              h.button(
                [
                  h.Type('button'),
                  h.OnClick(M.ChoseStep({ step: Math.max(0, model.step - 1) })),
                  h.Class(
                    'text-[13px] font-medium text-primary disabled:opacity-40',
                  ),
                  ...(model.step === 0 ? [h.Attribute('disabled', '')] : []),
                ],
                ['← Previous'],
              ),
              h.button(
                [
                  h.Type('button'),
                  h.OnClick(
                    M.ChoseStep({
                      step: Math.min(steps.length - 1, model.step + 1),
                    }),
                  ),
                  h.Class(
                    'text-[13px] font-medium text-primary disabled:opacity-40',
                  ),
                  ...(model.step === steps.length - 1
                    ? [h.Attribute('disabled', '')]
                    : []),
                ],
                ['Next →'],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/* ---- The app, running ----------------------------------------------------- */

const appView = defineView<App.Model, App.Message>(appPage)

export const liveApp = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-3')],
    [
      h.div(
        [h.Class('flex flex-wrap items-center gap-3')],
        [
          segmented(
            h,
            'Storage',
            [
              { value: 'works' as const, label: 'Storage works' },
              { value: 'fails' as const, label: 'Storage refuses writes' },
            ],
            model.isStorageFailing ? 'fails' : 'works',
            () => M.ToggledStorage(),
          ),
          h.span(
            [h.Class('text-[12.5px] text-muted-foreground')],
            [
              model.isStorageFailing
                ? 'Change a status or create an issue: the save fails.'
                : 'Every change is saved to an in-page store.',
            ],
          ),
        ],
      ),
      h.div(
        [
          h.Class(
            'h-[600px] [transform:translateZ(0)] overflow-auto rounded-xl bg-background shadow-[0_0_0_1px_var(--border)] [&_[data-slot=sidebar-wrapper]]:min-h-full',
          ),
        ],
        [
          h.submodel({
            slotId: 'chapter-08-app',
            model: model.app,
            view: appView,
            toParentMessage: (message: App.Message) =>
              M.GotAppMessage({ message }),
          }),
        ],
      ),
    ],
  )

/* ---- What the browser check proved -------------------------------------- */

const CHECKS: ReadonlyArray<Readonly<{ check: string; result: string }>> = [
  { check: 'Open the composer', result: 'Focus is on the title field' },
  {
    check: 'Create with an empty title',
    result:
      '"Give the issue a title." next to the field; focus back on the title',
  },
  { check: 'Type a title', result: 'The error disappears' },
  {
    check: 'Choose High, press Ctrl+Enter',
    result:
      'CRE-143 created with priority High; dialog closed; focus on New issue',
  },
  {
    check: 'Type, press Escape, reopen',
    result: 'Button reads New issue (draft); the title is still there',
  },
  { check: 'Reload the page', result: 'CRE-143 is still there' },
  {
    check: 'Make localStorage throw, change a status',
    result: 'SaveNotice: "Your last change was not saved"',
  },
  {
    check: 'Restore localStorage, press Retry',
    result: 'The notice disappears; after a reload the change is there',
  },
  {
    check: 'Store unreadable data, reload',
    result: 'Sample issues, with "Saved issues could not be read"',
  },
  {
    check: 'Click the title of CRE-142',
    result: 'The issue page opens; the header reads All issues › CRE-142',
  },
  {
    check: 'Empty the title on the issue page',
    result:
      '"Give the issue a title." at the field; the issue keeps its old title',
  },
  {
    check: 'Type a new title, go back, reload',
    result: 'The list shows the new title after the reload',
  },
  {
    check: 'Press Ctrl+K, type "unassig", press Enter',
    result: 'The Unassigned view opens',
  },
  { check: 'Press C on the list', result: 'The composer opens' },
  { check: 'Switch to dark, reload', result: 'The page is still dark' },
]

export const checks = (h: H): Html =>
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
                  h.th(
                    [h.Class('px-4 py-2 font-medium')],
                    ['Step in Chromium'],
                  ),
                  h.th([h.Class('px-4 py-2 font-medium')], ['Observed']),
                  h.th([h.Class('w-10 px-4 py-2')], []),
                ],
              ),
            ],
          ),
          h.tbody(
            [h.Class('divide-y divide-border/60')],
            CHECKS.map(row =>
              h.tr(
                [],
                [
                  h.td(
                    [h.Class('px-4 py-2 align-top text-foreground')],
                    [row.check],
                  ),
                  h.td(
                    [h.Class('px-4 py-2 align-top text-foreground/80')],
                    [row.result],
                  ),
                  h.td(
                    [
                      h.Class(
                        'px-4 py-2 align-top font-semibold text-emerald-700',
                      ),
                    ],
                    ['✓'],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  )
