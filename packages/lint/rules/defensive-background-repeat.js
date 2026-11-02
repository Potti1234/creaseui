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

const BG_URL_CLS = /^bg-\[url\(/u
const BG_REPEAT = /^bg-repeat|^bg-no-repeat/u

export const defensiveBackgroundRepeat = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require an explicit background-repeat (or bg-repeat-*) next to background url() images; the default is repeat which is rarely intended (defensivecss.dev tip).',
      url: docsUrl('defensive-background-repeat'),
    },
    schema: SCHEMA,
    messages: {
      backgroundRepeat:
        'background `url()` without an explicit repeat; add `bg-no-repeat`/`bg-repeat-*` or `backgroundRepeat`.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      info => {
        const tokens = tokensOf(info)
        if (
          tokens.some(t => BG_URL_CLS.test(t)) &&
          !tokens.some(t => BG_REPEAT.test(t))
        )
          for (const src of info.classSources)
            if (src.tokens.some(t => BG_URL_CLS.test(t)))
              context.report({ node: src.node, messageId: 'backgroundRepeat' })
      },
      object => {
        const decls = styleDecls(object)
        const hasUrl = decls.some(
          d =>
            /background/i.test(d.prop) &&
            d.value !== null &&
            /url\(/iu.test(d.value),
        )
        const hasRepeat = decls.some(d => d.prop === 'backgroundRepeat')
        if (hasUrl && !hasRepeat)
          for (const d of decls)
            if (/background/i.test(d.prop) && /url\(/iu.test(d.value ?? ''))
              context.report({ node: d.node, messageId: 'backgroundRepeat' })
      },
    )
  },
}
