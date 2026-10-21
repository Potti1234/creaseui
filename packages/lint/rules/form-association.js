import { docsUrl } from '../lib/strict/context.js'

/* Static half of review R11, narrowed by review F7: a footer submit's
   literal form: reference is an error only inside a closed composition. That
   is one module-level function whose Forms are all the imported Crease Form
   with literal ids, and which calls nothing that could render another Form
   (imported helpers, callbacks, other local functions, methods of local
   objects or parameters) — only its element builder and the Form's own
   component family. Everything else —
   cross-module, computed ids, forms owned elsewhere — is left to the
   form-association runtime audit. */

const lastSegment = source =>
  source
    .replace(/\.[cm]?[jt]s$/u, '')
    .split('/')
    .pop()

const propertyValue = (object, name) =>
  object.properties.find(
    property =>
      property.type === 'Property' &&
      !property.computed &&
      ((property.key.type === 'Identifier' && property.key.name === name) ||
        (property.key.type === 'Literal' && property.key.value === name)),
  )?.value

const stringOf = node =>
  node?.type === 'Literal' && typeof node.value === 'string'
    ? node.value
    : node?.type === 'TemplateLiteral' && node.expressions.length === 0
      ? node.quasis[0].value.cooked
      : null

const FUNCTIONS = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
])

/** The module-level function a node belongs to, or null at top level. */
const compositionOf = node => {
  let outermost = null
  for (let current = node.parent; current; current = current.parent)
    if (FUNCTIONS.has(current.type)) outermost = current
  return outermost
}

export const formAssociation = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require a footer submit's literal form: reference to name a Form id its own closed composition renders.",
      url: docsUrl('form-association'),
    },
    schema: [],
    messages: {
      unknownForm:
        "button() submits form '{{id}}', but the Forms this view renders have ids {{ids}}. Give the Form id '{{id}}' or fix the reference; if that Form renders elsewhere, check it with the form-association audit.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    const compositions = new Map()
    const at = fn => {
      if (!compositions.has(fn))
        compositions.set(fn, { closed: true, forms: new Set(), references: [] })
      return compositions.get(fn)
    }
    const variableOf = identifier => {
      for (
        let scope = sourceCode.getScope(identifier);
        scope;
        scope = scope.upper
      ) {
        const variable = scope.set.get(identifier.name)
        if (variable) return variable
      }
      return null
    }
    const importOf = identifier => {
      const definition = variableOf(identifier)?.defs[0]
      if (definition?.type !== 'ImportBinding') return null
      const specifier = definition.node
      return {
        imported:
          specifier.type === 'ImportSpecifier'
            ? (specifier.imported.name ?? specifier.imported.value)
            : specifier.type === 'ImportNamespaceSpecifier'
              ? '*'
              : 'default',
        source: definition.parent.source.value,
      }
    }
    /* Component identity comes from the import, not the callee's spelling:
       `form`/`button` exported by the installed form/button modules. */
    const componentOf = callee => {
      if (callee.type === 'Identifier') {
        const binding = importOf(callee)
        return binding !== null &&
          binding.imported === lastSegment(binding.source)
          ? { name: binding.imported, source: binding.source }
          : null
      }
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.object.type === 'Identifier' &&
        callee.property.type === 'Identifier'
      ) {
        const binding = importOf(callee.object)
        return binding?.imported === '*' &&
          callee.property.name === lastSegment(binding.source)
          ? { name: callee.property.name, source: binding.source }
          : null
      }
      return null
    }
    const formModules = new Set()
    const calls = []
    return {
      CallExpression(node) {
        const component = componentOf(node.callee)
        if (component?.name === 'form')
          formModules.add(component.source.replace(/\/[^/]*$/u, ''))
        calls.push({ component, node })
      },
      'Program:exit'() {
        const sameFamily = source =>
          formModules.has(source.replace(/\/[^/]*$/u, ''))
        /* The element builder: whatever a Crease component call receives
           as its builder argument. */
        const builders = new Set()
        for (const { component, node } of calls) {
          const builder = node.arguments[1]
          if (component !== null && builder?.type === 'Identifier') {
            const variable = variableOf(builder)
            if (variable !== null) builders.add(variable)
          }
        }
        for (const { component, node } of calls) {
          const composition = at(compositionOf(node))
          const props = node.arguments[0]
          if (component?.name === 'form') {
            const id =
              props?.type === 'ObjectExpression'
                ? stringOf(propertyValue(props, 'id'))
                : null
            if (id === null) composition.closed = false
            else composition.forms.add(id)
            continue
          }
          if (component?.name === 'button') {
            if (props?.type !== 'ObjectExpression') continue
            const value = propertyValue(props, 'form')
            const id = stringOf(value)
            if (id !== null) composition.references.push({ id, node: value })
            continue
          }
          if (component !== null) continue
          /* Calls that could render a Form this function cannot see: any
             call except the element builder the Crease components receive
             (`h.div(...)`) and other members of the Form's own component
             family. Local objects, parameters and nested members
             (`sections.external(h)`, `parts.body(h)`) may render one. */
          const callee = node.callee
          if (
            callee.type !== 'MemberExpression' ||
            callee.object.type !== 'Identifier'
          ) {
            composition.closed = false
            continue
          }
          const binding = importOf(callee.object)
          if (
            binding === null
              ? !builders.has(variableOf(callee.object))
              : !sameFamily(binding.source)
          )
            composition.closed = false
        }
        for (const composition of compositions.values()) {
          if (!composition.closed || composition.forms.size === 0) continue
          const ids = [...composition.forms].map(id => `'${id}'`).join(', ')
          for (const reference of composition.references)
            if (!composition.forms.has(reference.id))
              context.report({
                node: reference.node,
                messageId: 'unknownForm',
                data: { id: reference.id, ids },
              })
        }
      },
    }
  },
}
