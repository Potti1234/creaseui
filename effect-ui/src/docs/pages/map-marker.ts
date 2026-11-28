import {
  Map,
  MapControls,
  MapMarker,
  MapMarkerContent,
  MapMarkerLabel,
  MapMarkerTooltip,
} from '#components'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView, MapDemoMessage } from './map-shared'
import { exampleApplicationSource } from './source'

const Demo = createMapDemo('DocsMapMarkerDemo', (h, model, kind, idPrefix) => {
  const draggable = kind === 'draggable'
  const readout = draggable
    ? `Drag the marker · ${model.longitude.toFixed(4)}, ${model.latitude.toFixed(4)}`
    : ''
  return Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map marker example in Munich',
    center: [11.576124, 48.137154],
    zoom: 14,
    toMessage: message => message as never,
    children: [
      MapControls(h),
      MapMarker(h, {
        id: 'marienplatz',
        longitude: draggable ? model.longitude : 11.576124,
        latitude: draggable ? model.latitude : 48.137154,
        ariaLabel: 'Marienplatz',
        ...(draggable ? { draggable: true } : {}),
        children: [
          MapMarkerContent(h, { children: ['●'] }),
          MapMarkerLabel(h, { children: ['Marienplatz'] }),
        ],
      }) as never,
      draggable
        ? undefined
        : (MapMarker(h, {
            id: 'odeonsplatz',
            longitude: 11.577248,
            latitude: 48.142751,
            ariaLabel: 'Odeonsplatz',
            children: [
              MapMarkerContent(h, { children: ['●'] }),
              MapMarkerTooltip(h, { children: ['Odeonsplatz'] }),
            ],
          }) as never),
      readout === ''
        ? undefined
        : h.div
            .class(
              'absolute right-3 bottom-10 left-3 z-10 max-h-20 overflow-auto rounded-md bg-background p-2 shadow-sm',
            )
            .attr('aria-live', 'polite')
            .children(
              h.p
                .class('text-sm text-muted-foreground tabular-nums')
                .children(readout),
            ),
    ],
  })
})
const source = exampleApplicationSource({
  imports: `import { Map, MapMarker, MapMarkerContent, MapMarkerLabel } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map marker example in Munich',
  center: [11.576124, 48.137154],
  zoom: 14,
  toMessage: message => message,
  children: [MapMarker(h, { id: 'gate', longitude, latitude, ariaLabel: 'Marienplatz', children })],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MapMarker } from '@/ui/effect/ui'\n\nMapMarker(h, { id, longitude, latitude, ariaLabel, children })`,
  examples: [
    {
      title: 'Markers and labels',
      view: mapExampleView(Demo, 'markers'),
      source,
    },
    {
      title: 'Draggable marker',
      view: mapExampleView(Demo, 'draggable'),
      source,
    },
  ],
})
