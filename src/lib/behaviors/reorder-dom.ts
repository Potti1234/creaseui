import { Effect, Schema } from 'effect'
import * as Command from 'foldkit/command'
import * as Render from 'foldkit/render'

import * as Reorder from '@/lib/behaviors/reorder'

export const CheckHandleFocus = Command.define('CheckReorderHandleFocus', {
  args: { id: Schema.String, key: Schema.String },
  messages: [Reorder.Message.CompletedFocusCheck],
  execute: ({ id, key }) =>
    Render.afterCommit.pipe(
      Effect.map(() =>
        Reorder.Message.CompletedFocusCheck({
          key,
          isFocused: document.activeElement?.id === id,
        }),
      ),
    ),
})
