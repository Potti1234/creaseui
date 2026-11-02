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

const SCHEMA2 = [
  {
    type: 'object',
    properties: {
      componentImports: { type: 'array', items: { type: 'string' } },
      ignoreImports: { type: 'array', items: { type: 'string' } },
      allow: { type: 'array', items: { type: 'string' } },
      allowTokens: { type: 'boolean' },
    },
    additionalProperties: false,
  },
]

export const defensiveCssVarFallback = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a fallback argument in var(--x) reads of variables the project never defines; declared design tokens may be exempted (allowTokens, default on).',
      url: docsUrl('defensive-css-var-fallback'),
    },
    schema: SCHEMA2,
    messages: {
      cssVarFallback:
        'var({{name}}) has no fallback and is not a defined token; use var({{name}}, <default>).',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const allow = allowedList(options)
    const allowTokens = options.allowTokens !== false
    const declared = declaredVariables(context)
    const reportRead = (node, name) => {
      if (matchesAllow(allow, name)) return
      if (allowTokens && declared(name)) return
      context.report({ node, messageId: 'cssVarFallback', data: { name } })
    }
    return runDefensiveRule(
      context,
      options,
      info => {
        for (const src of info.classSources)
          for (const token of src.tokens)
            if (token.includes('var('))
              for (const name of bareVariableReads(token))
                reportRead(src.node, name)
      },
      object => {
        for (const d of styleDecls(object))
          if (d.value !== null && d.value.includes('var('))
            for (const name of bareVariableReads(d.value))
              reportRead(d.node, name)
      },
    )
  },
}
