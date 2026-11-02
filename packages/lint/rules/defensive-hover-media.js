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

/* Only `:hover` inside an arbitrary `[...]` selector is raw — a plain
   `hover:`/`group-hover:`/`has-[…]:hover:` variant segment compiles under
   @media (hover: hover) in Tailwind v4. An arbitrary variant carrying its
   own `(hover:hover)` guards the rest of the token. */
const rawHoverSelector = token => {
  let guarded = false
  for (let i = 0; i < token.length; i += 1) {
    if (token[i] !== '[') continue
    let depth = 1
    let parens = 0
    let quote = ''
    let j = i + 1
    for (; j < token.length && depth > 0; j += 1) {
      const c = token[j]
      if (quote) {
        if (c === quote) quote = ''
      } else if (c === '"' || c === "'" || c === '`') quote = c
      else if (c === '(') parens += 1
      else if (c === ')') parens -= 1
      else if (c === '[' && parens === 0) depth += 1
      else if (c === ']' && parens === 0) depth -= 1
    }
    const inner = token.slice(i + 1, j - 1)
    if (inner.includes('hover:hover') || inner.includes('hover: hover'))
      guarded = true
    else if (inner.includes(':hover') && !guarded) return true
    i = j
  }
  return false
}

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
            if (rawHoverSelector(token))
              context.report({ node: src.node, messageId: 'hoverMedia' })
      },
      (object, info, conditions) => {
        for (const d of styleDecls(object)) {
          const all = [...conditions, ...d.conditions]
          if (all.some(cond => cond.includes(':hover')) && !hoverGuarded(all))
            context.report({ node: d.node, messageId: 'hoverMedia' })
        }
      },
    )
  },
}
