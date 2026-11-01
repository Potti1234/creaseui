import type { Html, HtmlBuilder } from 'foldkit/html'

import doctor from '../../generated/02/doctor-02.txt?raw'
import eslintConfig from '../../generated/02/eslint.config.js?raw'
import initOutput from '../../generated/02/init-02.txt?raw'
import packageJson from '../../generated/02/package.json?raw'
import { codeBlock, terminal } from '../../shared/artifacts'
import { plainHeader } from '../../shared/early'
import { essayFooter, essayPage, figure, h2, list, p } from '../../shared/prose'
import { lintModes, receiptExplorer, slice } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

const install = `# A Vite project with Foldkit 0.164, Effect 4.0.0-rc.117 and Tailwind 4
npm install

# The theme first, then the components the first screens need
npx shadcn@latest add Potti1234/creaseui/crease-theme --yes
npx shadcn@latest add Potti1234/creaseui/button Potti1234/creaseui/item \\
  Potti1234/creaseui/badge Potti1234/creaseui/kbd Potti1234/creaseui/input \\
  Potti1234/creaseui/separator Potti1234/creaseui/sidebar Potti1234/creaseui/avatar \\
  Potti1234/creaseui/stack Potti1234/creaseui/text Potti1234/creaseui/heading \\
  Potti1234/creaseui/empty Potti1234/creaseui/toolbar --yes
npx shadcn@latest add Potti1234/creaseui/icon --yes

# The lint is not published yet; a packed copy lives in vendor/
npm install -D ./vendor/creaseui-lint-0.1.0.tgz

# Write the receipt and a strict lint configuration
npx creaseui-lint init --renderer tailwind`

const scripts = JSON.stringify(
  (JSON.parse(packageJson) as { scripts: Record<string, string> }).scripts,
  null,
  2,
)

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    plainHeader(h, {
      chapter: 2,
      title: 'Install crease and build a first slice',
      dek: 'This chapter installs crease into an empty project, sets up the strict lint and the receipt, and builds three views quickly, with every shortcut counted by the lint.',
      meta: 'Ends at `chapter-02` · 43 files · Tailwind',
    }),

    p(
      h,
      'The decisions in chapter 3 need real screens to be written against, so Crease Tasks starts with a quick first version. Each view is written on its own, and where a component does not fit, a class makes it fit.',
    ),
    p(
      h,
      'The strict lint is on from the first commit. It lets these shortcuts through as warnings and counts them, and the count is not allowed to grow.',
    ),

    h2(h, 'install', 'Installing crease'),
    p(
      h,
      'Crease Tasks is a Vite project with Foldkit, Effect and Tailwind, at the versions crease tests against. crease is installed with the shadcn CLI. The CLI reads `components.json` for the target folders (`@/ui`, `@/lib`) and needs `tsx: true` to write TypeScript files, although crease contains no JSX. The components come from the registry in the GitHub repository `Potti1234/creaseui`, at commit `9240b562`.',
    ),
    figure(h, {
      n: 1,
      title: 'The install',
      caption:
        'The commands that built `chapter-02`. Each `add` copies the component and the helpers it needs into the project.',
      bare: true,
      body: [codeBlock(h, 'terminal', install)],
    }),
    p(
      h,
      'The theme is installed first because the components use its tokens: classes like `bg-primary` and `text-muted-foreground` only have a value once the theme defines them. After these commands `src/ui` holds 14 components and `src/lib` holds 8 files of shared behaviour, such as the native button that every Button variant renders.',
    ),

    h2(h, 'receipt', 'The receipt'),
    p(
      h,
      '`creaseui-lint init` reads what was installed and writes `crease.lock.json`. For every installed artifact the receipt records its files, whether each file may render raw HTML elements, and its exports with the contract each one fulfils. Choose an artifact to see its entry:',
    ),
    figure(h, {
      n: 2,
      title: 'crease.lock.json at chapter 2',
      caption:
        'The real receipt of `chapter-02`: 23 artifacts. Only files marked raw may build HTML elements directly; feature code is never marked.',
      body: [receiptExplorer(h, model)],
    }),
    p(
      h,
      'Two fields matter most later. `rawRendering` decides which files may build HTML elements directly, so a feature file that writes `h.button(...)` is rejected and told to use `button`. `visibility: "implementation"` marks exports like `renderButton` that only components may call. Chapter 6 uses both. Running `init` again keeps everything already recorded:',
    ),
    figure(h, {
      n: 3,
      title: 'init, run again',
      caption:
        '`creaseui-lint init --dry-run` at `chapter-02`. Registered artifacts are never rewritten, which matters from chapter 5 on, when the receipt starts holding decisions.',
      bare: true,
      body: [
        terminal(
          h,
          'npx creaseui-lint init --renderer tailwind --dry-run',
          initOutput,
        ),
      ],
    }),

    h2(h, 'lint', 'The lint, in migration mode'),
    p(
      h,
      "`init` also writes an `eslint.config.js` with crease's strict policy, `crease-default-v1`. Crease Tasks changes two things in it before the first commit:",
    ),
    figure(h, {
      n: 4,
      title: 'eslint.config.js at chapter 2',
      caption: 'The whole file.',
      bare: true,
      body: [codeBlock(h, 'eslint.config.js', eslintConfig.trimEnd())],
    }),
    list(h, [
      "`preset: 'migration'` with `migrationFiles` puts the view files in migration mode. Every rule still runs there, but a finding is a warning instead of an error.",
      'The `app-entry` extension registers `src/main.ts` as the setup file, the one place allowed to import stylesheets.',
    ]),
    p(
      h,
      'Everything else, including the components themselves, is checked with every rule at error level from the first commit.',
    ),

    h2(h, 'slice', 'The slice'),
    p(
      h,
      "The slice has three views. All issues groups the sample issues by status, with a button to turn grouping off. My issues shows the signed-in person's open issues, sorted by priority or by number. Search filters by identifier and title as you type. The navigation is crease's `sidebar`, used as installed.",
    ),
    figure(h, {
      n: 5,
      title: 'The three views',
      caption:
        "Screenshots of `chapter-02`, running. The theme is still crease's default; chapter 4 replaces it.",
      bare: true,
      body: [slice(h, model)],
    }),
    p(
      h,
      'Each view draws its own rows, so the same issue appears three ways: with different heights, a different order of parts and different badges. Chapter 3 writes down what a row should be, and chapters 5 and 7 build it.',
    ),

    h2(h, 'warnings', 'Thirteen warnings, counted'),
    p(
      h,
      'Every class a view passes to a component to change its appearance is a finding. In migration mode the findings are warnings; with the strict preset the same thirteen findings are errors:',
    ),
    figure(h, {
      n: 6,
      title: 'The same findings in both modes',
      caption:
        "`npx eslint src` at `chapter-02`, with the configuration of Figure 4 and with `preset: 'strict'` instead. The list is identical; only the severity changes.",
      bare: true,
      body: [lintModes(h, model)],
    }),
    p(
      h,
      'The lint script sets a ratchet: `--max-warnings 13` fails the build on a fourteenth warning. A chapter that removes warnings lowers the number in the same commit, and no chapter raises it. The count stays at 13 through chapter 4, drops to 1 in chapter 5 and reaches 0 in chapter 7.',
    ),
    figure(h, {
      n: 7,
      title: 'The scripts',
      caption: 'From `package.json` at `chapter-02`.',
      bare: true,
      body: [codeBlock(h, 'package.json', `"scripts": ${scripts}`)],
    }),

    h2(h, 'doctor', 'Checking that the lint covers every file'),
    p(
      h,
      'ESLint only checks the files it is given. `creaseui-lint doctor` checks the configuration: that the receipt is valid, and that every file that renders UI is covered by the rules.',
    ),
    figure(h, {
      n: 8,
      title: 'doctor at chapter 2',
      caption:
        'All 30 source files are covered. The note lists contracts with no installed component yet; using one of those raw elements in a feature is rejected with the install command.',
      bare: true,
      body: [terminal(h, 'npx creaseui-lint doctor', doctor, /^coverage/u)],
    }),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-02` in the `creaseui-demo` repository. Chapter 3 adds no code: it writes a short product brief and ten decisions, each naming the code that will enforce it.',
    ),
  ])
