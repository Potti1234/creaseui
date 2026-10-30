import type { Html, HtmlBuilder } from 'foldkit/html'

import cssRaw from '../../generated/04/css-raw-preset.txt?raw'
import eslintDiff from '../../generated/04/eslint.config.diff?raw'
import geometry from '../../generated/04/geometry.css?raw'
import lintClassList from '../../generated/04/lint-classlist.txt?raw'
import mainDiff from '../../generated/04/main.diff?raw'
import mode from '../../generated/04/mode.ts.txt?raw'
import presetBuild from '../../generated/04/preset-build.txt?raw'
import stylesDiff from '../../generated/04/styles.css.diff?raw'
import tokensFix from '../../generated/04/tokens-fix.css.txt?raw'
import { codeBlock, diffView, terminal } from '../../shared/artifacts'
import {
  essayFooter,
  essayHeader,
  essayPage,
  figure,
  h2,
  list,
  p,
} from '../../shared/prose'
import { beforeAfter, contrastPlayground, darkPair, knobs } from './figures'
import type { Message, Model } from './model'

type H = HtmlBuilder<Message>

/* The header comment and the first three rules of the generated geometry. */
const geometryExcerpt = geometry
  .replace(/\r/gu, '')
  .split('\n')
  .slice(0, 8)
  .join('\n')

/* The build output up to the error, without the stack frames. */
const buildError = presetBuild
  .split('\n')
  .filter(line => !/^\s+at /u.test(line))
  .join('\n')
  .trim()

const fix = `// scripts/materialize-create-preset.ts, line 32
-    presetRegistryJson(config),
+    presetRegistryJson(config.value),`

export const view = (model: Model, h: H): Html =>
  essayPage(h, [
    essayHeader(h, {
      chapter: 4,
      title: 'Generate the theme',
      dek: "This chapter generates the colours, type, corners and control sizes with crease's preset compiler, adds a dark mode, and shows what a theme cannot decide.",
      from: 'chapter-03',
      to: 'chapter-04',
      filesChanged: 10,
    }),

    p(
      h,
      "Until now Crease Tasks has used crease's default theme: neutral greys, a black primary colour and 14 pixel text. Chapter 3 asked for a calmer and denser look, with the issue as the most prominent thing on the screen. Switch between the two tags:",
    ),
    figure(h, {
      n: 1,
      title: 'Before and after',
      caption:
        'All issues at `chapter-03` and at `chapter-04`. Chapter 3 changed no code, so its app is the one from the chapter 2 screenshots.',
      bare: true,
      body: [beforeAfter(h, model)],
    }),
    p(
      h,
      "The differences are cool grey surfaces, an indigo for the In Review and Done glyphs, 13 pixel type and 28 pixel controls. No view changed; every difference comes from tokens and from the theme's control sizes.",
    ),

    h2(h, 'compiler', 'A compiler for themes'),
    p(
      h,
      "crease's `/create` page works as a theme compiler. Every setting is a field of one `Config`: a style, a base grey, the accent's hue, chroma and lightness, surface tint and contrast, radius, shadow, font, text scale and a few more. The configuration encodes into a preset code, and `npm run preset:build` turns a code into CSS and a JSON record of the settings.",
    ),
    p(
      h,
      'Crease Tasks keeps the preset code and the reason for each setting in `design-system/theme.md`, not a stylesheet edited by hand. A later change to the accent or the density is then one setting and one regeneration:',
    ),
    figure(h, {
      n: 2,
      title: 'The knobs',
      caption: 'The table from `design-system/theme.md` at `chapter-04`.',
      bare: true,
      body: [knobs(h)],
    }),
    p(
      h,
      "The `mira` style carries decisions D1 and D4 from chapter 3. It is crease's port of shadcn's compact Mira scale: a default button or input is 28 pixels tall (`1.75rem`), the small sizes are 24 and 20, and control text is 13 pixels. The text scale of 0.925 brings body text from 14 to about 13 pixels.",
    ),

    h2(h, 'contrast', 'One knob, tuned'),
    p(
      h,
      "The first preset used crease's default surface contrast of 22. In the app, the sidebar and the group headers came out a clearly visible grey that competed with the issues. Surface contrast sets how far surfaces like the sidebar step away from the page. Compare the default with the value Crease Tasks uses:",
    ),
    figure(h, {
      n: 3,
      title: 'Surface contrast 22 and 6',
      caption:
        'A sketch of the app painted with the real token values of both generated presets. Only `--sidebar`, `--muted` and `--border` change; the page and the accent stay.',
      body: [contrastPlayground(h, model)],
    }),
    p(
      h,
      "At 22, `--sidebar` and `--muted` are `oklch(0.923 …)`. At 6 they are `oklch(0.979 …)`, close to the page's white, and the border mixes from the lighter grey too. Changing one number changed every surface in the app together.",
    ),

    h2(h, 'build', 'Generating it'),
    p(
      h,
      'With the settings chosen, one command should produce the CSS. At the crease commit this guide uses, that command fails for every preset code:',
    ),
    figure(h, {
      n: 4,
      title: 'preset:build',
      caption:
        'The output of `npm run preset:build` in the crease repository at `9240b562`, without the stack frames.',
      bare: true,
      body: [
        terminal(
          h,
          'npm run preset:build -- --preset c41ST0kztg1aRr803UlnDN6',
          buildError,
          /RangeError/u,
        ),
      ],
    }),
    p(
      h,
      'The script parses the code into an `Option` and then passes the whole `Option` to `presetRegistryJson`, where the knob values are `undefined` and turn into `NaN`. The fix is one line:',
    ),
    figure(h, {
      n: 5,
      title: 'The one-line fix',
      caption:
        "Crease Tasks generated its theme with a copy of the script that has this change. The bug is on the guide's list of crease issues.",
      bare: true,
      body: [codeBlock(h, 'scripts/materialize-create-preset.ts', fix)],
    }),

    h2(h, 'policy', "The generated CSS against crease's own policy"),
    p(
      h,
      "crease's lint has a CSS policy, `creaseui-lint css`, that keeps component styling out of global stylesheets. Run on the stylesheet the preset compiler produces, it finds 22 violations:",
    ),
    figure(h, {
      n: 6,
      title: 'The raw preset, checked',
      caption:
        'The generated file placed at `src/theme/crease-preset.css` in a `chapter-04` checkout, then checked.',
      bare: true,
      body: [terminal(h, 'npx creaseui-lint css', cssRaw, /^css:/u)],
    }),
    p(
      h,
      'They are of two kinds. Most are the `mira` sizes, which reach components through their `data-slot` attribute: allowed in theme CSS that is registered as such, rejected in a global stylesheet. The rest are base rules: fonts and weights on `h1` to `h4`, `stroke-width` on every `svg`, transition and animation durations on every element, and a `font-family` in the token rule.',
    ),
    p(
      h,
      'Registered theme CSS may not define `:root` tokens, so Crease Tasks splits the generated file in two. `tokens.css` holds the custom properties for light and dark and the shadows, as a global stylesheet. `geometry.css` holds the `mira` rules and is registered as theme CSS:',
    ),
    figure(h, {
      n: 7,
      title: 'The geometry half',
      caption:
        'The start of `src/theme/geometry.css`. Each rule sizes one kind of control, keyed by `data-slot` and `data-size`.',
      bare: true,
      body: [codeBlock(h, 'src/theme/geometry.css', geometryExcerpt)],
    }),
    figure(h, {
      n: 8,
      title: 'Registering and loading the theme',
      caption:
        "The changes to `eslint.config.js`, `src/main.ts` and `src/styles.css`. The ignore line exists because ESLint would otherwise try to parse the registered stylesheet as TypeScript, another crease issue on the guide's list.",
      bare: true,
      body: [
        h.div(
          [h.Class('grid gap-3')],
          [
            diffView(
              h,
              'eslint.config.js',
              eslintDiff,
              'git diff chapter-03 chapter-04',
            ),
            diffView(
              h,
              'src/main.ts',
              mainDiff,
              'git diff chapter-03 chapter-04',
            ),
            diffView(
              h,
              'src/styles.css',
              stylesDiff,
              'git diff chapter-03 chapter-04',
            ),
          ],
        ),
      ],
    }),
    p(
      h,
      "The base rules were removed, with the reasons in the files' header comments and in `theme.md`, so a regeneration repeats the same edits:",
    ),
    list(h, [
      "The heading rule: headings in Crease Tasks are crease's `heading` component, which sets its own weight and size.",
      "`stroke-width: 2` on every `svg`: crease's icon helper already draws every icon with a stroke width of 2.",
      "The motion durations on `*`: dropped, so transitions keep crease's defaults. The preset's motion setting of 0.8 has no effect as a result.",
      'The Google Fonts import: replaced with the self-hosted `@fontsource-variable/inter`, which registers the family as `Inter Variable`. That is why `src/styles.css` changes its font stack.',
    ]),
    p(
      h,
      "`main.ts` loads both halves after crease's base theme in `styles.css`, so the product's values win.",
    ),

    h2(h, 'dark', 'Light and dark'),
    p(
      h,
      'The preset also generates a dark token set, under the `.dark` class. Crease Tasks gets a button in the sidebar footer that switches between the two. The switch puts the class on `<html>`, so the whole document, including dialogs, uses the same set.',
    ),
    p(
      h,
      'The first version changed the class from a Command in `src/model.ts`. The strict lint rejected it:',
    ),
    figure(h, {
      n: 9,
      title: 'Changing classes outside a component',
      caption: '`npx eslint src` with the class change in `src/model.ts`.',
      bare: true,
      body: [terminal(h, 'npx eslint src', lintClassList.trimEnd())],
    }),
    p(
      h,
      'The rule exists so that appearance comes from components, variants and tokens, not from code that edits the DOM. Switching the token set is a legitimate exception, so it gets one place: `src/theme/mode.ts`, registered in `eslint.config.js` as a setup file with its reason, like `src/main.ts`. The Command in the model calls it.',
    ),
    figure(h, {
      n: 10,
      title: 'The one place that switches the theme',
      caption:
        '`src/theme/mode.ts` at `chapter-04`. Its registration is part of the `eslint.config.js` diff in Figure 8.',
      bare: true,
      body: [codeBlock(h, 'src/theme/mode.ts', mode.trimEnd())],
    }),
    p(
      h,
      "Switching to dark showed a problem the light theme had hidden. The preset's dark set has no sidebar tokens, and the product's light values load after crease's base theme, so the sidebar stays light while its text turns white:",
    ),
    figure(h, {
      n: 11,
      title: 'The sidebar in dark mode',
      caption:
        'All issues at `chapter-04` in dark mode, without and with the added tokens.',
      bare: true,
      body: [darkPair(h)],
    }),
    p(
      h,
      "Looking for the cause turned up a second gap in the light set: `--sidebar-accent` has the same value as `--sidebar`, so the active link in the sidebar had no visible background since chapter 2. `tokens.css` fixes both by hand, with values taken from the preset's own tokens, and `theme.md` says to add the block again after a regeneration. Both gaps are on the guide's list of crease issues; crease fixed them, and chapter 15 deletes the block.",
    ),
    figure(h, {
      n: 12,
      title: 'The tokens added by hand',
      caption: 'The end of `src/theme/tokens.css` at `chapter-04`.',
      bare: true,
      body: [codeBlock(h, 'src/theme/tokens.css', tokensFix.trimEnd())],
    }),

    h2(h, 'limits', 'What a theme cannot do'),
    p(
      h,
      'The lint at `chapter-04` still reports thirteen warnings, as in chapter 2. The theme changed every colour and size, and no override went away. Two overrides now repeat the theme: `h-7 text-xs` on the search field sets the height and text size that `mira` already gives every input.',
    ),
    p(
      h,
      'Tokens decide values. They do not decide which component gets which value, whether a row may wrap, or how many kinds of button a product has. Those are decisions about components, and chapter 5 makes them.',
    ),

    essayFooter(
      h,
      'The code for this chapter is the tag `chapter-04` in the `creaseui-demo` repository, and `git diff chapter-03 chapter-04` shows all of it. Chapter 5 reads the thirteen warnings as a list and turns them into two decisions.',
    ),
  ])
