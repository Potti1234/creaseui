import type { Html } from '@effect/ui/html'

import { mapTranslations, type MapTranslations } from './map-localization'

export type MapControlsProps = {
  readonly position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  readonly showZoom?: boolean
  readonly showCompass?: boolean
  readonly showLocate?: boolean
  readonly showFullscreen?: boolean
  readonly language?: string
  readonly translations?: Partial<MapTranslations>
  readonly className?: string
}

type Classes = Partial<Record<'controlGroup' | 'control', string>>

export const MapControlsBehavior = <Msg>(
  h: Html.H<Msg>,
  props: MapControlsProps,
  styles: Classes = {},
) => {
  const {
    position = 'top-right',
    language,
    translations,
    showZoom,
    showCompass,
    showLocate,
    showFullscreen,
    className,
    ...config
  } = props
  const text = mapTranslations(language, translations)
  const button = (action: string, label: string, symbol: string) =>
    h.button
      .key(action)
      .class(styles.control)
      .attrs({
        type: 'button',
        'data-map-action': action,
        'aria-label': label,
        title: label,
      })
      .children(h.span.attr('aria-hidden', 'true').children(symbol))
  return h.div
    .class(styles.controlGroup, className)
    .attrs({
      role: 'group',
      'aria-label': text.controls,
      'data-slot': 'map-controls',
      'data-map-controls-config': JSON.stringify({
        ...config,
        position,
        language,
        translations,
        showZoom,
        showCompass,
        showLocate,
        showFullscreen,
      }),
    })
    .style({
      ...(position.endsWith('left') ? { left: '12px' } : { right: '12px' }),
      ...(position.startsWith('bottom') ? { bottom: '32px' } : { top: '12px' }),
    })
    .children(
      showZoom === false ? undefined : button('zoom-in', text.zoomIn, '+'),
      showZoom === false ? undefined : button('zoom-out', text.zoomOut, '−'),
      showCompass === false
        ? undefined
        : button('north', text.resetBearing, '↑'),
      showLocate ? button('locate', text.locate, '◎') : undefined,
      showFullscreen ? button('fullscreen', text.fullscreen, '⛶') : undefined,
    )
}
