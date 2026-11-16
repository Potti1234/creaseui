import { expect, test, type Locator, type Page } from '@playwright/test'
import type { checkPattern, Pattern } from '@ui-sdk/core/testing'
import { buildSync } from 'esbuild'

declare global {
  interface Window {
    __checkPattern?: typeof checkPattern
  }
}

const RENDERER_PORTS = { Tailwind: 4173, StyleX: 4174, Pleat: 4175 } as const
type Renderer = keyof typeof RENDERER_PORTS

/* The checker settles one bare `setTimeout` plus two frames after each
   input. A Foldkit Message → Command → render cycle can take longer, so the
   checker's own timeouts (not the app's) wait for the Model to settle. */
const FOLDKIT_SETTLE_MS = 100

const checkerScript = (() => {
  const output = buildSync({
    stdin: {
      contents: [
        "import { checkPattern } from '@ui-sdk/core/testing'",
        'window.__checkPattern = checkPattern',
        `window.__settleTimeout = (handler, timeout) => window.setTimeout(handler, Math.max(timeout ?? 0, ${String(FOLDKIT_SETTLE_MS)}))`,
      ].join('\n'),
      resolveDir: process.cwd(),
    },
    define: { setTimeout: 'window.__settleTimeout' },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    write: false,
  }).outputFiles[0]
  if (output === undefined) {
    throw new Error('esbuild produced no checkPattern bundle')
  }
  return output.text
})()

type PatternCase = Readonly<{
  slug: string
  pattern: Pattern
  target: string
  trigger?: (main: Locator) => Locator
  opens?: string
}>

const CASES: ReadonlyArray<PatternCase> = [
  { slug: 'tabs', pattern: 'tabs', target: '[role="tablist"]' },
  { slug: 'switch', pattern: 'switch', target: '[role="switch"]' },
  {
    slug: 'checkbox',
    pattern: 'checkbox',
    target: '[role="checkbox"], input[type="checkbox"]',
  },
  { slug: 'slider', pattern: 'slider', target: '[role="slider"]' },
  {
    slug: 'radio-group',
    pattern: 'radio-group',
    target: '[role="radiogroup"]',
  },
  { slug: 'toolbar', pattern: 'toolbar', target: '[role="toolbar"]' },
  { slug: 'tree-list', pattern: 'tree', target: '[role="tree"]' },
  { slug: 'menubar', pattern: 'menubar', target: '[role="menubar"]' },
  {
    slug: 'accordion',
    pattern: 'accordion',
    target: '[data-slot^="accordion"]',
  },
  {
    slug: 'collapsible',
    pattern: 'disclosure',
    target: 'button[aria-expanded]',
  },
  { slug: 'combobox', pattern: 'combobox', target: '[role="combobox"]' },
  {
    slug: 'select',
    pattern: 'listbox',
    target: 'button[aria-haspopup]',
    opens: '[role="listbox"]',
  },
  {
    slug: 'dropdown-menu',
    pattern: 'menu',
    target: 'button[aria-haspopup="menu"]',
    opens: '[role="menu"]',
  },
  {
    slug: 'alert-dialog',
    pattern: 'alertdialog',
    target: '[role="alertdialog"]',
    trigger: main => main.getByRole('button', { name: /show dialog/iu }),
    opens: '[role="alertdialog"]',
  },
]

const installChecker = async (page: Page) => {
  await page.addScriptTag({ content: checkerScript })
}

const patternProblems = (target: Locator, pattern: Pattern) =>
  target.evaluate(async (element, checkedPattern) => {
    if (window.__checkPattern === undefined) {
      return 'checkPattern is not installed'
    }
    try {
      await window.__checkPattern(element, checkedPattern)
      return ''
    } catch (error) {
      return error instanceof Error ? error.message : String(error)
    }
  }, pattern)

for (const renderer of Object.keys(RENDERER_PORTS) as Array<Renderer>) {
  test.describe(`checkPattern (${renderer})`, () => {
    for (const patternCase of CASES) {
      test(`${patternCase.slug} follows the ${patternCase.pattern} pattern`, async ({
        page,
      }) => {
        await page.goto(
          `http://127.0.0.1:${String(RENDERER_PORTS[renderer])}/docs/components/${patternCase.slug}`,
        )
        const main = page.locator('main').first()
        const initial = main.locator(patternCase.target).first()
        if (patternCase.opens !== undefined) {
          await (patternCase.trigger?.(main) ?? initial).first().click()
        }
        const target =
          patternCase.opens === undefined
            ? initial
            : page.locator(patternCase.opens).first()
        await expect(target).toBeVisible()
        await installChecker(page)
        expect(await patternProblems(target, patternCase.pattern)).toBe('')
      })
    }
  })
}
