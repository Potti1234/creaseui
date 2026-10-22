import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, it } from 'node:test'

import { authoredPages } from '../src/docs/components/pages/index.ts'

const pagesRoot = join('src', 'docs', 'components', 'pages')

const sourceFiles = (directory: string): ReadonlyArray<string> =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return entry.name.endsWith('.ts') ? [path] : []
  })

const typeOnlyImport = /^import type \{[^}]*\} from ['"]@\/lib\/icon['"];?$/
// Named helpers such as Icon.chevronDown(...) or Icon.x(...) live only in @/lib/icon.
const namedHelperCall = /\bIcon\.(?!icon\b)[a-z][A-Za-z0-9]*\(/
const positionalIconCall = /\bIcon\.icon\(\s*['"`$]/

const violations = (check: (line: string) => boolean): ReadonlyArray<string> =>
  sourceFiles(pagesRoot).flatMap(path =>
    readFileSync(path, 'utf8')
      .split('\n')
      .flatMap((line, index) =>
        check(line) ? [`${relative(pagesRoot, path)}:${index + 1}`] : [],
      ),
  )

describe('docs examples use the public Icon component', () => {
  it('only imports types from @/lib/icon', () => {
    assert.deepEqual(
      violations(
        line =>
          line.includes('@/lib/icon') && !typeOnlyImport.test(line.trim()),
      ),
      [],
    )
  })

  it('does not call the low-level icon helpers', () => {
    assert.deepEqual(
      violations(line => namedHelperCall.test(line)),
      [],
    )
  })

  it('passes icon props as an object', () => {
    assert.deepEqual(
      violations(line => positionalIconCall.test(line)),
      [],
    )
  })

  it('shows the public Icon component in every copyable example', () => {
    // The shown code imports `icon` or `Icon` from the renderer and passes props as an object.
    const positionalCall = /\b(?:Icon\.)?icon\(\s*[^{\s]/
    const problems = Object.values(authoredPages).flatMap(page =>
      [
        ...page.definition.examples,
        ...(page.definition.stylexExamples ?? []),
        ...(page.definition.pleatExamples ?? []),
      ].flatMap(example =>
        example.code
          .split('\n')
          .filter(
            line =>
              line.includes('@/lib/icon') ||
              namedHelperCall.test(line) ||
              positionalCall.test(line),
          )
          .map(line => `${page.slug}: ${line.trim()}`),
      ),
    )
    assert.deepEqual(problems, [])
  })
})
