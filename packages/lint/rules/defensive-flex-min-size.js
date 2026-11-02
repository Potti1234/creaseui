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

const TRUNC = new Set(['truncate', 'overflow-hidden', 'break-words'])
const TRUNC_PREFIX = /^line-clamp/u
const FLEX_PARENT = new Set(['flex', 'inline-flex', 'grid', 'inline-grid'])
const MINZERO = new Set([
  'min-w-0',
  'min-h-0',
  'min-w-\\[0\\]',
  'min-h-\\[0\\]',
])

const isFlexParent = info =>
  tokensOf(info).some(t => FLEX_PARENT.has(t) || t.includes('minmax(')) ||
  info.styleObjects.some(object =>
    styleDecls(object).some(
      d => d.prop === 'display' && (d.value === 'flex' || d.value === 'grid'),
    ),
  )

export const defensiveFlexMinSize = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn when a truncating child sits in a flex/grid parent without min-w-0/min-h-0: flex children refuse to shrink below content size (defensivecss.dev tip).',
      url: docsUrl('defensive-flex-min-size'),
    },
    schema: SCHEMA,
    messages: {
      flexMinSize:
        'truncating element inside a flex/grid container without `min-w-0`/`min-h-0` — it cannot shrink below its content size; add `min-w-0` (or `min-h-0` for columns).',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      (info, walker) => {
        const tokens = new Set(tokensOf(info))
        const truncating =
          [...tokens].some(t => TRUNC.has(t) || TRUNC_PREFIX.test(t)) ||
          info.styleObjects.some(object =>
            styleDecls(object).some(
              d =>
                (d.prop === 'overflow' && d.value === 'hidden') ||
                d.prop === 'overflowWrap' ||
                d.prop === 'textOverflow',
            ),
          )
        if (!truncating) return
        /* shrink-0 children never shrink — min-w-0 is pointless on them. */
        const noShrink =
          tokens.has('shrink-0') ||
          info.styleObjects.some(object =>
            styleDecls(object).some(
              d =>
                d.prop === 'flexShrink' && (d.value === '0' || d.value === 0),
            ),
          )
        const hasMinZero =
          noShrink ||
          [...tokens].some(t => MINZERO.has(t)) ||
          info.styleObjects.some(object =>
            styleDecls(object).some(
              d =>
                (d.prop === 'minWidth' || d.prop === 'minHeight') &&
                (d.value === '0' || d.value === '0px'),
            ),
          )
        if (hasMinZero) return
        const parent = walker
          .ancestors()
          .find(
            ancestor =>
              ancestor !== info &&
              isFlexParent(ancestor) &&
              !tokensOf(ancestor).some(t => t.includes('minmax(')),
          )
        if (parent !== undefined)
          context.report({ node: info.node, messageId: 'flexMinSize' })
      },
      null,
    )
  },
}
