import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Map, MapControls } from '#components'
import type { DocsExampleImplementation } from '../types'

export const initialMapViewport = {
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
export const MapDemoMessage = UiSchema.TaggedEnum({
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
  ToggledPopup: {},
  PickedSelect: { value: Schema.String },
  RequestedOpenSelect: {},
  RequestedCloseSelect: {},
})
export type MapDemoMessage = typeof MapDemoMessage.Type

export const munichRoute: ReadonlyArray<readonly [number, number]> = [
  [11.576124, 48.137154],
  [11.57595, 48.1381],
  [11.5767, 48.1386],
  [11.577, 48.1397],
  [11.5772, 48.1412],
  [11.577248, 48.142751],
]
export const munichRegion = {
  type: 'Feature' as const,
  properties: { name: 'Central Munich' },
  geometry: {
    type: 'Polygon' as const,
    coordinates: [
      [
        [11.55, 48.125],
        [11.605, 48.125],
        [11.605, 48.155],
        [11.55, 48.155],
        [11.55, 48.125],
      ],
    ],
  },
}
export const munichPoints = {
  type: 'FeatureCollection' as const,
  features: Array.from({ length: 120 }, (_, index) => ({
    type: 'Feature' as const,
    properties: { name: `Location ${index + 1}` },
    geometry: {
      type: 'Point' as const,
      coordinates: [
        11.49 + ((index * 37) % 120) / 700,
        48.097 + ((index * 53) % 120) / 1400,
      ],
    },
  })),
}

export const createMapDemo = (
  name: string,
  render: (
    h: Html.H<MapDemoMessage>,
    model: {
      viewport: typeof Viewport.Type
      detail: string
      longitude: number
      latitude: number
      popupOpen: boolean
      selected: string
      selectOpen: boolean
    },
    kind: string,
    idPrefix: string,
  ) => unknown,
) =>
  Html.component({
    name,
    props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
    model: Schema.Struct({
      viewport: Viewport,
      detail: Schema.String,
      longitude: Schema.Number,
      latitude: Schema.Number,
      popupOpen: Schema.Boolean,
      selected: Schema.String,
      selectOpen: Schema.Boolean,
    }),
    message: MapDemoMessage,
  }).make({
    init: () => ({
      viewport: initialMapViewport,
      detail: '',
      longitude: 11.576124,
      latitude: 48.137154,
      popupOpen: true,
      selected: 'positron',
      selectOpen: false,
    }),
    update: {
      MapLoaded: $ => $,
      MapFailed: ($, { reason }) => $.evolve({ detail: reason }),
      MapViewportChanged: ($, viewport) => $.evolve({ viewport }),
      MapClicked: $ => $,
      MapFeatureClicked: ($, { layerId, propertiesJson }) =>
        $.evolve({ detail: `Selected ${layerId}: ${propertiesJson}` }),
      MapMarkerDragged: ($, { longitude, latitude }) =>
        $.evolve({ longitude, latitude }),
      ResetViewport: $ => $.evolve({ viewport: initialMapViewport }),
      ToggledPopup: $ => $.evolve({ popupOpen: !$.model.popupOpen }),
      PickedSelect: ($, { value }) =>
        $.evolve({ selected: value, selectOpen: false }),
      RequestedOpenSelect: $ => $.evolve({ selectOpen: true }),
      RequestedCloseSelect: $ => $.evolve({ selectOpen: false }),
    },
    view: (h, model) =>
      render(h, model, h.props.kind, h.props.idPrefix) as never,
  })

export const mapExampleView =
  (component: any, kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div.class('w-full').children(
      component(h, {
        key: `${context.idPrefix}-${kind}`,
        props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
      }) as never,
    )

export const defaultMapChildren = (h: Html.H<any>) => [MapControls(h)]
export const mapSource = (imports: string, body: string) => ({ imports, body })
