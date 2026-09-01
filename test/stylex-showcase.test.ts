import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import ts from 'typescript'

const showcasePath = 'src/demo/stylex-catalog.ts'
const source = readFileSync(showcasePath, 'utf8')
const sourceFile = ts.createSourceFile(
  showcasePath,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
)

const registryNames = readdirSync('src/ui')
  .filter(file => file.endsWith('.ts'))
  .map(file => file.slice(0, -3))
  .sort()

const catalogNames = (): ReadonlyArray<string> => {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === 'STYLEX_CATALOG_NAMES' &&
        declaration.initializer !== undefined
      ) {
        const expression = ts.isAsExpression(declaration.initializer)
          ? declaration.initializer.expression
          : declaration.initializer
        if (ts.isArrayLiteralExpression(expression)) {
          return expression.elements.flatMap(element =>
            ts.isStringLiteral(element) ? [element.text] : [],
          )
        }
      }
    }
  }
  return []
}

const stylexImports = (): ReadonlyMap<string, string> => {
  const imports = new Map<string, string>()
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.moduleSpecifier.text.startsWith('@/stylex/')
    ) continue
    const binding = statement.importClause?.namedBindings
    if (binding !== undefined && ts.isNamespaceImport(binding)) {
      imports.set(statement.moduleSpecifier.text.slice('@/stylex/'.length), binding.name.text)
    }
  }
  return imports
}

const invokedNamespaces = (): ReadonlySet<string> => {
  const namespaces = new Set<string>()
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression)
    ) namespaces.add(node.expression.expression.text)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return namespaces
}

describe('StyleX visual showcase coverage', () => {
  it('renders one imported and invoked specimen for every registry component', () => {
    const names = catalogNames().slice().sort()
    const imports = stylexImports()
    const invoked = invokedNamespaces()

    assert.deepEqual(names, registryNames)
    assert.equal(new Set(names).size, 65)

    const gaps = names.flatMap(name => {
      const namespace = imports.get(name)
      if (namespace === undefined) return [`${name}: not imported`]
      return invoked.has(namespace) ? [] : [`${name}: ${namespace} is never invoked`]
    })
    assert.deepEqual(gaps, [], gaps.join('\n'))
  })
})
