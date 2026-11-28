import { Map, MapControls, Select } from '#components'
import { MAP_PALETTES, OPENFREEMAP_STYLES } from '../../behaviors/map-style'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView, MapDemoMessage } from './map-shared'
import { exampleApplicationSource } from './source'

const labels: Record<string, string> = {
  positron: 'Positron',
  liberty: 'Liberty',
  bright: 'Bright',
  dark: 'Dark',
  cool: 'Cool',
  warm: 'Warm',
}
const Demo = createMapDemo('DocsMapStylesDemo', (h, model, kind, idPrefix) => {
  const custom = kind === 'custom'
  const selected =
    custom && model.selected === 'positron' ? 'cool' : model.selected
  const values = custom
    ? ['cool', 'warm']
    : ['positron', 'liberty', 'bright', 'dark']
  const style =
    OPENFREEMAP_STYLES[selected as keyof typeof OPENFREEMAP_STYLES] ??
    OPENFREEMAP_STYLES.positron
  return Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map styles example in Munich',
    center: [11.576124, 48.137154],
    zoom: 11,
    ...(custom
      ? {
          themed: true,
          palette: {
            ...MAP_PALETTES.light,
            water: selected === 'warm' ? '#b9d9ca' : '#b9cde8',
            park: selected === 'warm' ? '#e4ead9' : '#e2eaf4',
            bg: selected === 'warm' ? '#fcf7ef' : '#f0f4fa',
            landuse: selected === 'warm' ? '#f1ebdf' : '#e8eef6',
          },
        }
      : { styles: { light: style, dark: style } }),
    toMessage: message => message as never,
    children: [
      MapControls(h),
      h.div
        .class(
          'absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-lg bg-background p-2 text-sm text-foreground shadow-md',
        )
        .children(
          h.div.class('flex items-center gap-3').children(
            h.label
              .attr('for', `${idPrefix}-style-button`)
              .children('Map style'),
            Select(h, {
              key: `${idPrefix}-style`,
              ariaLabel: 'Map style',
              props: {
                open: model.selectOpen,
                items: values.map(value => ({ value, label: labels[value]! })),
                value: selected,
              },
              onEmit: {
                Picked: ({ value }) =>
                  typeof value === 'string'
                    ? MapDemoMessage.PickedSelect({ value })
                    : undefined,
                RequestedOpen: () => MapDemoMessage.RequestedOpenSelect(),
                RequestedClose: () => MapDemoMessage.RequestedCloseSelect(),
                Settled: () => undefined,
              },
            }) as never,
          ),
        ),
    ],
  })
})
const source = exampleApplicationSource({
  imports: `import { Map, Select, OPENFREEMAP_STYLES } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map styles example in Munich',
  center: [11.576124, 48.137154],
  zoom: 11,
  styles: { light: OPENFREEMAP_STYLES[selected], dark: OPENFREEMAP_STYLES[selected] },
  toMessage: message => message,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { OPENFREEMAP_STYLES } from '@/ui/effect/ui'\n\nMap(h, { styles, toMessage })`,
  examples: [
    { title: 'Basemap styles', view: mapExampleView(Demo, 'basemap'), source },
    { title: 'Custom palette', view: mapExampleView(Demo, 'custom'), source },
  ],
})
