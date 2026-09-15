const DEFAULT_CLASS_HELPERS = new Set([
  'classNames',
  'clsx',
  'cn',
  'cx',
  'twJoin',
  'twMerge',
])

const patternCache = new Map()

const regexp = pattern => {
  const cached = patternCache.get(pattern)
  if (cached !== undefined) return cached
  const compiled = new RegExp(pattern, 'u')
  patternCache.set(pattern, compiled)
  return compiled
}
export const patternsOf = (options, fallback) =>
  (options.componentImports ?? fallback).map(regexp)

const importedName = specifier => {
  if (specifier.type === 'ImportSpecifier') {
    return specifier.imported.name ?? specifier.imported.value
  }
  return specifier.type === 'ImportDefaultSpecifier' ? 'default' : null
}

const keyOf = property => {
  if (property.computed && property.key.type === 'Literal') {
    return String(property.key.value)
  }
  if (property.key.type === 'Identifier') return property.key.name
  if (property.key.type === 'Literal') return String(property.key.value)
  return null
}

export const pascalCase = value =>
  value
    .replace(/(?:^|[-_/]+)([a-zA-Z0-9])/gu, (_, letter) => letter.toUpperCase())
    .replace(/[^a-zA-Z0-9]/gu, '')

export const createFoldkitTracker = (options = {}) => {
  const patterns = patternsOf(options, ['^@/ui(?:/|$)'])
  const ignored = (options.ignoreImports ?? []).map(regexp)
  const ignoredExports = (options.ignoreExports ?? ['(?:Variants?|variants)$']).map(regexp)
  const bindings = new Map()
  const variables = new Map()

  const collectImport = node => {
    const source = node.source.value
    if (
      typeof source !== 'string' ||
      !patterns.some(pattern => pattern.test(source)) ||
      ignored.some(pattern => pattern.test(source))
    ) return

    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportNamespaceSpecifier') {
        bindings.set(specifier.local.name, { namespace: true, source })
      } else {
        bindings.set(specifier.local.name, {
          exportName: importedName(specifier),
          namespace: false,
          source,
        })
      }
    }
  }

  const collectVariable = node => {
    if (node.id.type === 'Identifier' && node.init !== null) {
      variables.set(node.id.name, node.init)
    }
  }

  const componentCall = node => {
    let binding
    let exportName
    if (node.callee.type === 'Identifier') {
      binding = bindings.get(node.callee.name)
      exportName = binding?.exportName ?? node.callee.name
    } else if (
      node.callee.type === 'MemberExpression' &&
      !node.callee.computed &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier'
    ) {
      binding = bindings.get(node.callee.object.name)
      if (binding?.namespace !== true) return null
      exportName = node.callee.property.name
    } else {
      return null
    }
    if (binding === undefined) return null
    if (ignoredExports.some(pattern => pattern.test(exportName))) return null

    const argument = resolveObject(node.arguments[0], variables)
    if (argument === null) {
      return {
        component: pascalCase(exportName),
        node,
        properties: new Map(),
        source: binding.source,
        unreadableProps: true,
      }
    }
    const properties = new Map()
    for (const property of argument.properties) {
      if (property.type !== 'Property' || property.kind !== 'init') continue
      const key = keyOf(property)
      if (key !== null) properties.set(key, property.value)
    }
    return {
      component: pascalCase(exportName),
      node,
      properties,
      source: binding.source,
      unreadableProps: argument.properties.some(property => property.type === 'SpreadElement'),
    }
  }

  return { collectImport, collectVariable, componentCall, variables }
}

const unwrap = node => {
  while (
    node !== null &&
    node !== undefined &&
    ['TSAsExpression', 'TSNonNullExpression', 'TSSatisfiesExpression'].includes(node.type)
  ) node = node.expression
  return node
}

export const resolveObject = (node, variables, seen = new Set()) => {
  node = unwrap(node)
  if (node?.type === 'ObjectExpression') return node
  if (node?.type !== 'Identifier' || seen.has(node.name)) return null
  seen.add(node.name)
  return resolveObject(variables.get(node.name), variables, seen)
}

export const staticValues = (node, variables, seen = new Set()) => {
  node = unwrap(node)
  if (node === null || node === undefined) return { strings: [], unresolved: true }
  if (node.type === 'Literal') {
    return typeof node.value === 'string'
      ? { strings: [node.value], unresolved: false }
      : { strings: [], unresolved: false }
  }
  if (node.type === 'TemplateLiteral') {
    return {
      strings: node.quasis.map(quasi => quasi.value.cooked ?? quasi.value.raw),
      unresolved: node.expressions.length > 0,
    }
  }
  if (node.type === 'ConditionalExpression') {
    return combine([
      staticValues(node.consequent, variables, seen),
      staticValues(node.alternate, variables, seen),
    ])
  }
  if (node.type === 'LogicalExpression') {
    return combine([
      ...(node.operator === '&&' ? [] : [staticValues(node.left, variables, seen)]),
      staticValues(node.right, variables, seen),
    ])
  }
  if (node.type === 'ArrayExpression') {
    return combine(node.elements.filter(Boolean).map(element => staticValues(element, variables, seen)))
  }
  if (node.type === 'CallExpression') {
    const name = node.callee.type === 'Identifier' ? node.callee.name : null
    if (name !== null && DEFAULT_CLASS_HELPERS.has(name)) {
      return combine(node.arguments.map(argument => staticValues(argument, variables, seen)))
    }
    return { strings: [], unresolved: true }
  }
  if (node.type === 'Identifier') {
    if (seen.has(node.name)) return { strings: [], unresolved: true }
    const next = variables.get(node.name)
    if (next === undefined) return { strings: [], unresolved: true }
    const path = new Set(seen)
    path.add(node.name)
    return staticValues(next, variables, path)
  }
  return { strings: [], unresolved: true }
}

const combine = values => ({
  strings: values.flatMap(value => value.strings),
  unresolved: values.some(value => value.unresolved),
})

export const splitClasses = value => value.trim().split(/\s+/u).filter(Boolean)

export const isStaticStyleReference = (node, variables, seen = new Set()) => {
  node = unwrap(node)
  if (node === null || node === undefined) return false
  if (node.type === 'MemberExpression') return true
  if (node.type === 'ConditionalExpression') {
    return isStaticStyleReference(node.consequent, variables, seen) &&
      isStaticStyleReference(node.alternate, variables, seen)
  }
  if (node.type === 'LogicalExpression') {
    return isStaticStyleReference(node.right, variables, seen)
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.filter(Boolean).every(element => isStaticStyleReference(element, variables, seen))
  }
  if (node.type === 'Identifier') {
    if (node.name === 'undefined') return true
    if (seen.has(node.name)) return false
    const next = variables.get(node.name)
    if (next === undefined) return false
    const path = new Set(seen)
    path.add(node.name)
    return isStaticStyleReference(next, variables, path)
  }
  return node.type === 'Literal' && (node.value === false || node.value === null)
}
