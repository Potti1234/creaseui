import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { authoredPages } from '../../../src/docs/components/pages/index.ts'

type Renderer = 'stylex' | 'pleat'

/**
 * Writes every copyable StyleX and Pleat documentation program as its own
 * page (`<slug>-<renderer>-<index>.html` + `.ts`) so a consumer build can
 * execute them exactly as a user would after copying.
 */
const outDir = resolve(process.argv[2] ?? 'e2e/.generated/copied-programs')
const only = process.argv[3]?.split(',')
mkdirSync(outDir, { recursive: true })

const entries: Array<string> = []
for (const page of Object.values(authoredPages)) {
  if (only !== undefined && !only.includes(page.slug)) continue
  const variants: ReadonlyArray<
    readonly [Renderer, ReadonlyArray<{ code: string }>]
  > = [
    ['stylex', page.definition.stylexExamples ?? []],
    ['pleat', page.definition.pleatExamples ?? []],
  ]
  for (const [renderer, examples] of variants) {
    examples.forEach((example, index) => {
      const name = `${page.slug}-${renderer}-${String(index)}`
      writeFileSync(resolve(outDir, `${name}.ts`), example.code)
      writeFileSync(
        resolve(outDir, `${name}.html`),
        `<!doctype html><html lang="en"><head><meta charset="UTF-8" /></head><body><div id="root"></div><script type="module" src="./${name}.ts"></script></body></html>\n`,
      )
      entries.push(name)
    })
  }
}
writeFileSync(resolve(outDir, 'entries.json'), JSON.stringify(entries))
