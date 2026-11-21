/* Ported from diceui ActionBar (diceui.com/docs/components/base/action-bar):
   document-level Escape dismissal while the bar is open. Roving-tabindex
   arrow navigation inside the group reuses lib/toolbar's mount. */

import { Stream } from 'effect'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'

import * as Layer from './behaviors/layer'
import { FocusToolbarItems, Message as ToolbarMessage } from './toolbar'

export type ActionBarSide = 'top' | 'bottom'
export type ActionBarAlign = 'start' | 'center' | 'end'

export const Message = defineMessageUnion({
  RequestedClose: {},
  CompletedEscapeListener: {},
})
export type Message = typeof Message.Type

export const EscapeActionBar = Mount.defineStream('EscapeActionBar', {
  args: {},
  messages: [Message.RequestedClose, Message.CompletedEscapeListener],
  execute: ({ element, viewStateChanges }) =>
    Layer.mount({ dismissOnOutsidePress: false })
      .f(element, viewStateChanges)
      .pipe(
        Stream.map(message =>
          message._tag === 'RequestedDismissal'
            ? Message.RequestedClose()
            : Message.CompletedEscapeListener(),
        ),
      ),
})

export const escapeActionBarMount = <Msg>(
  toParentMessage: (message: Message) => Msg,
) => Mount.mapMessage(EscapeActionBar({}), toParentMessage)

// Foldkit installs one OnMount per node. Both streams need the toolbar root.
const ObserveActionBar = Mount.defineStream('ObserveActionBar', {
  messages: [
    Message.RequestedClose,
    Message.CompletedEscapeListener,
    ToolbarMessage.CompletedFocusToolbarItems,
  ],
  execute: ({ element, viewStateChanges }) =>
    Stream.merge(
      EscapeActionBar({}).f(element, viewStateChanges),
      FocusToolbarItems({ orientation: 'horizontal' }).f(
        element,
        viewStateChanges,
      ),
    ),
})

export const actionBarMount = <Msg>(
  send: (message: Message | ToolbarMessage) => Msg,
) => Mount.mapMessage(ObserveActionBar(), send)
