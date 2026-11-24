import { Effect, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { DEVTOOLS_HOST_ID } from 'foldkit/devtools-host'
import * as Dom from 'foldkit/dom'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

export const Message = defineMessageUnion({
  SucceededShowDialog: {},
  FailedShowDialog: {},
  SucceededAcquireResources: {},
  FailedAcquireResources: {},
  CompletedCloseDialog: {},
  CompletedReleaseDialogResources: {},
})
export type Message = typeof Message.Type

const dialogSelector = (id: string): string => '#' + CSS.escape(id)
const resourceArgs = { id: S.String, focusSelector: S.String }

const acquire = (id: string, focusSelector: string) =>
  Effect.uninterruptibleMask(restore =>
    restore(
      Effect.suspend(() =>
        Dom.showDialog(dialogSelector(id), {
          focusSelector,
          isModal: true,
          allowedOutsideSelectors: ['#' + DEVTOOLS_HOST_ID],
        }),
      ),
    ).pipe(Effect.tap(acquired => (acquired ? Dom.lockScroll : Effect.void))),
  )

export const ShowDialog = Command.define('ShowDialog', {
  args: resourceArgs,
  messages: [Message.SucceededShowDialog, Message.FailedShowDialog],
  execute: ({ id, focusSelector }) =>
    acquire(id, focusSelector).pipe(
      Effect.as(Message.SucceededShowDialog()),
      Effect.catch(() => Effect.succeed(Message.FailedShowDialog())),
    ),
})

// Mount also handles a restored visible model whose open command never ran.
export const AcquireResources = Mount.define('AcquireResources', {
  args: resourceArgs,
  messages: [Message.SucceededAcquireResources, Message.FailedAcquireResources],
  execute: ({ element, id, focusSelector }) => {
    const Dialog = element.ownerDocument.defaultView?.HTMLDialogElement
    if (!Dialog || !(element instanceof Dialog) || element.id !== id)
      return Effect.succeed(Message.FailedAcquireResources())

    return Effect.acquireRelease(acquire(id, focusSelector), acquired =>
      acquired ? Dom.releaseDialogResources(id) : Effect.void,
    ).pipe(
      Effect.as(Message.SucceededAcquireResources()),
      Effect.catch(() => Effect.succeed(Message.FailedAcquireResources())),
    )
  },
})

export const CloseDialog = Command.define('CloseDialog', {
  args: { id: S.String },
  messages: [Message.CompletedCloseDialog],
  execute: ({ id }) =>
    Effect.suspend(() => Dom.closeDialog(dialogSelector(id))).pipe(
      Effect.andThen(released => (released ? Dom.unlockScroll : Effect.void)),
      Effect.catch(() => Dom.releaseDialogResources(id)),
      Effect.as(Message.CompletedCloseDialog()),
    ),
})

export const ReleaseDialogResources = Command.define('ReleaseDialogResources', {
  args: { id: S.String },
  messages: [Message.CompletedReleaseDialogResources],
  execute: ({ id }) =>
    Dom.releaseDialogResources(id).pipe(
      Effect.as(Message.CompletedReleaseDialogResources()),
    ),
})

/** Apply to a native dialog. The caller owns visibility and dismissal policy. */
export const attributes = <Msg>(
  config: Readonly<{ id: string; visible: boolean; focusSelector: string }>,
  events: Readonly<{
    send: (message: Message) => Msg
    cancel: Msg
    unmounted: Msg
  }>,
  h: HtmlBuilder<Msg>,
) => [
  h.Id(config.id),
  // Foldkit dispatches its topmost Escape signal through the cancel binding.
  h.OnCancelPreventDefault(events.cancel),
  h.Open(config.visible),
  ...(config.visible
    ? [
        h.AriaModal(true),
        h.OnMount(
          Mount.mapMessage(
            AcquireResources({
              id: config.id,
              focusSelector: config.focusSelector,
            }),
            events.send,
          ),
        ),
        h.OnUnmount(events.unmounted),
      ]
    : []),
]
