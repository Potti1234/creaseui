import assert from 'node:assert/strict'
import { it } from 'node:test'

import * as Preview from '../src/docs/components/pages/thumbnail/state'

it('opens the clicked image and keeps gallery indices correct after removal', () => {
  const model = Preview.init(2)
  const opened = Preview.update(
    model,
    Preview.Message.OpenedThumbnail({ label: 'golden-sunset.jpg' }),
  )
  assert.equal(opened.model.lightbox.index, 2)
  assert.notEqual(opened.model.lightbox.dialog, model.lightbox.dialog)
  const removed = Preview.update(
    model,
    Preview.Message.RemovedThumbnail({ label: 'forest-night.jpg' }),
  )
  assert.equal(removed.model.items.length, 3)
  assert.equal(removed.model.lightbox.mediaCount, 3)
  const next = Preview.update(
    removed.model,
    Preview.Message.OpenedThumbnail({ label: 'golden-sunset.jpg' }),
  )
  assert.equal(next.model.lightbox.index, 1)
  assert.equal(model.items.length, 4)
})

it('ignores disabled, unknown and unsupported thumbnail actions', () => {
  const model = Preview.init(4)
  const disabled = {
    ...model,
    items: model.items.filter(item => item.isDisabled),
  }
  assert.equal(
    Preview.update(
      disabled,
      Preview.Message.RemovedThumbnail({ label: 'golden-sunset.jpg' }),
    ).model,
    disabled,
  )
  assert.equal(
    Preview.update(
      model,
      Preview.Message.OpenedThumbnail({ label: 'golden-sunset.jpg' }),
    ).model,
    model,
  )
  assert.equal(
    Preview.update(
      model,
      Preview.Message.RemovedThumbnail({ label: 'unknown' }),
    ).model,
    model,
  )
})

it('can remove every gallery image without leaving an invalid index', () => {
  let model = Preview.init(2)
  for (const item of model.items)
    model = Preview.update(
      model,
      Preview.Message.RemovedThumbnail({ label: item.label }),
    ).model
  assert.equal(model.items.length, 0)
  assert.equal(model.lightbox.index, 0)
  assert.equal(model.lightbox.mediaCount, 1)
})
