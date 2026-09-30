import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  type AppShellFixture,
  appShellFixtures,
} from '@/docs/components/pages/app-shell/shared';
import { icon } from '@/lib/icon';
import { className } from '@/stylex/style';
import * as Alert from '@/stylex/alert';
import * as AppShell from '@/stylex/app-shell';
import * as Stack from '@/stylex/stack';

const styles = stylex.create({
  fill: { height: '100%', minHeight: 0, width: '100%' },
  heading: { fontSize: '1.0625rem', fontWeight: 600 },
  body: { fontSize: '0.875rem' },
  logoLink: { alignItems: 'center', display: 'flex', gap: '0.5rem' },
  logoChip: {
    alignItems: 'center',
    backgroundColor: 'var(--primary)',
    borderRadius: '0.375rem',
    color: 'var(--primary-foreground)',
    display: 'flex',
    height: '1.5rem',
    justifyContent: 'center',
    width: '1.5rem',
  },
  logoIcon: { height: '1rem', width: '1rem' },
  logoText: { fontSize: '0.875rem', fontWeight: 600 },
  sideNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    height: '100%',
    padding: '0.5rem',
    width: '16.25rem',
  },
  navSectionTitle: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    fontWeight: 500,
    paddingBlockEnd: '0.25rem',
    paddingInline: '0.5rem',
  },
  navItem: {
    alignItems: 'center',
    borderRadius: '0.375rem',
    color: 'var(--muted-foreground)',
    display: 'flex',
    fontSize: '0.875rem',
    gap: '0.5rem',
    height: '1.5rem',
    paddingInline: '0.5rem',
  },
  navItemSelected: {
    alignItems: 'center',
    backgroundColor: 'var(--accent)',
    borderRadius: '0.375rem',
    display: 'flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    gap: '0.5rem',
    height: '1.5rem',
    paddingInline: '0.5rem',
  },
  navItemIcon: { height: '1rem', width: '1rem' },
  topNav: {
    alignItems: 'center',
    display: 'flex',
    gap: '1rem',
    height: '3rem',
    paddingInline: '1rem',
  },
  topNavItems: { alignItems: 'center', display: 'flex', gap: '0.25rem' },
  topNavItem: {
    borderRadius: '0.375rem',
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
  },
  topNavItemSelected: {
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
  },
});

const navLogo = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.a([h.Href('#'), h.Class(className(styles.logoLink))], [
    h.span([h.Class(className(styles.logoChip))], [
      icon('box', { class: className(styles.logoIcon) }, h),
    ]),
    h.span([h.Class(className(styles.logoText))], ['App Shell']),
  ]);

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
        className(selected ? styles.navItemSelected : styles.navItem),
      ),
    ],
    [icon(iconName, { class: className(styles.navItemIcon) }, h), label],
  );

const sideNavFor = <Msg>(
  kind: AppShellFixture['kind'],
  h: HtmlBuilder<Msg>,
): Html => {
  const withHeader = kind === 'showcase' || kind === 'sideNav';
  const sections: ReadonlyArray<{ title: string | undefined; items: ReadonlyArray<Html> }> =
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
        ];
  return h.nav([h.Class(className(styles.sideNav))], [
    ...(withHeader ? [navLogo(h)] : []),
    ...sections.map(section =>
      Stack.vStack(
        {
          gap: 0.5,
          children: [
            ...(section.title === undefined
              ? []
              : [
                  h.div([h.Class(className(styles.navSectionTitle))], [
                    section.title,
                  ]),
                ]),
            ...section.items,
          ],
        },
        h,
      ),
    ),
  ]);
};

const topNav = <Msg>(h: HtmlBuilder<Msg>): Html => {
  const topNavItem = (label: string, selected: boolean): Html =>
    h.a(
      [
        h.Href('#'),
        h.Class(
          className(
            selected ? styles.topNavItemSelected : styles.topNavItem,
          ),
        ),
      ],
      [label],
    );
  return h.nav(
    [h.AriaLabel('Main navigation'), h.Class(className(styles.topNav))],
    [
      navLogo(h),
      h.div([h.Class(className(styles.topNavItems))], [
        topNavItem('Home', true),
        topNavItem('Products', false),
        topNavItem('Docs', false),
      ]),
    ],
  );
};

const pageContent = <Msg>(h: HtmlBuilder<Msg>): Html =>
  Stack.vStack(
    {
      gap: 4,
      children: [
        h.h3([h.Class(className(styles.heading))], ['Page Content']),
        h.p([h.Class(className(styles.body))], [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        ]),
      ],
    },
    h,
  );

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
  );

const viewFor = <Msg>(fixture: AppShellFixture, h: HtmlBuilder<Msg>): Html => {
  const hasTop =
    fixture.kind === 'topNav' ||
    fixture.kind === 'topAndSide' ||
    fixture.kind === 'withBanner';
  const hasSide =
    fixture.kind === 'showcase' ||
    fixture.kind === 'sideNav' ||
    fixture.kind === 'topAndSide' ||
    fixture.kind === 'withBanner';
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
  );
};

export const appShellStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => viewFor(appShellFixtures[exampleIndex] ?? appShellFixtures[0], h);
