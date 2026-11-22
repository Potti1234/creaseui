import { Option } from 'effect'
import * as Scene from 'foldkit/scene'
import type { HtmlBuilder } from 'foldkit/html'
import { describe, expect, it } from 'vitest'

import * as Listbox from '@/lib/behaviors/listbox'
import * as RovingFocus from '@/lib/behaviors/roving-focus'
import * as Typeahead from '@/lib/behaviors/typeahead'

type Key = 'apple' | 'apricot' | 'banana'
const behavior = Listbox.create<Key>()
const initial = Listbox.init({ id: 'fruit' })
const apple = Scene.selector('#fruit-item-apple')
const apricot = Scene.selector('#fruit-item-apricot')
const banana = Scene.selector('#fruit-item-banana')
const list = Scene.role('listbox')
const view =
  (
    inputs: Partial<Omit<Listbox.ViewInputs<Key>, 'toView'>> = {},
    onMessage: (message: Listbox.Message) => void = () => {},
  ) =>
  (model: Listbox.Model, h: HtmlBuilder<Listbox.Message>) =>
    h.submodel({
      slotId: model.id,
      model,
      view: behavior.view,
      viewInputs: {
        keys: ['apple', 'apricot', 'banana'],
        label: key => key,
        ...inputs,
        toView: (items, keydown) =>
          h.div(
            [h.Role('listbox'), h.OnKeyDownPreventDefault(keydown)],
            items.map(item => h.div([...item.attributes], [item.key])),
          ),
      },
      toParentMessage: message => {
        onMessage(message)
        return message
      },
    })

describe('Listbox rendered behavior', () => {
  it('emits ids, highlight and disabled attributes without owning selection semantics', () => {
    Scene.scene(
      {
        update: behavior.update,
        view: view({ isDisabled: key => key === 'apricot' }),
      },
      Scene.given(Listbox.highlight(initial, 'apple')),
      Scene.expect(apple).toHaveAttr('id', 'fruit-item-apple'),
      Scene.expect(apple).toHaveAttr('data-highlighted', ''),
      Scene.expect(banana).not.toHaveAttr('data-highlighted'),
      Scene.expect(apricot).toHaveAttr('aria-disabled', 'true'),
      Scene.expect(apple).not.toHaveAttr('aria-disabled'),
      Scene.expect(apple).not.toHaveAttr('role'),
      Scene.expect(apple).not.toHaveAttr('aria-selected'),
      Scene.tap(({ html }) => {
        expect(
          Option.getOrThrow(Scene.find(html, '#fruit-item-apricot')).data?.on
            ?.pointermove,
        ).toBeUndefined()
      }),
    )
  })

  it('routes Real navigation through MovedHighlight and the shared FocusItem command', () => {
    const messages: Listbox.Message[] = []
    Scene.scene(
      {
        update: (model, message) => {
          messages.push(message)
          return behavior.update(model, message)
        },
        view: view({ isDisabled: key => key === 'apricot' }),
      },
      Scene.given(Listbox.highlight(initial, 'apple')),
      Scene.keydown(list, 'ArrowDown'),
      Scene.expectHandled(),
      Scene.expect(banana).toHaveAttr('data-highlighted', ''),
      Scene.expect(apple).not.toHaveAttr('data-highlighted'),
      Scene.Command.expectExact(
        RovingFocus.FocusItem({ id: 'fruit', key: 'banana' }),
      ),
      Scene.Command.resolve(
        RovingFocus.FocusItem,
        RovingFocus.Message.CompletedFocusItem(),
      ),
    )
    expect(messages).toContainEqual(
      Listbox.Message.MovedHighlight({ key: 'banana', focus: 'Real' }),
    )
  })

  it('changes Virtual highlight without a focus command and ignores Home and typing', () => {
    Scene.scene(
      { update: behavior.update, view: view({ focus: 'Virtual' }) },
      Scene.given(initial),
      Scene.keydown(list, 'ArrowDown'),
      Scene.expectHandled(),
      Scene.expect(apple).toHaveAttr('data-highlighted', ''),
      Scene.Command.expectNone(),
      Scene.keydown(list, 'Home'),
      Scene.expectIgnored(),
      Scene.keydown(list, 'b'),
      Scene.expectIgnored(),
      Scene.Command.expectNone(),
    )
  })

  it('routes pointer movement through the rendered option handler without focusing', () => {
    const messages: Listbox.Message[] = []
    Scene.scene(
      {
        update: behavior.update,
        view: view({}, message => messages.push(message)),
      },
      Scene.given(initial),
      Scene.tap(({ html }) => {
        const handler = Option.getOrThrow(
          Scene.find(html, '#fruit-item-banana'),
        ).data?.on?.pointermove
        expect(handler).toBeTypeOf('function')
        if (typeof handler === 'function')
          handler(new PointerEvent('pointermove', { pointerType: 'mouse' }))
      }),
    )
    expect(messages).toEqual([
      Listbox.Message.HighlightedItem({ key: 'banana' }),
    ])
    const result = behavior.update(initial, messages[0]!)
    expect(result.commands ?? []).toEqual([])
    Scene.scene(
      { update: behavior.update, view: view() },
      Scene.given(result.model),
      Scene.expect(banana).toHaveAttr('data-highlighted', ''),
      Scene.Command.expectNone(),
    )
  })

  it('moves Real highlight with typeahead and routes its reset through Listbox', () => {
    Scene.scene(
      { update: behavior.update, view: view() },
      Scene.given(initial),
      Scene.keydown(list, 'b'),
      Scene.expectHandled(),
      Scene.expect(banana).toHaveAttr('data-highlighted', ''),
      Scene.Command.expectHas(
        RovingFocus.FocusItem({ id: 'fruit', key: 'banana' }),
      ),
      Scene.Command.expectHas(Typeahead.WaitBeforeResettingTypeahead),
      Scene.Command.resolve(
        RovingFocus.FocusItem,
        RovingFocus.Message.CompletedFocusItem(),
      ),
      Scene.Command.resolve(
        Typeahead.WaitBeforeResettingTypeahead,
        Typeahead.Message.ElapsedTimeout({ version: 1 }),
      ),
      Scene.expect(banana).toHaveAttr('data-highlighted', ''),
      Scene.keydown(list, 'a'),
      Scene.expectHandled(),
      Scene.expect(apple).toHaveAttr('data-highlighted', ''),
      Scene.Command.resolve(
        RovingFocus.FocusItem,
        RovingFocus.Message.CompletedFocusItem(),
      ),
      Scene.Command.resolve(
        Typeahead.WaitBeforeResettingTypeahead,
        Typeahead.Message.ElapsedTimeout({ version: 2 }),
      ),
    )
  })

  it('renders empty and all-disabled lists without navigation targets', () => {
    for (const inputs of [
      { keys: [] },
      { isDisabled: () => true },
    ] satisfies Partial<Listbox.ViewInputs<Key>>[]) {
      Scene.scene(
        { update: behavior.update, view: view(inputs) },
        Scene.given(initial),
        Scene.keydown(list, 'ArrowDown'),
        Scene.expectIgnored(),
        Scene.Command.expectNone(),
      )
    }
  })
})
