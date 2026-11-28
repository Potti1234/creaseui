import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Map, MapControls } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const initialViewport = {
  center: [11.576124, 48.137154] as readonly [number, number],
  zoom: 11,
  bearing: 0,
  pitch: 0,
}
const Viewport = Schema.Struct({
  center: Schema.Tuple([Schema.Number, Schema.Number]),
  zoom: Schema.Number,
  bearing: Schema.Number,
  pitch: Schema.Number,
})
const Message = UiSchema.TaggedEnum({
  MapLoaded: {},
  MapFailed: { reason: Schema.String },
  MapViewportChanged: Viewport.fields,
  MapClicked: { longitude: Schema.Number, latitude: Schema.Number },
  MapFeatureClicked: {
    layerId: Schema.String,
    propertiesJson: Schema.String,
    longitude: Schema.Number,
    latitude: Schema.Number,
  },
  MapMarkerDragged: {
    id: Schema.String,
    longitude: Schema.Number,
    latitude: Schema.Number,
  },
  ResetViewport: {},
})
const MapDemo = Html.component({
  name: 'DocsMapDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ viewport: Viewport, detail: Schema.String }),
  message: Message,
}).make({
  init: () => ({ viewport: initialViewport, detail: '' }),
  update: {
    MapLoaded: $ => $,
    MapFailed: ($, { reason }) => $.evolve({ detail: reason }),
    MapViewportChanged: ($, viewport) => $.evolve({ viewport }),
    MapClicked: $ => $,
    MapFeatureClicked: ($, { layerId, propertiesJson }) =>
      $.evolve({ detail: `Selected ${layerId}: ${propertiesJson}` }),
    MapMarkerDragged: $ => $,
    ResetViewport: $ => $.evolve({ viewport: initialViewport }),
  },
  view: (h, model) => {
    const controlled = h.props.kind === 'controlled'
    const readout = controlled
      ? `Longitude ${model.viewport.center[0].toFixed(3)} · Latitude ${model.viewport.center[1].toFixed(3)} · Zoom ${model.viewport.zoom.toFixed(1)}`
      : model.detail
    return Map(h, {
      key: `${h.props.idPrefix}-map`,
      ariaLabel: `map example in Munich`,
      center: initialViewport.center,
      zoom: initialViewport.zoom,
      ...(controlled ? { viewport: model.viewport } : {}),
      toMessage: message => message as never,
      children: [
        MapControls(h),
        controlled
          ? h.div
              .class(
                'absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-lg bg-background p-2 text-sm text-foreground shadow-md',
              )
              .children(
                Button(h, {
                  variant: 'outline',
                  size: 'lg',
                  onPress: Message.ResetViewport(),
                }).children('Reset view'),
              )
          : undefined,
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
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div.class('w-full').children(
      MapDemo(h, {
        key: `${context.idPrefix}-${kind}`,
        props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
      }) as never,
    )

const source = exampleApplicationSource({
  imports: `import { Map, MapControls } from '@/ui/effect/ui'`,
  body: `Map(h, {
  key: 'munich-map',
  ariaLabel: 'map example in Munich',
  center: [11.576124, 48.137154],
  zoom: 11,
  toMessage: message => message,
  children: [MapControls(h)],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Map, MapControls } from '@/ui/effect/ui'\n\nMap(h, { ariaLabel, center, zoom, toMessage, children })`,
  examples: [
    { title: 'Basic map', view: view('basic'), source },
    { title: 'Controlled viewport', view: view('controlled'), source },
  ],
})
