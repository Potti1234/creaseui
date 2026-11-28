import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type MapMarkerProps<Msg, R = never> = {
  readonly id: string
  readonly longitude: number
  readonly latitude: number
  readonly ariaLabel: string
  readonly draggable?: boolean
  readonly onPress?: Msg
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}
type Classes = Partial<
  Record<'marker' | 'markerContent' | 'label' | 'tooltip', string>
>

export const MapMarkerBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    longitude,
    latitude,
    ariaLabel,
    draggable,
    onPress,
    className,
    children,
  }: MapMarkerProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const control = h.button
    .key(id)
    .class(styles.marker, className)
    .attrs({
      type: 'button',
      'aria-label': ariaLabel,
      'data-slot': 'map-marker',
      'data-map-marker-id': id,
      'data-map-coordinate': JSON.stringify([longitude, latitude]),
      'data-map-draggable': String(draggable ?? false),
    })
  return (
    onPress === undefined ? control : control.on('click', onPress)
  ).children(
    children ?? [
      h.span
        .class(styles.markerContent)
        .attr('aria-hidden', 'true')
        .children('●'),
    ],
  )
}

export type MapMarkerPartProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}

export const MapMarkerPartBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { children, className }: MapMarkerPartProps<NoInfer<Msg>, R>,
  part: 'markerContent' | 'label' | 'tooltip',
  styles: Classes = {},
) =>
  h.span
    .class(styles[part], className)
    .attrs({
      'data-slot':
        part === 'markerContent' ? 'map-marker-content' : `map-marker-${part}`,
      role: part === 'tooltip' ? 'tooltip' : undefined,
    })
    .children(children)
