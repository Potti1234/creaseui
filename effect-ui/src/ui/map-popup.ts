import type { Html } from '@effect/ui/html'
import { MapPopupBehavior, type MapPopupProps } from '../behaviors/map-popup'
import { mapClasses, type MapClasses } from './map'

export const MapPopup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MapPopupProps<NoInfer<Msg>, R>,
  styles: MapClasses = mapClasses,
) => MapPopupBehavior(h, options, styles)
