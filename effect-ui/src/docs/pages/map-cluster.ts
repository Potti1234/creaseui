import { Map, MapClusterLayer, MapControls } from '#components'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView, munichPoints } from './map-shared'
import { exampleApplicationSource } from './source'

const Demo = createMapDemo('DocsMapClusterDemo', (h, model, kind, idPrefix) =>
  Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map cluster example in Munich',
    center: [11.576124, 48.137154],
    zoom: 11,
    toMessage: message => message as never,
    children: [
      MapControls(h),
      MapClusterLayer(h, {
        id: 'munich-locations',
        data: munichPoints,
        clusterRadius: kind === 'custom' ? 80 : 50,
        ...(kind === 'custom'
          ? { clusterColors: ['#0f766e', '#115e59', '#134e4a'] as const }
          : {}),
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
  imports: `import { Map, MapClusterLayer } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map cluster example in Munich',
  center: [11.576124, 48.137154],
  zoom: 11,
  toMessage: message => message,
  children: [MapClusterLayer(h, { id: 'locations', data })],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MapClusterLayer } from '@/ui/effect/ui'\n\nMapClusterLayer(h, { id, data })`,
  examples: [
    {
      title: 'Clustered locations',
      view: mapExampleView(Demo, 'clustered'),
      source,
    },
    {
      title: 'Custom cluster styling',
      view: mapExampleView(Demo, 'custom'),
      source,
    },
  ],
})
