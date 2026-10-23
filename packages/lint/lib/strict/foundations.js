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

/* foldkit's builder functions (`h.div(attributes, children)`,
   `h.keyed('li')(key, attributes, children)`, `h.OnClick(message)`),
   recognised by the declaration of the resolved signature. Only arguments
   to a `children` parameter are rendered; attributes and the messages
   they carry are not. */
const FOLDKIT_HTML = /[\\/]foldkit[\\/](?:dist|src)[\\/]html[\\/]/u
const FOLDKIT_UI = /[\\/]@foldkit[\\/]ui[\\/]/u
/* `@foldkit/ui` primitives render what their `toView` callback returns:
   `Button.view({ onClick, toView: attributes => h.button(...) }, h)`.
   Their other options are behavior and attributes, never rendered output. */
const isRenderSlotCall = (checker, call) => {
  const declaration = checker.getResolvedSignature(call)?.getDeclaration()
  return (
    declaration !== undefined &&
    FOLDKIT_UI.test(declaration.getSourceFile().fileName)
  )
}
const builderChildren = (checker, call) => {
  const declaration = checker.getResolvedSignature(call)?.getDeclaration()
  if (
    declaration === undefined ||
    !FOLDKIT_HTML.test(declaration.getSourceFile().fileName)
  )
    return undefined
  return declaration.parameters.flatMap((parameter, index) =>
    ts.isIdentifier(parameter.name) && parameter.name.text === 'children'
      ? [index]
      : [],
  )
}

/* Array operations that keep every element (in another order, or with
   `concat`'s arguments). Selections (`at`, `slice`, `filter`) are followed
   only with literal arguments; anything else is unverifiable. */
const REORDERING = new Set([
  'concat',
  'reverse',
  'sort',
  'toReversed',
  'toSorted',
])

const PRIMITIVE =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.Void |
  ts.TypeFlags.Undefined |
  ts.TypeFlags.Null |
  ts.TypeFlags.Never

const literalNumber = node => {
  node = strip(node)
  if (node === undefined) return undefined
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  )
    return -Number(node.operand.text)
  return undefined
}

const propertyNameOf = property => {
  const name = property.name
  return name !== undefined &&
    (ts.isIdentifier(name) ||
      ts.isStringLiteral(name) ||
      ts.isNumericLiteral(name))
    ? name.text
    : undefined
}

/** `true`/`false` for a filter callback that keeps every view
    (`Boolean`, `() => true`) or none (`() => false`). */
const constantPredicate = callback => {
  callback = strip(callback)
  if (callback === undefined) return undefined
  if (ts.isIdentifier(callback) && callback.text === 'Boolean') return true
  if (!(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)))
    return undefined
  const returned = returnedOf(callback)
  if (returned.length !== 1) return undefined
  const value = strip(returned[0])
  return value?.kind === ts.SyntaxKind.TrueKeyword
    ? true
    : value?.kind === ts.SyntaxKind.FalseKeyword
      ? false
      : undefined
}

const ANY = '*'
/* A path step for calling the value: follow what the function returns. */
const CALLED = '\u0001()'
/* Joins a rendered parameter path (`slot.body`) into one `reached` key. */
const PATH_SEPARATOR = '\u0000'

/* Contracts whose calls flow into the returned view: through children,
   props, branches, local consts, callbacks and helpers. A value is followed
   along a path (`['body']`, `['1']`, `[ANY, 'body']` for every element), so
   a destructured property, a selected array element and the last write of
   an object key are what counts. A helper argument counts only when the
   helper's matching parameter reaches its own returned output. Primitive
   results (`String(...)`, `JSON.stringify(...)`) cannot hold a view; other
   calls the check can't follow are recorded as `uncertain`, so a missing
   foundation is reported as unverifiable rather than absent. */
const renderedContracts = (
  checker,
  declaration,
  contractOf,
  probes = new Map(),
  probing = false,
) => {
  const rendered = new Set()
  const uncertain = []
  /* Probing a registered component: the first key of every path through
     which each parameter reaches the returned view (`ANY` for all of it). */
  const reached = new Map()
  /* Every helper body the flow entered, for telling a discarded call
     inside one apart from a missing one. */
  const followed = new Set()
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
  const isPrimitive = node => {
    const type = checker.getTypeAtLocation(node)
    return (type.isUnion() ? type.types : [type]).every(
      part => (part.flags & PRIMITIVE) !== 0,
    )
  }
  const variableInitializer = (node, depth) => {
    const target = declarationOf(calleeSymbol(checker, node))
    return target !== undefined &&
      ts.isVariableDeclaration(target) &&
      depth <= 12
      ? strip(target.initializer)
      : undefined
  }
  /** The literal an expression is, through local consts. */
  const literalOf = (node, test, depth = 0) => {
    node = strip(node)
    if (node === undefined) return undefined
    if (test(node)) return node
    return ts.isIdentifier(node)
      ? literalOf(variableInitializer(node, depth), test, depth + 1)
      : undefined
  }
  /** The object literal a spread is, through local consts and the
      arguments bound to helper parameters. */
  const objectOf = (node, depth, bindings) => {
    node = strip(node)
    if (node === undefined || depth > 12) return undefined
    if (ts.isObjectLiteralExpression(node)) return { bindings, object: node }
    if (!ts.isIdentifier(node)) return undefined
    const target = declarationOf(calleeSymbol(checker, node))
    const bound = target === undefined ? undefined : parameterOf(target)
    if (bound !== undefined) {
      const argument = bindings.get(bound.parameter)
      return argument?.node !== undefined &&
        argument.path.length === 0 &&
        bound.path.length === 0
        ? objectOf(argument.node, depth + 1, argument.bindings)
        : undefined
    }
    return target !== undefined && ts.isVariableDeclaration(target)
      ? objectOf(target.initializer, depth + 1, bindings)
      : undefined
  }
  /** Whether a spread value the check can't see always, never or maybe
      provides `key`, from its type. */
  const keyPresence = (node, key) => {
    const type = checker.getTypeAtLocation(node)
    if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return 'maybe'
    const property = checker.getPropertyOfType(type, key)
    if (property === undefined)
      return checker.getIndexInfosOfType(type).length > 0 ? 'maybe' : 'never'
    return property.flags & ts.SymbolFlags.Optional ? 'maybe' : 'always'
  }
  const elementsOf = (node, depth) => {
    const array = literalOf(node, ts.isArrayLiteralExpression, depth)
    return array === undefined || array.elements.some(ts.isSpreadElement)
      ? undefined
      : array.elements
  }
  /** Every element of `elements` along `path`, as if they were an array. */
  const flowElements = (elements, path, depth, bindings) => {
    const [key, ...rest] = path
    if (key === undefined || key === ANY)
      for (const element of elements)
        flow(element, key === undefined ? [] : rest, depth, bindings)
    else if (elements[Number(key)] !== undefined)
      flow(elements[Number(key)], rest, depth, bindings)
  }
  /* Last write wins: follows the value `key` ends up with, scanning back
     from the final property. Returns whether the key is definitely set. */
  const flowKey = (object, key, rest, depth, bindings) => {
    for (const property of [...object.properties].reverse()) {
      if (ts.isSpreadAssignment(property)) {
        const spread = objectOf(property.expression, depth, bindings)
        if (spread !== undefined) {
          if (flowKey(spread.object, key, rest, depth + 1, spread.bindings))
            return true
          continue
        }
        flow(property.expression, [key, ...rest], depth, bindings)
        const presence = keyPresence(property.expression, key)
        if (presence === 'never') continue
        /* An earlier write may be overwritten: it proves nothing. */
        if (presence === 'maybe') uncertain.push(property.expression)
        return true
      }
      if (propertyNameOf(property) !== key) continue
      if (ts.isPropertyAssignment(property))
        flow(property.initializer, rest, depth, bindings)
      else if (ts.isShorthandPropertyAssignment(property))
        flow(property.name, rest, depth, bindings)
      else if (ts.isMethodDeclaration(property) && rest[0] === CALLED)
        helper(property, rest.slice(1), depth, bindings)
      return true
    }
    return false
  }
  /** Every effective value of an object literal (component props). */
  const flowValues = (object, seen, depth, bindings) => {
    for (const property of [...object.properties].reverse()) {
      if (ts.isSpreadAssignment(property)) {
        const spread = objectOf(property.expression, depth, bindings)
        if (spread === undefined) flow(property.expression, [], depth, bindings)
        else flowValues(spread.object, seen, depth + 1, spread.bindings)
        continue
      }
      const name = propertyNameOf(property)
      if (name !== undefined) {
        if (seen.has(name)) continue
        seen.add(name)
      }
      if (ts.isPropertyAssignment(property))
        flow(property.initializer, [], depth, bindings)
      else if (ts.isShorthandPropertyAssignment(property))
        flow(property.name, [], depth, bindings)
    }
  }
  /* A `map`/`flatMap` callback: its first parameter is one element of the
     receiver, and its result is one element of the output. */
  const mapped = (call, method, receiver, path, depth, bindings) => {
    const callback = strip(call.arguments[0])
    const fn =
      callback !== undefined &&
      (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
        ? callback
        : callback !== undefined && ts.isIdentifier(callback)
          ? functionOf(declarationOf(calleeSymbol(checker, callback)))
          : undefined
    const [key, ...rest] = path
    if (fn === undefined || (method === 'flatMap' && key !== undefined)) {
      uncertain.push(call)
      return
    }
    const passed = new Map()
    if (fn.parameters[0] !== undefined)
      passed.set(fn.parameters[0], {
        bindings,
        node: receiver,
        path: [key === undefined || key === ANY ? ANY : key],
      })
    helper(fn, key === undefined ? [] : rest, depth, passed)
  }
  const collection = (call, method, receiver, path, depth, bindings) => {
    const [key, ...rest] = path
    const indexed = key !== undefined && key !== ANY
    if (REORDERING.has(method)) {
      if (indexed) {
        uncertain.push(call)
        return
      }
      flow(receiver, path, depth, bindings)
      if (method === 'concat')
        for (const argument of call.arguments)
          flow(
            argument,
            isArray(argument) || key === undefined ? path : rest,
            depth,
            bindings,
          )
      return
    }
    if (method === 'map' || method === 'flatMap') {
      mapped(call, method, receiver, path, depth, bindings)
      return
    }
    if (method === 'filter') {
      const keep = constantPredicate(call.arguments[0])
      if (keep === false) return
      if (keep === true && !indexed) flow(receiver, path, depth, bindings)
      else uncertain.push(call)
      return
    }
    if (method === 'at' || method === 'slice') {
      const elements = elementsOf(receiver, depth)
      const [first, second] = call.arguments
      const start = first === undefined ? 0 : literalNumber(first)
      const end =
        second === undefined ? elements?.length : literalNumber(second)
      if (elements === undefined || start === undefined || end === undefined) {
        uncertain.push(call)
        return
      }
      if (method === 'slice')
        flowElements(elements.slice(start, end), path, depth, bindings)
      else if (elements.at(start) !== undefined)
        flow(elements.at(start), path, depth, bindings)
      return
    }
    if (method !== 'flat' || path.length > 0) {
      if (!isPrimitive(call)) uncertain.push(call)
      return
    }
    flow(receiver, [], depth, bindings)
  }
  /** Which parts of each parameter a registered component renders. */
  const probe = fn => {
    if (probes.has(fn)) return probes.get(fn)
    probes.set(fn, undefined)
    const result = renderedContracts(checker, fn, contractOf, probes, true)
    probes.set(fn, result)
    return result
  }
  /* A registered component's arguments count only through the props its
     own implementation renders (`leadingIcon`, `children`), not through
     event payloads or other metadata. */
  const componentCall = (node, fn, depth, bindings) => {
    const result = fn === undefined ? undefined : probe(fn)
    if (result === undefined) {
      if (node.arguments.some(argument => !isPrimitive(argument)))
        uncertain.push(node)
      return
    }
    for (const contract of result.rendered) rendered.add(contract)
    node.arguments.forEach((argument, index) => {
      const parameter = fn.parameters[index]
      if (parameter === undefined || parameter.dotDotDotToken) {
        if (!isPrimitive(argument)) uncertain.push(node)
        return
      }
      const keys = result.reached.get(parameter) ?? new Set()
      if (keys.has(ANY)) flow(argument, [], depth, bindings)
      else {
        for (const key of keys)
          flow(argument, key.split(PATH_SEPARATOR), depth, bindings)
        if (result.uncertain.length > 0) uncertain.push(node)
      }
    })
  }
  const flowCall = (node, path, depth, bindings) => {
    const symbol = calleeSymbol(checker, node.expression)
    const contract = contractOf(symbol)
    if (contract !== undefined) {
      rendered.add(contract)
      componentCall(node, functionOf(declarationOf(symbol)), depth, bindings)
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
          passed.set(parameter, { bindings, node: argument, path: [] })
      })
      helper(fn, path, depth, passed)
      return
    }
    if (isRenderSlotCall(checker, node)) {
      /* The `toView` the options end up with, after spreads and later
         writes, is the one that renders. */
      const [options] = node.arguments
      if (options === undefined) uncertain.push(node)
      else flow(options, ['toView', CALLED, ...path], depth, bindings)
      return
    }
    const children = builderChildren(checker, node)
    if (children !== undefined) {
      for (const index of children)
        flow(node.arguments[index], [], depth, bindings)
      return
    }
    const callee = node.expression
    if (ts.isPropertyAccessExpression(callee) && isArray(callee.expression)) {
      collection(
        node,
        callee.name.text,
        callee.expression,
        path,
        depth,
        bindings,
      )
      return
    }
    if (!isPrimitive(node)) uncertain.push(node)
  }
  const flow = (node, path, depth, bindings) => {
    node = strip(node)
    if (node === undefined || depth > 12) return
    const [key, ...rest] = path
    if (ts.isCallExpression(node)) {
      flowCall(node, path, depth, bindings)
      return
    }
    if (ts.isPropertyAccessExpression(node)) {
      flow(node.expression, [node.name.text, ...path], depth, bindings)
      return
    }
    if (ts.isElementAccessExpression(node)) {
      const argument = strip(node.argumentExpression)
      if (
        argument !== undefined &&
        (ts.isStringLiteral(argument) || ts.isNumericLiteral(argument))
      )
        flow(node.expression, [argument.text, ...path], depth, bindings)
      else uncertain.push(node)
      return
    }
    if (ts.isArrayLiteralExpression(node)) {
      if (key === undefined || key === ANY) {
        for (const element of node.elements)
          if (ts.isSpreadElement(element))
            flow(element.expression, path, depth, bindings)
          else flow(element, key === undefined ? [] : rest, depth, bindings)
        return
      }
      if (node.elements.some(ts.isSpreadElement)) uncertain.push(node)
      else flowElements(node.elements, path, depth, bindings)
      return
    }
    if (ts.isObjectLiteralExpression(node)) {
      if (key === undefined) flowValues(node, new Set(), depth, bindings)
      else if (key !== ANY) flowKey(node, key, rest, depth, bindings)
      return
    }
    if (ts.isConditionalExpression(node)) {
      flow(node.whenTrue, path, depth, bindings)
      flow(node.whenFalse, path, depth, bindings)
      return
    }
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) {
      flow(node.left, path, depth, bindings)
      flow(node.right, path, depth, bindings)
      return
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      if (key === undefined) helper(node, [], depth, NO_BINDINGS)
      else if (key === CALLED) helper(node, rest, depth, bindings)
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
        if (argument?.probe !== undefined) {
          const full = [...bound.path, ...path]
          if (!reached.has(argument.probe))
            reached.set(argument.probe, new Set())
          reached
            .get(argument.probe)
            .add(full.length === 0 ? ANY : full.join(PATH_SEPARATOR))
        } else if (argument !== undefined)
          flow(
            argument.node,
            [...argument.path, ...bound.path, ...path],
            depth + 1,
            argument.bindings,
          )
        return
      }
      if (target !== undefined && ts.isVariableDeclaration(target))
        flow(target.initializer, path, depth + 1, bindings)
      else if (key === undefined)
        helper(functionOf(target), [], depth, NO_BINDINGS)
      else if (key === CALLED) {
        const fn = functionOf(target)
        if (fn === undefined) uncertain.push(node)
        else helper(fn, rest, depth, NO_BINDINGS)
      }
    }
  }
  const helper = (fn, path, depth, bindings) => {
    if (fn === undefined) return
    followed.add(fn)
    for (const returned of returnedOf(fn))
      flow(returned, path, depth + 1, bindings)
  }
  const fn = functionOf(declaration)
  if (fn !== undefined && probing)
    helper(
      fn,
      [],
      0,
      new Map(
        fn.parameters.map(parameter => [parameter, { probe: parameter }]),
      ),
    )
  else if (fn !== undefined) helper(fn, [], 0, NO_BINDINGS)
  else if (ts.isVariableDeclaration(declaration))
    flow(declaration.initializer, [], 0, NO_BINDINGS)
  return { followed, reached, rendered, uncertain }
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
    const { followed, rendered, uncertain } = renderedContracts(
      checker,
      declaration,
      contractOf,
    )
    visit(declaration)
    for (const fn of followed) visit(fn)
    for (const foundation of record.foundations) {
      if (foundation === record.contract || rendered.has(foundation)) continue
      const unfollowed = uncertain[0]
      problems.push(
        called.has(foundation) && unfollowed !== undefined
          ? `${where} declares foundation ${foundation}, but the check can't verify that the call's result reaches the returned view: it passes through \`${unfollowed.getText().replace(/\s+/gu, ' ').slice(0, 60)}\`, which it can't follow; render it through a foldkit element, an array, a literal selection or a helper with a body`
          : called.has(foundation)
            ? `${where} declares foundation ${foundation} but never renders it: the call's result does not reach the returned view (unused closures and discarded calls do not count)`
            : providers.has(foundation)
              ? `${where} declares foundation ${foundation} but never renders it; call the installed component (imports, comments and names do not count)`
              : `${where} declares foundation ${foundation}, but no installed export provides it; install the component before building on it`,
      )
    }
  }
  return problems
}
