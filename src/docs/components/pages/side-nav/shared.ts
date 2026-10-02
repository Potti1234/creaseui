import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

/** Renderer-neutral fixture shapes — `endBadge`/`endText`/`endMenu`/`heading.icon`
    are decorated per renderer (Badge.badge, Text-like span, icon button,
    Icon.icon). `onSelect` mirrors astryx's no-href item: activation reports
    the item id via the SelectedSideNavItem out message. */
export type SideNavFixtureItem = Readonly<{
  id: string;
  label: string;
  icon?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  href?: string;
  onSelect?: boolean;
  endBadge?: string;
  endText?: string;
  endMenu?: boolean;
  children?: ReadonlyArray<SideNavFixtureItem>;
}>;

export type SideNavFixtureHeading = Readonly<{
  heading: string;
  icon?: 'grid' | 'cube';
  headingHref?: string;
  superheading?: string;
  subheading?: string;
  menu?: ReadonlyArray<string>;
}>;

export type SideNavFixtureSection = Readonly<{
  title?: string;
  isHeaderHidden?: boolean;
  items: ReadonlyArray<SideNavFixtureItem>;
}>;

export type SideNavFixtureNav = Readonly<{
  heading?: SideNavFixtureHeading;
  sections?: ReadonlyArray<SideNavFixtureSection>;
  items?: ReadonlyArray<SideNavFixtureItem>;
  isCollapsible?: boolean;
  /** Hide the built-in footer collapse button (astryx collapsible.hasButton). */
  hasCollapseButton?: boolean;
  /** Render the collapse control inside the footer icon row
      (astryx footerIcons={<SideNavCollapseButton/>}). */
  footerCollapseButton?: boolean;
}>;

export type SideNavFixture = Readonly<{
  title: string;
  description?: string;
  navs: ReadonlyArray<SideNavFixtureNav>;
}>;

export const sideNavFixtures: Readonly<
  [SideNavFixture, ...Array<SideNavFixture>]
> = [
  {
    title: 'Side Nav',
    navs: [
      {
        heading: { heading: 'My App', headingHref: '/' },
        sections: [
          {
            title: 'Main',
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'house',
                isSelected: true,
                href: '/dashboard',
              },
              {
                id: 'projects',
                label: 'Projects',
                icon: 'folder',
                href: '/projects',
              },
              {
                id: 'analytics',
                label: 'Analytics',
                icon: 'chart-no-axes-combined',
                href: '/analytics',
              },
            ],
          },
          {
            title: 'Documents',
            items: [
              {
                id: 'documents',
                label: 'All Documents',
                icon: 'file-text',
                href: '/documents',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'SideNav — End Content',
    description:
      'Side navigation items with badges, counts, and context menus as trailing content.',
    navs: [
      {
        heading: { heading: 'My App', headingHref: '/' },
        sections: [
          {
            title: 'Navigation',
            isHeaderHidden: true,
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'house',
                isSelected: true,
                href: '/dashboard',
                endMenu: true,
              },
              {
                id: 'projects',
                label: 'Projects',
                icon: 'folder',
                href: '/projects',
                endBadge: '12',
              },
              {
                id: 'analytics',
                label: 'Analytics',
                icon: 'chart-no-axes-combined',
                href: '/analytics',
                endBadge: 'New',
              },
              {
                id: 'team',
                label: 'Team',
                icon: 'users',
                href: '/team',
                endText: '8 members',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'SideNav — Header with Menu',
    description:
      'Side navigation with an account switcher dropdown in the header for multi-account apps.',
    navs: [
      {
        heading: {
          heading: 'Product Name',
          icon: 'cube',
          subheading: 'Business Account',
          menu: ['Personal Account', 'Acme Corp', 'Add account', 'Sign out'],
        },
        sections: [
          {
            title: 'Navigation',
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'house',
                isSelected: true,
                onSelect: true,
              },
              { id: 'settings', label: 'Settings', icon: 'settings', onSelect: true },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'SideNav — Nested Items',
    description:
      'Side navigation with collapsible nested items for settings or hierarchical menus.',
    navs: [
      {
        heading: { heading: 'My App' },
        sections: [
          {
            title: 'Main',
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'house',
                isSelected: true,
                onSelect: true,
              },
              {
                id: 'settings',
                label: 'Settings',
                icon: 'settings',
                children: [
                  {
                    id: 'general',
                    label: 'General',
                    href: '/settings/general',
                  },
                  {
                    id: 'security',
                    label: 'Security',
                    href: '/settings/security',
                  },
                  {
                    id: 'notifications',
                    label: 'Notifications',
                    href: '/settings/notifications',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'SideNavCollapseButton — Basic',
    description:
      'Place a collapse button in the SideNav footer to let users toggle the rail between expanded and collapsed states.',
    navs: [
      {
        isCollapsible: true,
        hasCollapseButton: false,
        footerCollapseButton: true,
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: 'house',
            isSelected: true,
            href: '#',
          },
          { id: 'projects', label: 'Projects', icon: 'folder', href: '#' },
        ],
      },
    ],
  },
  {
    title: 'SideNavCollapseButton',
    description:
      'Demonstrates SideNavCollapseButton inside a collapsible SideNav.',
    navs: [
      {
        isCollapsible: true,
        hasCollapseButton: false,
        footerCollapseButton: true,
        heading: { heading: 'Workspace' },
        sections: [
          {
            title: 'Main',
            items: [
              {
                id: 'home',
                label: 'Home',
                icon: 'house',
                isSelected: true,
                href: '#',
              },
              { id: 'projects', label: 'Projects', icon: 'folder', href: '#' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'SideNavHeading — Basic',
    description:
      'A SideNav header with an app icon and a linked title. Pass it to the SideNav header prop to identify the product or workspace at the top of the navigation rail.',
    navs: [
      {
        heading: { heading: 'Analytics', icon: 'grid', headingHref: '/' },
      },
    ],
  },
  {
    title: 'SideNavHeading',
    description:
      'Demonstrates SideNavHeading with an app name, logo icon, superheading, and subheading.',
    navs: [
      {
        heading: { heading: 'Analytics', icon: 'grid', headingHref: '/' },
      },
      {
        heading: {
          heading: 'Analytics',
          icon: 'grid',
          headingHref: '/',
          superheading: 'Acme Corp',
          subheading: 'Production',
        },
      },
    ],
  },
  {
    title: 'SideNavItem — Basic',
    description:
      'Navigation links inside a SideNav, each with a label, an icon, and an href. Mark the item for the current page with isSelected.',
    navs: [
      {
        items: [
          {
            id: 'inbox',
            label: 'Inbox',
            icon: 'inbox',
            isSelected: true,
            href: '#',
          },
          { id: 'documents', label: 'Documents', icon: 'file', href: '#' },
        ],
      },
    ],
  },
  {
    title: 'SideNavItem',
    description:
      'Demonstrates SideNavItem with selected, icon, disabled, and nested states.',
    navs: [
      {
        items: [
          {
            id: 'inbox',
            label: 'Inbox',
            icon: 'inbox',
            isSelected: true,
            href: '#',
            endBadge: '12',
          },
          { id: 'documents', label: 'Documents', icon: 'file', href: '#' },
          {
            id: 'settings',
            label: 'Settings',
            icon: 'settings',
            href: '#',
            isDisabled: true,
          },
        ],
      },
    ],
  },
  {
    title: 'SideNavSection — Basic',
    description:
      'Group related SideNavItems under titled sections. Use sections to organize longer navigation lists into scannable clusters like Overview and Account.',
    navs: [
      {
        sections: [
          {
            title: 'Overview',
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'house',
                isSelected: true,
                href: '#',
              },
              {
                id: 'analytics',
                label: 'Analytics',
                icon: 'chart-no-axes-combined',
                href: '#',
              },
            ],
          },
          {
            title: 'Account',
            items: [{ id: 'profile', label: 'Profile', icon: 'user', href: '#' }],
          },
        ],
      },
    ],
  },
  {
    title: 'SideNavSection',
    description:
      'Demonstrates SideNavSection with titled groups of navigation items.',
    navs: [
      {
        sections: [
          {
            title: 'Overview',
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'house',
                isSelected: true,
                href: '#',
              },
              {
                id: 'analytics',
                label: 'Analytics',
                icon: 'chart-no-axes-combined',
                href: '#',
              },
            ],
          },
          {
            title: 'Account',
            items: [
              { id: 'profile', label: 'Profile', icon: 'user', href: '#' },
              { id: 'settings', label: 'Settings', icon: 'settings', href: '#' },
            ],
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Fixture introspection (which decorations the generated code needs)
// ---------------------------------------------------------------------------

const collectItems = (nav: SideNavFixtureNav): ReadonlyArray<SideNavFixtureItem> => [
  ...(nav.items ?? []),
  ...(nav.sections ?? []).flatMap(section => section.items),
];

const walkItems = (
  items: ReadonlyArray<SideNavFixtureItem>,
): ReadonlyArray<SideNavFixtureItem> =>
  items.flatMap(item => [item, ...walkItems(item.children ?? [])]);

const fixtureNeedsIcon = (fixture: SideNavFixture): boolean =>
  fixture.navs.some(
    nav =>
      nav.heading?.icon !== undefined ||
      collectItems(nav).some(item => walkItems([item]).some(i => i.icon !== undefined)) ||
      collectItems(nav).some(i => i.endMenu === true) ||
      nav.footerCollapseButton === true,
  );

const fixtureNeedsBadge = (fixture: SideNavFixture): boolean =>
  fixture.navs.some(nav =>
    collectItems(nav).some(
      item => walkItems([item]).some(i => i.endBadge !== undefined),
    ),
  );

const fixtureNeedsEndText = (fixture: SideNavFixture): boolean =>
  fixture.navs.some(nav =>
    collectItems(nav).some(
      item => walkItems([item]).some(i => i.endText !== undefined),
    ),
  );

const fixtureNeedsMenu = (fixture: SideNavFixture): boolean =>
  fixture.navs.some(nav => nav.heading?.menu !== undefined);

// ---------------------------------------------------------------------------
// Generated example source
// ---------------------------------------------------------------------------

const headingIconName = (icon: 'grid' | 'cube'): string =>
  icon === 'grid' ? 'layout-grid' : 'package';

const itemEndContentSource = (
  item: SideNavFixtureItem,
  isStyleX: boolean,
): string | undefined => {
  if (item.endBadge !== undefined) {
    return `Badge.badge({ children: ['${item.endBadge}'] }, h)`;
  }
  if (item.endText !== undefined) {
    return isStyleX
      ? `h.span([h.Class(stylex.props(styles.endText).className ?? '')], ['${item.endText}'])`
      : `h.span([h.Class('text-xs text-muted-foreground')], ['${item.endText}'])`;
  }
  if (item.endMenu === true) {
    return isStyleX
      ? `h.button([h.Type('button'), h.AriaLabel('More actions'), h.Class(stylex.props(styles.endMenu).className ?? '')], [Icon.icon('ellipsis', { class: stylex.props(styles.itemIcon).className ?? '' }, h)])`
      : `h.button([h.Type('button'), h.AriaLabel('More actions'), h.Class('inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground')], [Icon.icon('ellipsis', { class: 'size-3.5' }, h)])`;
  }
  return undefined;
};

const itemSource = (
  item: SideNavFixtureItem,
  isStyleX: boolean,
): string => {
  const fields: Array<string> = [`id: '${item.id}'`, `label: '${item.label}'`];
  if (item.icon !== undefined) {
    fields.push(`icon: '${item.icon}'`);
  }
  if (item.isSelected === true) {
    fields.push('isSelected: true');
  }
  if (item.isDisabled === true) {
    fields.push('isDisabled: true');
  }
  if (item.href !== undefined) {
    fields.push(`href: '${item.href}'`);
  }
  if (item.onSelect === true) {
    fields.push('onSelect: true');
  }
  const endContent = itemEndContentSource(item, isStyleX);
  if (endContent !== undefined) {
    fields.push(`endContent: ${endContent}`);
  }
  if (item.children !== undefined) {
    fields.push(
      `children: [${item.children
        .map(child => itemSource(child, isStyleX))
        .join(', ')}]`,
    );
  }
  return `{ ${fields.join(', ')} }`;
};

const headingSource = (
  heading: SideNavFixtureHeading,
  isStyleX: boolean,
): string => {
  const fields: Array<string> = [`heading: '${heading.heading}'`];
  if (heading.icon !== undefined) {
    fields.push(
      `icon: ${isStyleX
        ? `h.span([h.Class(stylex.props(styles.headingIconTile).className ?? '')], [Icon.icon('${headingIconName(heading.icon)}', { class: stylex.props(styles.headingIconGlyph).className ?? '' }, h)])`
        : `h.span([h.Class('flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground')], [Icon.icon('${headingIconName(heading.icon)}', { class: 'size-4' }, h)])`}`,
    );
  }
  if (heading.headingHref !== undefined) {
    fields.push(`headingHref: '${heading.headingHref}'`);
  }
  if (heading.superheading !== undefined) {
    fields.push(`superheading: '${heading.superheading}'`);
  }
  if (heading.subheading !== undefined) {
    fields.push(`subheading: '${heading.subheading}'`);
  }
  if (heading.menu !== undefined) {
    fields.push(
      `menu: [${heading.menu
        .map(label => `{ label: '${label}', href: '#' }`)
        .join(', ')}]`,
    );
  }
  return `{ ${fields.join(', ')} }`;
};

const sectionSource = (
  section: SideNavFixtureSection,
  isStyleX: boolean,
): string => {
  const fields: Array<string> = [];
  if (section.title !== undefined) {
    fields.push(`title: '${section.title}'`);
  }
  if (section.isHeaderHidden === true) {
    fields.push('isHeaderHidden: true');
  }
  fields.push(
    `items: [${section.items.map(item => itemSource(item, isStyleX)).join(', ')}]`,
  );
  return `{ ${fields.join(', ')} }`;
};

const viewInputsSource = (
  nav: SideNavFixtureNav,
  isStyleX: boolean,
): string => {
  const fields: Array<string> = [];
  if (nav.heading !== undefined) {
    fields.push(`heading: ${headingSource(nav.heading, isStyleX)}`);
  }
  if (nav.sections !== undefined) {
    fields.push(
      `sections: [${nav.sections
        .map(section => sectionSource(section, isStyleX))
        .join(', ')}]`,
    );
  }
  if (nav.items !== undefined) {
    fields.push(
      `items: [${nav.items.map(item => itemSource(item, isStyleX)).join(', ')}]`,
    );
  }
  if (nav.hasCollapseButton === false) {
    fields.push('hasCollapseButton: false');
  }
  if (nav.footerCollapseButton === true) {
    fields.push('footerCollapseButton: true');
  }
  fields.push(`ariaLabel: 'Docs nav'`);
  return `{ ${fields.join(', ')} }`;
};

const submodelSource = (
  modelField: string,
  messageTag: string,
  nav: SideNavFixtureNav,
  isStyleX: boolean,
): string => `h.submodel({
        slotId: '${modelField}',
        model: model.${modelField},
        view: SideNav.view,
        viewInputs: ${viewInputsSource(nav, isStyleX)},
        toParentMessage: message => Message['${messageTag}']({ message }),
      })`;

const initSource = (nav: SideNavFixtureNav, modelField: string, index: number): string =>
  `${modelField}: SideNav.init({ id: 'docs-side-nav-${index}'${
    nav.isCollapsible === true ? ', isCollapsible: true' : ''
  } })`;

const applySource = (
  modelField: string,
  messageTag: string,
): string => `const apply${modelField[0]!.toUpperCase()}${modelField.slice(1)} = (model: Model, result: ReturnType<typeof SideNav.update>): Update.Return<Model, Message> => {
  const commands = Command.mapMessages(result.commands ?? [], message => Message['${messageTag}']({ message }));
  const maybeSelectedId = result.outMessage?._tag === 'SelectedSideNavItem'
    ? Option.some(result.outMessage.id)
    : model.maybeSelectedId;
  return { model: { ...model, ${modelField}: result.model, maybeSelectedId }, commands };
};`;

const stylexStylesSource = (fixture: SideNavFixture): string => {
  const multi = fixture.navs.length > 1;
  const needsEndText = fixtureNeedsEndText(fixture);
  const needsEndMenu = fixture.navs.some(nav =>
    collectItems(nav).some(item => item.endMenu === true),
  );
  const needsTile = fixture.navs.some(nav => nav.heading?.icon !== undefined);
  const entries: Array<string> = [];
  if (fixtureNeedsIcon(fixture)) {
    entries.push(`itemIcon: { height: '1rem', width: '1rem' }`);
  }
  if (needsTile) {
    entries.push(
      `headingIconTile: { alignItems: 'center', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)', color: 'var(--primary-foreground)', display: 'flex', height: '1.5rem', justifyContent: 'center', width: '1.5rem' }`,
      `headingIconGlyph: { height: '1rem', width: '1rem' }`,
    );
  }
  if (needsEndText) {
    entries.push(
      `endText: { color: 'var(--muted-foreground)', fontSize: '0.75rem', lineHeight: '1rem' }`,
    );
  }
  if (needsEndMenu) {
    entries.push(
      `endMenu: { alignItems: 'center', appearance: 'none', backgroundColor: 'transparent', borderStyle: 'none', borderWidth: 0, borderRadius: 'var(--radius)', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'inline-flex', height: '1.25rem', justifyContent: 'center', padding: 0, width: '1.25rem' }`,
    );
  }
  if (multi) {
    entries.push(
      `wrap: { alignItems: 'flex-start', display: 'flex', gap: '1.5rem', height: '24rem' }`,
    );
  }
  return `const styles = stylex.create({\n  ${entries.join(',\n  ')},\n})`;
};

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => {
  const fixture = sideNavFixtures[index] ?? sideNavFixtures[0];
  const isStyleX = renderer === 'stylex';
  const ui = isStyleX ? 'stylex' : 'ui';
  const multi = fixture.navs.length > 1;
  const fields = fixture.navs.map((_nav, i) => `nav${i}`);
  const tags = fixture.navs.map(
    (_nav, i) => `GotSideNav${i}Message`,
  );
  const needsIcon = fixtureNeedsIcon(fixture);
  const needsBadge = fixtureNeedsBadge(fixture);

  const modelFields = fields.map(field => `${field}: SideNav.Model`).join(', ');
  const initFields = fixture.navs
    .map((nav, i) => initSource(nav, fields[i]!, i))
    .join(', ');

  const navsSource = fixture.navs
    .map((nav, i) => submodelSource(fields[i]!, tags[i]!, nav, isStyleX))
    .join(',\n    ');

  const stylexStyles = isStyleX
    ? `import * as stylex from '@stylexjs/stylex'

${stylexStylesSource(fixture)}`
    : '';

  const bodyWrapper = multi
    ? `h.div([h.Class(${isStyleX ? "stylex.props(styles.wrap).className ?? ''" : "'flex h-96 items-start gap-6'"})], [
      ${navsSource},
    ])`
    : `h.div([${isStyleX ? "h.Style({ height: '24rem' })" : "h.Class('h-96')"}], [
      ${navsSource},
    ])`;

  return foldkitApplication({
    title: `SideNav — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
${stylexStyles === '' ? '' : `${stylexStyles}\n`}
import * as SideNav from '@/${ui}/side-nav'${needsIcon ? `\nimport * as Icon from '@/lib/icon'` : ''}${needsBadge ? `\nimport * as Badge from '@/${ui}/badge'` : ''}`,
    model: `export const Model = S.Struct({ ${modelFields}, maybeSelectedId: S.Option(S.String) })
export type Model = typeof Model.Type`,
    messages: `import { defineMessageUnion } from 'foldkit/message'

export const Message = defineMessageUnion({
${tags.map(tag => `  ${tag}: { message: SideNav.Message },`).join('\n')}
});
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: { ${initFields}, maybeSelectedId: Option.none() } })`,
    update: `${fields
      .map((field, i) => applySource(field, tags[i]!))
      .join('\n\n')}

export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
${tags
  .map(
    (tag, i) =>
      `    case '${tag}': return apply${fields[i]![0]!.toUpperCase()}${fields[i]!.slice(1)}(model, SideNav.update(model.${fields[i]!}, message.message))`,
  )
  .join('\n')}
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'SideNav — ${fixture.title}',
  body: h.main([h.Class('mx-auto flex min-h-screen w-full max-w-3xl p-8')], [
    ${bodyWrapper},
  ]),
})`,
  });
};

export const sideNavExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  sideNavFixtures.map((fixture, index) => ({
    title: fixture.title,
    keepIdsCanonical: index === 0,
    ...(fixture.description === undefined
      ? {}
      : { description: fixture.description }),
    code: source(index, renderer),
  }));
