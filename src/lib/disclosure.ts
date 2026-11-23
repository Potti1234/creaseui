import { Option } from 'effect'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

type DisclosureParts<Msg> = Readonly<{
  button: ReadonlyArray<Attribute<Msg>>
  panel: ReadonlyArray<Attribute<Msg>>
  animatePanel: (content: Html) => Html
}>

type DisclosureConfig<Msg> = Readonly<{
  id: string
  isOpen: boolean
  onToggle: (isOpen: boolean) => Msg
  isDisabled?: boolean
  ariaLabel?: string
  toView: (parts: DisclosureParts<Msg>) => Html
}>

/** Controlled disclosure attributes shared by Accordion, Collapsible, and Banner. */
export const view = <Msg>(
  config: DisclosureConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const { id, isOpen, onToggle, isDisabled, ariaLabel, toView } = config
  const panelId = `${id}-panel`
  const button = [
    h.Id(`${id}-button`),
    h.Type('button'),
    h.AriaExpanded(isOpen),
    ...(isOpen ? [h.AriaControls(panelId), h.DataAttribute('open', '')] : []),
    ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
    h.Tabindex(0),
    ...(isDisabled
      ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
      : [
          h.OnClick(onToggle(!isOpen)),
          h.OnKeyDownPreventDefault(key =>
            key === 'Enter' || key === ' '
              ? Option.some(onToggle(!isOpen))
              : Option.none(),
          ),
        ]),
  ]
  const panel = [
    h.Id(panelId),
    ...(isOpen ? [h.DataAttribute('open', '')] : []),
  ]

  // Keep the panel mounted for the height transition and hide its contents
  // from keyboard navigation and assistive technology as soon as it closes.
  const animatePanel = (content: Html): Html =>
    h.div(
      [
        h.Style({
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease-out',
          overflow: 'hidden',
        }),
      ],
      [
        h.div(
          [
            h.Style({ minHeight: '0px', overflow: 'hidden' }),
            ...(isOpen ? [] : [h.Inert(true), h.AriaHidden(true)]),
          ],
          [content],
        ),
      ],
    )

  return toView({ button, panel, animatePanel })
}
