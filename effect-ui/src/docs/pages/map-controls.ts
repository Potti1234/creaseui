import { Map, MapControls } from '#components'
import { defineComponentDocs } from '../types'
import { createMapDemo, mapExampleView } from './map-shared'
import { exampleApplicationSource } from './source'

const Demo = createMapDemo('DocsMapControlsDemo', (h, _model, kind, idPrefix) =>
  Map(h, {
    key: `${idPrefix}-map`,
    ariaLabel: 'map controls example in Munich',
    center: [11.576124, 48.137154],
    zoom: 11,
    toMessage: message => message as never,
    children: [
      MapControls(h, {
        showLocate: kind === 'location',
        showFullscreen: true,
        position: kind === 'location' ? 'bottom-left' : 'top-right',
      }),
    ],
  }),
)
const source = exampleApplicationSource({
  imports: `import { Map, MapControls } from '@/ui/effect/ui'`,
  body: `Map(h, {
  ariaLabel: 'map controls example in Munich',
  center: [11.576124, 48.137154],
  zoom: 11,
  toMessage: message => message,
  children: [MapControls(h, { showFullscreen: true })],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MapControls } from '@/ui/effect/ui'\n\nMapControls(h, { showFullscreen: true })`,
  examples: [
    {
      title: 'Navigation controls',
      view: mapExampleView(Demo, 'navigation'),
      source,
    },
    {
      title: 'Location and fullscreen',
      view: mapExampleView(Demo, 'location'),
      source,
    },
  ],
})
