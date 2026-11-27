import { Map, MapControls, MapGeoJSON } from '#components'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView, munichRegion } from './map-shared'
import { exampleApplicationSource } from './source'

const Demo = createMapDemo('DocsMapGeoJSONDemo', (h, model, kind, idPrefix) =>
  Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map geojson example in Munich',
    center: [11.576124, 48.137154],
    zoom: 11,
    ...(kind === 'blank' ? { blank: true } : {}),
    toMessage: message => message as never,
    children: [
      MapControls(h),
      MapGeoJSON(h, {
        id: 'central-munich',
        data: munichRegion,
        interactive: true,
        ...(kind === 'blank' ? { fillPaint: false } : {}),
      }),
      model.detail === ''
        ? undefined
        : h.div
            .class(
              'absolute right-3 bottom-10 left-3 z-10 max-h-20 overflow-auto rounded-md bg-background p-2 text-sm text-muted-foreground shadow-sm',
            )
            .attr('aria-live', 'polite')
            .children(model.detail),
    ],
  }),
)
const source = exampleApplicationSource({
  imports: `import { Map, MapGeoJSON } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map geojson example in Munich',
  center: [11.576124, 48.137154],
  zoom: 11,
  toMessage: message => message,
  children: [MapGeoJSON(h, { id: 'region', data, interactive: true })],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MapGeoJSON } from '@/ui/effect/ui'\n\nMapGeoJSON(h, { id, data })`,
  examples: [
    { title: 'Region overlay', view: mapExampleView(Demo, 'region'), source },
    {
      title: 'Blank map and outlines',
      view: mapExampleView(Demo, 'blank'),
      source,
    },
  ],
})
