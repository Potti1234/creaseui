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

const SIZE_TOKEN = /^[wh]-|^size-/u
const OBJECT_FIT = /^object-(cover|contain|fill|none|scale-down)/u
const IMG_NAME = /^(h\.img|img|image|avatar)$/iu

export const defensiveImageObjectFit = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn on sized images without object-fit: a forced width/height distorts the aspect unless object-fit controls the crop (defensivecss.dev tip).',
      url: docsUrl('defensive-image-object-fit'),
    },
    schema: SCHEMA,
    messages: {
      imageObjectFit:
        'image with explicit width/height but no `object-fit`; add object-cover/contain to control the crop.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    return runDefensiveRule(
      context,
      options,
      info => {
        const isImg =
          info.tag === 'img' || (info.name !== null && IMG_NAME.test(info.name))
        if (!isImg) return
        const tokens = tokensOf(info)
        const decls = info.styleObjects.flatMap(styleDecls)
        const sized =
          tokens.some(t => SIZE_TOKEN.test(t)) ||
          decls.some(
            d =>
              (d.prop === 'width' || d.prop === 'height') && d.value !== null,
          )
        const fitted =
          tokens.some(t => OBJECT_FIT.test(t)) ||
          decls.some(d => d.prop === 'objectFit')
        if (sized && !fitted)
          context.report({ node: info.node, messageId: 'imageObjectFit' })
      },
      null,
    )
  },
}
