import {
  createFoldkitTracker,
  isStaticStyleReference,
} from '../lib/foldkit-sites.js'

export const stylexComponentContract = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce the StyleX component boundary at Foldkit call sites.' },
    schema: [{ type: 'object', properties: {
      componentImports: { type: 'array', items: { type: 'string' } },
      ignoreImports: { type: 'array', items: { type: 'string' } },
      layoutProperties: { type: 'array', items: { type: 'string' } },
    }, additionalProperties: false }],
    messages: {
      class: '{{component}}() is a StyleX component and may not receive class. Use a named variant or layoutStyle.',
      dynamic: '{{property}} on {{component}}() must be a statically extracted StyleX reference such as styles.fullWidth.',
    },
  },
  create(context) {
    const options = {
      componentImports: ['^@/stylex(?:/|$)'],
      ...(context.options[0] ?? {}),
    }
    const tracker = createFoldkitTracker(options)
    const layoutProperties = options.layoutProperties ?? ['layoutStyle', '*LayoutStyle']
    const isLayoutProperty = name => layoutProperties.some(pattern =>
      pattern.startsWith('*') ? name.endsWith(pattern.slice(1)) : name === pattern,
    )
    return {
      ImportDeclaration: tracker.collectImport,
      VariableDeclarator: tracker.collectVariable,
      CallExpression(node) {
        const call = tracker.componentCall(node)
        if (call === null) return
        const classValue = call.properties.get('class')
        if (classValue !== undefined) {
          context.report({ node: classValue, messageId: 'class', data: { component: call.component } })
        }
        for (const [property, value] of call.properties) {
          if (isLayoutProperty(property) && !isStaticStyleReference(value, tracker.variables)) {
            context.report({
              node: value,
              messageId: 'dynamic',
              data: { component: call.component, property },
            })
          }
        }
      },
    }
  },
}
