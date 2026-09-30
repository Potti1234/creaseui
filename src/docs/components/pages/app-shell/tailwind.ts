import type { Html, HtmlBuilder } from 'foldkit/html';

import {
  type AppShellFixture,
  appShellFixtures,
} from '@/docs/components/pages/app-shell/shared';
import { icon } from '@/lib/icon';
import * as Alert from '@/ui/alert';
import * as AppShell from '@/ui/app-shell';
import * as Stack from '@/ui/stack';

const navLogo = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.a([h.Href('#'), h.Class('flex items-center gap-2')], [
    h.span(
      [
        h.Class(
          'flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground',
        ),
      ],
      [icon('box', { class: 'size-4' }, h)],
    ),
    h.span([h.Class('text-sm font-semibold')], ['App Shell']),
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
        `flex h-6 items-center gap-2 rounded-md px-2 text-sm${
          selected ? ' bg-accent font-medium' : ' text-muted-foreground'
        }`,
      ),
    ],
    [icon(iconName, { class: 'size-4' }, h), label],
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
  return h.nav([h.Class('flex h-full w-[260px] flex-col gap-1 p-2')], [
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
                    [
                      h.Class(
                        'px-2 pb-1 text-xs font-medium text-muted-foreground',
                      ),
                    ],
                    [section.title],
                  ),
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
          `rounded-md px-2 py-1 text-sm${
            selected ? ' font-medium' : ' text-muted-foreground'
          }`,
        ),
      ],
      [label],
    );
  return h.nav(
    [h.AriaLabel('Main navigation'), h.Class('flex h-12 items-center gap-4 px-4')],
    [
      navLogo(h),
      h.div([h.Class('flex items-center gap-1')], [
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
        h.h3([h.Class('text-lg font-semibold')], ['Page Content']),
        h.p([h.Class('text-sm')], [
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

const viewFor = <Msg>(
  fixture: AppShellFixture,
  h: HtmlBuilder<Msg>,
): Html => {
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
      class: 'h-full min-h-0 w-full',
      ...(hasTop ? { topNav: topNav(h) } : {}),
      ...(hasSide ? { sideNav: sideNavFor(fixture.kind, h) } : {}),
      ...(fixture.kind === 'withBanner' ? { banner: banner(h) } : {}),
      children: [pageContent(h)],
    },
    h,
  );
};

export type AppShellStaticPreview = <Msg>(
  model: Readonly<Record<string, never>>,
  h: HtmlBuilder<Msg>,
) => Html;

export const appShellTailwindPreviews: ReadonlyArray<AppShellStaticPreview> =
  appShellFixtures.map(fixture => (_m, h) => viewFor(fixture, h));
