import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Option } from 'effect'
import { Window } from 'happy-dom'
import { Animation } from '@foldkit/ui'

import * as Motion from '../src/lib/behaviors/motion.ts'
import * as Popup from '../src/lib/behaviors/popup.ts'

const paint = (model: Motion.Model) =>
  Motion.update(
    model,
    Motion.Message.GotAnimationMessage({
      message: Animation.Message.CompletedWaitForPaint({
        generation: model.transitionGeneration,
      }),
    }),
  )
const end = (model: Motion.Model) =>
  Motion.update(
    model,
    Motion.Message.GotAnimationMessage({
      message: Animation.Message.EndedAnimation({
        generation: model.transitionGeneration,
      }),
    }),
  )

describe('Motion', () => {
  it('mounts open without reporting settlement and leaves closed content absent', () => {
    const closed = Motion.init({ id: 'panel' })
    const open = Motion.init({ id: 'panel', isOpen: true })
    assert.equal(Motion.isMounted(closed), false)
    assert.equal(Motion.isMounted(open), true)
    assert.equal(open.transitionState, 'Idle')
    assert.deepEqual(end(open), { model: open })
    assert.deepEqual(Motion.hide(closed), { model: closed })
    assert.deepEqual(Motion.show(open), { model: open })
  })

  it('reports one settled fact on entry and exit', () => {
    const opening = Motion.show(Motion.init({ id: 'panel' }))
    assert.equal(opening.model.transitionState, 'EnterStart')
    assert.equal(opening.commands?.[0]?.name, 'WaitForPaint')
    assert.equal(opening.outMessage, undefined)
    const entered = end(paint(opening.model).model)
    assert.deepEqual(entered.outMessage, { _tag: 'Settled', isOpen: true })
    const closing = Motion.hide(entered.model)
    assert.equal(Motion.isMounted(closing.model), true)
    const leaving = paint(closing.model)
    assert.equal(leaving.commands?.[0]?.name, 'WaitForAnimationSettled')
    assert.deepEqual(leaving.commands?.[0]?.args, {
      id: 'panel',
      generation: closing.model.transitionGeneration,
    })
    const exited = end(leaving.model)
    assert.equal(Motion.isMounted(exited.model), false)
    assert.deepEqual(exited.outMessage, { _tag: 'Settled', isOpen: false })
    assert.deepEqual(end(exited.model), { model: exited.model })
  })

  it('rejects stale paint and completion results across reversals and instant changes', () => {
    const opening = Motion.show(Motion.init({ id: 'panel' })).model
    const closing = Motion.hide(paint(opening).model).model
    const reopened = Motion.show(closing).model
    for (const message of [
      Animation.Message.CompletedWaitForPaint({
        generation: opening.transitionGeneration,
      }),
      Animation.Message.EndedAnimation({
        generation: closing.transitionGeneration,
      }),
    ])
      assert.deepEqual(
        Motion.update(
          reopened,
          Motion.Message.GotAnimationMessage({ message }),
        ),
        { model: reopened },
      )
    const instant = Motion.hideInstantly(reopened)
    assert.deepEqual(
      Motion.update(
        instant.model,
        Motion.Message.GotAnimationMessage({
          message: Animation.Message.EndedAnimation({
            generation: reopened.transitionGeneration,
          }),
        }),
      ),
      { model: instant.model },
    )
  })

  it('settles instant changes without animation commands, including an interrupted transition', () => {
    const opened = Motion.showInstantly(Motion.init({ id: 'panel' }))
    assert.equal(opened.commands, undefined)
    assert.equal(opened.model.transitionState, 'Idle')
    assert.deepEqual(opened.outMessage, { _tag: 'Settled', isOpen: true })
    assert.deepEqual(Motion.showInstantly(opened.model), {
      model: opened.model,
    })
    const closed = Motion.hide(opened.model, { instant: true })
    assert.equal(closed.commands, undefined)
    assert.deepEqual(closed.outMessage, { _tag: 'Settled', isOpen: false })
    const entering = Motion.show(closed.model).model
    assert.deepEqual(Motion.showInstantly(entering).outMessage, {
      _tag: 'Settled',
      isOpen: true,
    })
  })

  it('emits focus return only on a real hide request and ignores its acknowledgement', async () => {
    const open = Motion.init({ id: 'panel', isOpen: true })
    const closing = Motion.hide(open, { returnFocusTo: 'trigger' })
    const command = closing.commands?.find(
      command => command.name === 'ReturnFocus',
    )
    assert.deepEqual(command?.args, { panelId: 'panel', triggerId: 'trigger' })
    assert.equal(
      Motion.hide(closing.model, { returnFocusTo: 'trigger' }).commands,
      undefined,
    )
    assert.equal(
      Motion.hide(open).commands?.some(
        command => command.name === 'ReturnFocus',
      ),
      false,
    )
    const browser = new Window()
    const globals = {
      document: browser.document,
      HTMLElement: browser.HTMLElement,
      requestAnimationFrame: browser.requestAnimationFrame.bind(browser),
      cancelAnimationFrame: browser.cancelAnimationFrame.bind(browser),
    }
    const previous = new Map(
      Object.keys(globals).map(key => [
        key,
        Object.getOwnPropertyDescriptor(globalThis, key),
      ]),
    )
    for (const [key, value] of Object.entries(globals))
      Object.defineProperty(globalThis, key, { value, configurable: true })
    try {
      browser.document.body.innerHTML =
        '<button id="trigger">Toggle</button><div id="panel"><button id="inside">Inside</button></div><button id="outside">Outside</button>'
      browser.document.getElementById('inside')!.focus()
      const acknowledgement = await Effect.runPromise(command!.effect)
      assert.deepEqual(acknowledgement, { _tag: 'CompletedReturnFocus' })
      assert.equal(browser.document.activeElement?.id, 'trigger')
      assert.deepEqual(Motion.update(closing.model, acknowledgement), {
        model: closing.model,
      })
      browser.document.getElementById('outside')!.focus()
      await Effect.runPromise(command!.effect)
      assert.equal(browser.document.activeElement?.id, 'outside')
      browser.document.getElementById('inside')!.focus()
      browser.document.getElementById('trigger')!.remove()
      assert.deepEqual(await Effect.runPromise(command!.effect), {
        _tag: 'CompletedReturnFocus',
      })
      assert.equal(browser.document.activeElement?.id, 'inside')
      browser.document.body.innerHTML = ''
      await Effect.runPromise(command!.effect)
      const opening = Motion.show(Motion.init({ id: 'panel' }))
      const painted = await Effect.runPromise(opening.commands![0]!.effect)
      assert.deepEqual(
        painted,
        Motion.Message.GotAnimationMessage({
          message: Animation.Message.CompletedWaitForPaint({
            generation: opening.model.transitionGeneration,
          }),
        }),
      )
      assert.equal(
        Motion.update(opening.model, painted).model.transitionState,
        'EnterAnimating',
      )
    } finally {
      for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
      await browser.happyDOM.close()
    }
  })

  it('bridges exit completion using the popup exit version', () => {
    const popup = Popup.update(
      Popup.init({ defaultOpen: true }),
      Popup.Message.RequestedClose({ reason: 'programmatic' }),
      { waitForExit: true },
    ).model
    assert.equal(Popup.isMounted(popup), true)
    const message = Motion.completedPopupExit(popup)
    assert.deepEqual(message, {
      _tag: 'CompletedExit',
      version: popup.exitVersion,
    })
    assert.equal(Popup.isMounted(Popup.update(popup, message).model), false)
    const reopened = Popup.update(
      popup,
      Popup.Message.RequestedOpen({ reason: 'programmatic' }),
    ).model
    assert.equal(Popup.update(reopened, message).model.isOpen, true)
  })

  it('emits lifecycle attributes and ui-sdk aliases without styling', () => {
    const keys = (model: Motion.Model) =>
      Motion.attributes(model)
        .map(attribute =>
          attribute._tag === 'DataAttribute' ? attribute.key : '',
        )
        .sort()
    const closed = Motion.init({ id: 'panel' })
    assert.deepEqual(keys(closed), ['closed'])
    const opening = Motion.show(closed).model
    assert.deepEqual(keys(opening), [
      'closed',
      'enter',
      'starting-style',
      'transition',
    ])
    const entering = paint(opening).model
    assert.deepEqual(keys(entering), ['enter', 'transition'])
    const open = end(entering).model
    assert.deepEqual(keys(open), [])
    const closing = Motion.hide(open).model
    assert.deepEqual(keys(closing), ['ending-style', 'leave', 'transition'])
    assert.deepEqual(keys(paint(closing).model), [
      'closed',
      'ending-style',
      'leave',
      'transition',
    ])
  })

  it('supports hidden-until-found and beforematch reveal without owning state', () => {
    assert.deepEqual(Motion.hiddenAttributes(true, true), [])
    assert.deepEqual(Motion.hiddenAttributes(false, true), [
      { _tag: 'Attribute', key: 'hidden', value: 'until-found' },
    ])
    assert.deepEqual(Motion.hiddenAttributes(false, false), [
      { _tag: 'Attribute', key: 'hidden', value: '' },
    ])
    const reveal = Motion.reveal(Motion.Message.Showed())
    assert.equal(reveal._tag, 'OnCustomEvent')
    if (reveal._tag === 'OnCustomEvent') {
      assert.equal(reveal.name, 'beforematch')
      assert.deepEqual(
        reveal.f({} as CustomEvent),
        Option.some(Motion.Message.Showed()),
      )
    }
  })
})
