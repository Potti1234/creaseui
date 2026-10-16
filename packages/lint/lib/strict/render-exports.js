import path from 'node:path'

import ts from 'typescript'

/* A value renders UI when one of its call signatures takes an HtmlBuilder
   or returns Html. Checked on resolved types first and on the resolved
   declaration's written signature when foldkit types are unavailable. */
const RENDER_TYPE = /\b(?:Html|HtmlBuilder|VNode)\b/u

const DEFAULT_OPTIONS = {
  allowJs: true,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
}

const parseConfig = configPath => {
  const read = ts.readConfigFile(configPath, ts.sys.readFile)
  if (read.error !== undefined) return null
  return ts.parseJsonConfigFileContent(
    read.config,
    ts.sys,
    path.dirname(configPath),
  )
}

/** Compiler options of the tsconfig (or project reference) covering `files`. */
const optionsFor = (rootDir, files) => {
  const configPath = ts.findConfigFile(
    rootDir,
    ts.sys.fileExists,
    'tsconfig.json',
  )
  if (configPath === undefined) return DEFAULT_OPTIONS
  const parsed = parseConfig(configPath)
  if (parsed === null) return DEFAULT_OPTIONS
  const covers = config =>
    files.some(file =>
      config.fileNames.some(name => path.resolve(name) === path.resolve(file)),
    )
  if (covers(parsed)) return { ...parsed.options, noEmit: true }
  for (const reference of parsed.projectReferences ?? []) {
    const referencePath = ts.sys.directoryExists(reference.path)
      ? path.join(reference.path, 'tsconfig.json')
      : reference.path
    const child = parseConfig(referencePath)
    if (child !== null && covers(child))
      return { ...child.options, noEmit: true }
  }
  return { ...DEFAULT_OPTIONS, ...parsed.options, noEmit: true }
}

const isFunctionLike = node =>
  node !== undefined &&
  (ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node))

const signatureText = node =>
  [
    ...node.parameters.map(parameter => parameter.type?.getText() ?? ''),
    node.type?.getText() ?? '',
  ].join(' ')

/**
 * Public rendering exports of each file, from the TypeScript program rather
 * than initializer shapes: direct functions, factories, aliases
 * (`export const actionAlias = button`) and local `export { a as b }`.
 * `origin` is the file that declares the rendered value, so an alias keeps
 * the contract of the component it aliases.
 */
export const createRenderExports = ({ rootDir, files }) => {
  const program = ts.createProgram(files, optionsFor(rootDir, files))
  const checker = program.getTypeChecker()

  const unalias = symbol =>
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol

  /** Declaration behind `symbol`, through imports and identifier aliases. */
  const valueDeclaration = (symbol, depth = 0) => {
    const resolved = unalias(symbol)
    const declaration = resolved.valueDeclaration ?? resolved.declarations?.[0]
    if (declaration === undefined || depth > 20) return declaration
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined
    ) {
      let initializer = declaration.initializer
      while (
        ts.isAsExpression(initializer) ||
        ts.isSatisfiesExpression(initializer) ||
        ts.isParenthesizedExpression(initializer)
      )
        initializer = initializer.expression
      if (
        ts.isIdentifier(initializer) ||
        ts.isPropertyAccessExpression(initializer)
      ) {
        const next = checker.getSymbolAtLocation(initializer)
        if (next !== undefined) return valueDeclaration(next, depth + 1)
      }
    }
    return declaration
  }

  const writtenRenders = (declaration, depth = 0) => {
    if (declaration === undefined || depth > 5) return false
    if (isFunctionLike(declaration))
      return (
        RENDER_TYPE.test(signatureText(declaration)) ||
        (declaration.body !== undefined &&
          !ts.isBlock(declaration.body) &&
          isFunctionLike(declaration.body) &&
          writtenRenders(declaration.body, depth + 1)) ||
        (declaration.body !== undefined &&
          ts.isBlock(declaration.body) &&
          declaration.body.statements.some(
            statement =>
              ts.isReturnStatement(statement) &&
              isFunctionLike(statement.expression) &&
              writtenRenders(statement.expression, depth + 1),
          ))
      )
    if (!ts.isVariableDeclaration(declaration)) return false
    if (declaration.type !== undefined)
      return RENDER_TYPE.test(declaration.type.getText())
    const initializer = declaration.initializer
    if (initializer === undefined) return false
    if (isFunctionLike(initializer)) return writtenRenders(initializer, depth)
    if (ts.isCallExpression(initializer)) {
      const callee = checker.getSymbolAtLocation(initializer.expression)
      return callee !== undefined
        ? writtenRenders(valueDeclaration(callee), depth + 1)
        : false
    }
    return false
  }

  const typedRenders = (symbol, location) => {
    const type = checker.getTypeOfSymbolAtLocation(unalias(symbol), location)
    return type.getCallSignatures().some(signature => {
      const text = [
        checker.typeToString(signature.getReturnType()),
        ...signature
          .getParameters()
          .map(parameter =>
            checker.typeToString(
              checker.getTypeOfSymbolAtLocation(parameter, location),
            ),
          ),
      ].join(' ')
      return RENDER_TYPE.test(text)
    })
  }

  /** Rendering exports declared (or locally re-bound) in `file`. */
  const of = file => {
    const sourceFile = program.getSourceFile(file)
    if (sourceFile === undefined) return null
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile)
    if (moduleSymbol === undefined) return []
    const found = []
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      const own = (symbol.declarations ?? []).find(
        declaration => declaration.getSourceFile() === sourceFile,
      )
      /* `export *` and `export { x } from` are recorded where declared. */
      if (own === undefined) continue
      if (
        ts.isExportSpecifier(own) &&
        own.parent.parent.moduleSpecifier !== undefined
      )
        continue
      if (!(unalias(symbol).flags & ts.SymbolFlags.Value)) continue
      const declaration = valueDeclaration(symbol)
      if (!typedRenders(symbol, own) && !writtenRenders(declaration)) continue
      const origin = declaration?.getSourceFile().fileName
      found.push({
        name: symbol.name,
        originName:
          declaration?.name !== undefined && ts.isIdentifier(declaration.name)
            ? declaration.name.text
            : symbol.name,
        origin:
          origin === undefined ? path.resolve(file) : path.resolve(origin),
      })
    }
    return found
  }

  return { of }
}
