import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  linkFixtures,
  type LinkFixture,
} from '@/docs/components/pages/link/shared'
import * as Link from '@/stylex/link'
import { className } from '@/stylex/style'
import * as Text from '@/stylex/text'

const styles = stylex.create({
  column: {
    gap: '0.5rem',
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
  },
})

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
        [h.Class(className(styles.column))],
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
        [h.Class(className(styles.column))],
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

export const linkStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => renderFixture(linkFixtures[exampleIndex] ?? linkFixtures[0], h)
