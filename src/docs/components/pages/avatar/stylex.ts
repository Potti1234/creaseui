import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { avatarPortrait } from '@/docs/components/pages/avatar/shared';
import * as Avatar from '@/stylex/avatar';

export const avatarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? Avatar.avatar({
      size: 'lg',
      children: [
        Avatar.avatarImage({
          src: avatarPortrait,
          alt: 'Ada Lovelace',
          model: (model as { avatar: Avatar.Model }).avatar,
          toParentMessage: message => onMessageJson(JSON.stringify({
            _tag: 'GotAvatarPreviewMessage',
            message,
          })),
        }, h),
        Avatar.avatarFallback({
          model: (model as { avatar: Avatar.Model }).avatar,
          children: ['AL'],
        }, h),
      ],
    }, h)
  : Avatar.avatar({
      children: [Avatar.avatarFallback({ children: ['CN'] }, h)],
    }, h);
