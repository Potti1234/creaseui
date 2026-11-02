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

const SCROLL_TOKENS = new Set([
  'overflow-scroll',
  'overflow-x-scroll',
  'overflow-y-scroll',
])
const OVERFLOW_PROPS = new Set(['overflow', 'overflowX', 'overflowY'])

export const defensivePreferOverflowAuto = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prefer overflow auto over scroll: scroll renders disabled scrollbars even when nothing overflows (defensivecss.dev tip).',
      url: docsUrl('defensive-prefer-overflow-auto'),
    },
    schema: SCHEMA,
    messages: {
      overflowScroll:
        '`{{what}}: scroll` forces scrollbars even when nothing overflows; use `auto` so scrollbars appear only when needed.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const allow = allowedList(options)
    return runDefensiveRule(
      context,
      options,
      info => {
        for (const src of info.classSources)
          for (const token of src.tokens)
            if (SCROLL_TOKENS.has(token) && !matchesAllow(allow, token))
              context.report({
                node: src.node,
                messageId: 'overflowScroll',
                data: { what: token },
              })
      },
      object => {
        for (const d of styleDecls(object))
          if (
            OVERFLOW_PROPS.has(d.prop) &&
            d.value === 'scroll' &&
            !matchesAllow(allow, `${d.prop}:scroll`)
          )
            context.report({
              node: d.node,
              messageId: 'overflowScroll',
              data: { what: d.prop },
            })
      },
    )
  },
}
