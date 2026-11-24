import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Deferred, Effect, Fiber, Option, Stream } from 'effect'
import * as Mount from 'foldkit/mount'
import { Window } from 'happy-dom'
import { __htmlBuilder } from '../node_modules/foldkit/dist/html/index.js'

import * as Behavior from '../src/lib/behaviors/popup-behavior.ts'

const config = {
  triggerId: 'example-trigger',
  panelId: 'example-panel',
  placement: { side: 'bottom', align: 'start' },
  hasPopup: 'dialog',
} satisfies Behavior.Config
const h = __htmlBuilder<Behavior.Message>()
const send = (message: Behavior.Message) => message
const open = Behavior.Request.RequestedOpen({ reason: 'trigger-press' })
const close = Behavior.Request.RequestedClose({ reason: 'close-press' })
const opened = Behavior.init({ defaultOpen: true })

describe('Anchored popup behavior', () => {
  it('delegates state transitions and dismissal policy to Popup', () => {
    const initial = Behavior.init()
    assert.deepEqual(
      Behavior.update(initial, open, { ...config, disabled: true }),
      {
        model: initial,
      },
    )
    assert.deepEqual(Behavior.update(initial, open, config), {
      model: opened,
      outMessage: Behavior.OutMessage.Opened({ reason: 'trigger-press' }),
    })

    for (const reason of [
      'escape-key',
      'outside-press',
      'focus-out',
    ] as const) {
      const dismiss = Behavior.Request.RequestedDismissal({ reason })
      assert.deepEqual(
        Behavior.update(opened, dismiss, { ...config, dismissible: false }),
        {
          model: opened,
          outMessage: Behavior.OutMessage.PreventedDismissal({ reason }),
        },
      )
      const closed = Behavior.update(opened, dismiss, config)
      assert.deepEqual(closed.model, initial)
      assert.deepEqual(
        closed.outMessage,
        Behavior.OutMessage.Closed({ reason }),
      )
      assert.equal(
        closed.commands?.length ?? 0,
        reason === 'escape-key' ? 1 : 0,
      )
      assert.deepEqual(Behavior.update(closed.model, dismiss, config), {
        model: initial,
      })
    }
  })

  it('restores focus on explicit close unless disabled or opted out', () => {
    const result = Behavior.update(opened, close, {
      ...config,
      dismissible: false,
    })
    assert.equal(result.model.isOpen, false)
    assert.equal(result.commands?.[0]?.name, 'FocusAnchoredPopupTrigger')
    assert.deepEqual(result.commands?.[0]?.args, { id: config.triggerId })
    assert.equal(
      Behavior.update(opened, close, { ...config, restoreFocus: false })
        .commands,
      undefined,
    )
    assert.equal(
      Behavior.update(opened, close, { ...config, disabled: true }).commands,
      undefined,
    )
  })

  it('wires native buttons, disclosure attributes and one composed panel mount', () => {
    const closedTrigger = Behavior.triggerAttributes(
      Behavior.init(),
      config,
      send,
      h,
    )
    assert.ok(
      closedTrigger.every(attribute => attribute._tag !== 'AriaControls'),
    )
    assert.deepEqual(
      closedTrigger.find(attribute => attribute._tag === 'OnClick'),
      h.OnClick(open),
    )

    const openTrigger = Behavior.triggerAttributes(opened, config, send, h)
    assert.ok(openTrigger.some(attribute => attribute._tag === 'AriaControls'))
    assert.deepEqual(
      openTrigger.find(attribute => attribute._tag === 'AriaExpanded'),
      h.AriaExpanded(true),
    )
    assert.deepEqual(
      openTrigger.find(attribute => attribute._tag === 'OnClick'),
      h.OnClick(Behavior.Request.RequestedClose({ reason: 'trigger-press' })),
    )
    assert.deepEqual(Behavior.closeAttributes(send, h), [
      h.Type('button'),
      h.OnClick(close),
    ])

    const panel = Behavior.panelAttributes(
      {
        ...config,
        initialFocus: { selector: '#first-action' },
        dismissOnFocusLeave: true,
      },
      send,
      h,
    )
    assert.deepEqual(
      panel.find(attribute => attribute._tag === 'OnFocusLeave'),
      h.OnFocusLeave(
        Behavior.Request.RequestedDismissal({ reason: 'focus-out' }),
      ),
    )
    const mounts = panel.filter(attribute => attribute._tag === 'OnMount')
    assert.equal(mounts.length, 1)
    assert.equal(mounts[0]?.action.name, 'ObserveAnchoredPopup')
    assert.deepEqual(mounts[0]?.action.args, {
      triggerId: config.triggerId,
      arrowId: config.panelId + '-arrow',
      placement: config.placement,
      focusAfterPosition: true,
      focusSelector: '#first-action',
    })
  })

  it('composes accessible parts and keeps the panel present until the current exit completes', () => {
    const labelledConfig = {
      ...config,
      titleId: 'details-title',
      descriptionId: 'details-description',
      waitForExit: true,
    }
    const initialParts = Behavior.parts(
      Behavior.init(),
      labelledConfig,
      send,
      h,
    )
    assert.equal(initialParts.isMounted, false)
    assert.deepEqual(initialParts.title, [h.Id('details-title')])
    assert.deepEqual(initialParts.description, [h.Id('details-description')])
    assert.ok(
      initialParts.panel.some(attribute => attribute._tag === 'AriaLabelledBy'),
    )
    assert.ok(
      initialParts.panel.some(
        attribute => attribute._tag === 'AriaDescribedBy',
      ),
    )
    assert.deepEqual(initialParts.arrow, [
      h.Id(config.panelId + '-arrow'),
      h.AriaHidden(true),
    ])
    assert.deepEqual(initialParts.backdrop, [
      h.Id(config.panelId + '-backdrop'),
      h.AriaHidden(true),
    ])
    assert.deepEqual(initialParts.viewport, [
      h.Id(config.panelId + '-viewport'),
    ])
    assert.deepEqual(Behavior.parts(opened, config, send, h).title, [])

    const exiting = Behavior.update(opened, close, labelledConfig).model
    const exitParts = Behavior.parts(exiting, labelledConfig, send, h)
    assert.equal(exitParts.isMounted, true)
    assert.equal(exitParts.isOpen, false)
    assert.ok(exitParts.panel.some(attribute => attribute._tag === 'Inert'))
    const complete = Behavior.Request.CompletedExit({
      version: exiting.exitVersion,
    })
    assert.equal(
      Behavior.update(exiting, complete, labelledConfig).model.isExiting,
      false,
    )
    const reopened = Behavior.update(exiting, open, labelledConfig).model
    assert.equal(
      Behavior.update(reopened, complete, labelledConfig).model.isOpen,
      true,
    )
  })
})

it('ignores a superseded animation and completes an exit with no motion', async () => {
  const window = new Window()
  try {
    const panel = window.document.createElement('section')
    window.document.body.append(panel)
    let finish: () => void = () => {}
    const finished = new Promise<void>(resolve => {
      finish = resolve
    })
    const observed = Deferred.makeUnsafe<void>()
    let reads = 0
    Object.defineProperty(panel, 'getAnimations', {
      value: () => {
        reads += 1
        Effect.runSync(Deferred.succeed(observed, undefined))
        return reads === 1
          ? [{ finished, playbackRate: 1, playState: 'running' }]
          : []
      },
    })
    panel.setAttribute('data-popup-exit-version', '1')

    await Effect.runPromise(
      Effect.gen(function* () {
        const element: unknown = panel
        const completed = yield* Effect.forkChild(
          Stream.runHead(Behavior.exitCompletions(element as HTMLElement)),
        )
        yield* Deferred.await(observed)
        panel.setAttribute('data-popup-exit-version', '2')
        finish()
        const message = yield* Fiber.join(completed)
        assert.deepEqual(
          Option.getOrThrow(message),
          Behavior.Request.CompletedExit({ version: 2 }),
        )
        assert.equal(reads, 2)
      }).pipe(Effect.timeout('3 seconds')),
    )
  } finally {
    await window.happyDOM.close()
  }
})

it('retains the top layer until all mounted exit surfaces settle', async () => {
  const window = new Window()
  const { document } = window
  const globals = {
    window,
    document,
    Element: window.Element,
    Node: window.Node,
    HTMLElement: window.HTMLElement,
    getComputedStyle: window.getComputedStyle.bind(window),
  }
  const descriptors = Object.entries(globals).map(([name, value]) => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, value })
    return { name, descriptor }
  })
  try {
    const trigger = document.createElement('button')
    trigger.id = config.triggerId
    const panel = document.createElement('section')
    let inTopLayer = false
    const matches = panel.matches.bind(panel)
    Object.assign(panel, {
      showPopover: () => {
        assert.equal(panel.getAttribute('popover'), 'manual')
        assert.equal(panel.style.position, '')
        inTopLayer = true
      },
      hidePopover: () => {
        inTopLayer = false
      },
      matches: (selector: string) =>
        selector === ':popover-open' ? inTopLayer : matches(selector),
    })
    panel.style.visibility = 'hidden'
    const firstAction = document.createElement('button')
    firstAction.id = 'first-action'
    panel.append(firstAction)
    const backdrop = document.createElement('div')
    backdrop.id = 'exit-backdrop'
    document.body.append(trigger, panel, backdrop)
    const panelMotion = Promise.withResolvers<void>()
    const backdropMotion = Promise.withResolvers<void>()
    const sampled = Deferred.makeUnsafe<void>()
    const completed = Deferred.makeUnsafe<Behavior.Message>()
    let backdropReads = 0
    Object.defineProperty(panel, 'getAnimations', {
      value: () => [{ finished: panelMotion.promise, playbackRate: 1 }],
    })
    Object.defineProperty(backdrop, 'getAnimations', {
      value: () => {
        backdropReads++
        Effect.runSync(Deferred.succeed(sampled, undefined))
        return [{ finished: backdropMotion.promise, playbackRate: 1 }]
      },
    })

    const mount = Behavior.panelAttributes(
      {
        ...config,
        portal: 'top-layer',
        waitForExit: 'auto',
        exitSurfaceIds: [backdrop.id, 'absent', backdrop.id],
        initialFocus: { selector: '#first-action' },
      },
      send,
      h,
    ).find(attribute => attribute._tag === 'OnMount')
    assert.ok(mount)
    const mountElement: unknown = panel
    assert.ok(mountElement instanceof Element)
    const focus = Deferred.makeUnsafe<void>()
    firstAction.addEventListener('focus', () => {
      Effect.runSync(Deferred.succeed(focus, undefined))
    })
    const dismissed = Deferred.makeUnsafe<Behavior.Message>()
    const layerReady = Deferred.makeUnsafe<void>()
    const addListener = document.addEventListener.bind(document)
    document.addEventListener = (type, listener, options) => {
      addListener(type, listener, options)
      if (type === 'keydown')
        Effect.runSync(Deferred.succeed(layerReady, undefined))
    }
    const escape = () => {
      const event = new window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
      document.dispatchEvent(event)
      return event.defaultPrevented
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const fiber = yield* Effect.forkChild(
          Stream.runForEach(
            mount.action.f(mountElement, Mount.liveViewStateChanges),
            message => {
              switch (message._tag) {
                case 'RequestedDismissal':
                  return Deferred.succeed(dismissed, message)
                case 'CompletedExit':
                  return Deferred.succeed(completed, message)
                default:
                  return Effect.void
              }
            },
          ),
        )
        yield* Deferred.await(focus)
        yield* Deferred.await(layerReady)
        yield* Effect.yieldNow
        assert.equal(panel.style.visibility, '')
        assert.equal(inTopLayer, true)
        assert.equal(panel.parentNode, document.body)
        assert.equal(document.activeElement, firstAction)
        assert.equal(escape(), true)
        assert.deepEqual(
          yield* Deferred.await(dismissed),
          Behavior.Request.RequestedDismissal({ reason: 'escape-key' }),
        )
        panel.setAttribute('data-popup-exit-version', '1')
        yield* Deferred.await(sampled)
        panelMotion.resolve()
        yield* Effect.promise(
          () => new Promise<void>(resolve => window.setTimeout(resolve, 0)),
        )
        assert.equal(yield* Deferred.isDone(completed), false)
        assert.equal(inTopLayer, true)
        backdropMotion.reject(new Error('cancelled animation'))
        assert.deepEqual(
          yield* Deferred.await(completed),
          Behavior.Request.CompletedExit({ version: 1 }),
        )
        assert.equal(backdropReads, 1)
        yield* Fiber.interrupt(fiber)
        assert.equal(panel.style.visibility, 'hidden')
        assert.equal(panel.style.position, '')
        assert.equal(inTopLayer, false)
        assert.equal(panel.hasAttribute('popover'), false)
        assert.equal(escape(), false)
      }).pipe(Effect.timeout('3 seconds')),
    )
  } finally {
    for (const { name, descriptor } of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else Reflect.deleteProperty(globalThis, name)
    }
    await window.happyDOM.close()
  }
})
