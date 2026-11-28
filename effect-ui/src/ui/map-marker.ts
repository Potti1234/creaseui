import type { Html } from '@effect/ui/html'
import {
  MapMarkerBehavior,
  MapMarkerPartBehavior,
  type MapMarkerPartProps,
  type MapMarkerProps,
} from '../behaviors/map-marker'
import { mapClasses, type MapClasses } from './map'

export const MapMarker = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MapMarkerProps<NoInfer<Msg>, R>,
  styles: MapClasses = mapClasses,
) => MapMarkerBehavior(h, options, styles)
export const MapMarkerContent = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MapMarkerPartProps<NoInfer<Msg>, R>,
  styles: MapClasses = mapClasses,
) => MapMarkerPartBehavior(h, options, 'markerContent', styles)
export const MapMarkerLabel = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MapMarkerPartProps<NoInfer<Msg>, R>,
  styles: MapClasses = mapClasses,
) => MapMarkerPartBehavior(h, options, 'label', styles)
export const MapMarkerTooltip = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MapMarkerPartProps<NoInfer<Msg>, R>,
  styles: MapClasses = mapClasses,
) => MapMarkerPartBehavior(h, options, 'tooltip', styles)
