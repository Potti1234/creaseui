import { Anchor } from '@foldkit/ui'
import { Effect, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import * as Mount from 'foldkit/mount'

import { Message } from './position-native'

export * from './position-native'

export const AnchorConfig = Anchor.AnchorConfig
export type AnchorConfig = typeof AnchorConfig.Type
export type AnchorSetupConfig = Anchor.SetupConfig

export const portalToContainingRoot = Anchor.portalToContainingRoot
export const portalBackdrop = Anchor.portalBackdrop

/** Foldkit owns collision handling, scroll tracking, portal and focus policy. */
export const bindAnchor = (
  panel: Element,
  config: AnchorSetupConfig,
): (() => void) => Anchor.anchorSetup(panel, config)

export const mount = Mount.define('AttachPositionAnchor', {
  args: {
    buttonId: S.String,
    anchor: AnchorConfig,
    interceptTab: S.optionalKey(S.Boolean),
    focusAfterPosition: S.optionalKey(S.Boolean),
    focusSelector: S.optionalKey(S.String),
    arrowId: S.optionalKey(S.String),
    arrowPadding: S.optionalKey(S.Number),
  },
  messages: [Message.CompletedPosition],
  execute: ({ element, viewStateChanges: _viewStateChanges, ...config }) =>
    Effect.acquireRelease(
      Effect.sync(() => bindAnchor(element, config)),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedPosition())),
})

export const view = <Msg>(
  config: AnchorSetupConfig,
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
) => [
  h.Style({ position: 'absolute', margin: '0', visibility: 'hidden' }),
  h.OnMount(Mount.mapMessage(mount(config), send)),
]
