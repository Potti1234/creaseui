import { Effect, Option } from 'effect'
import * as Scene from 'foldkit/scene'
import type { HtmlBuilder } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as RovingFocus from '@/lib/behaviors/roving-focus'

type Key = 'one' | 'two' | 'three'
const behavior = RovingFocus.create<Key>()
const one = Scene.role('button', { name: 'one' })
const two = Scene.role('button', { name: 'two' })
const three = Scene.role('button', { name: 'three' })
const view =
  (inputs: Omit<RovingFocus.ViewInputs<Key>, 'toView'>) =>
  (model: RovingFocus.Model, h: HtmlBuilder<RovingFocus.Message>) =>
    h.submodel({
      slotId: model.id,
      model,
      view: behavior.view,
      viewInputs: {
        ...inputs,
        toView: items =>
          h.div(
            [],
            items.map(item =>
              h.button([...item.attributes, h.Type('button')], [item.key]),
            ),
          ),
      },
      toParentMessage: message => message,
    })

describe('RovingFocus attributes', () => {
  it('focuses readable ids containing spaces, quotes, and selector syntax', async () => {
    const id = '1 group"'
    const keys = ['a b', 'a"b', 'a\\b', 'a\nb', 'a] [id="other', '']
    for (const key of keys) {
      const button = document.createElement('button')
      button.id = RovingFocus.itemId(id, key)
      document.body.append(button)
      try {
        await Effect.runPromise(RovingFocus.FocusItem({ id, key }).effect)
        expect(document.activeElement).toBe(button)
      } finally {
        button.remove()
      }
    }
  })

  it('completes focus gracefully when the target is no longer mounted', async () => {
    await expect(
      Effect.runPromise(
        RovingFocus.FocusItem({ id: 'missing', key: 'two' }).effect,
      ),
    ).resolves.toEqual(RovingFocus.Message.CompletedFocusItem())
  })

  it('records focus received naturally without a focus Command', () => {
    Scene.scene(
      { update: behavior.update, view: view({ keys: ['one', 'two'] }) },
      Scene.given(RovingFocus.init({ id: 'group' })),
      Scene.focus(two),
      Scene.expectHandled(),
      Scene.expect(two).toHaveAttr('tabIndex', '0'),
      Scene.expect(one).toHaveAttr('tabIndex', '-1'),
    )
  })

  it('keeps the focused key as tab stop across reordering', () => {
    Scene.scene(
      {
        update: behavior.update,
        view: view({ keys: ['three', 'two', 'one'], preferredKey: 'three' }),
      },
      Scene.given({
        ...RovingFocus.init({ id: 'group' }),
        maybeFocusedKey: Option.some('two'),
      }),
      Scene.expect(one).toHaveAttr('tabIndex', '-1'),
      Scene.expect(two).toHaveAttr('tabIndex', '0'),
      Scene.expect(three).toHaveAttr('tabIndex', '-1'),
      Scene.expect(two).toHaveAttr('id', RovingFocus.itemId('group', 'two')),
      Scene.expect(two).not.toHaveAttr('aria-selected'),
      Scene.expect(two).not.toHaveAttr('role'),
    )
  })

  it('falls back to the enabled preferred key when the focused key is filtered', () => {
    Scene.scene(
      {
        update: behavior.update,
        view: view({ keys: ['one', 'three'], preferredKey: 'three' }),
      },
      Scene.given({
        ...RovingFocus.init({ id: 'group' }),
        maybeFocusedKey: Option.some('two'),
      }),
      Scene.expect(one).toHaveAttr('tabIndex', '-1'),
      Scene.expect(three).toHaveAttr('tabIndex', '0'),
    )
  })

  it('falls back to the first enabled key when focused and preferred keys are disabled', () => {
    Scene.scene(
      {
        update: behavior.update,
        view: view({
          keys: ['one', 'two', 'three'],
          preferredKey: 'one',
          isDisabled: key => key !== 'three',
        }),
      },
      Scene.given({
        ...RovingFocus.init({ id: 'group' }),
        maybeFocusedKey: Option.some('two'),
      }),
      Scene.expect(one).toHaveAttr('tabIndex', '-1'),
      Scene.expect(two).toHaveAttr('tabIndex', '-1'),
      Scene.expect(three).toHaveAttr('tabIndex', '0'),
      Scene.keydown(three, 'Enter'),
      Scene.expectIgnored(),
    )
  })

  it('does not create a tab stop or handle navigation when every item is disabled', () => {
    Scene.scene(
      {
        update: behavior.update,
        view: view({ keys: ['one', 'two'], isDisabled: () => true }),
      },
      Scene.given(RovingFocus.init({ id: 'group' })),
      Scene.expect(one).toHaveAttr('tabIndex', '-1'),
      Scene.expect(two).toHaveAttr('tabIndex', '-1'),
      Scene.keydown(one, 'ArrowRight'),
      Scene.expectIgnored(),
    )
  })

  it('renders an empty collection without a tab stop', () => {
    Scene.scene(
      { update: behavior.update, view: view({ keys: [] }) },
      Scene.given(RovingFocus.init({ id: 'group' })),
      Scene.expect(one).not.toExist(),
      Scene.expect(two).not.toExist(),
      Scene.expect(three).not.toExist(),
    )
  })

  it('only handles keys that resolve to a target', () => {
    Scene.scene(
      {
        update: behavior.update,
        view: view({ keys: ['one', 'two'], loop: false }),
      },
      Scene.given(RovingFocus.init({ id: 'group' })),
      Scene.keydown(one, 'ArrowLeft'),
      Scene.expectIgnored(),
      Scene.keydown(one, 'Tab'),
      Scene.expectIgnored(),
      Scene.keydown(one, 'ArrowRight'),
      Scene.expectHandled(),
      Scene.Command.resolve(
        RovingFocus.FocusItem,
        RovingFocus.Message.CompletedFocusItem(),
      ),
      Scene.expect(two).toHaveAttr('tabIndex', '0'),
    )
  })
})
