/* Crease Tasks' own lint rules. Each one enforces a decision in
   design-system/principles.md that configuration cannot express. */

const BUTTON_MODULE = '@/ui/button'
const BUTTON_EXPORTS = new Set(['button', 'buttonLink'])

/** The string values an expression can have: a literal, or either branch of a condition. */
const stringValues = node => {
  if (node === null || node === undefined) return []
  if (node.type === 'Literal' && typeof node.value === 'string')
    return [node.value]
  if (node.type === 'ConditionalExpression')
    return [...stringValues(node.consequent), ...stringValues(node.alternate)]
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression')
    return stringValues(node.expression)
  return []
}

const oneButtonProps = node => {
  const props = node.arguments[0]
  return props !== undefined && props.type === 'ObjectExpression'
    ? props
    : undefined
}

/** D4: a region has one main action. A file is the region it renders: a page header, a dialog, a pattern. */
const onePrimaryAction = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Allow at most one primary button per file (decision D4).',
    },
    schema: [],
    messages: {
      second:
        'A region has one primary action (decision D4). This file already has one at line {{line}}; make this one `secondary`, or move it to its own region.',
    },
  },
  create(context) {
    const buttonNames = new Set()
    let first = undefined
    return {
      ImportDeclaration(node) {
        if (node.source.value !== BUTTON_MODULE) return
        for (const specifier of node.specifiers)
          if (
            specifier.type === 'ImportSpecifier' &&
            BUTTON_EXPORTS.has(specifier.imported.name)
          )
            buttonNames.add(specifier.local.name)
      },
      CallExpression(node) {
        if (
          node.callee.type !== 'Identifier' ||
          !buttonNames.has(node.callee.name)
        )
          return
        const props = oneButtonProps(node)
        const intent = props?.properties.find(
          property =>
            property.type === 'Property' &&
            property.key.type === 'Identifier' &&
            property.key.name === 'intent',
        )
        if (
          intent === undefined ||
          !stringValues(intent.value).includes('primary')
        )
          return
        if (first === undefined) {
          first = intent
          return
        }
        context.report({
          node: intent,
          messageId: 'second',
          data: { line: String(first.loc.start.line) },
        })
      },
    }
  },
}

export default {
  meta: { name: 'eslint-plugin-crease-tasks' },
  rules: { 'one-primary-action': onePrimaryAction },
}
