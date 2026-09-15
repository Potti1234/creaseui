import { createFoldkitTracker, staticValues } from '../lib/foldkit-sites.js'

export const requireStaticClass = {
  meta: {
    type: 'problem',
    docs: { description: 'Require component class values that design-system lint can fully inspect.' },
    schema: [{ type: 'object', properties: {
      componentImports: { type: 'array', items: { type: 'string' } },
      ignoreImports: { type: 'array', items: { type: 'string' } },
    }, additionalProperties: false }],
    messages: {
      dynamic: '{{component}}() receives a dynamic class value the design-system linter cannot verify. Use static classes, variants, or a finite conditional.',
    },
  },
  create(context) {
    const tracker = createFoldkitTracker(context.options[0] ?? {})
    return {
      ImportDeclaration: tracker.collectImport,
      VariableDeclarator: tracker.collectVariable,
      CallExpression(node) {
        const call = tracker.componentCall(node)
        const value = call?.properties.get('class')
        if (call !== null && value !== undefined && staticValues(value, tracker.variables).unresolved) {
          context.report({ node: value, messageId: 'dynamic', data: { component: call.component } })
        }
      },
    }
  },
}
