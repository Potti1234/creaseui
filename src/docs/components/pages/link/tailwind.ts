import { Schema as S } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import {
  linkFixtures,
  type LinkFixture,
} from '@/docs/components/pages/link/shared'
import * as Link from '@/ui/link'
import * as Text from '@/ui/text'

const InteractedWithLinkPreview = defineMessageUnion({
  InteractedWithLinkPreview: {},
})
type InteractedWithLinkPreview = typeof InteractedWithLinkPreview.Type
const LinkPreviewModel = S.Struct({ _docsPage: S.Literal('link') })
type LinkPreviewModel = typeof LinkPreviewModel.Type

const renderFixture = <Msg>(
  fixture: LinkFixture,
  h: HtmlBuilder<Msg>,
): Html => {
  switch (fixture.kind) {
    case 'showcase':
      return Link.link(
        { href: '#', isStandalone: true, children: ['Documentation'] },
        h,
      )
    case 'inline':
      return Text.text(
        {
          type: 'body',
          display: 'block',
          children: [
            'Browse the ',
            Link.link({ href: '#', children: ['documentation'] }, h),
            ' for installation steps.',
          ],
        },
        h,
      )
    case 'external':
      return h.div(
        [h.Class('flex flex-col gap-2 items-start')],
        (
          [
            ['GitHub', 'https://github.com', false],
            ['MDN', 'https://developer.mozilla.org', false],
            ['Foldkit', 'https://foldkit.dev', true],
          ] as const
        ).map(([label, url, underlined]) =>
          Link.link(
            {
              href: url,
              isExternalLink: true,
              isStandalone: true,
              ...(underlined ? { hasUnderline: true } : {}),
              children: [label],
            },
            h,
          ),
        ),
      )
    case 'tooltips':
      return h.div(
        [h.Class('flex flex-col gap-2 items-start')],
        (
          [
            ['Settings', '/settings', 'Manage your application preferences'],
            ['Profile', '/profile', 'View and edit your profile'],
            ['Help', '/help', 'Browse help articles and support'],
          ] as const
        ).map(([label, url, tip], index) =>
          Link.link(
            {
              href: url,
              isStandalone: true,
              tooltip: tip,
              ...(index === 2 ? { color: 'secondary' as const } : {}),
              children: [label],
            },
            h,
          ),
        ),
      )
  }
}

export const linkTailwindPreviewProgram = definePreviewProgram<
  LinkPreviewModel,
  InteractedWithLinkPreview
>({
  Model: LinkPreviewModel,
  Message: InteractedWithLinkPreview,
  init: () => ({ _docsPage: 'link' }),
  update: model => ({ model: model }),
  view: (index, _model, h) =>
    renderFixture(linkFixtures[index] ?? linkFixtures[0], h),
})
