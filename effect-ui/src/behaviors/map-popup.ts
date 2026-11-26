import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { mapTranslations, type MapTranslations } from './map-localization'

export type MapPopupProps<Msg, R = never> = {
  readonly longitude: number
  readonly latitude: number
  readonly ariaLabel: string
  readonly children: View.Children<Msg, R>
  readonly onClose?: Msg
  readonly language?: string
  readonly translations?: Partial<MapTranslations>
  readonly className?: string
}

type Classes = Partial<Record<'popup' | 'close', string>>

export const MapPopupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    longitude,
    latitude,
    ariaLabel,
    children,
    onClose,
    language,
    translations,
    className,
  }: MapPopupProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const popup = h.div.class(styles.popup, className).attrs({
    'data-slot': 'map-popup',
    role: 'dialog',
    'aria-label': ariaLabel,
    'data-map-coordinate': JSON.stringify([longitude, latitude]),
    'data-map-popup-config': JSON.stringify({ language, translations }),
  })
  return (
    onClose === undefined
      ? popup
      : popup.on(
          'keydown',
          ({ key }) => (key === 'Escape' ? onClose : undefined),
          { preventDefault: true },
        )
  ).children(
    children,
    onClose === undefined
      ? undefined
      : h.button
          .class(styles.close)
          .attrs({
            type: 'button',
            'data-slot': 'map-popup-close',
            'aria-label': mapTranslations(language, translations).close,
          })
          .on('click', onClose)
          .children('×'),
  )
}
