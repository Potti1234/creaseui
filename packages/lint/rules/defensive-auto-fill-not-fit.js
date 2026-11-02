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

const AUTO_FIT = /repeat\(\s*auto-fit\s*,\s*minmax\(/u

export const defensiveAutoFillNotFit = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prefer auto-fill over auto-fit in repeat(minmax()) grids: auto-fit collapses empty tracks so real items stretch (defensivecss.dev tip).',
      url: docsUrl('defensive-auto-fill-not-fit'),
    },
    schema: SCHEMA,
    messages: {
      autoFit:
        '`repeat(auto-fit, minmax(...))` collapses empty tracks so the real items stretch; use `auto-fill` unless that stretching is intended.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      info => {
        for (const src of info.classSources)
          for (const token of src.tokens)
            if (AUTO_FIT.test(token))
              context.report({ node: src.node, messageId: 'autoFit' })
      },
      object => {
        for (const d of styleDecls(object))
          if (
            d.prop === 'gridTemplateColumns' &&
            d.value !== null &&
            AUTO_FIT.test(d.value)
          )
            context.report({ node: d.node, messageId: 'autoFit' })
      },
    )
  },
}
