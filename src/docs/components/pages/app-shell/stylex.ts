import { reset } from '@/stylex/reset'
import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  type AppShellFixture,
  appShellFixtures,
} from '@/docs/components/pages/app-shell/shared'
import { icon } from '@/lib/icon'
import { className } from '@/stylex/style'
import * as Alert from '@/stylex/alert'
import * as AppShell from '@/stylex/app-shell'
import * as Stack from '@/stylex/stack'

const styles = stylex.create({
  fill: { height: '100%', minHeight: 0, width: '100%' },
  heading: { fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.75rem' },
  body: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  logoLink: { gap: '0.5rem', alignItems: 'center', display: 'flex' },
  logoChip: {
    borderRadius: '0.5rem',
    alignItems: 'center',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    display: 'flex',
    justifyContent: 'center',
    height: '1.5rem',
    width: '1.5rem',
  },
  logoIcon: { height: '1rem', width: '1rem' },
  logoText: { fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.25rem' },
  sideNav: {
    padding: '0.5rem',
    gap: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '16.25rem',
  },
  navSectionTitle: {
    paddingInline: '0.5rem',
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1rem',
    paddingBlockEnd: '0.25rem',
  },
  navItem: {
    borderRadius: '0.5rem',
    gap: '0.5rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    color: 'var(--muted-foreground)',
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    height: '1.5rem',
  },
  navItemSelected: {
    borderRadius: '0.5rem',
    gap: '0.5rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    backgroundColor: 'var(--accent)',
    display: 'flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    height: '1.5rem',
  },
  navItemIcon: { height: '1rem', width: '1rem' },
  topNav: {
    gap: '1rem',
    paddingInline: '1rem',
    alignItems: 'center',
    display: 'flex',
    height: '3rem',
  },
  topNavItems: { gap: '0.25rem', alignItems: 'center', display: 'flex' },
  topNavItem: {
    borderRadius: '0.5rem',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  topNavItemSelected: {
    borderRadius: '0.5rem',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
  },
})

const navLogo = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.a(
    [h.Href('#'), h.Class(className(reset.link, styles.logoLink))],
    [
      h.span(
        [h.Class(className(styles.logoChip))],
        [icon('box', { class: className(styles.logoIcon) }, h)],
      ),
      h.span([h.Class(className(styles.logoText))], ['App Shell']),
    ],
  )

const sideNavItem = <Msg>(
  label: string,
  iconName: string,
  selected: boolean,
  h: HtmlBuilder<Msg>,
): Html =>
  h.a(
    [
      h.Href('#'),
      h.Class(
        className(
          reset.link,
          selected ? styles.navItemSelected : styles.navItem,
        ),
      ),
    ],
    [icon(iconName, { class: className(styles.navItemIcon) }, h), label],
  )

const sideNavFor = <Msg>(
  kind: AppShellFixture['kind'],
  h: HtmlBuilder<Msg>,
): Html => {
  const withHeader = kind === 'showcase' || kind === 'sideNav'
  const sections: ReadonlyArray<{
    title: string | undefined
    items: ReadonlyArray<Html>
  }> =
    kind === 'showcase'
      ? [
          {
            title: undefined,
            items: [
              sideNavItem('Home', 'house', true, h),
              sideNavItem('Reports', 'chart-column', false, h),
              sideNavItem('Documents', 'file-text', false, h),
              sideNavItem('Team', 'users', false, h),
            ],
          },
        ]
      : [
          {
            title: undefined as string | undefined,
            items: [
              sideNavItem('Dashboard', 'house', true, h),
              sideNavItem('Analytics', 'chart-column', false, h),
              sideNavItem('Projects', 'folder', false, h),
            ],
          },
          {
            title: 'Organization' as string | undefined,
            items: [
              sideNavItem('Team', 'users', false, h),
              sideNavItem('Settings', 'settings', false, h),
            ],
          },
        ]
  return h.nav(
    [h.Class(className(styles.sideNav))],
    [
      ...(withHeader ? [navLogo(h)] : []),
      ...sections.map(section =>
        Stack.vStack(
          {
            gap: 0.5,
            children: [
              ...(section.title === undefined
                ? []
                : [
                    h.div(
                      [h.Class(className(styles.navSectionTitle))],
                      [section.title],
                    ),
                  ]),
              ...section.items,
            ],
          },
          h,
        ),
      ),
    ],
  )
}

const topNav = <Msg>(h: HtmlBuilder<Msg>): Html => {
  const topNavItem = (label: string, selected: boolean): Html =>
    h.a(
      [
        h.Href('#'),
        h.Class(
          className(
            reset.link,
            selected ? styles.topNavItemSelected : styles.topNavItem,
          ),
        ),
      ],
      [label],
    )
  return h.nav(
    [h.AriaLabel('Main navigation'), h.Class(className(styles.topNav))],
    [
      navLogo(h),
      h.div(
        [h.Class(className(styles.topNavItems))],
        [
          topNavItem('Home', true),
          topNavItem('Products', false),
          topNavItem('Docs', false),
        ],
      ),
    ],
  )
}

const pageContent = <Msg>(h: HtmlBuilder<Msg>): Html =>
  Stack.vStack(
    {
      gap: 4,
      children: [
        h.h3(
          [h.Class(className(reset.text, styles.heading))],
          ['Page Content'],
        ),
        h.p(
          [h.Class(className(reset.text, styles.body))],
          [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
          ],
        ),
      ],
    },
    h,
  )

const banner = <Msg>(h: HtmlBuilder<Msg>): Html =>
  Alert.alert(
    {
      severity: 'info',
      announcement: 'status',
      children: [
        Alert.alertIcon(
          { children: [icon('info', { class: 'size-4' }, h)] },
          h,
        ),
        Alert.alertTitle({ children: ['System maintenance scheduled'] }, h),
        Alert.alertDescription(
          {
            children: [
              'The system will undergo maintenance tonight at 10pm UTC.',
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

const viewFor = <Msg>(fixture: AppShellFixture, h: HtmlBuilder<Msg>): Html => {
  const hasTop =
    fixture.kind === 'topNav' ||
    fixture.kind === 'topAndSide' ||
    fixture.kind === 'withBanner'
  const hasSide =
    fixture.kind === 'showcase' ||
    fixture.kind === 'sideNav' ||
    fixture.kind === 'topAndSide' ||
    fixture.kind === 'withBanner'
  return AppShell.appShell(
    {
      contentPadding: 6,
      layoutStyle: styles.fill,
      ...(hasTop ? { topNav: topNav(h) } : {}),
      ...(hasSide ? { sideNav: sideNavFor(fixture.kind, h) } : {}),
      ...(fixture.kind === 'withBanner' ? { banner: banner(h) } : {}),
      children: [pageContent(h)],
    },
    h,
  )
}

export const appShellStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => viewFor(appShellFixtures[exampleIndex] ?? appShellFixtures[0], h)
