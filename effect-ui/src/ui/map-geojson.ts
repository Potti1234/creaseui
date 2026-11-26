import type { Html } from '@effect/ui/html'
import {
  MapGeoJSONBehavior,
  type MapGeoJSONProps,
} from '../behaviors/map-geojson'
export const MapGeoJSON = <Msg>(h: Html.H<Msg>, options: MapGeoJSONProps) =>
  MapGeoJSONBehavior(options, h)
