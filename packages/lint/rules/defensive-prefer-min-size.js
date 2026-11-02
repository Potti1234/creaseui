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

/* Only arbitrary fixed sizes (h-[40px], w-[20rem]) — scale tokens like
   `w-3`/`h-8` stay legal: they are the icon/sizing shorthand and the
   pair exemption would make them noise. */
const FIXED_ARB = /^([wh])-\[(\d+(?:\.\d+)?)(px|rem|em)\]$/u
const SIZE_CLS = /^size-/u
const DIM_PROP = /^(width|height)$/u
const LEN_VALUE = /^(\d+(?:\.\d+)?)(px|rem|em)?$/u

const sizeOf = (num, unit) => `${num}${unit || 'px'}`

const fixedDims = info => {
  const dims = []
  for (const token of tokensOf(info)) {
    const m = FIXED_ARB.exec(token)
    if (m)
      dims.push({ axis: m[1], node: null, token, size: sizeOf(m[2], m[3]) })
  }
  for (const object of info.styleObjects)
    for (const d of styleDecls(object))
      if (DIM_PROP.test(d.prop) && d.value !== null) {
        const m = LEN_VALUE.exec(d.value)
        if (m)
          dims.push({
            axis: d.prop === 'width' ? 'w' : 'h',
            node: d.node,
            token: null,
            size: sizeOf(m[1], m[2]),
          })
      }
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
          new Set(dims.filter(d => d.axis === axis).map(d => d.size))
        const square = [...values('w')].some(v => values('h').has(v))
        if (square) return
        for (const src of info.classSources)
          for (const token of src.tokens)
            if (FIXED_ARB.test(token) && !matchesAllow(allow, token))
              context.report({
                node: src.node,
                messageId: 'preferMinSize',
                data: { dim: token },
              })
      },
      object => {
        const decls = styleDecls(object)
        const sized = decls.filter(
          d =>
            DIM_PROP.test(d.prop) &&
            d.value !== null &&
            LEN_VALUE.test(d.value),
        )
        if (sized.length === 0) return
        const axes = axis =>
          new Set(
            sized
              .filter(d => (d.prop === 'width' ? 'w' : 'h') === axis)
              .map(d => {
                const m = LEN_VALUE.exec(d.value)
                return sizeOf(m[1], m[2])
              }),
          )
        if ([...axes('w')].some(v => axes('h').has(v))) return
        for (const d of sized)
          if (!matchesAllow(allow, `${d.prop}:${d.value}`))
            context.report({
              node: d.node,
              messageId: 'preferMinSize',
              data: { dim: `${d.prop}: ${d.value}` },
            })
      },
    )
  },
}
