import { Map, MapArc, MapControls } from '#components'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView } from './map-shared'
import { exampleApplicationSource } from './source'

const Demo = createMapDemo('DocsMapArcDemo', (h, _model, kind, idPrefix) =>
  Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map arc example in Munich',
    center: [11.576124, 48.137154],
    zoom: 4,
    toMessage: message => message as never,
    children: [
      MapControls(h),
      MapArc(h, {
        id: 'munich-paris',
        from: [11.576124, 48.137154],
        to: [2.3522, 48.8566],
        curvature: kind === 'reverse' ? -0.3 : 0.2,
        color: kind === 'reverse' ? '#0f766e' : '#2563eb',
        interactive: true,
      }),
    ],
  }),
)
const source = exampleApplicationSource({
  imports: `import { Map, MapArc } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map arc example in Munich',
  center: [11.576124, 48.137154],
  zoom: 4,
  toMessage: message => message,
  children: [MapArc(h, { id: 'arc', from, to, curvature: 0.2 })],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MapArc } from '@/ui/effect/ui'\n\nMapArc(h, { id, from, to })`,
  examples: [
    { title: 'City connection', view: mapExampleView(Demo, 'city'), source },
    {
      title: 'Reverse curvature',
      view: mapExampleView(Demo, 'reverse'),
      source,
    },
  ],
})
