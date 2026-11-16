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
  checkerLimitations?: ReadonlyArray<RegExp>
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
  {
    slug: 'combobox',
    pattern: 'combobox',
    target: '[role="combobox"]',
    checkerLimitations: [/Escape should close its popup/u],
  },
  {
    slug: 'select',
    pattern: 'listbox',
    target: 'button[aria-haspopup]',
    opens: '[role="listbox"]',
    checkerLimitations: [/typing "a" should move focus/u],
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
    checkerLimitations: [/Escape should close it/u],
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

/* checkPattern fires synthetic keys back to back, faster than Foldkit's
   Escape and typeahead Commands settle. Those problems are listed per case
   and covered with real key presses in the "real keys" tests below. */
const unexplainedProblems = (
  message: string,
  limitations: ReadonlyArray<RegExp>,
): ReadonlyArray<string> => {
  if (message === '') return []
  const problems = message
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
  return problems.length === 0
    ? [message]
    : problems.filter(
        problem => !limitations.some(limitation => limitation.test(problem)),
      )
}

const rendererUrl = (renderer: Renderer, slug: string) =>
  `http://127.0.0.1:${String(RENDERER_PORTS[renderer])}/docs/components/${slug}`

for (const renderer of Object.keys(RENDERER_PORTS) as Array<Renderer>) {
  test.describe(`checkPattern (${renderer})`, () => {
    for (const patternCase of CASES) {
      test(`${patternCase.slug} follows the ${patternCase.pattern} pattern`, async ({
        page,
      }) => {
        await page.goto(rendererUrl(renderer, patternCase.slug))
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
        expect(
          unexplainedProblems(
            await patternProblems(target, patternCase.pattern),
            patternCase.checkerLimitations ?? [],
          ),
        ).toEqual([])
      })
    }
  })

  test.describe(`checkPattern limitations with real keys (${renderer})`, () => {
    test('Escape closes the alert dialog', async ({ page }) => {
      await page.goto(rendererUrl(renderer, 'alert-dialog'))
      await page
        .locator('main')
        .getByRole('button', { name: /show dialog/iu })
        .first()
        .click()
      const dialog = page.getByRole('alertdialog')
      await expect(dialog).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
    })

    test('Escape closes the combobox popup', async ({ page }) => {
      await page.goto(rendererUrl(renderer, 'combobox'))
      const input = page.locator('main [role="combobox"]').first()
      await input.click()
      await page.keyboard.press('ArrowDown')
      await expect(input).toHaveAttribute('aria-expanded', 'true')
      await page.keyboard.press('Escape')
      await expect(input).toHaveAttribute('aria-expanded', 'false')
    })

    test('typeahead moves the active select option', async ({ page }) => {
      await page.goto(rendererUrl(renderer, 'select'))
      await page.locator('main button[aria-haspopup]').first().click()
      const listbox = page.getByRole('listbox').first()
      await expect(listbox).toBeFocused()
      await page.keyboard.press('b')
      const banana = listbox.getByRole('option', { name: 'Banana' })
      await expect(listbox).toHaveAttribute(
        'aria-activedescendant',
        (await banana.getAttribute('id')) ?? '',
      )
    })
  })
}
