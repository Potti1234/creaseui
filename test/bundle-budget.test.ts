import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import ts from 'typescript'

const MAX_GENERATED_ICON_BYTES = 64 * 1024
const MAX_GENERATED_ICON_COUNT = 100

const sourceFiles = (directory: string): ReadonlyArray<string> =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory()
      ? sourceFiles(path)
      : entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name) && entry.name !== 'icon-nodes.ts'
        ? [path]
        : []
  })

const referencedIconNames = (): ReadonlyArray<string> =>
  sourceFiles('src').flatMap(path => {
    const sourceFile = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    )
    const names: Array<string> = []
    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression
        const isIconCall =
          (ts.isIdentifier(callee) && (callee.text === 'icon' || callee.text === 'named')) ||
          (ts.isPropertyAccessExpression(callee) && callee.name.text === 'icon')
        const firstArgument = node.arguments[0]
        if (isIconCall && firstArgument !== undefined && ts.isStringLiteralLike(firstArgument)) {
          names.push(firstArgument.text)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return names
  })

describe('consumer bundle budgets', () => {
  it('keeps the generated icon catalog bounded', () => {
    const path = 'src/lib/icon-nodes.ts'
    const source = readFileSync(path, 'utf8')
    const iconCount = Array.from(source.matchAll(/^  "[^"]+": \[/gm)).length

    assert.ok(
      statSync(path).size <= MAX_GENERATED_ICON_BYTES,
      `generated icon catalog exceeds ${MAX_GENERATED_ICON_BYTES} bytes`,
    )
    assert.ok(
      iconCount <= MAX_GENERATED_ICON_COUNT,
      `generated icon catalog contains ${iconCount} icons`,
    )
  })

  it('never imports the complete Lucide node catalog in consumer source', () => {
    const source = readFileSync('src/lib/icon.ts', 'utf8')

    assert.doesNotMatch(source, /lucide-static\/icon-nodes\.json/)
    assert.doesNotMatch(source, /\?raw/)
  })

  it('contains every statically referenced and adapter icon', () => {
    const generatedSource = readFileSync('src/lib/icon-nodes.ts', 'utf8')
    const generatedNames = new Set(
      Array.from(generatedSource.matchAll(/^  "([^"]+)": \[/gm), match => match[1]),
    )
    const adapterNames = Object.keys(
      JSON.parse(readFileSync('scripts/icon-adapter-map.json', 'utf8')) as Record<string, unknown>,
    )
    const requiredNames = Array.from(new Set([...adapterNames, ...referencedIconNames()])).sort()
    const missingNames = requiredNames.filter(name => !generatedNames.has(name))

    assert.deepEqual(missingNames, [], `generated icon catalog is missing: ${missingNames.join(', ')}`)
  })
})
