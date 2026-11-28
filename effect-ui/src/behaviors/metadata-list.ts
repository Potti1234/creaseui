import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

const Disclosure = Html.component({
  name: 'CreaseMetadataList',
  props: Schema.Struct({
    expanded: Schema.optional(Schema.Boolean),
    defaultExpanded: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ expanded: Schema.Boolean }),
  message: UiSchema.TaggedEnum({ Toggled: {} }),
  events: UiSchema.TaggedEnum({ Updated: { expanded: Schema.Boolean } }),
}).make({
  init: ({ props }) => ({ expanded: props.defaultExpanded ?? false }),
  update: {
    Toggled: $ => {
      const expanded = !($.props.expanded ?? $.model.expanded)
      return $.evolve({ expanded }).emit({ _tag: 'Updated', expanded })
    },
  },
  parts: (p, model) => ({
    expanded: p.props.expanded ?? model.expanded,
    toggle: p.part('button', element =>
      element.on('click', { _tag: 'Toggled' }),
    ),
  }),
})

export type MetadataListColumns = 'multi' | 'single' | number
export type MetadataListOrientation = 'vertical' | 'horizontal'
export type MetadataListLabelConfig = {
  readonly position: 'start' | 'top'
  readonly width?: number | string
}

export const resolveMetadataLayout = (config: {
  readonly columns?: MetadataListColumns
  readonly label?: MetadataListLabelConfig
  readonly orientation?: MetadataListOrientation
}) => {
  if (config.orientation === 'horizontal')
    return { isStacked: true, kind: 'horizontal', tracks: undefined }
  const columns = config.columns ?? 'single'
  const count =
    typeof columns === 'number' && Number.isFinite(columns)
      ? Math.max(1, Math.trunc(columns))
      : undefined
  const multi = columns === 'multi' || (count ?? 1) > 1
  const isStacked =
    (config.label?.position ?? (multi ? 'top' : 'start')) === 'top'
  const width = config.label?.width
  const labelTrack =
    typeof width === 'number' ? `${width}px` : (width ?? 'auto')
  return {
    isStacked,
    kind: multi ? 'grid-multi' : 'grid-single',
    tracks:
      count !== undefined && count > 1
        ? isStacked
          ? `repeat(${count}, minmax(0,1fr))`
          : `repeat(${count}, ${labelTrack} minmax(0,1fr))`
        : !isStacked && !multi
          ? `${labelTrack} minmax(0,1fr)`
          : undefined,
  }
}

type Options<Msg> = Parameters<typeof Disclosure<Msg>>[1]
type Classes = Partial<
  Record<
    | 'root'
    | 'title'
    | 'list'
    | 'item'
    | 'term'
    | 'definition'
    | 'icon'
    | 'toggle',
    string
  >
>
export type MetadataListProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly id: string
  readonly title?: View.Input<Msg, R>
  readonly columns?: MetadataListColumns
  readonly orientation?: MetadataListOrientation
  readonly label?: MetadataListLabelConfig
  readonly maxNumOfItems?: number
  readonly moreLabel?: string
  readonly lessLabel?: string
  readonly className?: string
  readonly items: readonly {
    readonly key: string
    readonly label: View.Input<Msg, R>
    readonly definition: View.Input<Msg, R>
    readonly icon?: View.Input<Msg, R>
  }[]
}

export const MetadataListBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    title,
    items,
    columns,
    orientation,
    label,
    maxNumOfItems,
    moreLabel = 'Show more',
    lessLabel = 'Show less',
    className,
    ...options
  }: MetadataListProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const layout = resolveMetadataLayout({
    ...(columns === undefined ? {} : { columns }),
    ...(orientation === undefined ? {} : { orientation }),
    ...(label === undefined ? {} : { label }),
  })
  const cap =
    layout.kind === 'horizontal' ||
    maxNumOfItems === undefined ||
    !Number.isFinite(maxNumOfItems)
      ? items.length
      : Math.max(0, Math.trunc(maxNumOfItems))
  const contentId = `${id}-content`
  return Disclosure(h, {
    ...options,
    props: options.props ?? {},
    key: options.key ?? id,
    view: ({ expanded, toggle }) =>
      h.div
        .class(styles.root, className)
        .attrs({ id, 'data-slot': 'metadata-list' })
        .children(
          title === undefined
            ? undefined
            : h.div
                .class(styles.title)
                .attr('id', `${id}-title`)
                .children(title),
          h.dl
            .class(styles.list)
            .attrs({
              id: contentId,
              'aria-labelledby':
                title === undefined ? undefined : `${id}-title`,
              'data-slot': 'metadata-list-items',
              'data-layout': layout.kind,
              'data-stacked': layout.isStacked ? '' : undefined,
            })
            .style({ gridTemplateColumns: layout.tracks })
            .children(
              (expanded ? items : items.slice(0, cap)).map(
                ({ key, label, definition, icon }) =>
                  h.div
                    .key(key)
                    .class(styles.item)
                    .attrs({
                      'data-slot': 'metadata-list-item',
                      'data-stacked': layout.isStacked ? '' : undefined,
                    })
                    .children(
                      h.dt
                        .class(styles.term)
                        .children(
                          icon === undefined
                            ? undefined
                            : h.span
                                .class(styles.icon)
                                .attr('aria-hidden', 'true')
                                .children(icon),
                          label,
                        ),
                      h.dd.class(styles.definition).children(definition),
                    ),
              ),
            ),
          items.length <= cap
            ? undefined
            : toggle(
                h.button.class(styles.toggle).attrs({
                  'data-slot': 'metadata-list-toggle',
                  type: 'button',
                  'aria-controls': contentId,
                  'aria-expanded': String(expanded),
                }),
              ).children(expanded ? lessLabel : moreLabel),
        ),
  })
}
