import {
  Map,
  MapControls,
  MapMarker,
  MapMarkerContent,
  MapMarkerLabel,
  MapMarkerTooltip,
  MapRoute,
} from '#components'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView, munichRoute } from './map-shared'
import { exampleApplicationSource } from './source'

const marker = (
  h: any,
  id: string,
  longitude: number,
  latitude: number,
  label: string,
  tooltip = false,
) =>
  MapMarker(h, {
    id,
    longitude,
    latitude,
    ariaLabel: label,
    children: [
      MapMarkerContent(h, { children: ['●'] }),
      tooltip
        ? MapMarkerTooltip(h, { children: [label] })
        : MapMarkerLabel(h, { children: [label] }),
    ],
  })
const Demo = createMapDemo('DocsMapRouteDemo', (h, _model, kind, idPrefix) =>
  Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map route example in Munich',
    center: [11.576124, 48.137154],
    zoom: 14,
    toMessage: message => message as never,
    children: [
      MapControls(h),
      marker(h, 'marienplatz', 11.576124, 48.137154, 'Marienplatz') as never,
      marker(
        h,
        'odeonsplatz',
        11.577248,
        48.142751,
        'Odeonsplatz',
        true,
      ) as never,
      MapRoute(h, {
        id: 'munich-route',
        coordinates: munichRoute,
        ...(kind === 'dashed' ? { dashArray: [2, 2], color: '#0f766e' } : {}),
        interactive: true,
      }),
    ],
  }),
)
const source = exampleApplicationSource({
  imports: `import { Map, MapRoute } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map route example in Munich',
  center: [11.576124, 48.137154],
  zoom: 14,
  toMessage: message => message,
  children: [MapRoute(h, { id: 'route', coordinates, interactive: true })],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MapRoute } from '@/ui/effect/ui'\n\nMapRoute(h, { id, coordinates })`,
  examples: [
    {
      title: 'Route between landmarks',
      view: mapExampleView(Demo, 'route'),
      source,
    },
    { title: 'Dashed route', view: mapExampleView(Demo, 'dashed'), source },
  ],
})
