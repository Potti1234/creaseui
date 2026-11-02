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

const INPUT_NAME = /^(h\.(input|select|textarea)|input|select|textarea)$/iu
const SMALL_CLS = new Set(['text-xs', 'text-sm'])
const ARB_SMALL = /^text-\[(\d+(?:\.\d+)?)(px|rem|em)\]$/u

const smallClass = token => {
  if (SMALL_CLS.has(token)) return true
  const m = ARB_SMALL.exec(token)
  if (m === null) return false
  const n = parseFloat(m[1])
  return m[2] === 'px' ? n < 16 : n < 1
}

export const defensiveInputFontSize = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn on input/select/textarea font-size below 16px: iOS Safari auto-zooms the page on focus (defensivecss.dev tip).',
      url: docsUrl('defensive-input-font-size'),
    },
    schema: SCHEMA,
    messages: {
      inputFontSize:
        'form control with font-size below 16px triggers iOS Safari auto-zoom on focus; use text-base (16px) or larger.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      info => {
        const isInput =
          ['input', 'select', 'textarea'].includes(info.tag) ||
          (info.name !== null && INPUT_NAME.test(info.name))
        if (!isInput) return
        for (const src of info.classSources)
          for (const token of src.tokens)
            if (smallClass(token))
              context.report({ node: src.node, messageId: 'inputFontSize' })
        for (const object of info.styleObjects)
          for (const d of styleDecls(object))
            if (
              d.prop === 'fontSize' &&
              d.value !== null &&
              parseFloat(d.value) < 16
            )
              context.report({ node: d.node, messageId: 'inputFontSize' })
      },
      null,
    )
  },
}
