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

const strip = node => {
  while (
    node !== undefined &&
    (ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isNonNullExpression(node))
  )
    node = node.expression
  return node
}

const functionOf = declaration => {
  if (declaration === undefined) return undefined
  if (
    ts.isFunctionDeclaration(declaration) ||
    ts.isFunctionExpression(declaration) ||
    ts.isArrowFunction(declaration) ||
    (ts.isMethodDeclaration(declaration) && declaration.body !== undefined)
  )
    return declaration
  if (
    ts.isVariableDeclaration(declaration) ||
    ts.isPropertyAssignment(declaration)
  ) {
    const initializer = strip(declaration.initializer)
    if (
      initializer !== undefined &&
      (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
    )
      return initializer
  }
  return undefined
}

/** Expressions a function returns, not counting nested functions. */
const returnedOf = fn => {
  if (fn.body === undefined) return []
  if (!ts.isBlock(fn.body)) return [fn.body]
  const returned = []
  const walk = node => {
    if (ts.isFunctionLike(node)) return
    if (ts.isReturnStatement(node) && node.expression !== undefined)
      returned.push(node.expression)
    ts.forEachChild(node, walk)
  }
  ts.forEachChild(fn.body, walk)
  return returned
}

/* foldkit's element builders (`h.div(...)`), recognised by where the
   called member is declared rather than by the receiver's name. */
const FOLDKIT_HTML = /[\\/]foldkit[\\/](?:dist|src)[\\/]html[\\/]/u
const isHtmlBuilderCall = (checker, call) => {
  if (!ts.isPropertyAccessExpression(call.expression)) return false
  const symbol = checker.getSymbolAtLocation(call.expression.name)
  return (
    symbol?.declarations?.some(declaration =>
      FOLDKIT_HTML.test(declaration.getSourceFile().fileName),
    ) ?? false
  )
}

/* Array operations whose result holds the receiver's elements (and, for
   `concat`, its arguments'), and those that map them through a callback. */
const COLLECTING = new Set([
  'at',
  'concat',
  'filter',
  'find',
  'findLast',
  'flat',
  'reverse',
  'slice',
  'sort',
  'toReversed',
  'toSorted',
])
const MAPPING = new Set(['flatMap', 'map'])

/* Contracts whose calls flow into the returned view: through children,
   props, branches, local consts, callbacks and helpers. A helper argument
   counts only when the helper's matching parameter reaches its own returned
   output; arguments to unknown functions (`String(...)`, imported utilities
   without a body) are not evidence. */
const renderedContracts = (checker, declaration, contractOf) => {
  const rendered = new Set()
  const declarationOf = symbol =>
    symbol?.valueDeclaration ?? symbol?.declarations?.[0]
  const NO_BINDINGS = new Map()
  /* The parameter a binding belongs to and the property path to it:
     `({ body }) =>` binds `body` to path ['body'] of the first argument. */
  const parameterOf = target => {
    const path = []
    let node = target
    while (node !== undefined && ts.isBindingElement(node)) {
      const pattern = node.parent
      if (ts.isArrayBindingPattern(pattern))
        path.unshift(String(pattern.elements.indexOf(node)))
      else {
        const key = node.propertyName ?? node.name
        if (
          node.dotDotDotToken ||
          !(ts.isIdentifier(key) || ts.isStringLiteral(key))
        )
          return undefined
        path.unshift(key.text)
      }
      node = pattern.parent
    }
    return node !== undefined && ts.isParameter(node)
      ? { parameter: node, path }
      : undefined
  }
  const isArray = node => {
    const type = checker.getTypeAtLocation(node)
    return checker.isArrayType(type) || checker.isTupleType(type)
  }
  /* The part of `node` at `path` that reaches the output. Paths that
     can't be followed (opaque values, computed keys) are not evidence. */
  const project = (node, path, depth, bindings) => {
    if (path.length === 0) return output(node, depth, bindings)
    node = strip(node)
    if (node === undefined || depth > 12) return
    const [key, ...rest] = path
    if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties)
        if (ts.isSpreadAssignment(property))
          project(property.expression, path, depth, bindings)
        else if (
          (ts.isPropertyAssignment(property) ||
            ts.isShorthandPropertyAssignment(property)) &&
          (ts.isIdentifier(property.name) ||
            ts.isStringLiteral(property.name)) &&
          property.name.text === key
        )
          project(
            ts.isPropertyAssignment(property)
              ? property.initializer
              : property.name,
            rest,
            depth,
            bindings,
          )
      return
    }
    if (ts.isArrayLiteralExpression(node)) {
      const element = node.elements[Number(key)]
      if (element !== undefined && !ts.isSpreadElement(element))
        project(element, rest, depth, bindings)
      return
    }
    if (ts.isConditionalExpression(node)) {
      project(node.whenTrue, path, depth, bindings)
      project(node.whenFalse, path, depth, bindings)
      return
    }
    if (ts.isPropertyAccessExpression(node)) {
      project(node.expression, [node.name.text, ...path], depth, bindings)
      return
    }
    if (ts.isIdentifier(node)) {
      const target = declarationOf(calleeSymbol(checker, node))
      const bound = target === undefined ? undefined : parameterOf(target)
      if (bound !== undefined) {
        const argument = bindings.get(bound.parameter)
        if (argument !== undefined)
          project(
            argument.node,
            [...bound.path, ...path],
            depth + 1,
            argument.bindings,
          )
        return
      }
      if (target !== undefined && ts.isVariableDeclaration(target))
        project(target.initializer, path, depth + 1, bindings)
    }
  }
  /* A callback whose first parameter receives the receiver's elements. */
  const mapped = (callback, receiver, depth, bindings) => {
    callback = strip(callback)
    const fn =
      callback !== undefined &&
      (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
        ? callback
        : callback !== undefined && ts.isIdentifier(callback)
          ? functionOf(declarationOf(calleeSymbol(checker, callback)))
          : undefined
    if (fn === undefined) return
    const passed = new Map()
    if (fn.parameters[0] !== undefined)
      passed.set(fn.parameters[0], { bindings, node: receiver })
    helper(fn, depth, passed)
  }
  const output = (node, depth, bindings) => {
    node = strip(node)
    if (node === undefined || depth > 12) return
    if (ts.isCallExpression(node)) {
      const symbol = calleeSymbol(checker, node.expression)
      const contract = contractOf(symbol)
      if (contract !== undefined) {
        rendered.add(contract)
        for (const argument of node.arguments) output(argument, depth, bindings)
        return
      }
      const fn = functionOf(declarationOf(symbol))
      if (fn !== undefined) {
        const passed = new Map()
        fn.parameters.forEach((parameter, index) => {
          const argument = parameter.dotDotDotToken
            ? undefined
            : node.arguments[index]
          if (argument !== undefined)
            passed.set(parameter, { bindings, node: argument })
        })
        helper(fn, depth, passed)
        return
      }
      /* foldkit element builders place their arguments in the output;
         array operations carry their receiver's elements. Any other call
         (`JSON.stringify`, unknown methods) is not evidence. */
      if (isHtmlBuilderCall(checker, node)) {
        for (const argument of node.arguments) output(argument, depth, bindings)
        return
      }
      const callee = node.expression
      if (ts.isPropertyAccessExpression(callee) && isArray(callee.expression)) {
        const method = callee.name.text
        if (COLLECTING.has(method)) {
          output(callee.expression, depth, bindings)
          if (method === 'concat')
            for (const argument of node.arguments)
              output(argument, depth, bindings)
        } else if (MAPPING.has(method))
          mapped(node.arguments[0], callee.expression, depth, bindings)
      }
      return
    }
    if (ts.isPropertyAccessExpression(node)) {
      project(node.expression, [node.name.text], depth, bindings)
      return
    }
    if (ts.isArrayLiteralExpression(node)) {
      for (const element of node.elements)
        output(
          ts.isSpreadElement(element) ? element.expression : element,
          depth,
          bindings,
        )
      return
    }
    if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties)
        if (ts.isPropertyAssignment(property))
          output(property.initializer, depth, bindings)
        else if (ts.isShorthandPropertyAssignment(property))
          output(property.name, depth, bindings)
        else if (ts.isSpreadAssignment(property))
          output(property.expression, depth, bindings)
      return
    }
    if (ts.isConditionalExpression(node)) {
      output(node.whenTrue, depth, bindings)
      output(node.whenFalse, depth, bindings)
      return
    }
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) {
      output(node.left, depth, bindings)
      output(node.right, depth, bindings)
      return
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      helper(node, depth, NO_BINDINGS)
      return
    }
    if (ts.isIdentifier(node)) {
      const symbol = calleeSymbol(checker, node)
      const contract = contractOf(symbol)
      if (contract !== undefined) {
        rendered.add(contract)
        return
      }
      const target = declarationOf(symbol)
      const bound = target === undefined ? undefined : parameterOf(target)
      if (bound !== undefined) {
        const argument = bindings.get(bound.parameter)
        if (argument !== undefined)
          project(argument.node, bound.path, depth + 1, argument.bindings)
        return
      }
      if (target !== undefined && ts.isVariableDeclaration(target))
        output(target.initializer, depth + 1, bindings)
      else helper(functionOf(target), depth, NO_BINDINGS)
    }
  }
  const helper = (fn, depth, bindings) => {
    if (fn === undefined) return
    for (const returned of returnedOf(fn)) output(returned, depth + 1, bindings)
  }
  const fn = functionOf(declaration)
  if (fn !== undefined) helper(fn, 0, NO_BINDINGS)
  else if (ts.isVariableDeclaration(declaration))
    output(declaration.initializer, 0, NO_BINDINGS)
  return rendered
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
    const contractOf = symbol => {
      const target = symbol?.valueDeclaration ?? symbol?.declarations?.[0]
      return target === undefined
        ? undefined
        : ownership
            .exportsOf(path.resolve(target.getSourceFile().fileName))
            ?.get(symbol.name)?.contract
    }
    /* Any resolved call, rendered or not: tells a discarded call apart from
       a missing one in the message. */
    const called = new Set()
    const visit = node => {
      if (ts.isCallExpression(node)) {
        const contract = contractOf(calleeSymbol(checker, node.expression))
        if (contract !== undefined) called.add(contract)
      }
      ts.forEachChild(node, visit)
    }
    visit(declaration)
    const rendered = renderedContracts(checker, declaration, contractOf)
    for (const foundation of record.foundations) {
      if (foundation === record.contract || rendered.has(foundation)) continue
      problems.push(
        called.has(foundation)
          ? `${where} declares foundation ${foundation} but never renders it: the call's result does not reach the returned view (unused closures and discarded calls do not count)`
          : providers.has(foundation)
            ? `${where} declares foundation ${foundation} but never renders it; call the installed component (imports, comments and names do not count)`
            : `${where} declares foundation ${foundation}, but no installed export provides it; install the component before building on it`,
      )
    }
  }
  return problems
}
