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

const GRID_CLS = new Set(['grid', 'inline-grid'])
const SELF_START = /^self-|^justify-self|^align-self/u

const isGridParent = info =>
  tokensOf(info).some(t => GRID_CLS.has(t)) ||
  info.styleObjects.some(object =>
    styleDecls(object).some(d => d.prop === 'display' && d.value === 'grid'),
  )

export const defensiveStickyGridAlign = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn on sticky children of grid containers without self-start: grid stretch makes the sticky element fill the track and never stick (defensivecss.dev tip).',
      url: docsUrl('defensive-sticky-grid-align'),
    },
    schema: SCHEMA,
    messages: {
      stickyGrid:
        'sticky element inside a grid container without `self-start`/`align-self: start` — grid stretch prevents it from sticking.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      (info, walker) => {
        const tokens = new Set(tokensOf(info))
        const sticky =
          tokens.has('sticky') ||
          info.styleObjects.some(object =>
            styleDecls(object).some(
              d => d.prop === 'position' && d.value === 'sticky',
            ),
          )
        if (!sticky) return
        const selfStart =
          [...tokens].some(t => SELF_START.test(t)) ||
          info.styleObjects.some(object =>
            styleDecls(object).some(
              d => d.prop === 'alignSelf' || d.prop === 'justifySelf',
            ),
          )
        if (selfStart) return
        const parent = walker
          .ancestors()
          .find(
            ancestor =>
              ancestor !== info &&
              isGridParent(ancestor) &&
              !tokensOf(ancestor).some(
                t => t === 'items-start' || t === 'content-start',
              ) &&
              !ancestor.styleObjects.some(object =>
                styleDecls(object).some(
                  d => d.prop === 'alignItems' && d.value === 'start',
                ),
              ),
          )
        if (parent !== undefined)
          context.report({ node: info.node, messageId: 'stickyGrid' })
      },
      null,
    )
  },
}
