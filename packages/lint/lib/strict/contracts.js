/* crease-default-v1: the shared source policy for strict application code. */

export const POLICY_VERSION = 'crease-default-v1'
export const RENDERERS = ['tailwind', 'stylex', 'pleat']
export const DOCS_URL =
  'https://github.com/Potti1234/creaseui/blob/main/packages/lint/docs/strict-rules.md'

/** Registry item (Tailwind name) that replaces raw output of a contract. */
export const CONTRACT_REPLACEMENTS = new Map([
  ['control.button', 'button'],
  ['control.input', 'input'],
  ['control.textarea', 'textarea'],
  ['control.native-select', 'native-select'],
  ['control.combobox', 'combobox'],
  ['control.label', 'label'],
  ['control.field', 'field'],
  ['composition.form', 'form'],
  ['composition.stack', 'stack'],
  ['composition.grid', 'grid'],
  ['composition.center', 'center'],
  ['composition.section', 'section'],
  ['navigation.nav', 'navigation-menu'],
  ['typography.heading', 'heading'],
  ['typography.text', 'text'],
  ['navigation.link', 'link'],
  ['composition.list', 'list'],
  ['data.table', 'table'],
  ['composition.separator', 'separator'],
  ['control.disclosure', 'accordion'],
  ['overlay.dialog', 'dialog'],
  ['feedback.progress', 'progress'],
])

export const registryItemFor = (contract, renderer) => {
  const base = CONTRACT_REPLACEMENTS.get(contract)
  if (base === undefined) return undefined
  return renderer === 'tailwind' ? base : `${renderer}-${base}`
}

export const installInstruction = item =>
  `npx shadcn@latest add Potti1234/creaseui/${item}`

/** Layout containers whose children must be Html, not bare strings. */
export const HTML_ONLY_CHILDREN = new Set([
  'composition.box',
  'composition.stack',
  'composition.inline',
  'composition.grid',
  'composition.center',
])

/** Props that are appearance escapes on every contracted component. */
export const FORBIDDEN_PROPS = new Set([
  'attributes',
  'attrs',
  'className',
  'css',
  'innerHTML',
  'style',
  'sx',
])

export const isLayoutSlot = name =>
  name === 'layoutStyle' || /LayoutStyle$/u.test(name)

/* Same closed allowlist as src/lib/layout-properties.ts. */
export const LAYOUT_PROPERTIES = new Set([
  'aspectRatio',
  'alignSelf',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'height',
  'justifySelf',
  'margin',
  'marginBlock',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInline',
  'marginInlineEnd',
  'marginInlineStart',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'order',
  'width',
])

export const LAYOUT_CONSTRUCTORS = new Set(['layoutStyle', 'layoutWhen'])

const SIZE =
  '(?:\\d+(?:\\.\\d+)?|px|full|auto|fit|min|max|screen|svh|dvh|\\d+\\/\\d+|xs|sm|md|lg|xl|[2-7]xl|prose)'
const PLACEMENT_UTILITY = new RegExp(
  [
    `-?m[trblxyse]?-(?:\\d+(?:\\.\\d+)?|px|auto)`,
    `(?:col|row)-(?:span-(?:\\d+|full)|start-(?:\\d+|auto)|end-(?:\\d+|auto)|auto)`,
    `self-(?:auto|start|end|center|stretch|baseline)`,
    `justify-self-(?:auto|start|end|center|stretch)`,
    `order-(?:\\d+|first|last|none)`,
    `flex-(?:1|auto|initial|none)`,
    `grow(?:-0)?`,
    `shrink(?:-0)?`,
    `basis-${SIZE}`,
    `(?:min-|max-)?[wh]-${SIZE}`,
    `size-${SIZE}`,
    `aspect-(?:auto|square|video)`,
  ]
    .map(pattern => `(?:${pattern})`)
    .join('|'),
  'u',
)
const VARIANT_PREFIX = /^(?:(?:sm|md|lg|xl|2xl|rtl|ltr|print):)*/u

/** True for a Tailwind utility that only places a component in its parent. */
export const isPlacementUtility = token => {
  const bare = token.replace(VARIANT_PREFIX, '')
  return new RegExp(`^(?:${PLACEMENT_UTILITY.source})$`, 'u').test(bare)
}

export const CLASS_HELPER_PACKAGES = [
  /^clsx$/u,
  /^classnames$/u,
  /^tailwind-merge$/u,
  /^class-variance-authority$/u,
]
export const RENDERER_AUTHORING_PACKAGES = [
  /^@stylexjs\/stylex$/u,
  /^@pleat\/(?:core|foldkit)(?:\/|$)/u,
  /^pleat-(?:core|foldkit)(?:\/|$)/u,
]
export const STYLE_MODULE = /\.(?:css|scss|sass|less|styl|pcss)(?:\?.*)?$/u
