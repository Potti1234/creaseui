import type { Html } from '@effect/ui/html'
import { MapArcBehavior, type MapArcProps } from '../behaviors/map-arc'
export { arcCoordinates } from '../behaviors/map-arc'
export const MapArc = <Msg>(h: Html.H<Msg>, options: MapArcProps) =>
  MapArcBehavior(options, h)
