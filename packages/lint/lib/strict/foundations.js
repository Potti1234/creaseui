import path from 'node:path'

import ts from 'typescript'

import { optionsFor } from './render-exports.js'

/* A product component that declares `foundations` must render each one: a
   resolved call to an installed export with that contract, or be the
   in-place adaptation of that contract itself. Imports, comments and names
   are not evidence. */

const followAlias = (checker, symbol) =>
  symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol

const calleeSymbol = (checker, expression) => {
  let symbol = followAlias(
    checker,
    checker.getSymbolAtLocation(
      ts.isPropertyAccessExpression(expression) ? expression.name : expression,
    ),
  )
  for (let hop = 0; hop < 8 && symbol !== undefined; hop += 1) {
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0]
    const initializer =
      declaration !== undefined && ts.isVariableDeclaration(declaration)
        ? declaration.initializer
        : undefined
    if (
      initializer === undefined ||
      !(
        ts.isIdentifier(initializer) ||
        ts.isPropertyAccessExpression(initializer)
      )
    )
      return symbol
    const next = followAlias(
      checker,
      checker.getSymbolAtLocation(
        ts.isPropertyAccessExpression(initializer)
          ? initializer.name
          : initializer,
      ),
    )
    if (next === undefined || next === symbol) return symbol
    symbol = next
  }
  return symbol
}

export const verifyFoundations = ({ ownership, rootDir }) => {
  const claims = []
  const providers = new Set()
  for (const byName of ownership.exports.values())
    for (const record of byName.values()) {
      if (record.contract !== undefined) providers.add(record.contract)
      if (record.foundations.length > 0) claims.push(record)
    }
  if (claims.length === 0) return []
  const files = [
    ...new Set(claims.map(record => path.resolve(rootDir, record.file))),
  ]
  const program = ts.createProgram(files, optionsFor(rootDir, files))
  const checker = program.getTypeChecker()
  const problems = []
  for (const record of claims) {
    const where = `${record.file} \`${record.name}\``
    const source = program.getSourceFile(path.resolve(rootDir, record.file))
    const moduleSymbol =
      source === undefined ? undefined : checker.getSymbolAtLocation(source)
    const exported = followAlias(
      checker,
      moduleSymbol === undefined
        ? undefined
        : checker
            .getExportsOfModule(moduleSymbol)
            .find(symbol => symbol.name === record.name),
    )
    const declaration =
      exported?.valueDeclaration ?? exported?.declarations?.[0]
    if (declaration === undefined) {
      for (const foundation of record.foundations)
        problems.push(
          `${where} declares foundation ${foundation}, but the export cannot be resolved to verify it`,
        )
      continue
    }
    const rendered = new Set()
    const visit = node => {
      if (ts.isCallExpression(node)) {
        const symbol = calleeSymbol(checker, node.expression)
        const target = symbol?.valueDeclaration ?? symbol?.declarations?.[0]
        if (target !== undefined) {
          const owned = ownership
            .exportsOf(path.resolve(target.getSourceFile().fileName))
            ?.get(symbol.name)
          if (owned?.contract !== undefined) rendered.add(owned.contract)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(declaration)
    for (const foundation of record.foundations) {
      if (foundation === record.contract || rendered.has(foundation)) continue
      problems.push(
        providers.has(foundation)
          ? `${where} declares foundation ${foundation} but never renders it; call the installed component (imports, comments and names do not count)`
          : `${where} declares foundation ${foundation}, but no installed export provides it; install the component before building on it`,
      )
    }
  }
  return problems
}
