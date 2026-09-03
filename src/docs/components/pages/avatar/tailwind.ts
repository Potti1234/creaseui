import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { avatarPortrait } from '@/docs/components/pages/avatar/shared';
import * as Avatar from '@/ui/avatar';

const GotAvatarPreviewMessage = m('GotAvatarPreviewMessage', {
  message: Avatar.Message,
});
type GotAvatarPreviewMessage = typeof GotAvatarPreviewMessage.Type;
const AvatarPreviewModel = S.Struct({
  _docsPage: S.Literal('avatar'),
  avatar: Avatar.Model,
});
type AvatarPreviewModel = typeof AvatarPreviewModel.Type;

export const avatarTailwindPreviewProgram = definePreviewProgram<
  AvatarPreviewModel,
  GotAvatarPreviewMessage
>({
  Model: AvatarPreviewModel,
  Message: GotAvatarPreviewMessage,
  init: () => ({ _docsPage: 'avatar', avatar: Avatar.init() }),
  update: (model, message) => [
    { ...model, avatar: Avatar.update(model.avatar, message.message) },
    [],
  ],
  view: (index, model, h) => index === 0
    ? Avatar.avatar({
        size: 'lg',
        children: [
          Avatar.avatarImage({
            src: avatarPortrait,
            alt: 'Ada Lovelace',
            model: model.avatar,
            toParentMessage: message => GotAvatarPreviewMessage({ message }),
          }, h),
          Avatar.avatarFallback({ model: model.avatar, children: ['AL'] }, h),
        ],
      }, h)
    : Avatar.avatar({
        children: [Avatar.avatarFallback({ children: ['CN'] }, h)],
      }, h),
});
