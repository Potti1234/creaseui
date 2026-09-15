const matchesFile = (filename, patterns) => patterns.some(pattern => new RegExp(pattern, 'u').test(filename.replaceAll('\\', '/')))

export const noStylexEscape = {
  meta: {
    type: 'problem',
    docs: { description: 'Keep raw StyleX APIs and Foldkit inline styles behind reviewed adapters.' },
    schema: [{ type: 'object', properties: {
      allowCreateIn: { type: 'array', items: { type: 'string' } },
      allowPropsIn: { type: 'array', items: { type: 'string' } },
    }, additionalProperties: false }],
    messages: {
      create: 'stylex.create() is not available at this composition boundary. Use the approved primitives and component variants.',
      props: 'Call the project StyleX class adapter instead of stylex.props() directly.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const filename = context.filename ?? context.getFilename()
    const stylexNamespaces = new Set()
    return {
      ImportDeclaration(node) {
        if (node.source.value !== '@stylexjs/stylex') return
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier') stylexNamespaces.add(specifier.local.name)
        }
      },
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.object.type !== 'Identifier' ||
          !stylexNamespaces.has(node.callee.object.name) ||
          node.callee.property.type !== 'Identifier'
        ) return
        if (
          node.callee.property.name === 'create' &&
          !matchesFile(filename, options.allowCreateIn ?? [])
        ) context.report({ node, messageId: 'create' })
        if (
          node.callee.property.name === 'props' &&
          !matchesFile(filename, options.allowPropsIn ?? [])
        ) context.report({ node, messageId: 'props' })
      },
    }
  },
}
