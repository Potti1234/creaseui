import { Effect, Option, Schema } from 'effect'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import type { Attribute } from 'foldkit/html'

import * as Reorder from '@/lib/behaviors/reorder'

export const handleId = (id: string, key: string): string =>
  `${id}-lane-${encodeURIComponent(key)}`

export const keydownAttribute = <Message>(
  model: Reorder.Model,
  itemKey: string,
  toMessage: (message: Reorder.Message) => Message,
): Attribute<Message> => ({
  _tag: 'OnKeyDownPreventDefault',
  f: (key, modifiers) => {
    if (key === 'Tab') return Option.none()
    const element = document.activeElement
    const rtl =
      element instanceof HTMLElement &&
      getComputedStyle(element).direction === 'rtl'
    const message = Reorder.keydown(model, {
      key,
      itemKey,
      orientation: 'horizontal',
      rtl,
      ...modifiers,
    })
    return Option.map(message, toMessage)
  },
})

const FocusLane = Command.define('FocusKanbanLane', {
  args: { id: Schema.String, key: Schema.String },
  messages: [Reorder.Message.Swallow],
  execute: ({ id, key }) =>
    Dom.focus(`[id="${handleId(id, key)}"]`).pipe(
      Effect.ignore,
      Effect.as(Reorder.Message.Swallow({})),
    ),
})

export const update = <Lane extends Readonly<{ id: string; name: string }>>(
  model: Reorder.Model,
  message: Reorder.Message,
  lanes: ReadonlyArray<Lane>,
  announcement: string,
  id: string,
) => {
  const value = lanes.map(lane => lane.id)
  const reflected = Reorder.update(model, Reorder.Message.Reflect({}), {
    value,
  }).model
  const result = Reorder.update(reflected, message, { value })
  let nextLanes = lanes
  let nextAnnouncement = announcement
  for (const out of result.outMessages) {
    if (out._tag === 'CommittedOrder') {
      nextLanes = out.order.flatMap(key =>
        lanes.filter(lane => lane.id === key),
      )
    } else {
      nextAnnouncement = Reorder.reorderMessage({
        ...out.announcement,
        label:
          lanes.find(lane => lane.id === out.announcement.key)?.name ??
          out.announcement.key,
      })
    }
  }
  return {
    model: result.model,
    lanes: nextLanes,
    announcement: nextAnnouncement,
    commands: Option.match(result.maybeFocus, {
      onNone: () => [],
      onSome: key => [FocusLane({ id, key })],
    }),
  }
}
