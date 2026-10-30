import type { Html, HtmlBuilder } from 'foldkit/html'

import { codeBlock } from '../../shared/artifacts'
import { factTable, plainHeader } from '../../shared/early'
import { essayFooter, essayPage, figure, h2, list, p } from '../../shared/prose'
import { finishedApp, layers, renderers } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const install = `npx shadcn@latest add Potti1234/creaseui/button
npx shadcn@latest add Potti1234/creaseui/stylex-button
npx shadcn@latest add Potti1234/creaseui/pleat-button`

const tags = `git switch --detach chapter-05     # the app at the end of chapter 5
git diff chapter-04 chapter-05      # everything chapter 5 changed`

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    plainHeader(h, {
      chapter: 1,
      title: 'What crease is, and what you will build',
      dek: 'This chapter introduces crease, the parts of a design system you write yourself, the renderer this guide uses, and the finished tutorial app.',
      meta: 'No code yet. The tutorial app starts at `chapter-02`.',
    }),

    h2(h, 'crease', 'What crease ships'),
    p(
      h,
      'crease is a component library for [Foldkit](https://foldkit.dev) apps. It has three parts:',
    ),
    figure(h, {
      n: 1,
      title: 'The three parts of crease',
      caption:
        'At crease commit `9240b562`, the version chapters 2 to 14 use. Chapter 15 updates to `d0bf498a`.',
      bare: true,
      body: [
        factTable(
          h,
          ['Part', 'What it does', 'Where it ends up'],
          [
            [
              'Components',
              '125 components, most ported from shadcn/ui. A stateless component is a function of props. A stateful one, such as the dropdown menu, also exports its `Model`, `Message`, `init` and `update`.',
              '`src/ui/*.ts` and `src/lib/*.ts`, copied in by the shadcn CLI',
            ],
            [
              'Lint',
              '`@creaseui/lint`: ESLint rules that understand component calls, a strict policy for application code, and the `creaseui-lint` command (`init`, `doctor`, `css`, `scope`, `inspect`, `info`, `audit`).',
              '`eslint.config.js` and the `package.json` scripts',
            ],
            [
              'Receipt',
              'Lists every installed file and export, which files may render raw HTML, and which values each component accepts. Written by `creaseui-lint init`.',
              '`crease.lock.json`',
            ],
          ],
        ),
      ],
    }),
    p(
      h,
      'The components are not a package dependency. The shadcn CLI copies their source into your project, and you edit them like any other file. In chapter 5, for example, Crease Tasks changes its own `src/ui/item.ts` to add a row layout that never wraps.',
    ),
    p(
      h,
      'Because anyone on the team can edit the components, the lint and the receipt check how they are used: which values a component may be called with, and which files may call it. Chapters 5, 6 and 10 set these limits for Crease Tasks.',
    ),

    h2(h, 'layers', 'Which parts you write'),
    p(
      h,
      'The guide splits an app into three layers. crease provides most of the foundation. You write the product system and the application. Choose a layer to see what belongs to it in Crease Tasks at `chapter-14`.',
    ),
    figure(h, {
      n: 2,
      title: 'Who owns what',
      caption:
        'The files of `creaseui-demo` at `chapter-14`, sorted into the three layers.',
      body: [layers(h, model)],
    }),
    p(
      h,
      "The product system holds the product's decisions: how an issue row is laid out, which button variants exist, when a list is grouped. Without it, each decision is made by whichever screen is built first, and the next screen may decide differently. Matt Rothenberg describes this gap in [You Don't Have a Design System](https://mattrothenberg.com/notes/you-dont-have-a-design-system/). Chapters 3 to 14 build the product system of Crease Tasks.",
    ),

    h2(h, 'renderer', 'Three renderers'),
    p(
      h,
      'crease can style each component with Tailwind classes, with StyleX, or with Pleat. Each renderer has its own registry item, and an app installs one of them:',
    ),
    figure(h, {
      n: 3,
      title: 'Installing Button',
      caption: 'One command per renderer. An app runs one of the three.',
      bare: true,
      body: [codeBlock(h, 'terminal', install)],
    }),
    p(
      h,
      'All three Button files import `renderButton` from `@/lib/button`. That shared file renders the native `<button>`, handles the disabled and loading states, and sends the click Message. The three files differ only in how they declare styles. The Tailwind file is the shortest, because Tailwind classes carry most of the styling; StyleX and Pleat declare styles as objects.',
    ),
    figure(h, {
      n: 4,
      title: 'Button in three renderers',
      caption:
        'The complete files from the crease repository at `9240b562`. Scroll inside the frame to read the rest of a file.',
      bare: true,
      body: [renderers(h, model)],
    }),
    p(
      h,
      'This guide uses Tailwind, and every chapter was built and checked with it. StyleX and Pleat versions of the tutorial do not exist yet. The decisions, patterns and checks would stay the same in them; only the files that hold styles would change.',
    ),

    h2(h, 'app', 'The tutorial app'),
    p(
      h,
      "The tutorial app is Crease Tasks, an issue tracker for a small software team, modelled on Linear. It follows the Linear clone built with hyper-effect, as a browser-only Foldkit app; the clone's sign-in is left out, because this app has no server. Chapter 2 starts it in an empty project. At `chapter-14` it has:",
    ),
    list(h, [
      'The navigation of the clone: My issues, All issues, two teams with their Issues and Board pages, and the saved views Urgent & high, Unassigned and Active bugs.',
      'One issue row and one issue card, shared by every list and board.',
      "Menus that change an issue's status, priority and assignee in place.",
      'A page per issue with title and description edited in place.',
      'A dialog for new issues that checks the title and keeps a draft when it is closed.',
      'A command menu on Ctrl+K, `C` for a new issue, and a light and a dark theme.',
      "Saving to the browser's local storage, with a notice and a retry button when saving fails.",
      "Checks: TypeScript, crease's strict lint with the product's own policy and one custom rule, 38 tests, and a browser check with 22 steps.",
    ]),
    figure(h, {
      n: 5,
      title: 'Crease Tasks at chapter 14',
      caption:
        'Screenshots of the app at the tag `chapter-14`, 1280 pixels wide, with the sample data it ships with.',
      bare: true,
      body: [finishedApp(h, model)],
    }),
    p(
      h,
      'An issue tracker has dense lists, small controls and edits in place. A component library says little about how those should look and behave, which makes them a good test for a product system.',
    ),

    h2(h, 'reading', 'How the guide is organised'),
    p(
      h,
      'From chapter 2 on, every chapter is a tag on the `main` branch of the `creaseui-demo` repository: `chapter-02`, `chapter-03` and so on. Check out a tag to get the app at the end of that chapter, or compare two tags to see what the chapter changed:',
    ),
    codeBlock(h, 'terminal', tags),
    p(h, 'The essays quote that code and the real output of the tools.'),
    figure(h, {
      n: 6,
      title: 'The chapters',
      caption: 'Chapter 1 has no tag.',
      bare: true,
      body: [
        factTable(
          h,
          ['Chapter', 'What it adds', 'Tag'],
          [
            [
              '2. Install and run',
              'crease installed, the strict lint and the receipt set up, a first version of the app built quickly',
              '`chapter-02`',
            ],
            [
              '3. Principles into decisions',
              'A product brief and ten numbered decisions, each naming what enforces it',
              '`chapter-03`',
            ],
            [
              '4. A coherent theme',
              "Colour and geometry tokens generated by crease's preset compiler, and a dark mode",
              '`chapter-04`',
            ],
            [
              '5. Customize a component',
              'A repeated style override becomes a variant; Button is reduced to two intents',
              '`chapter-05`',
            ],
            [
              '6. Contracts and boundaries',
              'Which files may use which components; one command for all checks',
              '`chapter-06`',
            ],
            [
              '7. Named patterns',
              'One issue row for every view, property menus, the full sidebar with teams and saved views, no lint warnings left',
              '`chapter-07`',
            ],
            [
              '8. Saving and workflows',
              'The new-issue dialog, drafts, saving to local storage, a page per issue, the command menu',
              '`chapter-08`',
            ],
            [
              '9. Verify the system',
              'Tests, lint fixtures and a browser check, each tested by breaking the app on purpose',
              '`chapter-09`',
            ],
            [
              '10. Product policy',
              "The product's own lint rules and narrower receipt values",
              '`chapter-10`',
            ],
            [
              '11. A custom lint rule',
              'A rule that allows one primary button per file',
              '`chapter-11`',
            ],
            [
              '12. Feature work by agents',
              'Three agents build the same saved view; where they differ becomes a decision',
              '`chapter-12`',
            ],
            [
              '13. A design-system change',
              'A board for each team, proposed by an agent, reviewed and adopted',
              '`chapter-13`',
            ],
            [
              '14. Evolve an API',
              "A pattern's API replaced and every caller migrated, in three commits",
              '`chapter-14`',
            ],
            [
              '15. Upstream changes',
              "crease's fixes for the problems the guide found, taken in without losing local changes",
              '`chapter-15`',
            ],
          ],
        ),
      ],
    }),

    h2(h, 'requirements', 'What you need'),
    p(
      h,
      'Node and npm, and enough TypeScript to read the code. The versions are the ones crease tests against: Effect `4.0.0-rc.117`, Foldkit `0.164`, Tailwind 4 and Vite 8. If Foldkit is new to you, read about its architecture first: a Model, Messages, an `update` function and a `view`, with side effects as Commands.',
    ),

    essayFooter(
      h,
      'Chapter 2 installs crease into an empty project and builds a first version of the app quickly, with shortcuts, so that the later chapters have real code to make decisions about.',
    ),
  ])
