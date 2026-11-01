import type { Html, HtmlBuilder } from 'foldkit/html'

import appSidebarDiff from '../../generated/15/app-sidebar.diff?raw'
import buttonDiff from '../../generated/15/button.diff?raw'
import doctorDanger from '../../generated/15/doctor-danger.txt?raw'
import doctor from '../../generated/15/doctor.txt?raw'
import eslintStylesDiff from '../../generated/15/eslint-styles.diff?raw'
import scope from '../../generated/15/scope.txt?raw'
import conflict from '../../generated/15/sidebar-conflict.txt?raw'
import upstreamStat from '../../generated/15/upstream-stat.txt?raw'
import { codeBlock, diffView, terminal } from '../../shared/artifacts'
import { factTable } from '../../shared/early'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  list,
  p,
} from '../../shared/prose'
import { sidebars } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const listFiles = `files=$(node -p "[...new Set(require('./crease.lock.json').artifacts.flatMap(a => a.files.map(f => f.path)))].join(' ')")
git -C ../crease diff --stat 9240b562 d0bf498a -- $files`

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 15,
      title: 'Take in changes from crease upstream',
      dek: 'This chapter updates crease from `9240b562` to `d0bf498a`: how to find the changes that reach the app, how to merge each kind, and which workarounds go.',
      from: 'chapter-14',
      to: 'chapter-15',
      filesChanged: 18,
    }),

    h2(h, 'owned', 'Why an update is a review'),
    p(
      h,
      'Since chapter 2, the crease components in `src/ui` and `src/lib` are files in this repository, copied by the shadcn CLI from crease at commit `9240b562`. Chapters 5, 7 and 10 changed some of them. A new crease version therefore arrives as a diff to read and merge, not as a version number in `package.json`.',
    ),
    p(
      h,
      'Building chapters 2 to 14 turned up nineteen problems in crease, and Crease Tasks worked around each one in its own copy. crease fixed all nineteen in [pull request #46](https://github.com/Potti1234/creaseui/pull/46), merged as `d0bf498a`. This chapter takes that version in.',
    ),

    h2(h, 'files', 'Which files changed'),
    p(
      h,
      '`crease.lock.json` lists every file that came from crease. Passing those paths to `git diff` in a crease checkout limits the upstream diff to what this app installed:',
    ),
    figure(h, {
      n: 1,
      title: 'Upstream changes to installed files',
      caption:
        'Run in `creaseui-demo` at `chapter-14`, with crease cloned next to it as `../crease`. 13 of the 36 installed files changed between the two commits.',
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            codeBlock(h, 'terminal', listFiles),
            terminal(
              h,
              'git -C ../crease diff --stat 9240b562 d0bf498a -- $files',
              upstreamStat.trimEnd(),
            ),
          ],
        ),
      ],
    }),
    p(
      h,
      'In eight of the thirteen, the only change is a byte-order mark that crease removed from the start of the file. The copies the shadcn CLI installed never had one, so these eight need nothing. That leaves five files with real changes: `src/lib/button.ts`, `avatar.ts`, `command.ts`, `dropdown-menu.ts` and `sidebar.ts`. Three more parts of crease changed that the receipt does not list as files: the base theme in `src/styles.css`, the preset compiler that generated the theme in chapter 4, and the lint package in `vendor/`.',
    ),

    h2(h, 'kinds', 'Three kinds of change'),
    p(
      h,
      'Each upstream change belongs to one of three groups, and each group is handled one way:',
    ),
    list(h, [
      "Upstream fixed something Crease Tasks had worked around. Take upstream's version and delete the workaround.",
      'Upstream changed something Crease Tasks never changed. Take it as it is.',
      'Both sides changed the same lines. Merge by hand, and keep the local change where it is a product decision.',
    ]),
    figure(h, {
      n: 2,
      title: 'Every upstream change that reaches the app',
      caption:
        'From `design-system/changes/010-crease-update.md` at `chapter-15`, which also gives the issue number of each fix.',
      bare: true,
      body: [
        factTable(
          h,
          ['Upstream change', 'Group', 'In Crease Tasks'],
          [
            [
              'The preset compiler writes tokens and geometry as two files, with the full sidebar tokens in light and dark',
              'Worked around in chapter 4',
              'Theme regenerated; the hand split and the hand-added sidebar tokens go',
            ],
            [
              "Registered stylesheets stay out of ESLint's file list",
              'Worked around in chapter 4',
              'The `ignores` line in `eslint.config.js` goes',
            ],
            [
              'The base theme loads Inter',
              'Worked around in chapter 4',
              'The import moves from `tokens.css` to `styles.css`',
            ],
            [
              'Button has `ariaExpanded`, `ariaControls` and `ariaHasPopup`',
              'Worked around in chapter 7',
              'The local `ariaExpanded` goes',
            ],
            [
              'The sub-menu button renders a `<button>` without an `href`, and the badge lines up next to it',
              'Worked around in chapter 7',
              'The local `indent` option goes; team pages use the sub-menu',
            ],
            [
              '`avatarFallback` has a `tone`',
              'Worked around in chapter 7',
              'Upstream file taken',
            ],
            [
              'The dropdown menu returns focus to its trigger after a selection',
              'Worked around in chapter 7',
              'Upstream file taken',
            ],
            [
              'Sidebar height without collapsing, `min-w-0` on `sidebarInset`, badge alignment',
              'Not changed locally',
              'Taken',
            ],
            [
              'The wiring example in `command.ts`',
              'Not changed locally',
              'Taken',
            ],
            [
              '`doctor` compares receipt values with the source, and five other lint fixes',
              'Not changed locally',
              'Vendored package replaced',
            ],
            [
              "A comment on the sidebar trigger's `buttonVariants` call",
              'Changed on both sides',
              'Merged by hand; the local call stays',
            ],
          ],
        ),
      ],
    }),
    p(
      h,
      'Seven of the eleven rows remove a workaround. Each one was a place where the app had to differ from crease, and each difference had to be merged again at every update.',
    ),

    h2(h, 'merge', 'Merging a file both sides changed'),
    p(
      h,
      'For a file that changed on both sides, `git merge-file` does a three-way merge of the local copy, the version it was installed from and the new version. In `src/ui/sidebar.ts` it applied the upstream fixes and stopped at one line:',
    ),
    figure(h, {
      n: 3,
      title: 'The one conflict',
      caption:
        '`git merge-file` on `src/ui/sidebar.ts` from `chapter-14`, with `9240b562` as the base and `d0bf498a` as the other side. Everything else in the file merged without a conflict.',
      bare: true,
      body: [codeBlock(h, 'src/ui/sidebar.ts', conflict.trimEnd())],
    }),
    p(
      h,
      "Upstream added a comment to the trigger's call to `buttonVariants`. Since chapter 5, Crease Tasks' Button has `intent` and `shape` instead of crease's `variant` and `size`, so its call names those. The local call stays and the comment is rewritten for it. That line is now the only place where `sidebar.ts` differs from crease.",
    ),
    p(
      h,
      'A clean merge can still leave work behind. `src/ui/button.ts` did not change upstream, so nothing conflicted. But the `ariaExpanded` prop it gained in chapter 7 now repeated a prop that `ButtonBehaviorProps` in `src/lib/button.ts` has, and the attribute was set twice. The merge tool cannot see this; reading each workaround against the new code finds it.',
    ),
    figure(h, {
      n: 4,
      title: 'Button after the update',
      caption:
        "The local `ariaExpanded` is removed; chapter 5's `intent` and `shape` stay.",
      bare: true,
      body: [
        diffView(
          h,
          'src/ui/button.ts',
          buttonDiff,
          'git diff chapter-14 chapter-15',
        ),
      ],
    }),

    h2(h, 'sidebar', 'Team pages in a sub-menu'),
    p(
      h,
      "In chapter 7 the team pages were ordinary sidebar buttons with a local `indent` option, because crease's sub-menu button was an anchor that could not take focus without an `href`. crease now renders it as a `<button>` when there is no `href`, and `sidebarMenuBadge` lines up next to it. `AppSidebar` uses the sub-menu, and `indent` is gone from `sidebar.ts`.",
    ),
    figure(h, {
      n: 5,
      title: 'The sidebar, before and after',
      caption:
        "Screenshots of the sidebar at 1280px with Engineering's Issues page open. Pick a theme to compare.",
      bare: true,
      body: [sidebars(h, model)],
    }),
    p(
      h,
      "The sub-menu draws a line along the team's pages and indents the active highlight with them. The browser check from chapter 9 finds the links by role and name, so its 22 steps pass unchanged, including the board steps that click the team links.",
    ),
    figure(h, {
      n: 6,
      title: 'AppSidebar on the sub-menu',
      caption: "The pattern's rules comment changes with the code.",
      bare: true,
      body: [
        diffView(
          h,
          'src/design/app-sidebar.ts',
          appSidebarDiff,
          'git diff chapter-14 chapter-15',
        ),
      ],
    }),

    h2(h, 'theme', 'Regenerating the theme'),
    p(
      h,
      "Chapter 4 generated the theme with a patched copy of the preset script, split the output into tokens and geometry by hand, removed the global rules that crease's CSS policy rejects, and added the sidebar tokens the preset left out. At `d0bf498a` the preset compiler does all of this. Run with the preset code from `design-system/theme.md`, it writes `crease-preset-tokens.css` and `crease-preset-geometry.css`. The geometry file has the same rules as chapter 4's, and the tokens now include the sidebar set; the generated dark sidebar border is 10% white, where chapter 4 had written 8%.",
    ),
    p(
      h,
      'One edit is left. The preset loads Inter from Google Fonts and names the family `"Inter"`, while crease\'s base theme now loads the self-hosted `"Inter Variable"`. `tokens.css` drops the import and uses the base theme\'s name. `design-system/theme.md` lists this step, and it is the next entry for the guide\'s list of crease issues.',
    ),
    figure(h, {
      n: 7,
      title: 'Two configuration changes',
      caption:
        'The ESLint ignore that chapter 4 needed goes, and the font import is now part of the base theme.',
      bare: true,
      body: [
        diffView(
          h,
          'eslint.config.js, src/styles.css',
          eslintStylesDiff,
          'git diff chapter-14 chapter-15',
        ),
      ],
    }),

    h2(h, 'lint', 'The new lint package'),
    p(
      h,
      "`@creaseui/lint` is not published yet, so Crease Tasks keeps a packed copy in `vendor/`. The update replaces it with one packed from `packages/lint` at `d0bf498a`. The largest change is in `doctor`. Chapter 6 wrote down a gap in `design-system/boundaries.md`: nothing compared the values in the receipt with the component's own, so a value added to one side only compiled and then failed the lint. `doctor` now compares them.",
    ),
    figure(h, {
      n: 8,
      title: 'doctor, comparing the receipt with the source',
      caption:
        "`npx creaseui-lint doctor` at `chapter-15`, then again after adding `'danger'` to Button's `intent` in `crease.lock.json` only, which exits with code 1. The notes are the narrowing from chapter 10.",
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            terminal(
              h,
              'npx creaseui-lint doctor',
              doctor.trimEnd(),
              /^note {4}src/u,
            ),
            terminal(
              h,
              "npx creaseui-lint doctor   # with 'danger' in the receipt",
              doctorDanger.trimEnd(),
              /^problem/u,
            ),
          ],
        ),
      ],
    }),
    p(
      h,
      'The two directions are treated differently. A value the component has and the receipt leaves out is a note, because chapter 10 narrows `badge` and `text` in the receipt on purpose. A value the receipt allows and the component does not have is a problem: the lint would accept a call that the type rejects.',
    ),

    h2(h, 'record', 'Recording the update'),
    p(
      h,
      'The update changes the lint package and the ESLint configuration, so `npm run scope` reports it. In the terms of chapter 6 it is a design-system change:',
    ),
    figure(h, {
      n: 9,
      title: 'The enforcement changes',
      caption:
        'The three enforcement inputs the update changes. A feature change may not change any of them.',
      bare: true,
      body: [
        terminal(
          h,
          'npx creaseui-lint scope --baseline chapter-14',
          scope.trimEnd(),
          /^problem/u,
        ),
      ],
    }),
    p(
      h,
      'Change record `010-crease-update.md` lists every upstream change and what happened to it, and the README names the new crease commit. `npm run check` and the browser check pass at `chapter-15`.',
    ),
    p(
      h,
      "What stays local after the update is product decisions: Button's two intents and one height, `item`'s inline layout, the label look of `badge`, the narrowing in the receipt, and the trigger call in `sidebar.ts`. The font edit in `tokens.css` is the one workaround left. The next update has those to merge.",
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-15` in the `creaseui-demo` repository, and `design-system/changes/010-crease-update.md` lists every upstream change. This is the last chapter; [the short version](/short-version.html) puts the whole guide on one page.',
    ),
  ])
