import type { Html } from '@effect/ui/html'
import {
  MapClusterBehavior,
  type MapClusterLayerProps,
} from '../behaviors/map-cluster'
export const MapClusterLayer = <Msg>(
  h: Html.H<Msg>,
  options: MapClusterLayerProps,
) => MapClusterBehavior(options, h)
