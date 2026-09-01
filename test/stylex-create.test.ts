import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import ts from 'typescript'

const cardNames = readdirSync('src/demo/cards')
  .filter(file => file.endsWith('.ts'))
  .map(file => file.slice(0, -3))
  .sort()

const exportedNames = (path: string): ReadonlyArray<string> => {
  const source = readFileSync(path, 'utf8')
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)
  const names = new Set<string>()

  for (const statement of file.statements) {
    const modifiers = ts.canHaveModifiers(statement)
      ? ts.getModifiers(statement)
      : undefined
    if (!modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue

    if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement)
    ) {
      if (statement.name !== undefined) names.add(statement.name.text)
      continue
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text)
      }
    }
  }

  return [...names].sort()
}

describe('StyleX Create demonstration', () => {
  it('has one StyleX implementation for every Create card', () => {
    const stylexNames = readdirSync('src/demo/stylex-cards')
      .filter(file => file.endsWith('.ts') && !file.endsWith('.stylex.ts'))
      .map(file => file.slice(0, -3))
      .sort()

    assert.deepEqual(stylexNames, cardNames)
    assert.equal(cardNames.length, 33)
  })

  it('preserves each card module export surface', () => {
    for (const name of cardNames) {
      assert.deepEqual(
        exportedNames(`src/demo/stylex-cards/${name}.ts`),
        exportedNames(`src/demo/cards/${name}.ts`),
        name,
      )
    }
  })

  it('keeps the StyleX board independent from Tailwind component sources', () => {
    const paths = [
      'src/demo/board-stylex.ts',
      ...cardNames.map(name => `src/demo/stylex-cards/${name}.ts`),
    ]

    for (const path of paths) {
      const source = readFileSync(path, 'utf8')
      assert.doesNotMatch(source, /@\/ui\//u, path)
      assert.doesNotMatch(source, /@\/demo\/cards\//u, path)
      assert.doesNotMatch(source, /\bh\.Class\(\s*['"`]/u, path)
      assert.doesNotMatch(source, /class-variance-authority|@\/lib\/utils/u, path)
    }
  })
})
