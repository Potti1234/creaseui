import { Effect, Option, Queue, Schema, Stream } from 'effect'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { childAttributes } from 'foldkit/html'
import type { ChildAttribute, Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { defineView } from 'foldkit/submodel'
import type * as Update from 'foldkit/update'

import * as Animation from './animation'
import * as Layer from './layer'
import * as Popup from './popup'
import * as Position from './position'

export type AnchorConfig = Position.AnchorConfig

export const Model = Schema.Struct({
  id: Schema.String,
  isOpen: Schema.Boolean,
  isAnimated: Schema.Boolean,
  isModal: Schema.Boolean,
  contentFocus: Schema.Boolean,
  animation: Animation.Model,
  maybeLastButtonPointerType: Schema.Option(Schema.String),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  RequestedOpen: {},
  RequestedClose: {},
  BlurredPanel: {},
  PressedPointerOnButton: { pointerType: Schema.String, button: Schema.Number },
  CompletedFocusPanel: {},
  CompletedFocusButton: {},
  CompletedLockScroll: {},
  CompletedUnlockScroll: {},
  CompletedInertOthers: {},
  CompletedRestoreInert: {},
  IgnoredMouseClick: {},
  SuppressedSpaceScroll: {},
  CompletedAnchorPopover: {},
  CompletedPortalPopoverBackdrop: {},
  GotAnimationMessage: { message: Animation.Message },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({ Opened: {}, Closed: {} })
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{
  id: string
  isAnimated?: boolean
  isModal?: boolean
  contentFocus?: boolean
}>

export const buttonId = (id: string) => id + '-button'
export const arrowId = (id: string) => id + '-arrow'
const panelId = (id: string) => id + '-panel'
const backdropId = (id: string) => id + '-backdrop'
const selector = (id: string) => '#' + CSS.escape(id)

export const init = (config: InitConfig): Model => ({
  id: config.id,
  isOpen: false,
  isAnimated: config.isAnimated ?? false,
  isModal: config.isModal ?? false,
  contentFocus: config.contentFocus ?? false,
  animation: Animation.init({ id: panelId(config.id) }),
  maybeLastButtonPointerType: Option.none(),
})

export const LockScroll = Command.define('LockScroll', {
  messages: [Message.CompletedLockScroll],
  execute: Dom.lockScroll.pipe(Effect.as(Message.CompletedLockScroll())),
})

export const UnlockScroll = Command.define('UnlockScroll', {
  messages: [Message.CompletedUnlockScroll],
  execute: Dom.unlockScroll.pipe(Effect.as(Message.CompletedUnlockScroll())),
})

export const InertOthers = Command.define('InertOthers', {
  args: { id: Schema.String },
  messages: [Message.CompletedInertOthers],
  execute: ({ id }) =>
    Effect.suspend(() =>
      Dom.inertOthers(id, [
        selector(buttonId(id)),
        selector(panelId(id)),
        selector(backdropId(id)),
      ]),
    ).pipe(Effect.as(Message.CompletedInertOthers())),
})

export const RestoreInert = Command.define('RestoreInert', {
  args: { id: Schema.String },
  messages: [Message.CompletedRestoreInert],
  execute: ({ id }) =>
    Dom.restoreInert(id).pipe(Effect.as(Message.CompletedRestoreInert())),
})

export const FocusButton = Command.define('FocusButton', {
  args: { id: Schema.String },
  messages: [Message.CompletedFocusButton],
  execute: ({ id }) =>
    Effect.suspend(() =>
      Dom.focus(selector(buttonId(id)), { preventScroll: true }),
    ).pipe(Effect.ignore, Effect.as(Message.CompletedFocusButton())),
})

export const DetectMovementOrAnimationEnd = Command.define(
  'DetectMovementOrAnimationEnd',
  {
    args: { id: Schema.String, generation: Schema.Number },
    messages: [Message.GotAnimationMessage],
    execute: ({ id, generation }) =>
      Effect.suspend(() =>
        Effect.raceFirst(
          Dom.detectElementMovement(selector(buttonId(id))),
          Dom.waitForAnimationSettled(selector(panelId(id))),
        ),
      ).pipe(
        Effect.as(
          Message.GotAnimationMessage({
            message: Animation.Message.EndedAnimation({ generation }),
          }),
        ),
      ),
  },
)

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const animate = (
  model: Model,
  result: ReturnType<typeof Animation.update>,
): UpdateReturn => ({
  model: { ...model, animation: result.model },
  commands: [
    ...Command.mapMessages(result.commands ?? [], message =>
      Message.GotAnimationMessage({ message }),
    ),
    ...(result.outMessage?._tag === 'StartedLeaveAnimating'
      ? [
          DetectMovementOrAnimationEnd({
            id: model.id,
            generation: result.outMessage.generation,
          }),
        ]
      : []),
  ],
})

const changeOpen = (
  model: Model,
  isOpen: boolean,
  restoreFocus = true,
): UpdateReturn => {
  const result = Popup.update(
    Popup.init({ defaultOpen: model.isOpen }),
    isOpen
      ? Popup.Message.RequestedOpen({ reason: 'programmatic' })
      : Popup.Message.RequestedClose({ reason: 'programmatic' }),
  )
  if (!result.outMessage) return { model }

  const next = {
    ...model,
    isOpen: result.model.isOpen,
    maybeLastButtonPointerType: isOpen
      ? model.maybeLastButtonPointerType
      : Option.none(),
  }
  const transition = model.isAnimated
    ? animate(
        next,
        Animation.update(
          model.animation,
          isOpen ? Animation.Message.Showed() : Animation.Message.Hid(),
        ),
      )
    : { model: next }
  const commands = isOpen
    ? model.isModal
      ? [LockScroll(), InertOthers({ id: model.id })]
      : []
    : [
        ...(restoreFocus ? [FocusButton({ id: model.id })] : []),
        ...(model.isModal
          ? [UnlockScroll(), RestoreInert({ id: model.id })]
          : []),
      ]
  return {
    model: transition.model,
    commands: [...commands, ...(transition.commands ?? [])],
    outMessage: isOpen ? OutMessage.Opened() : OutMessage.Closed(),
  }
}

const usedMouse = (model: Model) =>
  Option.exists(model.maybeLastButtonPointerType, type => type === 'mouse')

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'RequestedOpen':
      return changeOpen(model, true)
    case 'RequestedClose':
      return changeOpen(model, false)
    case 'BlurredPanel':
      return usedMouse(model) ? { model } : changeOpen(model, false, false)
    case 'PressedPointerOnButton': {
      const pointer = Option.some(message.pointerType)
      if (message.pointerType !== 'mouse' || message.button !== 0)
        return { model: { ...model, maybeLastButtonPointerType: pointer } }

      const result = changeOpen(model, !model.isOpen)
      return {
        ...result,
        model: { ...result.model, maybeLastButtonPointerType: pointer },
      }
    }
    case 'IgnoredMouseClick':
      return { model: { ...model, maybeLastButtonPointerType: Option.none() } }
    case 'GotAnimationMessage':
      return animate(model, Animation.update(model.animation, message.message))
    default:
      return { model }
  }
}

export const open = (model: Model): UpdateReturn =>
  update(model, Message.RequestedOpen())
export const close = (model: Model): UpdateReturn =>
  update(model, Message.RequestedClose())

export const PortalPopoverBackdrop = Mount.define('PortalPopoverBackdrop', {
  messages: [Message.CompletedPortalPopoverBackdrop],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() => Position.portalBackdrop(element)),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedPortalPopoverBackdrop())),
})

const inheritTheme = (source: Element, panel: HTMLElement, win: Window) => {
  const nonInherited = new Set<string>()
  const visit = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (
        'inherits' in rule &&
        rule.inherits === false &&
        'name' in rule &&
        typeof rule.name === 'string'
      )
        nonInherited.add(rule.name)
      if ('cssRules' in rule && rule.cssRules instanceof CSSRuleList)
        visit(rule.cssRules)
    }
  }
  for (const sheet of panel.ownerDocument.styleSheets) {
    try {
      visit(sheet.cssRules)
    } catch {
      // Cross-origin stylesheets do not expose their rules.
    }
  }

  const saved = new Map<string, { value: string; priority: string }>()
  const restore = (
    name: string,
    previous: { value: string; priority: string },
  ) => panel.style.setProperty(name, previous.value, previous.priority)
  const refresh = () => {
    const computed = win.getComputedStyle(source)
    const names = ['font-family', 'color-scheme']
    if (!panel.hasAttribute('dir')) names.push('direction')
    for (let index = 0; index < computed.length; index++) {
      const name = computed.item(index)
      if (name.startsWith('--') && !nonInherited.has(name)) names.push(name)
    }

    const current = new Set(names)
    for (const [name, previous] of saved) {
      if (current.has(name)) continue
      restore(name, previous)
      saved.delete(name)
    }
    for (const name of current) {
      if (!saved.has(name))
        saved.set(name, {
          value: panel.style.getPropertyValue(name),
          priority: panel.style.getPropertyPriority(name),
        })
      panel.style.setProperty(name, computed.getPropertyValue(name))
    }
  }
  refresh()
  const observer = new MutationObserver(refresh)
  for (
    let ancestor: Element | null = source;
    ancestor;
    ancestor = ancestor.parentElement
  )
    observer.observe(ancestor, {
      attributes: true,
      attributeFilter: ['class', 'style', 'dir'],
    })
  return () => {
    observer.disconnect()
    for (const [name, previous] of saved) restore(name, previous)
  }
}

export const AnchorPopover = Mount.defineStream('AnchorPopover', {
  args: {
    id: Schema.String,
    anchor: Position.AnchorConfig,
    isModal: Schema.Boolean,
    themedPortal: Schema.Boolean,
    focusSelector: Schema.optionalKey(Schema.String),
    arrowPadding: Schema.optionalKey(Schema.Number),
  },
  messages: [Message.CompletedAnchorPopover, Message.RequestedClose],
  execute: ({
    element,
    id,
    anchor,
    isModal,
    themedPortal,
    focusSelector,
    arrowPadding,
  }) =>
    Stream.callback<
      ReturnType<
        typeof Message.CompletedAnchorPopover | typeof Message.RequestedClose
      >
    >(queue =>
      Effect.gen(function* () {
        const win = element.ownerDocument.defaultView
        const root = element.getRootNode()
        if (
          !win ||
          !(element instanceof win.HTMLElement) ||
          !(root instanceof win.Document || root instanceof win.ShadowRoot)
        )
          return
        const trigger = root.getElementById(buttonId(id))
        if (!trigger) return

        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const parent = element.parentElement
            const releaseTheme =
              themedPortal && parent
                ? inheritTheme(parent, element, win)
                : undefined
            const releasePortal =
              themedPortal || anchor.portal !== false
                ? Position.portalToContainingRoot(element)
                : undefined
            let frame: number | undefined
            let placed = false
            let releaseLayer: (() => void) | undefined
            const syncOpen = () => {
              if (element.hasAttribute('data-leave')) {
                if (frame !== undefined) win.cancelAnimationFrame(frame)
                releaseLayer?.()
                releaseLayer = undefined
                return
              }
              if (!placed || releaseLayer) return
              releaseLayer = Layer.bindLayer(element, {
                modal: isModal,
                contains: target =>
                  trigger.contains(target) ||
                  // Backdrop clicks retain their existing click timing.
                  root.getElementById(backdropId(id))?.contains(target) ===
                    true,
                onDismiss: () =>
                  Queue.offerUnsafe(queue, Message.RequestedClose()),
              })
              frame = win.requestAnimationFrame(() => {
                if (!element.isConnected || element.hasAttribute('data-leave'))
                  return
                const target =
                  focusSelector === undefined
                    ? element
                    : (element.querySelector(focusSelector) ??
                      root.querySelector(focusSelector))
                if (target instanceof win.HTMLElement)
                  target.focus({ preventScroll: true })
              })
            }
            const onPlaced = () => {
              if (placed) return
              placed = true
              element.style.removeProperty('visibility')
              syncOpen()
            }
            // Keep positioning through exit, and stop dismissing while it runs.
            const observer = new win.MutationObserver(syncOpen)
            observer.observe(element, {
              attributes: true,
              attributeFilter: ['data-leave'],
            })

            const arrow = element.querySelector(selector(arrowId(id)))
            if (!arrow) {
              element.style.overflowY = 'auto'
              element.style.overscrollBehavior = 'none'
            }
            // Native positioning takes scalar padding and always allows flips.
            const legacyPosition =
              anchor.isPlacementLocked === true ||
              typeof anchor.padding === 'object'
            const releasePosition = legacyPosition
              ? Position.bindAnchor(element, {
                  buttonId: buttonId(id),
                  anchor: { ...anchor, portal: false },
                  interceptTab: false,
                  arrowId: arrowId(id),
                  ...(arrowPadding === undefined ? {} : { arrowPadding }),
                })
              : Position.position(trigger, element, {
                  side: (anchor.placement?.split('-')[0] ??
                    'bottom') as Position.Side,
                  align: (anchor.placement?.split('-')[1] ??
                    (anchor.placement ? 'center' : 'start')) as Position.Align,
                  sideOffset: anchor.gap ?? 0,
                  alignOffset: anchor.offset ?? 0,
                  collisionPadding: anchor.padding ?? 0,
                  arrowPadding: arrowPadding ?? 0,
                  arrow,
                  onPlaced: placement => {
                    element.dataset.placement = placement.split('-')[0]
                    element.style.setProperty(
                      '--button-width',
                      trigger.getBoundingClientRect().width + 'px',
                    )
                    onPlaced()
                  },
                })
            const legacyObserver = legacyPosition
              ? new win.MutationObserver(() => {
                  if (element.hasAttribute('data-placement')) onPlaced()
                })
              : undefined
            legacyObserver?.observe(element, {
              attributes: true,
              attributeFilter: ['data-placement'],
            })
            return () => {
              observer.disconnect()
              legacyObserver?.disconnect()
              if (frame !== undefined) win.cancelAnimationFrame(frame)
              releaseLayer?.()
              releasePosition()
              element.style.removeProperty('--button-width')
              element.removeAttribute('data-placement')
              releaseTheme?.()
              releasePortal?.()
            }
          }),
          cleanup => Effect.sync(cleanup),
        )
        Queue.offerUnsafe(queue, Message.CompletedAnchorPopover())
        return yield* Effect.never
      }),
    ),
})

export type RenderInfo = Readonly<{
  button: ReadonlyArray<ChildAttribute>
  panel: ReadonlyArray<ChildAttribute>
  backdrop: ReadonlyArray<ChildAttribute>
  arrow: ReadonlyArray<ChildAttribute>
  isVisible: boolean
}>

export type ViewInputs = Readonly<{
  anchor: AnchorConfig
  toView: (render: RenderInfo) => Html
  isDisabled?: boolean
  focusSelector?: string
  arrowPadding?: number
  ariaLabel?: string
  ariaLabelledBy?: string
  themedPortal?: boolean
}>

export const view = defineView<Model, Message, ViewInputs>(
  (model, inputs, h) => {
    const { id, isOpen, contentFocus } = model
    const { transitionState } = model.animation
    const {
      anchor,
      toView,
      isDisabled,
      focusSelector,
      arrowPadding,
      ariaLabel,
      ariaLabelledBy,
      themedPortal,
    } = inputs
    const isEntering =
      transitionState === 'EnterStart' || transitionState === 'EnterAnimating'
    const isLeaving =
      transitionState === 'LeaveStart' || transitionState === 'LeaveAnimating'
    const isVisible = isOpen || isLeaving
    const toggle = isOpen ? Message.RequestedClose() : Message.RequestedOpen()
    const escape = (key: string) =>
      key === 'Escape' && isOpen
        ? Option.some(Message.RequestedClose())
        : Option.none()

    return toView({
      button: childAttributes([
        h.Id(buttonId(id)),
        h.Type('button'),
        h.AriaExpanded(isVisible),
        ...(isVisible
          ? [
              h.AriaControls(panelId(id)),
              h.DataAttribute('open', ''),
              h.Style({ position: 'relative', zIndex: '1' }),
            ]
          : []),
        ...(ariaLabel !== undefined
          ? [h.AriaLabel(ariaLabel)]
          : ariaLabelledBy !== undefined
            ? [h.AriaLabelledBy(ariaLabelledBy)]
            : []),
        ...(isDisabled
          ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
          : [
              h.OnPointerDown((pointerType, button) =>
                Option.some(
                  Message.PressedPointerOnButton({ pointerType, button }),
                ),
              ),
              h.OnKeyDownPreventDefault(key =>
                key === 'Enter' || key === ' ' || key === 'ArrowDown'
                  ? Option.some(toggle)
                  : escape(key),
              ),
              h.OnKeyUpPreventDefault(key =>
                key === ' '
                  ? Option.some(Message.SuppressedSpaceScroll())
                  : Option.none(),
              ),
              h.OnClick(
                usedMouse(model) ? Message.IgnoredMouseClick() : toggle,
              ),
            ]),
      ]),
      panel: childAttributes([
        h.Id(panelId(id)),
        ...(contentFocus ? [] : [h.Tabindex(0)]),
        h.Style({
          position: 'absolute',
          margin: '0',
          visibility: 'hidden',
          maxHeight: 'var(--available-height, none)',
        }),
        h.OnMount(
          AnchorPopover({
            id,
            anchor,
            isModal: model.isModal,
            themedPortal: themedPortal ?? false,
            ...(focusSelector === undefined ? {} : { focusSelector }),
            ...(arrowPadding === undefined ? {} : { arrowPadding }),
          }),
        ),
        ...(isEntering ? [h.DataAttribute('enter', '')] : []),
        ...(isLeaving ? [h.DataAttribute('leave', '')] : []),
        ...(isEntering || isLeaving ? [h.DataAttribute('transition', '')] : []),
        ...(transitionState === 'EnterStart' ||
        transitionState === 'LeaveAnimating'
          ? [h.DataAttribute('closed', '')]
          : []),
        ...(isLeaving
          ? []
          : [
              h.OnKeyDownPreventDefault(escape),
              ...(contentFocus ? [] : [h.OnBlur(Message.BlurredPanel())]),
            ]),
      ]),
      backdrop: childAttributes([
        ...Popup.backdropAttributes(backdropId(id), h),
        h.OnMount(PortalPopoverBackdrop()),
        ...(isLeaving
          ? [h.Style({ pointerEvents: 'none' })]
          : [h.OnClick(Message.RequestedClose())]),
      ]),
      arrow: childAttributes(Popup.arrowAttributes(arrowId(id), h)),
      isVisible,
    })
  },
)
