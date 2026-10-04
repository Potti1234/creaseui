import type { DocsExample } from '@/docs/components/page-definition'
import { staticComponentApplication } from '@/docs/components/pages/authored-page'

/* Astryx AppShell example blocks ported 1:1. astryx SideNav/TopNav/NavIcon
   composite components don't exist in Crease UI — the nav slots receive
   equivalent hand-built markup (260px SideNav, 48px TopNav, icon+label rows,
   selected item on the accent wash). astryx Banner → crease Alert
   severity="info". The useAppShellMobile hook example is not ported — the
   mobile drawer machinery is absent (see component PORT-NOTE). */

export type AppShellFixture = Readonly<{
  title: string
  description?: string
  kind:
    | 'showcase'
    | 'topNav'
    | 'sideNav'
    | 'contentOnly'
    | 'topAndSide'
    | 'withBanner'
}>

export const appShellFixtures: Readonly<
  [AppShellFixture, ...Array<AppShellFixture>]
> = [
  {
    title: 'App Shell',
    description: 'A basic app shell with content padding.',
    kind: 'showcase',
  },
  {
    title: 'AppShell — Top Nav Only',
    description:
      'Simple layout with TopNav and no side navigation, suitable for landing pages.',
    kind: 'topNav',
  },
  {
    title: 'AppShell — Side Nav Only',
    description:
      'App shell with SideNav header providing app identity, no TopNav needed.',
    kind: 'sideNav',
  },
  {
    title: 'AppShell — Content Only',
    description:
      'Minimal shell with no navigation, useful for full-bleed pages, auth screens, or embedded views.',
    kind: 'contentOnly',
  },
  {
    title: 'AppShell — Top Nav with Side Nav',
    description:
      'The most common layout with TopNav for app identity and SideNav for page-level navigation.',
    kind: 'topAndSide',
  },
  {
    title: 'AppShell — With Banner',
    description:
      'Full layout with TopNav, SideNav, and a dismissable info banner between the nav and content.',
    kind: 'withBanner',
  },
]

export const appShellPageContent = (
  renderer: 'tailwind' | 'stylex',
): string => {
  const heading =
    renderer === 'tailwind'
      ? `h.h3([h.Class('text-lg font-semibold')], ['Page Content'])`
      : `h.h3([h.Class(stylex.props(styles.heading).className ?? '')], ['Page Content'])`
  const body =
    renderer === 'tailwind'
      ? `h.p([h.Class('text-sm')], ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'])`
      : `h.p([h.Class(stylex.props(styles.body).className ?? '')], ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'])`
  return `Stack.vStack({ gap: 4, children: [
        ${heading},
        ${body},
      ] }, h)`
}

/* Emitted nav markup — one string per renderer, reused by the emitted example
   code below (the live previews build the same markup natively). */

const navLogoTw = `h.a([h.Href('#'), h.Class('flex items-center gap-2')], [
            h.span([h.Class('flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground')], [
              icon('box', { class: 'size-4' }, h),
            ]),
            h.span([h.Class('text-sm font-semibold')], ['App Shell']),
          ])`
const navLogoSx = `h.a([h.Href('#'), h.Class(stylex.props(styles.logoLink).className ?? '')], [
            h.span([h.Class(stylex.props(styles.logoChip).className ?? '')], [
              icon('box', { class: stylex.props(styles.logoIcon).className ?? '' }, h),
            ]),
            h.span([h.Class(stylex.props(styles.logoText).className ?? '')], ['App Shell']),
          ])`

const sideNavItemTw = (
  label: string,
  iconName: string,
  selected: boolean,
): string =>
  `h.a([h.Href('#'), h.Class('flex h-6 items-center gap-2 rounded-md px-2 text-sm${selected ? ' bg-accent font-medium' : ' text-muted-foreground'}')], [
                icon('${iconName}', { class: 'size-4' }, h),
                '${label}',
              ])`
const sideNavItemSx = (
  label: string,
  iconName: string,
  selected: boolean,
): string =>
  `h.a([h.Href('#'), h.Class(stylex.props(${selected ? 'styles.navItemSelected' : 'styles.navItem'}).className ?? '')], [
                icon('${iconName}', { class: stylex.props(styles.navItemIcon).className ?? '' }, h),
                '${label}',
              ])`

export const sideNavMarkup = (
  renderer: 'tailwind' | 'stylex',
  withHeader: boolean,
  sections: ReadonlyArray<{
    title?: string
    items: ReadonlyArray<{ label: string; icon: string; selected?: boolean }>
  }>,
): string => {
  const item = renderer === 'tailwind' ? sideNavItemTw : sideNavItemSx
  const logo = renderer === 'tailwind' ? navLogoTw : navLogoSx
  const sectionTitle = (title: string): string =>
    renderer === 'tailwind'
      ? `h.div([h.Class('px-2 pb-1 text-xs font-medium text-muted-foreground')], ['${title}'])`
      : `h.div([h.Class(stylex.props(styles.navSectionTitle).className ?? '')], ['${title}'])`
  const navClass =
    renderer === 'tailwind'
      ? `'flex h-full w-[260px] flex-col gap-1 p-2'`
      : `stylex.props(styles.sideNav).className ?? ''`
  return `h.nav([h.Class(${navClass})], [
          ${withHeader ? `${logo},` : ''}
          ${sections
            .map(
              section => `Stack.vStack({ gap: 0.5, children: [
            ${section.title === undefined ? '' : `${sectionTitle(section.title)},`}
            ...[
              ${section.items
                .map(it => item(it.label, it.icon, it.selected === true))
                .join(',\n              ')},
            ],
          ] }, h)`,
            )
            .join(',\n          ')},
        ])`
}

export const topNavMarkup = (renderer: 'tailwind' | 'stylex'): string => {
  const logo = renderer === 'tailwind' ? navLogoTw : navLogoSx
  const navClass =
    renderer === 'tailwind'
      ? `'flex h-12 items-center gap-4 px-4'`
      : `stylex.props(styles.topNav).className ?? ''`
  const itemsClass =
    renderer === 'tailwind'
      ? `'flex items-center gap-1'`
      : `stylex.props(styles.topNavItems).className ?? ''`
  const topNavItem = (label: string, selected: boolean): string =>
    renderer === 'tailwind'
      ? `h.a([h.Href('#'), h.Class('rounded-md px-2 py-1 text-sm${selected ? ' font-medium' : ' text-muted-foreground'}')], ['${label}'])`
      : `h.a([h.Href('#'), h.Class(stylex.props(${selected ? 'styles.topNavItemSelected' : 'styles.topNavItem'}).className ?? '')], ['${label}'])`
  return `h.nav([h.AriaLabel('Main navigation'), h.Class(${navClass})], [
          ${logo},
          h.div([h.Class(${itemsClass})], [
            ${topNavItem('Home', true)},
            ${topNavItem('Products', false)},
            ${topNavItem('Docs', false)},
          ]),
        ])`
}

const showcaseSections = [
  {
    title: 'Main',
    items: [
      { label: 'Home', icon: 'house', selected: true },
      { label: 'Reports', icon: 'chart-column' },
      { label: 'Documents', icon: 'file-text' },
      { label: 'Team', icon: 'users' },
    ],
  },
] as const

const sideNavSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: 'house', selected: true },
      { label: 'Analytics', icon: 'chart-column' },
      { label: 'Projects', icon: 'folder' },
    ],
  },
  {
    title: 'Organization',
    items: [
      { label: 'Team', icon: 'users' },
      { label: 'Settings', icon: 'settings' },
    ],
  },
] as const

export const sideNavFor = (
  kind: AppShellFixture['kind'],
  renderer: 'tailwind' | 'stylex',
): string =>
  kind === 'showcase'
    ? sideNavMarkup(renderer, true, showcaseSections)
    : sideNavMarkup(renderer, kind === 'sideNav', sideNavSections)

export const bannerMarkup = (renderer: 'tailwind' | 'stylex'): string =>
  `Alert.alert({ severity: 'info', announcement: 'status', children: [
            Alert.alertIcon({ children: [icon('info', { class: 'size-4' }, h)] }, h),
            Alert.alertTitle({ children: ['System maintenance scheduled'] }, h),
            Alert.alertDescription({ children: ['The system will undergo maintenance tonight at 10pm UTC.'] }, h),
          ] }, h)`

const emitBody = (
  fixture: AppShellFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  const content = appShellPageContent(renderer)
  const topNav =
    fixture.kind === 'topNav' ||
    fixture.kind === 'topAndSide' ||
    fixture.kind === 'withBanner'
      ? `topNav: ${topNavMarkup(renderer)},\n        `
      : ''
  const sideNav =
    fixture.kind === 'showcase' ||
    fixture.kind === 'sideNav' ||
    fixture.kind === 'topAndSide' ||
    fixture.kind === 'withBanner'
      ? `sideNav: ${sideNavFor(fixture.kind, renderer)},\n        `
      : ''
  const banner =
    fixture.kind === 'withBanner'
      ? `banner: ${bannerMarkup(renderer)},\n        `
      : ''
  const rootStyleProp =
    renderer === 'tailwind'
      ? `class: 'h-full min-h-0 w-full'`
      : `layoutStyle: styles.fill`
  return `AppShell.appShell(
      {
        contentPadding: 6,
        ${rootStyleProp},
        ${topNav}${sideNav}${banner}children: [
          ${content},
        ],
      },
      h,
    )`
}

const stylexStyles = `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  fill: { height: '100%', minHeight: 0, width: '100%' },
  heading: { fontSize: '1.0625rem', fontWeight: 600 },
  body: { fontSize: '0.875rem', lineHeight: '1.25rem' },
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
  logoText: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 600 },
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
    fontSize: '0.75rem', lineHeight: '1rem',
    fontWeight: 500,
    paddingBlockEnd: '0.25rem',
    paddingInline: '0.5rem',
  },
  navItem: {
    alignItems: 'center',
    borderRadius: '0.375rem',
    color: 'var(--muted-foreground)',
    display: 'flex',
    fontSize: '0.875rem', lineHeight: '1.25rem',
    gap: '0.5rem',
    height: '1.5rem',
    paddingInline: '0.5rem',
  },
  navItemSelected: {
    alignItems: 'center',
    backgroundColor: 'var(--accent)',
    borderRadius: '0.375rem',
    display: 'flex',
    fontSize: '0.875rem', lineHeight: '1.25rem',
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
    fontSize: '0.875rem', lineHeight: '1.25rem',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
  },
  topNavItemSelected: {
    borderRadius: '0.375rem',
    fontSize: '0.875rem', lineHeight: '1.25rem',
    fontWeight: 500,
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
  },
})`

const source = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  const fixture = appShellFixtures[index] ?? appShellFixtures[0]
  const mod = renderer === 'stylex' ? 'stylex' : 'ui'
  const componentImports = [
    `import * as Stack from '@/${mod}/stack'`,
    fixture.kind !== 'contentOnly' ? `import { icon } from '@/lib/icon'` : '',
    fixture.kind === 'withBanner'
      ? `import * as Alert from '@/${mod}/alert'`
      : '',
    renderer === 'stylex' ? stylexStyles : '',
  ]
    .filter(Boolean)
    .join('\n')
  return staticComponentApplication({
    componentName: 'AppShell',
    componentSlug: 'app-shell',
    renderer,
    exampleName: fixture.title,
    componentImports,
    viewBody: emitBody(fixture, renderer),
  })
}

export const appShellExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  appShellFixtures.map((fixture, index) => ({
    title: fixture.title,
    ...(fixture.description === undefined
      ? {}
      : { description: fixture.description }),
    code: source(index, renderer),
  }))
