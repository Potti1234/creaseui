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

const BG_URL = /^bg-\[url\(/u
const BG_COLOR = /^bg-(?!\[url)[a-zA-Z][\w-]*/u

export const defensiveBgImageFallback = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a background-color fallback under background images: if the image fails to load, content sits on an unstyled gap (defensivecss.dev tip).',
      url: docsUrl('defensive-bg-image-fallback'),
    },
    schema: SCHEMA,
    messages: {
      bgImageFallback:
        'background image without a background-color fallback; add a bg-* color so content is still styled while/if the image fails to load.',
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
          tokens.some(t => BG_URL.test(t)) &&
          !tokens.some(t => BG_COLOR.test(t))
        )
          for (const src of info.classSources)
            if (src.tokens.some(t => BG_URL.test(t)))
              context.report({ node: src.node, messageId: 'bgImageFallback' })
      },
      object => {
        const decls = styleDecls(object)
        const hasUrl = decls.some(
          d =>
            /background/i.test(d.prop) &&
            d.value !== null &&
            /url\(/iu.test(d.value),
        )
        const hasColor = decls.some(
          d => d.prop === 'backgroundColor' && d.value !== null,
        )
        if (hasUrl && !hasColor)
          for (const d of decls)
            if (d.prop === 'backgroundImage' && /url\(/iu.test(d.value ?? ''))
              context.report({ node: d.node, messageId: 'bgImageFallback' })
      },
    )
  },
}
