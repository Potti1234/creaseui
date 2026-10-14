/* Lexical (scope-manager) and, when available, type-checker resolution of
   Foldkit builders. Nothing is classified by spelling alone. */

import ts from 'typescript'

const TS_WRAPPERS = new Set([
  'TSAsExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'ChainExpression',
])

export const unwrap = node => {
  while (node !== null && node !== undefined && TS_WRAPPERS.has(node.type))
    node = node.expression
  return node
}

export const isAssertion = node =>
  node?.type === 'TSAsExpression' || node?.type === 'TSTypeAssertion'

export const findVariable = (scope, name) => {
  for (let current = scope; current !== null; current = current.upper) {
    const variable = current.set.get(name)
    if (variable !== undefined) return variable
  }
  return null
}

const importSource = definition =>
  definition.type === 'ImportBinding'
    ? definition.parent?.source?.value
    : undefined

const importedName = specifier => {
  if (specifier.type === 'ImportSpecifier')
    return specifier.imported.name ?? specifier.imported.value
  if (specifier.type === 'ImportDefaultSpecifier') return 'default'
  return '*'
}

const FOLDKIT_HTML = /^foldkit\/html$/u
const FOLDKIT = /^foldkit$/u
const DOM_LIB = /[\\/]lib\.dom(?:\.[^\\/]+)?\.d\.ts$|[\\/]@types[\\/]web[\\/]/u
const FOLDKIT_HTML_DECLARATION =
  /[\\/]foldkit[\\/]dist[\\/]html[\\/][^\\/]+\.d\.ts$/u

export const createFileAnalysis = context => {
  const { sourceCode } = context
  const services = sourceCode.parserServices
  const program = services?.program
  const hasTypes =
    program !== undefined &&
    program !== null &&
    services.esTreeNodeToTSNodeMap !== undefined
  const checker = hasTypes ? program.getTypeChecker() : undefined

  const scopeOf = node => sourceCode.getScope(node)
  const variableOf = identifier =>
    identifier?.type === 'Identifier'
      ? findVariable(scopeOf(identifier), identifier.name)
      : null

  /** True when a TypeScript symbol is Foldkit's own `HtmlBuilder` declaration,
      following import/export aliases and local type aliases. */
  const symbolIsBuilder = (symbol, seen = new Set()) => {
    while (symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias) {
      if (seen.has(symbol)) return false
      seen.add(symbol)
      symbol = checker.getAliasedSymbol(symbol)
    }
    if (symbol === undefined || seen.has(symbol)) return false
    seen.add(symbol)
    for (const declaration of symbol.declarations ?? []) {
      if (
        symbol.escapedName === 'HtmlBuilder' &&
        FOLDKIT_HTML_DECLARATION.test(declaration.getSourceFile().fileName)
      )
        return true
      if (
        ts.isTypeAliasDeclaration(declaration) &&
        ts.isTypeReferenceNode(declaration.type) &&
        symbolIsBuilder(
          checker.getSymbolAtLocation(declaration.type.typeName),
          seen,
        )
      )
        return true
    }
    return false
  }

  const typedAsBuilder = node => {
    if (!hasTypes) return false
    try {
      const type = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node),
      )
      return symbolIsBuilder(type.aliasSymbol) || symbolIsBuilder(type.symbol)
    } catch {
      return false
    }
  }

  /** Checker resolution of a type reference name, or undefined without types. */
  const typedReferenceIsBuilder = name => {
    if (!hasTypes) return undefined
    try {
      const tsNode = services.esTreeNodeToTSNodeMap.get(
        name.type === 'TSQualifiedName' ? name.right : name,
      )
      return symbolIsBuilder(checker.getSymbolAtLocation(tsNode))
    } catch {
      return undefined
    }
  }

  /** `import { Html } from 'foldkit'` or `import * as Html from 'foldkit/html'`. */
  const isHtmlNamespace = identifier => {
    const variable = variableOf(identifier)
    const definition = variable?.defs[0]
    if (definition?.type !== 'ImportBinding') return false
    const source = importSource(definition)
    const name = importedName(definition.node)
    return (
      (FOLDKIT.test(source) && name === 'Html') ||
      (FOLDKIT_HTML.test(source) && name === '*')
    )
  }

  const isBuilderTypeNode = (typeNode, seen = new Set()) => {
    if (typeNode?.type !== 'TSTypeReference' || seen.has(typeNode)) return false
    seen.add(typeNode)
    const name = typeNode.typeName
    const typed = typedReferenceIsBuilder(name)
    if (typed !== undefined) return typed
    if (name.type === 'TSQualifiedName')
      return (
        name.right.name === 'HtmlBuilder' &&
        name.left.type === 'Identifier' &&
        isHtmlNamespace(name.left)
      )
    const variable = variableOf(name)
    for (const definition of variable?.defs ?? []) {
      if (definition.type === 'ImportBinding')
        return (
          FOLDKIT_HTML.test(importSource(definition)) &&
          importedName(definition.node) === 'HtmlBuilder'
        )
      if (definition.node.type === 'TSTypeAliasDeclaration')
        return isBuilderTypeNode(definition.node.typeAnnotation, seen)
    }
    return false
  }

  const builderVariables = new Map()
  const isBuilderVariable = variable => {
    if (variable === null) return false
    if (builderVariables.has(variable)) return builderVariables.get(variable)
    builderVariables.set(variable, false)
    let result = false
    const definition = variable.defs[0]
    if (definition?.type === 'ImportBinding') {
      result =
        FOLDKIT_HTML.test(importSource(definition)) &&
        importedName(definition.node) === 'inertHtml'
    } else if (
      definition?.type === 'Parameter' &&
      definition.name.parent?.type !== 'Property'
    ) {
      const annotation = definition.name.typeAnnotation?.typeAnnotation
      result =
        annotation !== undefined
          ? isBuilderTypeNode(annotation)
          : typedAsBuilder(definition.name)
    } else if (
      definition?.type === 'Variable' &&
      definition.node.id === definition.name
    ) {
      const annotation = definition.name.typeAnnotation?.typeAnnotation
      result =
        (annotation !== undefined && isBuilderTypeNode(annotation)) ||
        (definition.node.init !== null &&
          isBuilderExpression(definition.node.init)) ||
        typedAsBuilder(definition.name)
    }
    builderVariables.set(variable, result)
    return result
  }

  const isBuilderExpression = node => {
    const raw = node
    node = unwrap(node)
    if (raw?.type === 'TSAsExpression' && isBuilderTypeNode(raw.typeAnnotation))
      return true
    if (node?.type === 'Identifier') return isBuilderVariable(variableOf(node))
    if (
      node?.type === 'MemberExpression' &&
      !node.computed &&
      node.property.name === 'inertHtml' &&
      node.object.type === 'Identifier' &&
      isHtmlNamespace(node.object)
    )
      return true
    if (node?.type === 'MemberExpression' || node?.type === 'CallExpression')
      return typedAsBuilder(node)
    return false
  }

  /** Constant string through `const` bindings and plain template literals. */
  const resolveString = (node, seen = new Set()) => {
    node = unwrap(node)
    if (node?.type === 'Literal' && typeof node.value === 'string')
      return node.value
    if (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
      return node.quasis[0].value.cooked
    if (node?.type === 'Identifier') {
      const init = constInit(node, seen)
      return init === null ? null : resolveString(init, seen)
    }
    return null
  }

  /** Initializer of an immutable `const` binding, or null. */
  const constInit = (identifier, seen = new Set()) => {
    const variable = variableOf(identifier)
    if (variable === null || seen.has(variable)) return null
    seen.add(variable)
    const definition = variable.defs[0]
    if (
      variable.defs.length !== 1 ||
      definition.type !== 'Variable' ||
      definition.parent.kind !== 'const' ||
      definition.node.id !== definition.name ||
      definition.node.init === null
    )
      return null
    return definition.node.init
  }

  const memberName = member =>
    member.computed
      ? resolveString(member.property)
      : member.property.type === 'Identifier'
        ? member.property.name
        : null

  /** `{ name }` for `h.name`/`h['name']`, `{ name: null }` when unknown. */
  const builderMember = node => {
    if (node?.type !== 'MemberExpression') return null
    if (!isBuilderExpression(node.object)) return null
    return { name: memberName(node), node }
  }

  /** Property of an ObjectPattern that destructures a builder. */
  const destructuredMember = property => {
    const pattern = property.parent
    if (pattern?.type !== 'ObjectPattern') return null
    let fromBuilder = false
    const owner = pattern.parent
    if (owner?.type === 'VariableDeclarator' && owner.id === pattern)
      fromBuilder = owner.init !== null && isBuilderExpression(owner.init)
    else if (owner?.type === 'AssignmentPattern' && owner.left === pattern)
      fromBuilder = isBuilderExpression(owner.right)
    else if (pattern.typeAnnotation !== undefined)
      fromBuilder = isBuilderTypeNode(pattern.typeAnnotation.typeAnnotation)
    else fromBuilder = typedAsBuilder(pattern)
    if (!fromBuilder) return null
    if (property.type === 'RestElement')
      return { name: null, node: property, rest: true }
    const name = property.computed
      ? resolveString(property.key)
      : property.key.type === 'Identifier'
        ? property.key.name
        : String(property.key.value)
    return { name, node: property }
  }

  /** Builder member an identifier is bound to (`const d = h.div`, `{ div } = h`). */
  const memberBinding = (identifier, seen = new Set()) => {
    const variable = variableOf(identifier)
    if (variable === null || seen.has(variable)) return null
    seen.add(variable)
    const definition = variable.defs[0]
    if (definition === undefined) return null
    const parent = definition.name.parent
    if (parent?.type === 'Property' && parent.value === definition.name)
      return destructuredMember(parent)
    if (
      definition.type === 'Variable' &&
      definition.node.id === definition.name
    ) {
      const init = unwrap(definition.node.init)
      if (init?.type === 'MemberExpression') return builderMember(init)
      if (init?.type === 'Identifier') return memberBinding(init, seen)
    }
    return null
  }

  /** Builder member a callee refers to, via member access or a binding. */
  const calleeMember = callee => {
    callee = unwrap(callee)
    if (callee?.type === 'MemberExpression') return builderMember(callee)
    if (callee?.type === 'Identifier') return memberBinding(callee)
    return null
  }

  /** Whether a member's property symbol is declared by the DOM lib; null
      when the checker cannot tell (no types, `any` receivers). */
  const domPropertyByType = member => {
    if (!hasTypes) return null
    try {
      const tsNode = services.esTreeNodeToTSNodeMap.get(member)
      const symbol = checker.getSymbolAtLocation(
        tsNode.name ?? tsNode.argumentExpression,
      )
      if (symbol === undefined) return null
      return (symbol.declarations ?? []).some(declaration =>
        DOM_LIB.test(declaration.getSourceFile().fileName),
      )
    } catch {
      return null
    }
  }

  /** Receiver bound to an object literal or a type-literal parameter. */
  const lexicallyPlainRecord = object => {
    object = unwrap(object)
    if (object?.type === 'ObjectExpression') return true
    if (object?.type !== 'Identifier') return false
    const definition = variableOf(object)?.defs[0]
    if (
      definition?.type === 'Variable' &&
      definition.node.id === definition.name
    )
      return unwrap(definition.node.init)?.type === 'ObjectExpression'
    if (definition?.type === 'Parameter')
      return (
        definition.name.typeAnnotation?.typeAnnotation?.type === 'TSTypeLiteral'
      )
    return false
  }

  /** `receiver.prop` that addresses a DOM element/style/class list. */
  const isDomMember = member => {
    const typed = domPropertyByType(member)
    return typed ?? !lexicallyPlainRecord(member.object)
  }

  return {
    builderMember,
    calleeMember,
    checker,
    constInit,
    destructuredMember,
    hasTypes,
    isHtmlNamespace,
    isBuilderExpression,
    isDomMember,
    resolveString,
    services,
    variableOf,
  }
}
