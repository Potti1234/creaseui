import { writeFileSync } from 'node:fs'

import { chromium } from 'playwright'

import { pageMetadata } from '../src/docs/page-metadata'
import { catalogOrder, componentPath } from '../src/docs/routes'

type PageReport = {
  readonly slug: string
  readonly title: string
  readonly ok: boolean
  readonly missingExamples: number
  readonly expectedExamples: number
  readonly exampleCards: number
  readonly exampleSections: number
  readonly expectedSections: number
  readonly titleMismatches: ReadonlyArray<string>
  readonly runtimeErrors: ReadonlyArray<string>
}

const argValue = (name: string): string | undefined => {
  const prefix = `--${name}=`
  return process.argv
    .find(argument => argument.startsWith(prefix))
    ?.slice(prefix.length)
}

const baseUrl = argValue('base-url') ?? 'http://127.0.0.1:5181'
const selected = new Set(
  (argValue('slugs') ?? '')
    .split(',')
    .map(slug => slug.trim())
    .filter(Boolean),
)
const strict = process.argv.includes('--strict')
const out = argValue('out')

const metadata = pageMetadata as Record<
  string,
  {
    readonly examples: ReadonlyArray<{
      readonly title: string
      readonly sectionId?: string
      readonly heroOnly?: boolean
    }>
  }
>

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const browser = await chromium.launch({ headless: true })
const reports: Array<PageReport> = []

for (const entry of catalogOrder) {
  if (selected.size > 0 && !selected.has(entry.slug)) continue
  const page = await browser.newPage()
  const runtimeErrors: Array<string> = []
  page.on('pageerror', error =>
    runtimeErrors.push(`pageerror: ${error.message}`),
  )
  page.on('console', message => {
    if (message.type() === 'error')
      runtimeErrors.push(`console: ${message.text()}`)
  })

  const expected = metadata[entry.slug]?.examples ?? []
  const visible = expected.filter(example => example.heroOnly !== true)
  const expectedTitles = visible.map(example => example.title)

  try {
    await page.goto(`${baseUrl}${componentPath(entry.slug)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    })
    await page.locator('h1').first().waitFor({ timeout: 10_000 })
    const h1 = await page.locator('h1').first().textContent()
    if (h1 !== entry.title) runtimeErrors.push(`h1 is ${JSON.stringify(h1)}`)

    const noticeText = await page
      .locator('.docs-main > .docs-pending')
      .first()
      .textContent()
      .catch(() => null)
    const missingMatch = /(\d+) of (\d+) live examples/.exec(noticeText ?? '')
    const missingExamples =
      missingMatch?.[1] === undefined ? 0 : Number(missingMatch[1])

    const headings = await page
      .locator('.docs-example-section .docs-section-heading')
      .evaluateAll(elements =>
        elements.map(element => element.childNodes[0]?.textContent ?? ''),
      )
    const titleMismatches = expectedTitles.flatMap((title, index) =>
      headings[index] === title
        ? []
        : [
            `section ${String(index)} expected ${JSON.stringify(title)}, got ${JSON.stringify(headings[index])}`,
          ],
    )
    if (headings.length !== expectedTitles.length) {
      titleMismatches.push(
        `expected ${String(expectedTitles.length)} example sections, found ${String(headings.length)}`,
      )
    }

    const exampleCards = await page.locator('.docs-example-card').count()
    const exampleSections = await page.locator('.docs-example-section').count()
    reports.push({
      slug: entry.slug,
      title: entry.title,
      ok:
        missingExamples === 0 &&
        titleMismatches.length === 0 &&
        runtimeErrors.length === 0,
      missingExamples,
      expectedExamples: expected.length,
      exampleCards,
      exampleSections,
      expectedSections: expectedTitles.length,
      titleMismatches,
      runtimeErrors,
    })
  } catch (error) {
    reports.push({
      slug: entry.slug,
      title: entry.title,
      ok: false,
      missingExamples: expected.length,
      expectedExamples: expected.length,
      exampleCards: 0,
      exampleSections: 0,
      expectedSections: expectedTitles.length,
      titleMismatches: [],
      runtimeErrors: [error instanceof Error ? error.message : String(error)],
    })
  } finally {
    await page.close()
  }
}

await browser.close()

const summary = {
  total: reports.length,
  complete: reports.filter(report => report.ok).length,
  incomplete: reports.filter(report => !report.ok).length,
  missingExamples: reports.reduce(
    (sum, report) => sum + report.missingExamples,
    0,
  ),
  reports,
}
const output = JSON.stringify(summary, null, 2)
if (out !== undefined) writeFileSync(out, `${output}\n`)
console.log(output)
if (
  strict &&
  reports.some(
    report =>
      !report.ok ||
      report.exampleCards === 0 ||
      report.exampleSections !== report.expectedSections,
  )
) {
  process.exitCode = 1
}
