import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import ts from 'typescript'

/** Parse imports and re-exports, including type-only and side-effect imports. */
export const moduleSpecifiers = source => {
  const file = ts.createSourceFile(
    'module.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
  )
  const specifiers = new Set()
  const visit = node => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.add(node.moduleSpecifier.text)
    }
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      specifiers.add(node.argument.literal.text)
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.add(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return [...specifiers]
}

/** File ownership, rather than basename matching, keeps lib/field distinct from ui/field. */
export const fileOwners = (root, registries) => {
  const owners = new Map()
  for (const { directory, items } of registries) {
    for (const item of items) {
      for (const file of item.files) {
        const path = resolve(root, directory, file.path)
        const previous = owners.get(path)
        if (previous && previous !== item.name) {
          throw new Error(
            `${path} belongs to both ${previous} and ${item.name}`,
          )
        }
        owners.set(path, item.name)
      }
    }
  }
  return owners
}

export const sourceDependencies = (root, sourcePath, owners, itemName) => {
  const registry = new Set()
  const packages = new Set()
  for (const specifier of moduleSpecifiers(readFileSync(sourcePath, 'utf8'))) {
    if (specifier.startsWith('@/') || specifier.startsWith('.')) {
      const path = specifier.startsWith('@/')
        ? resolve(root, 'src', specifier.slice(2))
        : resolve(dirname(sourcePath), specifier)
      const owner = owners.get(path) ?? owners.get(`${path}.ts`)
      if (!owner) {
        throw new Error(`Unregistered dependency ${specifier} in ${sourcePath}`)
      }
      if (owner !== itemName) registry.add(`Potti1234/creaseui/${owner}`)
    } else {
      packages.add(
        specifier.startsWith('@')
          ? specifier.split('/').slice(0, 2).join('/')
          : specifier.split('/')[0],
      )
    }
  }
  return { registry, packages }
}
