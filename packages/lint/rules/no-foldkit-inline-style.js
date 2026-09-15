export const noFoldkitInlineStyle = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow Foldkit h.Style so styling remains statically verifiable.' },
    schema: [{ type: 'object', properties: {
      allowCustomProperties: { type: 'boolean' },
    }, additionalProperties: false }],
    messages: {
      inline: 'h.Style() bypasses the design-system styling contract. Use Tailwind classes, StyleX, or an approved custom-property adapter.',
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
          node.callee.property.name === 'Style'
        ) context.report({ node, messageId: 'inline' })
      },
    }
  },
}
