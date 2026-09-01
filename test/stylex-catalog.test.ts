import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { dirname, resolve } from 'node:path'
import ts from 'typescript'

const componentNames = readdirSync('src/ui')
  .filter(file => file.endsWith('.ts'))
  .map(file => file.slice(0, -3))
  .sort()

const infrastructureNames = new Set([
  'complex-tokens.stylex',
  'contracts',
  'foundations-tokens.stylex',
  'index',
  'interaction-tokens.stylex.const',
  'overlay-boundary',
  'overlay-tokens.stylex',
  'style',
  'tokens.stylex',
])

const registry = JSON.parse(readFileSync('src/ui/registry.json', 'utf8')) as {
  readonly items: ReadonlyArray<{ readonly name: string }>
}
const registryNames = registry.items.map(item => item.name)

const pascalCase = (name: string): string =>
  name
    .split('-')
    .map(part => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join('')

/** Styling implementation details may disappear when CVA is replaced by StyleX. */
const intentionallyRemovedStylingExports = new Map<string, ReadonlySet<string>>([
  ['badge', new Set(['BadgeVariants', 'badgeVariants'])],
  ['button', new Set(['ButtonVariants', 'buttonVariants'])],
])

const parse = (path: string): ts.SourceFile =>
  ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

const isExported = (node: ts.Node): boolean =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node)?.some(
    modifier => modifier.kind === ts.SyntaxKind.ExportKeyword,
  ) ??
    false)

const bindingNames = (name: ts.BindingName): ReadonlyArray<string> => {
  if (ts.isIdentifier(name)) return [name.text]
  return name.elements.flatMap(element =>
    ts.isOmittedExpression(element) ? [] : bindingNames(element.name),
  )
}

const resolveModule = (sourceFile: ts.SourceFile, specifier: string): string | undefined => {
  const unresolvedBase = specifier.startsWith('@/')
    ? resolve('src', specifier.slice(2))
    : specifier.startsWith('.')
      ? resolve(dirname(sourceFile.fileName), specifier)
      : undefined
  if (unresolvedBase === undefined) return undefined
  const base = unresolvedBase.endsWith('.js')
    ? unresolvedBase.slice(0, -'.js'.length)
    : unresolvedBase
  return [`${base}.ts`, resolve(base, 'index.ts')].find(existsSync)
}

const exportedNames = (
  sourceFile: ts.SourceFile,
  visited: Set<string> = new Set(),
): ReadonlySet<string> => {
  const names = new Set<string>()
  if (visited.has(sourceFile.fileName)) return names
  visited.add(sourceFile.fileName)

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause !== undefined && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) names.add(element.name.text)
      } else if (
        statement.moduleSpecifier !== undefined &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        const target = resolveModule(sourceFile, statement.moduleSpecifier.text)
        if (target !== undefined) {
          for (const name of exportedNames(parse(target), visited)) names.add(name)
        }
      }
      continue
    }

    if (!isExported(statement)) continue

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        for (const name of bindingNames(declaration.name)) names.add(name)
      }
      continue
    }

    if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement)
    ) {
      if (statement.name !== undefined) names.add(statement.name.text)
    }
  }

  return names
}

const localTypeDeclarations = (
  sourceFile: ts.SourceFile,
): ReadonlyMap<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration> => {
  const declarations = new Map<
    string,
    ts.InterfaceDeclaration | ts.TypeAliasDeclaration
  >()
  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      declarations.set(statement.name.text, statement)
    }
  }
  return declarations
}

const publicTypeProperties = (sourceFile: ts.SourceFile): ReadonlyMap<string, ReadonlySet<string>> => {
  const result = new Map<string, ReadonlySet<string>>()

  for (const statement of sourceFile.statements) {
    if (
      !isExported(statement) ||
      (!ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement))
    ) {
      continue
    }

    const properties = new Set<string>()
    const visit = (node: ts.Node): void => {
      if (ts.isPropertySignature(node) && node.name !== undefined) {
        const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
          ? node.name.text
          : node.name.getText(sourceFile)
        properties.add(name)
      }
      ts.forEachChild(node, visit)
    }
    visit(statement)
    result.set(statement.name.text, properties)
  }

  return result
}

const migratedStylePropName = (name: string): string => {
  if (name === 'class' || name === 'className' || name === 'style' || name === 'unsafeStyle') {
    return 'layoutStyle'
  }
  return name.endsWith('Class') ? `${name.slice(0, -'Class'.length)}LayoutStyle` : name
}

const publicStaticStyleEscapes = (sourceFile: ts.SourceFile): ReadonlyArray<string> => {
  const findings: Array<string> = []

  for (const statement of sourceFile.statements) {
    if (
      !isExported(statement) ||
      (!ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement))
    ) {
      continue
    }

    const visit = (node: ts.Node): void => {
      if (ts.isPropertySignature(node) && node.name !== undefined && node.type !== undefined) {
        const type = node.type.getText(sourceFile)
        if (/\b(?:StaticStyles|StyleXStyles)\b/u.test(type)) {
          findings.push(`${statement.name.text}.${node.name.getText(sourceFile)}`)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(statement)
  }

  return findings
}

const classStyleProp = /^(?:class|className|style|unsafeStyle|[a-z][A-Za-z]*Class)$/u

const isStringLike = (type: ts.TypeNode | undefined): boolean => {
  if (type === undefined) return false
  if (type.kind === ts.SyntaxKind.StringKeyword) return true
  if (ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) return true
  return ts.isUnionTypeNode(type) && type.types.some(isStringLike)
}

const publicStringClassProps = (sourceFile: ts.SourceFile): ReadonlyArray<string> => {
  const declarations = localTypeDeclarations(sourceFile)
  const findings = new Set<string>()
  const visited = new Set<string>()

  const inspect = (node: ts.Node, owner: string): void => {
    if (ts.isPropertySignature(node) && node.name !== undefined) {
      const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
        ? node.name.text
        : node.name.getText(sourceFile)
      if (classStyleProp.test(name) && isStringLike(node.type)) {
        findings.add(`${owner}.${name}`)
      }
    }

    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      const referencedName = node.typeName.text
      const declaration = declarations.get(referencedName)
      const visitKey = `${owner}:${referencedName}`
      if (declaration !== undefined && !visited.has(visitKey)) {
        visited.add(visitKey)
        inspect(declaration, owner)
      }
    }

    ts.forEachChild(node, child => inspect(child, owner))
  }

  for (const statement of sourceFile.statements) {
    if (
      isExported(statement) &&
      (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement))
    ) {
      inspect(statement, statement.name.text)
    }

    if (isExported(statement) && ts.isFunctionDeclaration(statement)) {
      for (const parameter of statement.parameters) inspect(parameter, statement.name?.text ?? '<anonymous>')
    }

    if (isExported(statement) && ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const owner = bindingNames(declaration.name).join(',')
        if (declaration.type !== undefined) inspect(declaration.type, owner)
        if (
          declaration.initializer !== undefined &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer))
        ) {
          for (const parameter of declaration.initializer.parameters) inspect(parameter, owner)
        }
      }
    }
  }

  return [...findings].sort()
}

const styleBoundaryViolations = (sourceFile: ts.SourceFile): ReadonlyArray<string> => {
  const findings: Array<string> = []
  const location = (node: ts.Node): string => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    return `${line + 1}:${character + 1}`
  }

  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      (/^@\/ui\//u.test(node.moduleSpecifier.text) ||
        /(?:^|\/)src\/ui(?:\/|$)/u.test(node.moduleSpecifier.text) ||
        /^\.\.\/ui(?:\/|$)/u.test(node.moduleSpecifier.text))
    ) {
      findings.push(`${location(node)} imports ${node.moduleSpecifier.text}`)
    }

    if (ts.isCallExpression(node)) {
      if (
        ts.isIdentifier(node.expression) &&
        (node.expression.text === 'className' || node.expression.text === 'cn')
      ) {
        node.arguments.forEach(argument => {
          if (ts.isStringLiteralLike(argument)) {
            findings.push(`${location(argument)} string passed to ${node.expression.getText(sourceFile)}`)
          }
        })
      }

      if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'Class'
      ) {
        const argument = node.arguments[0]
        const isAdapterCall =
          argument !== undefined &&
          ts.isCallExpression(argument) &&
          ts.isIdentifier(argument.expression) &&
          (argument.expression.text === 'className' || argument.expression.text === 'cn')
        if (!isAdapterCall) findings.push(`${location(node)} Class bypasses StyleX adapter`)
      }

      if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'Style'
      ) {
        const argument = node.arguments[0]
        if (
          argument !== undefined &&
          ts.isPropertyAccessExpression(argument) &&
          ts.isIdentifier(argument.expression) &&
          (argument.expression.text === 'props' || argument.expression.text === 'p')
        ) {
          findings.push(`${location(node)} public prop passed directly to h.Style`)
        }
      }

      if (
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'stylex' &&
        node.expression.name.text === 'create'
      ) {
        const argument = node.arguments[0]
        if (
          argument !== undefined &&
          ts.isObjectLiteralExpression(argument) &&
          argument.properties.length === 0
        ) {
          findings.push(`${location(node)} empty stylex.create declaration`)
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return findings
}

describe('complete StyleX catalog', () => {
  it('keeps its closed component-name tuple in canonical registry order', () => {
    const sourceFile = parse('src/stylex/index.ts')
    const declaration = sourceFile.statements
      .filter(ts.isVariableStatement)
      .flatMap(statement => [...statement.declarationList.declarations])
      .find(candidate =>
        ts.isIdentifier(candidate.name) &&
        candidate.name.text === 'STYLEX_COMPONENT_NAMES',
      )

    assert.ok(declaration?.initializer !== undefined)
    assert.ok(ts.isAsExpression(declaration.initializer), 'tuple must use `as const`')
    assert.equal(declaration.initializer.type.getText(sourceFile), 'const')

    const tuple = declaration.initializer.expression
    assert.ok(ts.isArrayLiteralExpression(tuple))
    assert.deepEqual(
      tuple.elements.map(element => {
        assert.ok(ts.isStringLiteral(element))
        return element.text
      }),
      registryNames,
    )
  })

  it('exposes one resolvable PascalCase namespace per registry component', () => {
    const sourceFile = parse('src/stylex/index.ts')
    const namespaceExports = sourceFile.statements.flatMap(statement => {
      if (
        !ts.isExportDeclaration(statement) ||
        statement.exportClause === undefined ||
        !ts.isNamespaceExport(statement.exportClause) ||
        statement.moduleSpecifier === undefined ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        return []
      }

      return [{
        name: statement.exportClause.name.text,
        specifier: statement.moduleSpecifier.text,
      }]
    })

    assert.deepEqual(
      namespaceExports.map(item => item.name),
      registryNames.map(pascalCase),
    )
    assert.deepEqual(
      namespaceExports.map(item => item.specifier),
      registryNames.map(name => `./${name}.js`),
    )

    for (const item of namespaceExports) {
      assert.ok(
        resolveModule(sourceFile, item.specifier) !== undefined,
        `${item.name} does not resolve from ${item.specifier}`,
      )
    }
  })

  it('has one implementation for every Crease UI component', () => {
    const stylexNames = readdirSync('src/stylex')
      .filter(file => file.endsWith('.ts'))
      .map(file => file.slice(0, -3))
      .filter(name => !infrastructureNames.has(name))
      .sort()

    assert.deepEqual(stylexNames, componentNames)
    assert.equal(componentNames.length, 65)
  })

  it('does not fall back to Tailwind, CVA, or raw authored class strings', () => {
    for (const name of componentNames) {
      const source = readFileSync(`src/stylex/${name}.ts`, 'utf8')

      assert.doesNotMatch(source, /class-variance-authority/u, name)
      assert.doesNotMatch(source, /@\/lib\/utils/u, name)
      assert.doesNotMatch(source, /\bh\.Class\(\s*['"`]/u, name)
    }
  })

  it('preserves the exported TypeScript API of every component', () => {
    const gaps: Array<string> = []

    for (const name of componentNames) {
      const uiExports = exportedNames(parse(`src/ui/${name}.ts`))
      const stylexExports = exportedNames(parse(`src/stylex/${name}.ts`))
      const allowlist = intentionallyRemovedStylingExports.get(name) ?? new Set()
      const missing = [...uiExports]
        .filter(exportName => !stylexExports.has(exportName) && !allowlist.has(exportName))
        .sort()

      if (missing.length > 0) gaps.push(`${name}: ${missing.join(', ')}`)
    }

    assert.deepEqual(gaps, [], `Missing StyleX exports:\n${gaps.join('\n')}`)
  })

  it('preserves public component prop names while migrating class hooks', () => {
    const gaps: Array<string> = []

    for (const name of componentNames) {
      const uiTypes = publicTypeProperties(parse(`src/ui/${name}.ts`))
      const stylexTypes = publicTypeProperties(parse(`src/stylex/${name}.ts`))

      for (const [typeName, uiProperties] of uiTypes) {
        const stylexProperties = stylexTypes.get(typeName)
        if (stylexProperties === undefined) continue
        const missing = [...uiProperties]
          .map(migratedStylePropName)
          .filter(property => !stylexProperties.has(property))
          .sort()
        if (missing.length > 0) gaps.push(`${name}.${typeName}: ${missing.join(', ')}`)
      }
    }

    assert.deepEqual(gaps, [], `Missing StyleX props:\n${gaps.join('\n')}`)
  })

  it('does not expose public string-based class styling props', () => {
    const violations: Array<string> = []

    for (const name of componentNames) {
      const findings = publicStringClassProps(parse(`src/stylex/${name}.ts`))
      if (findings.length > 0) violations.push(`${name}: ${findings.join(', ')}`)
    }

    assert.deepEqual(
      violations,
      [],
      `Public string class-style props found:\n${violations.join('\n')}`,
    )
  })

  it('keeps every component on the statically extracted StyleX boundary', () => {
    const violations: Array<string> = []

    for (const name of componentNames) {
      const findings = styleBoundaryViolations(parse(`src/stylex/${name}.ts`))
      if (findings.length > 0) violations.push(`${name}: ${findings.join(', ')}`)
    }

    assert.deepEqual(
      violations,
      [],
      `StyleX boundary violations found:\n${violations.join('\n')}`,
    )
  })

  it('does not expose unrestricted visual StyleX overrides', () => {
    const violations: Array<string> = []

    for (const name of componentNames) {
      const findings = publicStaticStyleEscapes(parse(`src/stylex/${name}.ts`))
      if (findings.length > 0) violations.push(`${name}: ${findings.join(', ')}`)
    }

    assert.deepEqual(
      violations,
      [],
      `Public unrestricted StyleX overrides found:\n${violations.join('\n')}`,
    )
  })
})
