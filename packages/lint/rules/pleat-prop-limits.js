const propertyName = key => {
  if (key === undefined || key === null) return null
  if (key.type === 'Identifier') return key.name
  if (key.type === 'Literal') return String(key.value)
  return null
}

const matchesProperty = (name, pattern) =>
  pattern.startsWith('*')
    ? name.endsWith(pattern.slice(1))
    : pattern.endsWith('*')
      ? name.startsWith(pattern.slice(0, -1))
      : name === pattern

const PLEAT_CORE = '@pleat/core'

const importedName = specifier =>
  specifier.imported.type === 'Identifier'
    ? specifier.imported.name
    : String(specifier.imported.value)

const CSS_WIDE_KEYWORDS = new Set(['inherit', 'initial', 'revert', 'unset'])

const literalString = node => {
  if (node.type !== 'Literal') return null
  if (typeof node.value === 'string' || typeof node.value === 'number')
    return String(node.value)
  return null
}

export const pleatPropLimits = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep Pleat declarations on semantic tokens by limiting raw property values.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          propLimits: { type: 'object' },
          tokenFiles: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      limit: '{{property}} may not use raw value {{value}} here. {{reason}}',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const propLimits = options.propLimits ?? {}
    const tokenFiles = (options.tokenFiles ?? []).map(
      pattern => new RegExp(pattern, 'u'),
    )
    const filename = (context.filename ?? context.getFilename()).replaceAll(
      '\\',
      '/',
    )
    if (tokenFiles.some(pattern => pattern.test(filename))) return {}
    const entries = Object.entries(propLimits)
    if (entries.length === 0) return {}
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    const findVariable = (node, name) => {
      let scope = sourceCode.getScope(node)
      while (scope) {
        const variable = scope.set.get(name)
        if (variable) return variable
        scope = scope.upper
      }
      return null
    }

    const isPleatCoreImport = definition =>
      definition.type === 'ImportBinding' &&
      definition.parent.source.value === PLEAT_CORE

    // `Style` (or an alias) imported from @pleat/core, or `P.Style` where P is
    // a namespace import of @pleat/core. Shadowed or unrelated bindings named
    // `Style` resolve to other definitions and are ignored.
    const isStyleModule = node => {
      if (node.type === 'Identifier') {
        const variable = findVariable(node, node.name)
        const definition = variable?.defs[0]
        return (
          definition !== undefined &&
          isPleatCoreImport(definition) &&
          definition.node.type === 'ImportSpecifier' &&
          importedName(definition.node) === 'Style'
        )
      }
      if (
        node.type === 'MemberExpression' &&
        !node.computed &&
        node.object.type === 'Identifier' &&
        propertyName(node.property) === 'Style'
      ) {
        const variable = findVariable(node.object, node.object.name)
        const definition = variable?.defs[0]
        return (
          definition !== undefined &&
          isPleatCoreImport(definition) &&
          definition.node.type === 'ImportNamespaceSpecifier'
        )
      }
      return false
    }

    // Follows local `const` declarations and object spreads back to the
    // object literals that hold the declarations.
    const declarationObjects = (node, seen = new Set()) => {
      if (node === null || node === undefined || seen.has(node)) return []
      seen.add(node)
      if (node.type === 'ObjectExpression') return [node]
      if (
        node.type === 'TSAsExpression' ||
        node.type === 'TSSatisfiesExpression'
      )
        return declarationObjects(node.expression, seen)
      if (node.type === 'Identifier') {
        const variable = findVariable(node, node.name)
        const definition = variable?.defs[0]
        if (
          variable?.defs.length === 1 &&
          definition.type === 'Variable' &&
          definition.parent.kind === 'const' &&
          definition.node.id.type === 'Identifier'
        )
          return declarationObjects(definition.node.init, seen)
      }
      return []
    }

    const checkDeclarations = (node, seen = new Set()) => {
      for (const objectNode of declarationObjects(node, seen)) {
        for (const property of objectNode.properties) {
          if (property.type === 'SpreadElement') {
            checkDeclarations(property.argument, seen)
            continue
          }
          if (property.type !== 'Property') continue
          const name = propertyName(property.key)
          if (name === null) continue
          checkValue(name, property.value)
        }
      }
    }

    const checkValue = (name, valueNode) => {
      for (const [pattern, spec] of entries) {
        if (!matchesProperty(name, pattern)) continue
        const value = literalString(valueNode)
        if (
          value !== null &&
          !CSS_WIDE_KEYWORDS.has(value) &&
          !(spec.limit ?? []).includes(value)
        ) {
          context.report({
            node: valueNode,
            messageId: 'limit',
            data: { property: name, value, reason: spec.reason ?? '' },
          })
        }
      }
    }

    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee.type !== 'MemberExpression' || callee.computed) return
        const method = propertyName(callee.property)
        if (method !== 'make' && method !== 'when') return
        if (!isStyleModule(callee.object)) return
        // Style.make(declarations); Style.when(condition, declarations) and
        // Style.when(self, condition, declarations) take declarations last.
        const argument =
          method === 'make' ? node.arguments[0] : node.arguments.at(-1)
        if (
          argument !== undefined &&
          node.arguments.length >= (method === 'make' ? 1 : 2)
        )
          checkDeclarations(argument)
      },
    }
  },
}
