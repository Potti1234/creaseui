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
    const checkObject = objectNode => {
      for (const property of objectNode.properties) {
        if (property.type !== 'Property') continue
        const name = propertyName(property.key)
        if (name === null) continue
        for (const [pattern, spec] of entries) {
          if (!matchesProperty(name, pattern)) continue
          const value = literalString(property.value)
          if (
            value !== null &&
            !CSS_WIDE_KEYWORDS.has(value) &&
            !(spec.limit ?? []).includes(value)
          ) {
            context.report({
              node: property.value,
              messageId: 'limit',
              data: { property: name, value, reason: spec.reason ?? '' },
            })
          }
        }
      }
    }
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          !node.callee.computed &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Style' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'make'
        ) {
          for (const argument of node.arguments) {
            if (argument.type === 'ObjectExpression') checkObject(argument)
          }
        }
      },
    }
  },
}
