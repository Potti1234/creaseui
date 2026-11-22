import { Option } from 'effect'
import * as Scene from 'foldkit/scene'
import type { HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as Reorder from '@/lib/behaviors/reorder'

const value = ['a', 'b', 'c']
const item = Scene.selector('#item-a')
const view = (model: Reorder.Model, h: HtmlBuilder<Reorder.Message>) =>
  h.div(
    [],
    Reorder.order(model, value).map(key =>
      h.button(
        [
          h.Id(`item-${key}`),
          h.AriaPressed(Reorder.isMoving(model, key) ? 'true' : 'false'),
          h.OnKeyDownPreventDefault(pressedKey =>
            Reorder.keydown(model, { key: pressedKey, itemKey: key }),
          ),
        ],
        [key],
      ),
    ),
  )
const update = (model: Reorder.Model, message: Reorder.Message) => ({
  model: Reorder.update(model, message, { value }).model,
})

describe('Reorder rendered keyboard policy', () => {
  it('grabs, previews and cancels without changing the owner order', () => {
    Scene.scene(
      { view, update },
      Scene.given(Reorder.init()),
      Scene.expect(item).toHaveAttr('aria-pressed', 'false'),
      Scene.keydown(item, ' '),
      Scene.expectHandled(),
      Scene.expect(item).toHaveAttr('aria-pressed', 'true'),
      Scene.keydown(item, 'ArrowDown'),
      Scene.expectHandled(),
      Scene.tap(({ model }) => {
        if (Reorder.order(model, value).join(',') !== 'b,a,c')
          throw new Error('Missing draft preview')
      }),
      Scene.keydown(item, 'Escape'),
      Scene.expectHandled(),
      Scene.expect(item).toHaveAttr('aria-pressed', 'false'),
      Scene.tap(({ model }) => {
        if (!Option.isNone(model.maybeDraft))
          throw new Error('Draft not cancelled')
      }),
    )
  })
  it('ignores idle arrows and clears the draft on drop', () => {
    Scene.scene(
      { view, update },
      Scene.given(Reorder.init()),
      Scene.keydown(item, 'ArrowDown'),
      Scene.expectIgnored(),
      Scene.keydown(item, 'Enter'),
      Scene.expectHandled(),
      Scene.keydown(item, 'End'),
      Scene.expectHandled(),
      Scene.keydown(item, 'Enter'),
      Scene.expectHandled(),
      Scene.expect(item).toHaveAttr('aria-pressed', 'false'),
    )
  })
})
