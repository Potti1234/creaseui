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

const FIXED_ARB = /^([wh])-\[(\d+(?:\.\d+)?)(px|rem|em)\]$/u
const FIXED_SCALE = /^([wh])-(\d+(?:\.\d+)?)$/u
const SIZE_CLS = /^size-/u
const DIM_PROP = /^(width|height)$/u
const LEN_VALUE = /^(\d+(?:\.\d+)?)(px|rem|em)?$/u

const fixedDims = info => {
  const dims = []
  for (const token of tokensOf(info)) {
    let m = FIXED_ARB.exec(token) ?? FIXED_SCALE.exec(token)
    if (m) dims.push({ axis: m[1], node: null, token })
  }
  for (const object of info.styleObjects)
    for (const d of styleDecls(object))
      if (DIM_PROP.test(d.prop) && d.value !== null && LEN_VALUE.test(d.value))
        dims.push({
          axis: d.prop === 'width' ? 'w' : 'h',
          node: d.node,
          token: null,
        })
  return dims
}

export const defensivePreferMinSize = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn on fixed h-*/w-* (or height/width literals) on layout containers: content overflow clips instead of growing; prefer min-h-*/min-w-* (defensivecss.dev tip). Equal w/h pairs (icons, avatars) and size-* are exempt.',
      url: docsUrl('defensive-prefer-min-size'),
    },
    schema: SCHEMA,
    messages: {
      preferMinSize:
        'fixed `{{dim}}` on a layout container clips overflowing content; prefer `min-{{dim}}`.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const allow = allowedList(options)
    return runDefensiveRule(
      context,
      options,
      info => {
        const tokens = tokensOf(info)
        if (tokens.some(t => SIZE_CLS.test(t))) return
        const dims = fixedDims(info)
        if (dims.length === 0) return
        const values = axis =>
          new Set(dims.filter(d => d.axis === axis).map(d => d.token ?? ''))
        const square = [...values('w')].some(v => values('h').has(v))
        if (square) return
        for (const src of info.classSources)
          for (const token of src.tokens)
            if (
              (FIXED_ARB.test(token) || FIXED_SCALE.test(token)) &&
              !matchesAllow(allow, token)
            )
              context.report({
                node: src.node,
                messageId: 'preferMinSize',
                data: { dim: token },
              })
        for (const object of info.styleObjects)
          for (const d of styleDecls(object))
            if (
              DIM_PROP.test(d.prop) &&
              d.value !== null &&
              LEN_VALUE.test(d.value) &&
              !matchesAllow(allow, `${d.prop}:${d.value}`)
            )
              context.report({
                node: d.node,
                messageId: 'preferMinSize',
                data: { dim: `${d.prop}: ${d.value}` },
              })
      },
      null,
    )
  },
}
