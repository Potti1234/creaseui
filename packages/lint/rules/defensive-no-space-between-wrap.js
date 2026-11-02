import { docsUrl } from '../lib/strict/context.js'
import {
  allowedList,
  bareVariableReads,
  declaredVariables,
  matchesAllow,
  runDefensiveRule,
  styleDecls,
} from '../lib/defensive.js'

const SCHEMA = [
  {
    type: 'object',
    properties: {
      componentImports: { type: 'array', items: { type: 'string' } },
      ignoreImports: { type: 'array', items: { type: 'string' } },
      allow: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
  },
]

const tokensOf = info => info.classSources.flatMap(src => src.tokens)

const WRAP = /^flex-wrap(?:-reverse)?$/u
const GAP_CLS = /^gap(?:-[xy])?(?:-\d|@)/u
const GAP_PROP = /^(?:gap|columnGap|rowGap)$/u

export const defensiveNoSpaceBetweenWrap = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow justify-content: space-between combined with flex-wrap: wrapped rows lose the between-spacing; use gap instead (defensivecss.dev tip).',
      url: docsUrl('defensive-no-space-between-wrap'),
    },
    schema: SCHEMA,
    messages: {
      spaceBetweenWrap:
        'justify-between + flex-wrap leaves wrapped rows without spacing control; use `gap` instead of justify-between.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      info => {
        const tokens = new Set(tokensOf(info))
        if (
          tokens.has('justify-between') &&
          [...tokens].some(t => WRAP.test(t)) &&
          /* `gap` IS the fix: wrapped rows keep spacing while
             justify-between still splits the first row. */
          ![...tokens].some(t => GAP_CLS.test(t))
        )
          for (const src of info.classSources)
            if (src.tokens.includes('justify-between'))
              context.report({ node: src.node, messageId: 'spaceBetweenWrap' })
      },
      object => {
        const decls = styleDecls(object)
        const props = new Map(decls.map(d => [d.prop, d]))
        if (
          props.get('justifyContent')?.value === 'space-between' &&
          props.has('flexWrap') &&
          !decls.some(d => GAP_PROP.test(d.prop) && d.value !== null)
        )
          context.report({
            node: props.get('justifyContent').node,
            messageId: 'spaceBetweenWrap',
          })
      },
    )
  },
}
