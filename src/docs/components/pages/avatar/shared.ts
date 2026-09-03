import type { DocsExample } from '@/docs/components/page-definition';
import {
  foldkitApplication,
  staticComponentApplication,
} from '@/docs/components/pages/authored-page';

export const avatarPortrait = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%2318171b%22/%3E%3Ccircle cx=%2232%22 cy=%2225%22 r=%2212%22 fill=%22%23fafafa%22/%3E%3Cpath d=%22M10 64c2-16 10-24 22-24s20 8 22 24%22 fill=%22%23fafafa%22/%3E%3C/svg%3E';

const lifecycleSource = (renderer: 'tailwind' | 'stylex'): string =>
  foldkitApplication({
    title: 'Avatar — Image lifecycle',
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Avatar from '@/${renderer === 'tailwind' ? 'ui' : 'stylex'}/avatar'`,
    model: `export const Model = S.Struct({ avatar: Avatar.Model })
export type Model = typeof Model.Type`,
    messages: `export const GotAvatarMessage = m('GotAvatarMessage', { message: Avatar.Message })
export const Message = S.Union([GotAvatarMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { avatar: Avatar.init() },
  [],
]`,
    update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotAvatarMessage':
      return [{ ...model, avatar: Avatar.update(model.avatar, message.message) }, []]
  }
}`,
    view: `const portrait = '${avatarPortrait}'

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Avatar — Image lifecycle',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Avatar.avatar({ size: 'lg', children: [
      Avatar.avatarImage({
        src: portrait,
        alt: 'Ada Lovelace',
        model: model.avatar,
        toParentMessage: message => GotAvatarMessage({ message }),
      }, h),
      Avatar.avatarFallback({ model: model.avatar, children: ['AL'] }, h),
    ] }, h),
  ]),
})`,
  });

export const avatarExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Image lifecycle',
    description: 'Load and error events flow through the child update so fallback visibility is model-driven.',
    code: lifecycleSource(renderer),
  },
  {
    title: 'Initials only',
    description: 'Omit the image entirely when the application has no meaningful image source.',
    code: staticComponentApplication({
      componentName: 'Avatar',
      componentSlug: 'avatar',
      renderer,
      exampleName: 'Initials only',
      viewBody: `Avatar.avatar({ children: [
  Avatar.avatarFallback({ children: ['CN'] }, h),
] }, h),`,
    }),
  },
];
