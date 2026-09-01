import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const files = [
  'src/demo/board-constrained.ts',
  'src/demo/blocks-stylex/featured-page.ts',
  'src/demo/blocks-stylex/astryx-inspired-dashboards.ts',
  'src/demo/blocks-stylex/chart-analytics-dashboard.ts',
  'src/demo/charts-stylex/page.ts',
]
const forbidden = [
  ['StyleX authoring', /@stylexjs\/stylex|stylex\.create/u],
  ['Tailwind class composition', /\bcn\s*\(|h\.Class\s*\(/u],
  ['inline style escape hatch', /h\.Style\s*\(/u],
  ['raw layout builder', /h\.(?:article|aside|div|footer|header|li|main|nav|ol|section|ul)\s*\(/u],
  ['double assertion', /\bas\s+unknown\s+as\b/u],
]

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  for (const [label, pattern] of forbidden) {
    assert.doesNotMatch(source, pattern, `${file}: forbidden ${label}`)
  }

  const calls = Object.fromEntries(
    ['box', 'grid', 'inline', 'stack', 'text'].map((name) => [
      name,
      [...source.matchAll(new RegExp(`\\b${name}\\s*\\(`, 'gu'))].length,
    ]),
  )

  for (const [name, count] of Object.entries(calls)) {
    assert.ok(count > 0, `${file}: expected at least one ${name}(...) call`)
  }

  console.log(`Constrained composition guard passed for ${file}: ${JSON.stringify(calls)}`)
}
