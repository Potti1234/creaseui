import { existsSync, readFileSync, realpathSync } from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { POLICY_VERSION, RENDERERS } from './contracts.js'

export class CreaseConfigError extends Error {
  constructor(problems) {
    super(
      `Invalid @creaseui/lint configuration:\n${problems.map(problem => `  - ${problem}`).join('\n')}`,
    )
    this.name = 'CreaseConfigError'
    this.problems = problems
  }
}

export const RECEIPT_SCHEMA_VERSION = 1
export const FILE_ROLES = ['renderer', 'behavior', 'theme', 'adapter', 'setup']
const RAW_ROLES = new Set(['renderer', 'behavior', 'adapter'])
const VISIBILITIES = ['public', 'implementation']
const RENDER_KINDS = ['helper', 'submodel', 'non-rendering']
const GLOB = /[*?{}[\]!]/u

const caseFold = value =>
  process.platform === 'win32' ? value.toLowerCase() : value

/** Normalized comparison key for an absolute filesystem path. */
export const fileKey = absolute => {
  let resolved = path.resolve(absolute)
  try {
    resolved = realpathSync.native(resolved)
  } catch {}
  return caseFold(resolved)
}

const within = (root, target) => {
  const relative = path.relative(root, target)
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  )
}

const checkPath = (rootDir, value, where, problems) => {
  if (typeof value !== 'string' || value.length === 0) {
    problems.push(`${where}: path must be a non-empty string`)
    return null
  }
  if (path.isAbsolute(value) || /^[a-zA-Z]:/u.test(value)) {
    problems.push(`${where}: '${value}' must be relative to rootDir`)
    return null
  }
  if (GLOB.test(value)) {
    problems.push(`${where}: '${value}' must be an exact file, not a glob`)
    return null
  }
  const segments = value.split(/[\\/]/u)
  if (segments.includes('..')) {
    problems.push(`${where}: '${value}' may not traverse outside rootDir`)
    return null
  }
  const absolute = path.resolve(rootDir, value)
  if (!within(rootDir, absolute)) {
    problems.push(`${where}: '${value}' resolves outside rootDir`)
    return null
  }
  if (!existsSync(absolute)) {
    problems.push(
      `${where}: '${value}' does not exist (stale ownership record)`,
    )
    return null
  }
  const real = realpathSync.native(absolute)
  if (!within(realpathSync.native(rootDir), real)) {
    problems.push(`${where}: '${value}' is a link to a target outside rootDir`)
    return null
  }
  return absolute
}

const toPosix = value => value.split(path.sep).join('/')

/**
 * Validate a `crease.lock.json` receipt plus explicit source-owned
 * extensions and index them by exact resolved file.
 */
export const buildOwnership = ({
  rootDir,
  receipt,
  extensions = [],
  renderer,
}) => {
  const problems = []
  if (receipt === null || typeof receipt !== 'object') {
    throw new CreaseConfigError(['manifest: receipt must be a JSON object'])
  }
  if (receipt.schemaVersion !== RECEIPT_SCHEMA_VERSION) {
    problems.push(
      `manifest: unsupported schemaVersion ${JSON.stringify(receipt.schemaVersion)} (expected ${RECEIPT_SCHEMA_VERSION})`,
    )
  }
  if (receipt.policyVersion !== POLICY_VERSION) {
    problems.push(
      `manifest: policyVersion ${JSON.stringify(receipt.policyVersion)} is not supported (expected '${POLICY_VERSION}')`,
    )
  }
  if (!RENDERERS.includes(receipt.renderer)) {
    problems.push(
      `manifest: renderer ${JSON.stringify(receipt.renderer)} must be one of ${RENDERERS.join(', ')}`,
    )
  } else if (renderer !== undefined && renderer !== receipt.renderer) {
    problems.push(
      `renderer: configured '${renderer}' conflicts with manifest renderer '${receipt.renderer}'`,
    )
  }

  const files = new Map()
  const exports = new Map()
  const seenFolded = new Map()

  const addFile = (record, owner, where) => {
    if (!FILE_ROLES.includes(record?.role)) {
      problems.push(`${where}: role must be one of ${FILE_ROLES.join(', ')}`)
      return
    }
    const absolute = checkPath(rootDir, record.path, where, problems)
    if (absolute === null) return
    const key = fileKey(absolute)
    const folded = key.toLowerCase()
    const previousSpelling = seenFolded.get(folded)
    if (previousSpelling !== undefined && previousSpelling !== record.path) {
      if (files.get(key) === undefined) {
        problems.push(
          `${where}: '${record.path}' differs only in case from '${previousSpelling}'`,
        )
        return
      }
    }
    seenFolded.set(folded, record.path)
    const rawRendering = record.rawRendering === true
    if (rawRendering && !RAW_ROLES.has(record.role)) {
      problems.push(
        `${where}: role '${record.role}' cannot grant raw rendering`,
      )
      return
    }
    /* `rawElements` narrows a raw grant to the exact native elements the
       implementation needs, so an SVG helper cannot also render controls. */
    const rawElements = record.rawElements
    if (
      rawElements !== undefined &&
      (!rawRendering ||
        !Array.isArray(rawElements) ||
        rawElements.length === 0 ||
        !rawElements.every(
          tag => typeof tag === 'string' && /^[a-z][A-Za-z0-9]*$/u.test(tag),
        ))
    ) {
      problems.push(
        `${where}: rawElements must be a non-empty list of element names on a raw-rendering file`,
      )
      return
    }
    const existing = files.get(key)
    if (
      existing !== undefined &&
      (existing.role !== record.role || existing.rawRendering !== rawRendering)
    ) {
      problems.push(
        `${where}: '${record.path}' is already owned by ${existing.owner} as ${existing.role}`,
      )
      return
    }
    files.set(key, {
      absolute,
      owner,
      path: toPosix(path.relative(rootDir, absolute)),
      rawRendering,
      ...(rawElements === undefined
        ? {}
        : { rawElements: new Set(rawElements) }),
      role: record.role,
    })
  }

  const addExport = (record, owner, where) => {
    const absolute = checkPath(rootDir, record?.file, where, problems)
    if (absolute === null) return
    const key = fileKey(absolute)
    if (!files.has(key)) {
      problems.push(
        `${where}: export file '${record.file}' is not listed in files`,
      )
      return
    }
    if (typeof record.name !== 'string' || record.name.length === 0) {
      problems.push(`${where}: export name is required`)
      return
    }
    const visibility = record.visibility ?? 'public'
    const renderKind = record.renderKind ?? 'helper'
    if (!VISIBILITIES.includes(visibility)) {
      problems.push(`${where}: visibility must be public or implementation`)
      return
    }
    if (!RENDER_KINDS.includes(renderKind)) {
      problems.push(
        `${where}: renderKind must be one of ${RENDER_KINDS.join(', ')}`,
      )
      return
    }
    if (renderKind !== 'non-rendering' && typeof record.contract !== 'string') {
      problems.push(
        `${where}: rendering export '${record.name}' needs a contract`,
      )
      return
    }
    /* Contracts this export claims to build on; doctor verifies that each
       one is actually rendered (see foundations.js). */
    const foundations = record.foundations ?? []
    if (
      !Array.isArray(foundations) ||
      !foundations.every(entry => typeof entry === 'string' && entry !== '')
    ) {
      problems.push(`${where}: foundations must be a list of contracts`)
      return
    }
    const byName = exports.get(key) ?? new Map()
    if (byName.has(record.name)) {
      problems.push(`${where}: export '${record.name}' is registered twice`)
      return
    }
    byName.set(record.name, {
      builderArgument: record.builderArgument ?? 1,
      contract: record.contract,
      file: files.get(key).path,
      foundations,
      name: record.name,
      owner,
      propsArgument: record.propsArgument ?? 0,
      renderKind,
      variants: record.variants ?? {},
      visibility,
    })
    exports.set(key, byName)
  }

  for (const [index, artifact] of (receipt.artifacts ?? []).entries()) {
    const owner =
      typeof artifact?.id === 'string' ? artifact.id : `artifacts[${index}]`
    for (const [fileIndex, record] of (artifact?.files ?? []).entries())
      addFile(record, owner, `${owner}.files[${fileIndex}]`)
    for (const [exportIndex, record] of (artifact?.exports ?? []).entries())
      addExport(record, owner, `${owner}.exports[${exportIndex}]`)
  }

  for (const [index, extension] of extensions.entries()) {
    const where = `extensions[${index}]`
    if (typeof extension?.id !== 'string')
      problems.push(`${where}: id is required`)
    if (typeof extension?.reason !== 'string' || extension.reason.trim() === '')
      problems.push(`${where}: a review reason is required`)
    const owner = `extension:${extension?.id}`
    for (const file of extension?.files ?? [])
      addFile(
        {
          path: file,
          role: extension.role,
          rawRendering: extension.rawRendering ?? RAW_ROLES.has(extension.role),
        },
        owner,
        `${where}.files`,
      )
    for (const record of extension?.exports ?? [])
      addExport(
        { contract: extension.contract, ...record },
        owner,
        `${where}.exports`,
      )
  }

  if (problems.length > 0) throw new CreaseConfigError(problems)
  return {
    exports,
    files,
    fileFor: absolute => files.get(fileKey(absolute)),
    exportsOf: absolute => exports.get(fileKey(absolute)),
    publicExportFor: contract => {
      for (const byName of exports.values())
        for (const record of byName.values())
          if (record.contract === contract && record.visibility === 'public')
            return record
      return undefined
    },
    renderer: receipt.renderer,
  }
}

export const readReceipt = (rootDir, manifest) => {
  if (manifest !== null && typeof manifest === 'object') return manifest
  if (typeof manifest !== 'string')
    throw new CreaseConfigError([
      'manifest: pass the path of crease.lock.json or a receipt object',
    ])
  const file = path.resolve(rootDir, manifest)
  if (!existsSync(file))
    throw new CreaseConfigError([
      `manifest: '${manifest}' not found; run \`creaseui-lint init\``,
    ])
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    throw new CreaseConfigError([
      `manifest: '${manifest}' is not valid JSON (${error.message})`,
    ])
  }
}

const SOURCE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
]

/**
 * Module resolution with the consumer's TypeScript configuration (paths,
 * baseUrl, moduleResolution) plus barrel re-export following.
 */
export const createModuleResolver = ({ rootDir, tsconfig }) => {
  const projects = (
    Array.isArray(tsconfig)
      ? tsconfig
      : tsconfig === undefined
        ? []
        : [tsconfig]
  ).map(project => {
    const file = path.resolve(rootDir, project)
    const config = ts.readConfigFile(file, ts.sys.readFile)
    if (config.error !== undefined)
      throw new CreaseConfigError([
        `tsconfig: cannot read '${project}' (${ts.flattenDiagnosticMessageText(config.error.messageText, ' ')})`,
      ])
    return ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(file),
    ).options
  })
  const fallback = {
    allowJs: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  }
  const cache = new Map()
  const resolve = (source, fromFile) => {
    const key = `${fromFile}\0${source}`
    if (cache.has(key)) return cache.get(key)
    let resolved = null
    for (const options of projects.length === 0 ? [fallback] : projects) {
      const result = ts.resolveModuleName(
        source,
        fromFile,
        { allowJs: true, ...options },
        ts.sys,
      )
      const file = result.resolvedModule?.resolvedFileName
      if (
        file !== undefined &&
        !result.resolvedModule.isExternalLibraryImport
      ) {
        resolved = path.resolve(file)
        break
      }
    }
    cache.set(key, resolved)
    return resolved
  }

  const parsed = new Map()
  const parse = file => {
    if (!parsed.has(file)) {
      let sourceFile = null
      if (SOURCE_EXTENSIONS.includes(path.extname(file)) && existsSync(file))
        sourceFile = ts.createSourceFile(
          file,
          readFileSync(file, 'utf8'),
          ts.ScriptTarget.Latest,
          false,
        )
      parsed.set(file, sourceFile)
    }
    return parsed.get(file)
  }

  /** `{ target, name }` of the value import bound to `local`, if any. */
  const importedBinding = (sourceFile, local) => {
    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.importClause?.isTypeOnly
      )
        continue
      const bindings = statement.importClause?.namedBindings
      if (bindings === undefined || !ts.isNamedImports(bindings)) continue
      for (const element of bindings.elements)
        if (element.name.text === local && !element.isTypeOnly)
          return {
            target: statement.moduleSpecifier.text,
            name: element.propertyName?.text ?? element.name.text,
          }
    }
    return undefined
  }

  /** Follow `export { a as b } from` / `export * from` to the declaring file. */
  const exportOrigin = (file, name, seen = new Set()) => {
    const key = `${file}#${name}`
    if (seen.has(key) || seen.size > 50) return null
    seen.add(key)
    const sourceFile = parse(file)
    if (sourceFile === null) return { file, name }
    const stars = []
    for (const statement of sourceFile.statements) {
      if (!ts.isExportDeclaration(statement)) continue
      const target =
        statement.moduleSpecifier !== undefined &&
        ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : undefined
      if (statement.exportClause === undefined) {
        if (target !== undefined) stars.push(target)
        continue
      }
      if (!ts.isNamedExports(statement.exportClause)) continue
      for (const element of statement.exportClause.elements) {
        if (element.name.text !== name) continue
        const local = element.propertyName?.text ?? element.name.text
        if (target === undefined) {
          /* `import { button as base }; export { base as action }` */
          const imported = importedBinding(sourceFile, local)
          if (imported === undefined) return { file, name: local }
          const next = resolve(imported.target, file)
          return next === null
            ? { file, name: local }
            : exportOrigin(next, imported.name, seen)
        }
        const next = resolve(target, file)
        return next === null ? null : exportOrigin(next, local, seen)
      }
    }
    for (const target of stars) {
      const next = resolve(target, file)
      if (next === null) continue
      const nested = parse(next)
      if (nested === null) continue
      const origin = exportOrigin(next, name, seen)
      if (origin !== null && declares(origin.file, origin.name)) return origin
    }
    return { file, name }
  }

  /** Module that `export * as name from` exposes from `file` (directly or
      via named/star re-exports): `{ file }` when it is local, `{ source }`
      for a bare package, or null. */
  const namespaceTarget = (file, name, seen = new Set()) => {
    const key = `${file}#${name}`
    if (seen.has(key) || seen.size > 50) return null
    seen.add(key)
    const sourceFile = parse(file)
    if (sourceFile === null) return null
    const stars = []
    for (const statement of sourceFile.statements) {
      if (!ts.isExportDeclaration(statement)) continue
      const target =
        statement.moduleSpecifier !== undefined &&
        ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : undefined
      const clause = statement.exportClause
      if (target === undefined) {
        if (clause !== undefined && ts.isNamedExports(clause))
          for (const element of clause.elements)
            if (element.name.text === name) {
              const local = element.propertyName?.text ?? element.name.text
              return importedNamespace(sourceFile, file, local, seen)
            }
        continue
      }
      if (clause === undefined) stars.push(target)
      else if (ts.isNamespaceExport(clause) && clause.name.text === name) {
        const next = resolve(target, file)
        return next === null ? { source: target } : { file: next }
      } else if (ts.isNamedExports(clause))
        for (const element of clause.elements)
          if (element.name.text === name) {
            const next = resolve(target, file)
            return next === null
              ? null
              : namespaceTarget(
                  next,
                  element.propertyName?.text ?? element.name.text,
                  seen,
                )
          }
    }
    for (const target of stars) {
      const next = resolve(target, file)
      const found = next === null ? null : namespaceTarget(next, name, seen)
      if (found !== null) return found
    }
    return null
  }

  /** Namespace behind a local binding that `file` exports later
      (`import * as X from …; export { X }` or `import { X } from …`). */
  const importedNamespace = (sourceFile, file, local, seen) => {
    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.importClause?.isTypeOnly
      )
        continue
      const target = statement.moduleSpecifier.text
      const bindings = statement.importClause?.namedBindings
      if (
        bindings !== undefined &&
        ts.isNamespaceImport(bindings) &&
        bindings.name.text === local
      ) {
        const next = resolve(target, file)
        return next === null ? { source: target } : { file: next }
      }
      if (bindings !== undefined && ts.isNamedImports(bindings))
        for (const element of bindings.elements)
          if (element.name.text === local && !element.isTypeOnly) {
            const next = resolve(target, file)
            return next === null
              ? null
              : namespaceTarget(
                  next,
                  element.propertyName?.text ?? element.name.text,
                  seen,
                )
          }
    }
    return null
  }

  /** Local file that `export * as name from` exposes from `file`, or null. */
  const namespaceExport = (file, name) =>
    namespaceTarget(file, name)?.file ?? null

  /** Bare-package origin (`{ source, name }`) that a local barrel re-exports
      `name` from, following named, star and import-then-export chains. */
  const externalOrigin = (file, name, seen = new Set()) => {
    const key = `${file}#${name}`
    if (seen.has(key) || seen.size > 50) return null
    seen.add(key)
    const sourceFile = parse(file)
    if (sourceFile === null) return null
    const follow = (target, imported) => {
      const next = resolve(target, file)
      return next === null
        ? { source: target, name: imported }
        : externalOrigin(next, imported, seen)
    }
    const stars = []
    for (const statement of sourceFile.statements) {
      if (!ts.isExportDeclaration(statement)) continue
      const target =
        statement.moduleSpecifier !== undefined &&
        ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : undefined
      if (statement.exportClause === undefined) {
        if (target !== undefined) stars.push(target)
        continue
      }
      if (!ts.isNamedExports(statement.exportClause)) continue
      for (const element of statement.exportClause.elements) {
        if (element.name.text !== name) continue
        const local = element.propertyName?.text ?? element.name.text
        return target === undefined
          ? importedOrigin(sourceFile, local, follow)
          : follow(target, local)
      }
    }
    for (const target of stars) {
      const origin = follow(target, name)
      if (origin !== null) return origin
    }
    return importedOrigin(sourceFile, name, follow)
  }

  const importedOrigin = (sourceFile, local, follow) => {
    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      )
        continue
      const bindings = statement.importClause?.namedBindings
      const target = statement.moduleSpecifier.text
      if (bindings !== undefined && ts.isNamedImports(bindings))
        for (const element of bindings.elements)
          if (element.name.text === local)
            return follow(target, element.propertyName?.text ?? local)
      if (
        bindings !== undefined &&
        ts.isNamespaceImport(bindings) &&
        bindings.name.text === local
      )
        return follow(target, '*')
    }
    return null
  }

  const declares = (file, name) => {
    const sourceFile = parse(file)
    if (sourceFile === null) return false
    return sourceFile.statements.some(statement => {
      const exported =
        ts.getCombinedModifierFlags?.(statement) & ts.ModifierFlags.Export ||
        statement.modifiers?.some(
          modifier => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
      if (!exported)
        return (
          ts.isExportDeclaration(statement) &&
          statement.exportClause !== undefined &&
          ts.isNamedExports(statement.exportClause) &&
          statement.exportClause.elements.some(
            element => element.name.text === name,
          )
        )
      if (ts.isVariableStatement(statement))
        return statement.declarationList.declarations.some(
          declaration =>
            ts.isIdentifier(declaration.name) && declaration.name.text === name,
        )
      return statement.name?.text === name
    })
  }

  return {
    exportOrigin,
    externalOrigin,
    namespaceExport,
    namespaceTarget,
    resolve,
  }
}
