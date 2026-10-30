import type { Html, HtmlBuilder } from 'foldkit/html'

import commandMenuRules from '../../generated/08/command-menu-rules.txt?raw'
import issueDetailRules from '../../generated/08/issue-detail-rules.txt?raw'
import composerSource from '../../snapshots/chapter-08/design/issue-composer.ts?raw'
import storageSource from '../../snapshots/chapter-08/storage.ts?raw'
import { codeBlock } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  p,
} from '../../shared/prose'
import { checks, liveApp, stepper } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const between = (text: string, start: string, end: string): string => {
  const from = text.indexOf(start)
  return text.slice(from, text.indexOf(end, from)).trimEnd()
}

const composerRules = between(
  composerSource,
  '/**\n * IssueComposer',
  'export const COMPOSER_ID',
)
const validation = between(
  composerSource,
  '/** The title a draft may be created with',
  'export const issueComposer',
)
const saveCommand = storageSource
  .slice(storageSource.indexOf('/** Writes the issues.'))
  .trimEnd()

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 8,
      title: 'Saving, validation and workflows',
      dek: 'This chapter adds creating issues with a draft, saving in the browser, a page per issue with edits in place, and a command menu with keyboard shortcuts.',
      from: 'chapter-07',
      to: 'chapter-08',
      filesChanged: 34,
    }),

    p(
      h,
      'Until now nothing survived a reload and no issue could be created. Chapter 7 made status, priority and assignee change in place: choosing a value in the picker is the commit, with nothing to confirm. Creating an issue is different. It takes several fields, the title must exist before the issue does, and a person may close the dialog halfway and come back. Decision D8 from chapter 3 says the draft survives that.',
    ),
    p(
      h,
      "Rothenberg's settings example in [You Don't Have a Design System](https://mattrothenberg.com/notes/you-dont-have-a-design-system/) turns on the same question: one team saves each row on change, another adds a Save button, and the product ends up with both. Crease Tasks answers it per task and writes the answer into the patterns: editing an existing issue commits on change; creating one has a draft and an explicit commit.",
    ),

    h2(h, 'flows', 'The two flows, message by message'),
    p(
      h,
      'Foldkit makes the difference visible, because every change is a Message and every effect is a Command. Step through both flows. The status change touches the issue list on its third step; the composer does not touch it until the fourth.',
    ),
    figure(h, {
      n: 1,
      title: 'Where each change becomes real',
      caption:
        'The Messages, Model changes and Commands of both flows in the `chapter-08` app.',
      body: [stepper(h, model)],
    }),
    p(
      h,
      'Both flows end in the same Command, `SaveIssues`. Saving does not commit anything; it stores a commit that already happened in the Model. So the list shows a new status before the browser has stored it, and a failed save does not undo anything on screen. Waiting for the save instead would make every change wait for storage, and a failing store would freeze the page.',
    ),

    h2(h, 'the-composer', 'The composer'),
    p(
      h,
      '`IssueComposer` is a new pattern, written like the ones in chapter 7, with its rules first.',
    ),
    figure(h, {
      n: 2,
      title: "IssueComposer's rules",
      caption:
        'The comment at the top of `src/design/issue-composer.ts` at `chapter-08`.',
      bare: true,
      body: [codeBlock(h, 'src/design/issue-composer.ts', composerRules)],
    }),
    p(
      h,
      "The draft lives in the page Model, not in the dialog. crease's dialog is a Submodel with its own Model, and a draft stored there would end when the dialog closes. Kept in the page, the draft stays, and the header button says so: New issue (draft). It does not survive a reload; D8 asks only for closing the composer, and keeping drafts across reloads would be a decision of its own.",
    ),
    p(
      h,
      "The draft is also an ordinary `Issue`, with the id `DRAFT`. That lets the composer reuse `PropertyPicker` for status, priority and assignee without a second picker. When a picker's key starts with `DRAFT--`, update changes the draft instead of the list.",
    ),
    figure(h, {
      n: 3,
      title: 'Validation',
      caption:
        'A pure function: the title a draft may be created with, or the reason it may not.',
      bare: true,
      body: [codeBlock(h, 'src/design/issue-composer.ts', validation)],
    }),
    p(
      h,
      'The error appears only after the first attempt to create, not for a field the person has not reached yet. It disappears as soon as the title is valid, and focus goes back to the title, where the fix happens.',
    ),

    h2(h, 'try', 'Try both'),
    p(
      h,
      'This is the chapter 8 app running in the page, against a store that lives in the page too. Change a status, create an issue, close the composer halfway and open it again, open an issue from its title, or press Ctrl+K. Then switch storage to refuse writes and change something.',
    ),
    figure(h, {
      n: 4,
      title: 'The app, running',
      caption:
        'The `view`, `update` and subscriptions of `chapter-08`, with an in-page store instead of `localStorage`. The theme switch in the sidebar footer switches this whole page.',
      body: [liveApp(h, model)],
    }),

    h2(h, 'issue-page', 'An issue on its own page'),
    p(
      h,
      "The row's title now links to the issue's own page, built by a new pattern, `IssueDetail`. Editing an existing issue follows the same rule as the pickers: the title and the description change as you type and are saved after each change, with no Save button. Issues gain a `description` for it.",
    ),
    figure(h, {
      n: 5,
      title: "IssueDetail's rules",
      caption:
        'The comment at the top of `src/design/issue-detail.ts` at `chapter-08`.',
      bare: true,
      body: [
        codeBlock(h, 'src/design/issue-detail.ts', issueDetailRules.trimEnd()),
      ],
    }),
    p(
      h,
      'An empty title is not saved. The page keeps the text of the field in its Model next to the issue, so the field can show the error while the issue keeps its last valid title. The issue page lives in the Model, not in the URL, because this guide embeds the app in its own pages and those pages own the URL.',
    ),
    p(
      h,
      "The link in the row needed two extra settings: `maxLines: 1` on the link and the placement classes `min-w-0 max-w-full`. Without them a long title is clipped at the edge instead of ending in an ellipsis, which breaks D1. The essay's own screenshot showed it; no check did. Chapter 9 adds one.",
    ),

    h2(h, 'keyboard', 'The command menu and shortcuts'),
    p(
      h,
      "The product brief asks for a keyboard-first tracker. `CommandMenu` puts every action, every place and every issue in one list behind Ctrl+K, built from crease's `command` in a dialog. `C` opens the composer when no dialog is open and focus is not in a field. Decision D9 says keys are shortcuts and never the only way, so both have a button in the sidebar header: a search button opens the menu, a pencil button the composer.",
    ),
    figure(h, {
      n: 6,
      title: "CommandMenu's rules",
      caption:
        'The comment at the top of `src/design/command-menu.ts` at `chapter-08`.',
      bare: true,
      body: [
        codeBlock(h, 'src/design/command-menu.ts', commandMenuRules.trimEnd()),
      ],
    }),
    p(
      h,
      "A menu entry runs the same Message as the control it stands for, so the menu adds no behaviour of its own. Following Foldkit's advice for key bindings, the subscriptions send what happened (`PressedNewIssueKey`) and `update` decides what it means: nothing while a dialog is open.",
    ),

    h2(h, 'saving', 'Saving is a service'),
    p(
      h,
      "The app reads the issues once, when it starts, and writes them after every change. Both go through Effect's `KeyValueStore`. In the app it is `localStorage`; in this essay it is the in-page store from Figure 4; in a test it can be a store that always fails. The update function does not know which one it has.",
    ),
    figure(h, {
      n: 7,
      title: 'The save Command',
      caption: 'From `src/storage.ts` at `chapter-08`.',
      bare: true,
      body: [codeBlock(h, 'src/storage.ts', saveCommand)],
    }),
    p(
      h,
      '`interrupt: true` handles stale results: a second save interrupts the first, so an older save can never finish after a newer one and overwrite it. A failure becomes a Message, `FailedSave`, which shows the `SaveNotice` with Retry. Reading works the same way: unreadable data falls back to the sample issues with a notice. The theme choice is saved together with the issues, so dark mode survives a reload.',
    ),

    h2(h, 'proof', 'What the browser check proved'),
    p(
      h,
      'Each behaviour above was checked in Chromium with Playwright against the running app, including a `localStorage` that throws:',
    ),
    figure(h, {
      n: 8,
      title: 'Fifteen checks',
      caption:
        "The steps of the chapter 8 browser check and what each one observed. Chapter 9 turns checks like these into the project's test suite.",
      bare: true,
      body: [checks(h)],
    }),

    essayFooter(
      h,
      "The code for this chapter is the tag `chapter-08` in the `creaseui-demo` repository, and `git diff chapter-07 chapter-08` shows all of it. Chapter 9 turns these checks into the project's test suite: Story tests for update, lint fixtures, and a browser check that runs every time.",
    ),
  ])
