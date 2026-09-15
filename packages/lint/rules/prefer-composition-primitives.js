const RAW_BUILDERS = new Set([
  'article', 'aside', 'div', 'footer', 'header', 'li', 'main', 'nav', 'ol',
  'p', 'section', 'span', 'ul',
])

export const preferCompositionPrimitives = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer the closed Crease composition vocabulary in agent-authored pages.' },
    schema: [],
    messages: {
      primitive: 'Use Box, Stack, Inline, Grid, Text, or Section instead of h.{{builder}}() in constrained composition.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          !node.callee.computed &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'h' &&
          node.callee.property.type === 'Identifier' &&
          RAW_BUILDERS.has(node.callee.property.name)
        ) context.report({
          node,
          messageId: 'primitive',
          data: { builder: node.callee.property.name },
        })
      },
    }
  },
}
