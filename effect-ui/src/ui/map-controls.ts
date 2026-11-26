import type { Html } from '@effect/ui/html'
import {
  MapControlsBehavior,
  type MapControlsProps,
} from '../behaviors/map-controls'
import { mapClasses, type MapClasses } from './map'

export const MapControls = <Msg>(
  h: Html.H<Msg>,
  options: MapControlsProps = {},
  styles: MapClasses = mapClasses,
) => MapControlsBehavior(h, options, styles)
