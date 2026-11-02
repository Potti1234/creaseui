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

const HOVER_MEDIA = /@media[^)]*hover\s*:\s*hover/iu

const hoverGuarded = conditions => {
  let guarded = false
  for (const cond of conditions) {
    if (HOVER_MEDIA.test(cond)) guarded = true
    if (cond.includes(':hover') && !guarded) return false
  }
  return true
}

export const defensiveHoverMedia = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require raw :hover styles to live under @media (hover: hover): on touch devices a tapped element keeps the hover state (defensivecss.dev tip). Tailwind hover: utilities are exempt (v4 emits the media query).',
      url: docsUrl('defensive-hover-media'),
    },
    schema: SCHEMA,
    messages: {
      hoverMedia:
        '`:hover` style is not guarded by `@media (hover: hover)` — it sticks after taps on touch devices.',
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
            if (
              token.includes(':hover') &&
              !token.includes('hover:hover') &&
              !token.includes('hover: hover')
            )
              context.report({ node: src.node, messageId: 'hoverMedia' })
      },
      object => {
        for (const d of styleDecls(object))
          if (
            d.conditions.some(cond => cond.includes(':hover')) &&
            !hoverGuarded(d.conditions)
          )
            context.report({ node: d.node, messageId: 'hoverMedia' })
      },
    )
  },
}
