import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { optionsFor } from './render-exports.js'

/* Foldkit-aware project information for `creaseui-lint info` and `inspect`,
   read from the project itself: package versions, components.json aliases,
   the install receipt and the installed source. */

const readJson = file =>
  existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined

const FRAMEWORK_PACKAGES = ['foldkit', '@foldkit/ui', 'effect', 'vite']
const PREFIX = { pleat: 'pleat-', stylex: 'stylex-', tailwind: '' }
const PROGRAM = ['Model', 'Message', 'init', 'update', 'subscriptions', 'view']

const installedVersion = (rootDir, name) =>
  readJson(path.join(rootDir, 'node_modules', name, 'package.json'))?.version

export const projectInfo = ({ manifest, rootDir }) => {
  const packageJson = readJson(path.join(rootDir, 'package.json')) ?? {}
  const declared = {
    ...packageJson.devDependencies,
    ...packageJson.dependencies,
  }
  const receipt = readJson(manifest)
  const components = readJson(path.join(rootDir, 'components.json'))
  return {
    aliases: components?.aliases ?? {},
    artifacts: (receipt?.artifacts ?? []).map(artifact => ({
      exports: (artifact.exports ?? []).length,
      files: (artifact.files ?? []).map(file => file.path),
      id: artifact.id,
      ...(artifact.adapted === undefined ? {} : { adapted: artifact.adapted }),
      ...(artifact.source === undefined ? {} : { source: artifact.source }),
    })),
    framework: Object.fromEntries(
      FRAMEWORK_PACKAGES.filter(name => declared[name] !== undefined).map(
        name => [
          name,
          {
            declared: declared[name],
            installed: installedVersion(rootDir, name),
          },
        ],
      ),
    ),
    policy: receipt?.policyVersion,
    receipt: receipt === undefined ? null : path.relative(rootDir, manifest),
    registries: components?.registries ?? {},
    renderer: receipt?.renderer,
  }
}

/* `native-select`, `pleat-native-select` and receipts written before the
   id stopped repeating the renderer (`pleat-pleat-native-select`) all name
   the same item. */
const itemName = id =>
  id
    .split('/')
    .at(-1)
    .replace(/^(?:(?:pleat|stylex)-)+/u, '')

const matches = (artifact, name) =>
  artifact.id === name ||
  (artifact.id !== undefined && itemName(artifact.id) === itemName(name)) ||
  (artifact.files ?? []).some(
    file => path.basename(file.path).replace(/\.[^.]+$/u, '') === name,
  ) ||
  (artifact.exports ?? []).some(record => record.name === name)

/** Value and type exports per file, through `export *` and re-exports, as
    the type checker sees them; undefined where a file can't be resolved. */
const checkedExports = (rootDir, files) => {
  const result = new Map()
  if (files.length === 0) return result
  try {
    const program = ts.createProgram(files, optionsFor(rootDir, files))
    const checker = program.getTypeChecker()
    for (const file of files) {
      const source = program.getSourceFile(file)
      const symbol =
        source === undefined ? undefined : checker.getSymbolAtLocation(source)
      if (symbol === undefined) continue
      const all = checker.getExportsOfModule(symbol)
      const resolved = entry =>
        entry.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(entry)
          : entry
      result.set(file, {
        names: all.map(entry => entry.name),
        values: all
          .filter(entry => resolved(entry).flags & ts.SymbolFlags.Value)
          .map(entry => entry.name),
      })
    }
  } catch {
    /* fall back to the source text below */
  }
  return result
}

export const inspectComponent = ({ component, manifest, rootDir }) => {
  const receipt = readJson(manifest)
  if (receipt === undefined)
    return {
      error: `no install receipt at ${path.relative(rootDir, manifest)}; run creaseui-lint init first`,
    }
  const artifact = (receipt.artifacts ?? []).find(entry =>
    matches(entry, component),
  )
  const install = `npx shadcn@latest add Potti1234/creaseui/${PREFIX[receipt.renderer] ?? ''}${component}`
  if (artifact === undefined)
    return {
      error: `${component} is not installed in this ${receipt.renderer} project. Install it with \`${install}\` and compose the installed source; if no Crease component fits, build a new domain component from installed ones instead of re-creating this one.`,
    }
  const checked = checkedExports(
    rootDir,
    (artifact.files ?? [])
      .map(file => path.resolve(rootDir, file.path))
      .filter(file => existsSync(file) && /\.[cm]?[jt]sx?$/u.test(file)),
  )
  const files = (artifact.files ?? []).map(file => {
    const absolute = path.join(rootDir, file.path)
    const source = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null
    const typed = checked.get(path.resolve(absolute))
    const program =
      source === null
        ? []
        : typed !== undefined
          ? PROGRAM.filter(name => typed.names.includes(name))
          : PROGRAM.filter(name =>
              new RegExp(
                `^export (?:type|interface|const|function|class) ${name}\\b`,
                'mu',
              ).test(source),
            )
    const sourceExports =
      source === null
        ? []
        : typed !== undefined
          ? typed.values.filter(name => !PROGRAM.includes(name))
          : [
              ...source.matchAll(
                /^export (?:const|function|class|let) ([A-Za-z_$][\w$]*)/gmu,
              ),
            ].map(match => match[1])
    return {
      imports:
        source === null
          ? []
          : [
              ...new Set(
                [...source.matchAll(/^import [^'"]*['"]([^'"]+)['"]/gmu)].map(
                  match => match[1],
                ),
              ),
            ].sort(),
      missing: source === null,
      path: file.path,
      program,
      rawElements:
        file.rawRendering === true ? (file.rawElements ?? 'all') : undefined,
      role: file.role,
      sourceExports,
    }
  })
  const registered = new Set(
    (artifact.exports ?? []).map(record => record.name),
  )
  const program = [...new Set(files.flatMap(file => file.program))]
  const stateful = program.includes('Model') && program.includes('update')
  const limitations = [
    ...files
      .filter(file => file.missing)
      .map(file => `${file.path} is in the receipt but missing on disk`),
    ...files.flatMap(file =>
      file.sourceExports
        .filter(name => !registered.has(name))
        .map(
          name =>
            `${file.path} exports ${name} without a contract; doctor checks whether it renders`,
        ),
    ),
    ...files
      .filter(file => file.rawElements !== undefined)
      .map(
        file =>
          `${file.path} may render raw ${file.rawElements === 'all' ? 'elements' : file.rawElements.join(', ')}`,
      ),
  ]
  return {
    artifact: artifact.id,
    exports: (artifact.exports ?? []).map(record => ({
      contract: record.contract,
      foundations: record.foundations ?? [],
      name: record.name,
      renderKind: record.renderKind ?? 'helper',
      variants: record.variants ?? {},
      visibility: record.visibility ?? 'public',
    })),
    files: files.map(({ sourceExports, missing, ...file }) => file),
    install,
    limitations,
    program,
    renderer: receipt.renderer,
    stateOwnership: stateful
      ? 'parent-model: keep its Model in yours, route its Message through update and render view'
      : 'stateless: call it from your view with props',
    docs: stateful
      ? `Stateful Foldkit component (${program.join(', ')}): embed its Model in your Model, start it from init, wrap its Message in one of yours and forward it to its update, and render it with view and your HtmlBuilder. Customize the installed source, not global CSS.`
      : 'Stateless Foldkit view: call it from your view with props and the HtmlBuilder; customize the installed source, not global CSS.',
    stylingOwner: `${receipt.renderer} component source (customize the installed file, not global CSS)`,
  }
}
