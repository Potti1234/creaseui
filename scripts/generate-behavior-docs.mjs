import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import ts from 'typescript'
import {
  companionModules,
  compositionModules,
  groups,
} from './behavior-catalog.mjs'

const entrypoint = (file, specifier, root) => {
  const absolute = specifier.startsWith('@/')
    ? resolve(
        root,
        'src',
        specifier.slice(2).replace(/^ui\/(stylex|pleat)\//u, '$1/'),
      )
    : specifier.startsWith('.')
      ? resolve(dirname(file), specifier)
      : undefined
  if (absolute === undefined) return undefined
  return [absolute, absolute + '.ts', join(absolute, 'index.ts')].find(
    candidate =>
      candidate.endsWith('.ts') &&
      existsSync(candidate) &&
      statSync(candidate).isFile(),
  )
}

const runtimeImports = file => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
  )
  return source.statements.flatMap(node => {
    if (!node.moduleSpecifier || !ts.isStringLiteralLike(node.moduleSpecifier))
      return []
    if (ts.isExportDeclaration(node)) {
      return node.isTypeOnly ||
        (node.exportClause &&
          ts.isNamedExports(node.exportClause) &&
          node.exportClause.elements.every(element => element.isTypeOnly))
        ? []
        : [node.moduleSpecifier.text]
    }
    if (!ts.isImportDeclaration(node)) return []
    const clause = node.importClause
    if (clause?.isTypeOnly) return []
    const bindings = clause?.namedBindings
    return !clause?.name &&
      bindings &&
      ts.isNamedImports(bindings) &&
      bindings.elements.every(element => element.isTypeOnly)
      ? []
      : [node.moduleSpecifier.text]
  })
}

export const behaviorDocs = (root, components, registries, apiFor) => {
  const folder = join(root, 'src/lib/behaviors')
  const guideFiles = readdirSync(folder)
  const titleWord = word => word[0].toUpperCase() + word.slice(1)
  const entries = Object.entries(groups).flatMap(([group, members]) =>
    Object.entries(members).map(([slug, description]) => {
      const behaviorPath = 'src/lib/behaviors/' + slug + '.ts'
      const path = existsSync(resolve(root, behaviorPath))
        ? behaviorPath
        : 'src/lib/' + slug + '.ts'
      const source = resolve(root, path)
      if (!existsSync(source))
        throw new Error('Missing behavior source ' + path)
      return {
        slug,
        group,
        kind: compositionModules.has(slug) ? 'composition' : 'primitive',
        title:
          slug === 'dropdown-menu-behavior'
            ? 'Dropdown Menu'
            : slug.split('-').map(titleWord).join(' '),
        description,
        source: path,
        docs: '/docs/behaviors/' + slug,
        guides: guideFiles
          .filter(
            file =>
              file === slug + '.md' ||
              companionModules[basename(file, '.md')] === slug,
          )
          .map(file => basename(file, '.md')),
        exports: [
          ...new Set(
            apiFor(source)
              .map(entry => entry.name)
              .filter(name => name !== '*'),
          ),
        ],
      }
    }),
  )
  const bySource = new Map(
    entries.map(entry => [resolve(root, entry.source), entry.slug]),
  )
  for (const file of readdirSync(folder).filter(file => file.endsWith('.ts'))) {
    const path = join(folder, file)
    const companion = companionModules[basename(file, '.ts')]
    if (companion !== undefined) bySource.set(path, companion)
    if (!bySource.has(path))
      throw new Error('Behavior has no docs entry: ' + relative(root, path))
  }

  const paths = new Map()
  for (const { renderer, directory, items } of registries)
    for (const item of items)
      paths.set(
        renderer + ':' + item.name.replace(/^(stylex|pleat)-/u, ''),
        item.files
          .map(file => resolve(root, directory, file.path))
          .filter(file => file.endsWith('.ts')),
      )
  const imports = new Map()
  const collect = sources => {
    const used = new Set()
    const seen = new Set()
    const visit = source => {
      if (seen.has(source)) return
      seen.add(source)
      const slug = bySource.get(source)
      if (slug !== undefined) used.add(slug)
      // The shared portal adapter imports three message schemas. Those imports
      // do not make one popup consumer use the other popup behaviors.
      const specifiers = () =>
        slug === 'overlay-boundary'
          ? ['./behaviors/position']
          : runtimeImports(source)
      if (!imports.has(source))
        imports.set(
          source,
          specifiers()
            .map(specifier => entrypoint(source, specifier, root))
            .filter(Boolean),
        )
      for (const dependency of imports.get(source)) visit(dependency)
    }
    for (const source of sources) visit(source)
    return [...used].sort()
  }

  const componentBehaviors = Object.fromEntries(
    components.map(component => [
      component.slug,
      Object.fromEntries(
        registries.map(({ renderer }) => [
          renderer,
          collect(
            paths.get(renderer + ':' + component.slug) ??
              (component.source.startsWith('src/lib/')
                ? [resolve(root, component.source)]
                : []),
          ),
        ]),
      ),
    ]),
  )
  return { entries, componentBehaviors }
}
