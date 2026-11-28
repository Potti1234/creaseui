import type { Html } from '@effect/ui/html'
import { MapRouteBehavior, type MapRouteProps } from '../behaviors/map-route'
export const MapRoute = <Msg>(h: Html.H<Msg>, options: MapRouteProps) =>
  MapRouteBehavior(options, h)
