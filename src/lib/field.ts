import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

type ElementNode = NonNullable<Html>

export type FieldError = Readonly<{ message?: string }> | undefined
export type FieldOrientation = 'vertical' | 'horizontal' | 'responsive'

export type ControlFieldParts = Readonly<{
  controlId: string
  labelId: string
  descriptionId?: string
  errorId?: string
  describedBy?: string
  isInvalid: boolean
  isDisabled: boolean
}>

export type ControlFieldProps<Msg> = Readonly<{
  id: string
  label: Html | string
  description?: Html | string
  error?: Html | string
  errors?: ReadonlyArray<FieldError>
  orientation?: FieldOrientation
  isInvalid?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  toControl: (parts: ControlFieldParts, h: HtmlBuilder<Msg>) => Html
}>

export type ControlFieldVisualAttributes<Msg> = Readonly<{
  field: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
  error: ReadonlyArray<Attribute<Msg>>
  errorList: ReadonlyArray<Attribute<Msg>>
}>

export const fieldErrorMessages = (
  errors: ReadonlyArray<FieldError> = [],
): ReadonlyArray<string> => [
  ...new Set(
    errors.flatMap((error) =>
      error?.message === undefined ? [] : [error.message],
    ),
  ),
]

export const controlFieldParts = <Msg>(
  props: ControlFieldProps<Msg>,
): ControlFieldParts => {
  const messages = fieldErrorMessages(props.errors)
  const hasError = props.error !== undefined || messages.length > 0
  const descriptionId =
    props.description === undefined ? undefined : `${props.id}-description`
  const errorId = hasError ? `${props.id}-error` : undefined
  const describedBy = [descriptionId, errorId]
    .filter((id): id is string => id !== undefined)
    .join(' ')

  return {
    controlId: props.id,
    labelId: `${props.id}-label`,
    ...(descriptionId === undefined ? {} : { descriptionId }),
    ...(errorId === undefined ? {} : { errorId }),
    ...(describedBy.length === 0 ? {} : { describedBy }),
    isInvalid: props.isInvalid === true || hasError,
    isDisabled: props.isDisabled === true,
  }
}

export const renderControlField = <Msg>(
  props: ControlFieldProps<Msg>,
  visual: ControlFieldVisualAttributes<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const parts = controlFieldParts(props)
  const messages = fieldErrorMessages(props.errors)
  const partStateAttributes: ReadonlyArray<Attribute<Msg>> = [
    ...(parts.isDisabled ? [h.DataAttribute('disabled', '')] : []),
    ...(parts.isInvalid ? [h.DataAttribute('invalid', '')] : []),
  ]
  const errorContent =
    props.error !== undefined
      ? [props.error]
      : messages.length <= 1
        ? messages
        : [
            h.ul(
              [...visual.errorList],
              messages.map((message) => h.li([], [message])),
            ),
          ]

  return h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'field'),
      h.DataAttribute('orientation', props.orientation ?? 'vertical'),
      ...(parts.isInvalid ? [h.DataAttribute('invalid', 'true')] : []),
      ...(parts.isDisabled ? [h.DataAttribute('disabled', '')] : []),
      ...(props.isRequired === true ? [h.DataAttribute('required', '')] : []),
      ...visual.field,
    ],
    [
      h.label(
        [
          h.Id(parts.labelId),
          h.For(parts.controlId),
          h.DataAttribute('slot', 'field-label'),
          ...partStateAttributes,
          ...visual.label,
        ],
        [props.label],
      ),
      props.toControl(parts, h),
      ...(parts.descriptionId === undefined
        ? []
        : [
            h.p(
              [
                h.Id(parts.descriptionId),
                h.DataAttribute('slot', 'field-description'),
                ...partStateAttributes,
                ...visual.description,
              ],
              [props.description ?? ''],
            ),
          ]),
      ...(parts.errorId === undefined
        ? []
        : [
            h.div(
              [
                h.Id(parts.errorId),
                h.Role('alert'),
                h.DataAttribute('slot', 'field-error'),
                ...partStateAttributes,
                ...visual.error,
              ],
              errorContent,
            ),
          ]),
    ],
  )
}

/* Fieldset context propagation. creaseui parts are pure view functions, so a
   `fieldSet` cannot hand context down the way Base UI's FieldsetRootContext
   does — children arrive already rendered. To keep Base UI semantics
   (legend registration + disabled propagation to nested parts and controls)
   the fieldset post-processes its child vnodes in place before mounting
   them: it finds the nearest descendant `field-legend` (nested fieldsets own
   their legends) and mirrors `disabled` onto form controls, interactive
   elements, and field parts. */

type VNodeData = NonNullable<ElementNode['data']>

const FIELD_PART_SLOTS: ReadonlySet<string> = new Set([
  'field',
  'field-label',
  'field-description',
  'field-error',
  'field-legend',
])

/* Elements the platform disables through `<fieldset disabled>`. */
const DISABLEABLE_ELEMENTS: ReadonlySet<string> = new Set([
  'button',
  'fieldset',
  'input',
  'optgroup',
  'option',
  'select',
  'textarea',
])

const INTERACTIVE_ROLES: ReadonlySet<string> = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'listbox',
  'menuitem',
  'option',
  'radio',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
  'treeitem',
])

const slotOf = (node: ElementNode): string | undefined => {
  const slot = node.data?.attrs?.['data-slot']
  return typeof slot === 'string' ? slot : undefined
}

const markDisabled = (node: ElementNode): void => {
  const slot = slotOf(node)
  const isFieldPart = slot !== undefined && FIELD_PART_SLOTS.has(slot)
  const isFormControl = node.sel !== undefined && DISABLEABLE_ELEMENTS.has(node.sel)
  const role = node.data?.attrs?.['role']
  const isInteractive = typeof role === 'string' && INTERACTIVE_ROLES.has(role)
  if (!isFieldPart && !isFormControl && !isInteractive) return

  const data = (node.data ??= {} as VNodeData)
  const attrs = (data.attrs ??= {})
  attrs['data-disabled'] = ''
  if (isFormControl) {
    const props = (data.props ??= {})
    props['disabled'] = true
  } else if (isInteractive && !isFieldPart) {
    attrs['aria-disabled'] = 'true'
  }
  if (isFormControl || isInteractive) {
    // Disabled controls do not participate in constraint validation, so
    // aria-invalid drops while data-invalid stays.
    delete attrs['aria-invalid']
  }
}

const applyFieldsetDisabled = (nodes: ReadonlyArray<Html | string>): void => {
  nodes.forEach((child) => {
    if (child === null || typeof child === 'string') return
    markDisabled(child)
    if (child.children !== undefined) applyFieldsetDisabled(child.children)
  })
}

const findFieldsetLegend = (
  nodes: ReadonlyArray<Html | string>,
): ElementNode | undefined => {
  let legend: ElementNode | undefined
  nodes.forEach((child) => {
    if (child === null || typeof child === 'string') return
    if (child.sel === 'fieldset') return
    if (slotOf(child) === 'field-legend') {
      legend = child
      return
    }
    if (child.children !== undefined) {
      const nested = findFieldsetLegend(child.children)
      if (nested !== undefined) legend = nested
    }
  })
  return legend
}

let nextGeneratedFieldsetId = 0

/* Mirrors Base UI's FieldsetRootContext pass over already-rendered children:
   propagates `isDisabled` to nested field parts/controls and returns the id
   the fieldset's `aria-labelledby` must point at, generating and stamping one
   on the legend when neither it nor the fieldset carries an id. The last
   descendant legend wins, matching Base UI's registration order. */
export const prepareFieldsetChildren = (
  children: ReadonlyArray<Html | string>,
  options: Readonly<{ id?: string; isDisabled?: boolean }> = {},
): string | undefined => {
  if (options.isDisabled === true) applyFieldsetDisabled(children)

  const legend = findFieldsetLegend(children)
  if (legend === undefined) return undefined

  const existingId = legend.data?.props?.['id']
  if (typeof existingId === 'string') return existingId

  const baseId = options.id ?? `fieldset-${nextGeneratedFieldsetId++}`
  const legendId = `${baseId}-legend`
  const data = (legend.data ??= {} as VNodeData)
  ;(data.props ??= {}).id = legendId
  return legendId
}
