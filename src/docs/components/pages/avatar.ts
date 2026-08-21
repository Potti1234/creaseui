import { Schema as S } from 'effect';
import { m } from 'foldkit/message';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, definePreviewProgram, foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as Avatar from '@/ui/avatar';

const portrait = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%2318171b%22/%3E%3Ccircle cx=%2232%22 cy=%2225%22 r=%2212%22 fill=%22%23fafafa%22/%3E%3Cpath d=%22M10 64c2-16 10-24 22-24s20 8 22 24%22 fill=%22%23fafafa%22/%3E%3C/svg%3E';

const GotAvatarPreviewMessage = m('GotAvatarPreviewMessage', { message: Avatar.Message });
type GotAvatarPreviewMessage = typeof GotAvatarPreviewMessage.Type;
const AvatarPreviewModel = S.Struct({ _docsPage: S.Literal('avatar'), avatar: Avatar.Model });
type AvatarPreviewModel = typeof AvatarPreviewModel.Type;
const previewProgram = definePreviewProgram<AvatarPreviewModel, GotAvatarPreviewMessage>({
  Model: AvatarPreviewModel,
  Message: GotAvatarPreviewMessage,
  init: () => ({ _docsPage: 'avatar', avatar: Avatar.init() }),
  update: (model, message) => [{ ...model, avatar: Avatar.update(model.avatar, message.message) }, []],
  view: (index, model, h) => index === 0
    ? Avatar.avatar({ size: 'lg', children: [Avatar.avatarImage({ src: portrait, alt: 'Ada Lovelace', model: model.avatar, toParentMessage: message => GotAvatarPreviewMessage({ message }) }, h), Avatar.avatarFallback({ model: model.avatar, children: ['AL'] }, h)] }, h)
    : Avatar.avatar({ children: [Avatar.avatarFallback({ children: ['CN'] }, h)] }, h),
});

const lifecycleSource = foldkitApplication({
  title: 'Avatar — Image lifecycle',
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Avatar from '@/ui/avatar'`,
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
  view: `const portrait = '${portrait}'

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

export const avatarPage = authoredPage({
  slug: 'avatar', title: 'Avatar', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Displays an identity image while explicitly tracking loading, loaded, and failed image states.',
    architecture: 'Avatar image lifecycle is a small child Model. Store Avatar.Model in the parent, wrap load/error Messages, and delegate them through Avatar.update; visual fallback selection then stays pure.',
    apiHref: 'https://foldkit.dev/core/submodels',
    composition: 'Avatar\n├── AvatarImage (child Model + Message)\n└── AvatarFallback',
    styling: 'Choose a stable size for each context and use initials or a recognizable neutral mark as fallback content.',
    accessibility: 'Image alt text names the represented person or object. The fallback remains visible while loading and after failure without producing duplicate image announcements.',
    examples: [
      {
        title: 'Image lifecycle', description: 'Load and error events flow through the child update so fallback visibility is model-driven.',
        preview: (model, h) => Avatar.avatar({ size: 'lg', children: [Avatar.avatarImage({ src: portrait, alt: 'Ada Lovelace', model: model.avatar, toParentMessage: (message) => State.GotAvatarMessage({ message }) }, h), Avatar.avatarFallback({ model: model.avatar, children: ['AL'] }, h)] }, h),
        code: lifecycleSource,
      },
      {
        title: 'Initials only', description: 'Omit the image entirely when the application has no meaningful image source.',
        preview: (_model, h) => Avatar.avatar({ children: [Avatar.avatarFallback({ children: ['CN'] }, h)] }, h),
        code: staticComponentApplication({ componentName: 'Avatar', componentSlug: 'avatar', exampleName: 'Initials only', viewBody: `Avatar.avatar({ children: [
  Avatar.avatarFallback({ children: ['CN'] }, h),
] }, h),` }),
      },
    ],
  },
});
