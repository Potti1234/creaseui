import { docsUrl } from '../lib/strict/context.js'

/* Static half of review R11: a Button's literal form: reference must name a
   literal Form id rendered in the same module. Only provable cases are
   reported; a module that renders no Form, computed ids and submit buttons
   placed by other modules are left to the form-association runtime audit. */

const calleeName = node =>
  node.callee.type === 'Identifier'
    ? node.callee.name
    : node.callee.type === 'MemberExpression' &&
        !node.callee.computed &&
        node.callee.property.type === 'Identifier'
      ? node.callee.property.name
      : null

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

export const formAssociation = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require a Button's literal form: reference to name a Form id the module renders.",
      url: docsUrl('form-association'),
    },
    schema: [],
    messages: {
      unknownForm:
        "button() submits form '{{id}}', but the Forms this module renders have ids {{ids}}. Give the Form id '{{id}}' or fix the reference; if that Form renders elsewhere, check it with the form-association audit.",
    },
  },
  create(context) {
    const forms = new Set()
    const references = []
    return {
      CallExpression(node) {
        const props = node.arguments[0]
        if (props?.type !== 'ObjectExpression') return
        const name = calleeName(node)
        if (name === 'form') {
          const id = stringOf(propertyValue(props, 'id'))
          if (id !== null) forms.add(id)
        } else if (name === 'button') {
          const value = propertyValue(props, 'form')
          const id = stringOf(value)
          if (id !== null) references.push({ node: value, id })
        }
      },
      'Program:exit'() {
        if (forms.size === 0) return
        const ids = [...forms].map(id => `'${id}'`).join(', ')
        for (const reference of references)
          if (!forms.has(reference.id))
            context.report({
              node: reference.node,
              messageId: 'unknownForm',
              data: { id: reference.id, ids },
            })
      },
    }
  },
}
