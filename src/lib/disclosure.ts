import { Effect, Option, Stream } from 'effect'
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

const openAttribute = 'data-disclosure-open'
const triggerAttribute = 'data-disclosure-trigger'
const heightProperty = '--crease-disclosure-height'
const transitionProperty = '--crease-disclosure-transition'

/** Observe the rendered open state and measure the panel's unconstrained content. */
export const bindPanel = (wrapper: HTMLElement): (() => void) => {
  const content = wrapper.firstElementChild
  const win = wrapper.ownerDocument.defaultView
  if (!(content instanceof HTMLElement) || win === null) return () => {}

  const motion = win.matchMedia('(prefers-reduced-motion: reduce)')
  const measure = () => {
    const height = `${content.offsetHeight}px`
    if (wrapper.style.getPropertyValue(heightProperty) !== height) {
      wrapper.style.setProperty(heightProperty, height)
    }
  }
  const updateMotion = () =>
    wrapper.style.setProperty(
      transitionProperty,
      motion.matches ? 'none' : 'height 200ms ease-out',
    )

  let wasOpen = wrapper.hasAttribute(openAttribute)
  let lostFocusOnClose = false
  const onFocusOut = (event: FocusEvent) => {
    if (
      wasOpen &&
      !wrapper.hasAttribute(openAttribute) &&
      event.relatedTarget === null
    ) {
      lostFocusOnClose = true
    }
  }
  const syncOpen = () => {
    const isOpen = wrapper.hasAttribute(openAttribute)
    if (wasOpen === isOpen) {
      lostFocusOnClose = false
      return
    }
    wasOpen = isOpen

    if (!isOpen && wrapper.isConnected) {
      const root = wrapper.getRootNode() as Document | ShadowRoot
      const active = root.activeElement
      const stranded =
        lostFocusOnClose &&
        (active === null || active === wrapper.ownerDocument.body)
      if (wrapper.contains(active) || stranded) {
        const triggerId = wrapper.getAttribute(triggerAttribute)
        const trigger =
          triggerId === null ? null : root.getElementById(triggerId)
        if (trigger instanceof HTMLElement)
          trigger.focus({ preventScroll: true })
      }
    }
    lostFocusOnClose = false
  }

  measure()
  updateMotion()
  motion.addEventListener('change', updateMotion)
  wrapper.addEventListener('focusout', onFocusOut)
  const stateObserver = new win.MutationObserver(syncOpen)
  stateObserver.observe(wrapper, {
    attributes: true,
    attributeFilter: [openAttribute],
  })
  const sizeObserver = new win.ResizeObserver(measure)
  sizeObserver.observe(content, { box: 'border-box' })

  return () => {
    stateObserver.disconnect()
    sizeObserver.disconnect()
    wrapper.removeEventListener('focusout', onFocusOut)
    motion.removeEventListener('change', updateMotion)
    wrapper.style.removeProperty(heightProperty)
    wrapper.style.removeProperty(transitionProperty)
  }
}

const panelMount = {
  name: 'ObserveDisclosurePanel',
  f: (element: Element) =>
    Stream.callback<never>(() =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() =>
            element instanceof HTMLElement ? bindPanel(element) : () => {},
          ),
          cleanup => Effect.sync(cleanup),
        )
        return yield* Effect.never
      }),
    ),
}

/** Controlled disclosure attributes shared by Accordion, Collapsible, and Banner. */
export const view = <Msg>(
  config: DisclosureConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const { id, isOpen, onToggle, isDisabled, ariaLabel, toView } = config
  const triggerId = `${id}-button`
  const panelId = `${id}-panel`
  const button = [
    h.Id(triggerId),
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
        h.DataAttribute('disclosure-trigger', triggerId),
        ...(isOpen ? [h.DataAttribute('disclosure-open', '')] : []),
        h.OnMount(panelMount),
        h.Style({
          height: isOpen ? `var(${heightProperty}, auto)` : '0px',
          transition: `var(${transitionProperty}, none)`,
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
