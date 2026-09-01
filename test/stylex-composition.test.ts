import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import ts from 'typescript'

const constrainedFile = 'src/demo/board-constrained.ts'
const constrainedSource = readFileSync(constrainedFile, 'utf8')
const constrainedAst = ts.createSourceFile(
  constrainedFile,
  constrainedSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
)

const walk = (node: ts.Node, visit: (candidate: ts.Node) => void): void => {
  visit(node)
  ts.forEachChild(node, (child) => walk(child, visit))
}

const primitiveNames = ['box', 'grid', 'inline', 'stack', 'text'] as const
const propFiles = primitiveNames.map((name) => ({
  name,
  file: `src/stylex/composition/${name}.ts`,
}))

describe('constrained StyleX composition', () => {
  it('keeps every primitive public API closed to enumerated props', () => {
    const forbidden = new Set([
      'class',
      'className',
      'layoutStyle',
      'style',
      'styles',
      'unsafeClass',
      'unsafeStyle',
    ])

    for (const { file, name } of propFiles) {
      const source = readFileSync(file, 'utf8')
      const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
      const props = `${name[0]!.toUpperCase()}${name.slice(1)}Props`
      let found = false

      walk(ast, (node) => {
        if (!ts.isTypeAliasDeclaration(node) || node.name.text !== props) return
        found = true
        walk(node.type, (member) => {
          if (!ts.isPropertySignature(member) || member.name === undefined) return
          const property = member.name.getText(ast).replaceAll(/["']/gu, '')
          assert.equal(
            forbidden.has(property),
            false,
            `${file}: ${props}.${property} is an unrestricted style escape hatch`,
          )
        })
      })

      assert.equal(found, true, `${file}: missing ${props}`)
    }
  })

  it('uses primitives for page layout without direct StyleX or raw Foldkit layout nodes', () => {
    const importedPrimitives = new Set<string>()
    const calledPrimitives = new Set<string>()
    const rawLayoutCalls: string[] = []
    const forbiddenBuilders = new Set([
      'article', 'aside', 'div', 'footer', 'header', 'li', 'main', 'nav',
      'ol', 'section', 'ul', 'Class', 'Style',
    ])

    walk(constrainedAst, (node) => {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        assert.notEqual(node.moduleSpecifier.text, '@stylexjs/stylex')
        if (node.moduleSpecifier.text === '@/stylex/composition') {
          for (const element of node.importClause?.namedBindings !== undefined &&
          ts.isNamedImports(node.importClause.namedBindings)
            ? node.importClause.namedBindings.elements
            : []) {
            importedPrimitives.add(element.name.text)
          }
        }
      }

      if (!ts.isCallExpression(node)) return
      if (ts.isIdentifier(node.expression) && primitiveNames.includes(node.expression.text as typeof primitiveNames[number])) {
        calledPrimitives.add(node.expression.text)
      }
      if (
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'h' &&
        forbiddenBuilders.has(node.expression.name.text)
      ) {
        rawLayoutCalls.push(node.expression.getText(constrainedAst))
      }
    })

    assert.deepEqual([...importedPrimitives].sort(), ['box', 'grid', 'inline', 'stack', 'text'])
    assert.deepEqual([...calledPrimitives].sort(), ['box', 'grid', 'inline', 'stack', 'text'])
    assert.deepEqual(rawLayoutCalls, [])
  })

  it('keeps responsive values finite instead of accepting arbitrary CSS', () => {
    const types = readFileSync('src/stylex/composition/types.ts', 'utf8')
    assert.match(
      types,
      /export type ResponsiveSpaceToken = SpaceToken \| 'createBoard'/u,
    )
    assert.doesNotMatch(types, /CSSProperties|StyleXStyles|StaticStyles/u)
  })

  it('keeps multi-column breakpoints mutually exclusive', () => {
    const grid = readFileSync('src/stylex/composition/grid.ts', 'utf8')
    assert.match(grid, /min-width: 700px\) and \(max-width: 1099px/u)
    assert.match(grid, /min-width: 1100px/u)
    assert.doesNotMatch(grid, /'@media \(min-width: 700px\)'/u)
  })
})
