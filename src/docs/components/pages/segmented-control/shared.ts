import type { DocsExample } from '@/docs/components/page-definition'
import { foldkitApplication } from '@/docs/components/pages/authored-page'

export type SCOption = Readonly<{
  value: string
  label: string
  icon?: string
  isLabelHidden?: boolean
  isDisabled?: boolean
}>

export type SCFixture = Readonly<{
  title: string
  description?: string
  heroOnly?: boolean
  group: Readonly<{
    id: string
    ariaLabel: string
    options: ReadonlyArray<SCOption>
    selected: string
    size?: 'sm' | 'md' | 'lg'
    layout?: 'fill'
  }>
  /** Width of the wrapping preview container in pixels. */
  width?: number
}>

const viewOptions: ReadonlyArray<SCOption> = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'table', label: 'Table' },
]

const viewIconOptions: ReadonlyArray<SCOption> = [
  { value: 'grid', label: 'Grid', icon: 'layout-grid' },
  { value: 'list', label: 'List', icon: 'list' },
  { value: 'table', label: 'Table', icon: 'table' },
]

export const segmentedControlFixtures: Readonly<
  [SCFixture, ...Array<SCFixture>]
> = [
  {
    title: 'Segmented Control',
    heroOnly: true,
    group: {
      id: 'demo',
      ariaLabel: 'View mode',
      options: viewOptions,
      selected: 'grid',
    },
  },
  {
    title: 'With Icons',
    description:
      'Segmented control with icon and label pairs for a view mode switcher.',
    group: {
      id: 'icons',
      ariaLabel: 'View mode',
      options: viewIconOptions,
      selected: 'grid',
    },
  },
  {
    title: 'Icon Only',
    description:
      'Compact segmented control with hidden labels, showing only icons for space-constrained layouts.',
    group: {
      id: 'icon-only',
      ariaLabel: 'View mode',
      options: [
        {
          value: 'grid',
          label: 'Grid',
          icon: 'layout-grid',
          isLabelHidden: true,
        },
        { value: 'list', label: 'List', icon: 'list', isLabelHidden: true },
      ],
      selected: 'grid',
      size: 'sm',
    },
  },
  {
    title: 'Fill Layout',
    description:
      'Segmented control that stretches segments equally to fill the available width, useful for fixed-width containers.',
    width: 400,
    group: {
      id: 'fill',
      ariaLabel: 'Time range',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
      selected: 'weekly',
      layout: 'fill',
    },
  },
  {
    title: 'Disabled Item',
    description:
      'Segmented control with an individually disabled option for unavailable choices.',
    group: {
      id: 'disabled',
      ariaLabel: 'Data granularity',
      options: [
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly', isDisabled: true },
      ],
      selected: 'hourly',
    },
  },
]

const optionEmit = (option: SCOption): string => `      {
        value: '${option.value}',
        label: '${option.label}',${
          option.icon !== undefined
            ? `
        icon: Icon.icon('${option.icon}', {}, h),`
            : ''
        }${
          option.isLabelHidden === true
            ? `
        isLabelHidden: true,`
            : ''
        }${
          option.isDisabled === true
            ? `
        isDisabled: true,`
            : ''
        }
      }`

const emitSource = (fixture: SCFixture, isStyleX: boolean): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '')
  const lib = isStyleX ? 'stylex' : 'ui'
  const group = fixture.group
  const usesIcon = group.options.some(option => option.icon !== undefined)
  const controlCall = `ExampleControl.segmentedControl({
      model: model.control ?? SegmentedControl.init({ id: '${group.id}' }),
      toParentMessage: message =>
        GotSegmentedControlMessage({ message }),
      ariaLabel: '${group.ariaLabel}',
      value: model.value,
      options: [
${group.options.map(option => optionEmit(option)).join(',\n')},
      ],${
        group.size !== undefined && group.size !== 'md'
          ? `
      size: '${group.size}',`
          : ''
      }${
        group.layout === 'fill'
          ? `
      layout: 'fill',`
          : ''
      }
    }, h)`
  const viewChild =
    fixture.width !== undefined
      ? `    h.div([h.Class(${isStyleX ? 'className(styles.frame)' : `'w-[${fixture.width}px]'`})], [
      ${controlCall},
    ])`
      : `    ${controlCall}`
  return foldkitApplication({
    title: `Segmented Control — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'
${
  isStyleX
    ? `import * as stylex from '@stylexjs/stylex'
import { className } from '@/stylex/style'
`
    : ''
}${
      usesIcon
        ? `import * as Icon from '@/lib/icon'
`
        : ''
    }import * as SegmentedControl from '@/${lib}/segmented-control'
${
  isStyleX && fixture.width !== undefined
    ? `const styles = stylex.create({
  frame: { width: '${fixture.width}px' },
})
`
    : ''
}`,
    model: `const ExampleControl = SegmentedControl.create<string>()
export const Model = S.Struct({
  control: SegmentedControl.Model,
  value: S.String,
})
export type Model = typeof Model.Type`,
    messages: `export const GotSegmentedControlMessage = taggedStruct('GotSegmentedControlMessage${tag}', {
  message: SegmentedControl.Message,
})
export const Message = S.Union([GotSegmentedControlMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    control: SegmentedControl.init({ id: '${group.id}' }),
    value: '${group.selected}',
  },
})`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotSegmentedControlMessage${tag}': {
      const next = ExampleControl.update(model.control, message.message)
      const selection = Option.getOrUndefined(
        Option.fromNullishOr(next.outMessage),
      )?.value
      return {
        model: {
          ...model,
          control: next.model,
          ...(selection === undefined ? {} : { value: selection }),
        },
        commands: Command.mapMessages(next.commands ?? [], next =>
          GotSegmentedControlMessage({ message: next })),
      }
    }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Segmented Control — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
${viewChild},
  ]),
})`,
  })
}

export const segmentedControlExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  segmentedControlFixtures.map(fixture => ({
    title: fixture.title,
    ...(fixture.description === undefined
      ? {}
      : { description: fixture.description }),
    ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
    code: emitSource(fixture, renderer === 'stylex'),
  }))
