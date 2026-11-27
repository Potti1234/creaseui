import {
  Button,
  Map,
  MapControls,
  MapMarker,
  MapMarkerContent,
  MapMarkerLabel,
  MapMarkerTooltip,
  MapPopup,
} from '#components'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView, MapDemoMessage } from './map-shared'
import { exampleApplicationSource } from './source'

const Demo = createMapDemo('DocsMapPopupDemo', (h, model, kind, idPrefix) => {
  const standalone = kind === 'standalone'
  return Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map popup example in Munich',
    center: [11.576124, 48.137154],
    zoom: 14,
    toMessage: message => message as never,
    children: [
      MapControls(h),
      MapMarker(h, {
        id: 'marienplatz',
        longitude: 11.576124,
        latitude: 48.137154,
        ariaLabel: 'Marienplatz',
        onPress: MapDemoMessage.ToggledPopup(),
        children: [
          MapMarkerContent(h, { children: ['●'] }),
          MapMarkerLabel(h, { children: ['Marienplatz'] }),
        ],
      }) as never,
      standalone
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
      model.popupOpen
        ? (MapPopup(h, {
            longitude: 11.576124,
            latitude: 48.137154,
            ariaLabel: 'Place details',
            onClose: MapDemoMessage.ToggledPopup(),
            children: [
              h.p
                .class('font-semibold')
                .children(standalone ? 'Central Munich' : 'Marienplatz'),
              h.p.children('Explore this location on OpenFreeMap.'),
            ],
          }) as never)
        : undefined,
      standalone && !model.popupOpen
        ? h.div
            .class(
              'absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-lg bg-background p-2 text-sm text-foreground shadow-md',
            )
            .children(
              Button(h, {
                variant: 'outline',
                size: 'lg',
                onPress: MapDemoMessage.ToggledPopup(),
              }).children('Open popup'),
            )
        : undefined,
    ],
  })
})
const source = exampleApplicationSource({
  imports: `import { Map, MapMarker, MapPopup } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map popup example in Munich',
  center: [11.576124, 48.137154],
  zoom: 14,
  toMessage: message => message,
  children: [popupOpen ? MapPopup(h, { longitude, latitude, ariaLabel: 'Place details', children }) : undefined],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MapPopup } from '@/ui/effect/ui'\n\nMapPopup(h, { longitude, latitude, ariaLabel, children })`,
  examples: [
    { title: 'Marker popup', view: mapExampleView(Demo, 'marker'), source },
    {
      title: 'Standalone popup',
      view: mapExampleView(Demo, 'standalone'),
      source,
    },
  ],
})
