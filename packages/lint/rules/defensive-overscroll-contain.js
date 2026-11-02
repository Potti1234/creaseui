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

const OVERLAY_NAME = /dialog|sheet|drawer|popover|overlay|modal|menu|tooltip/iu
const SCROLL_AUTO = new Set([
  'overflow-auto',
  'overflow-x-auto',
  'overflow-y-auto',
])
const CONTAIN = /^overscroll/u

export const defensiveOverscrollContain = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn on scrollable regions inside overlays without overscroll-contain: scrolling past the end scrolls the page behind (defensivecss.dev tip).',
      url: docsUrl('defensive-overscroll-contain'),
    },
    schema: SCHEMA,
    messages: {
      overscrollContain:
        'scrollable region inside an overlay without `overscroll-contain`/`overscrollBehavior` — wheel/touch scroll leaks to the page behind.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      (info, walker) => {
        const tokens = tokensOf(info)
        const scrolls =
          tokens.some(t => SCROLL_AUTO.has(t)) ||
          info.styleObjects.some(object =>
            styleDecls(object).some(
              d => /^overflow[XY]?$/u.test(d.prop) && d.value === 'auto',
            ),
          )
        if (!scrolls) return
        const contained =
          tokens.some(t => CONTAIN.test(t)) ||
          info.styleObjects.some(object =>
            styleDecls(object).some(d =>
              d.prop.toLowerCase().startsWith('overscrollbehavior'),
            ),
          )
        if (contained) return
        const inOverlay = walker
          .ancestors()
          .some(
            ancestor =>
              ancestor !== info &&
              ancestor.name !== null &&
              OVERLAY_NAME.test(ancestor.name),
          )
        if (inOverlay)
          context.report({ node: info.node, messageId: 'overscrollContain' })
      },
      null,
    )
  },
}
