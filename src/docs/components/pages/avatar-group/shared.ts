import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';
import { NIGHT_FOREST, MISTY_VALLEY, GOLDEN_SUNSET, SNOWY_PEAKS } from '@/docs/components/pages/thumbnail/shared';

export type AvatarEntry = Readonly<{
  name: string;
  /** Optional image source (data URI constant name in generated code). */
  src?: string;
}>;

export type AvatarGroupSection = Readonly<{
  label: string;
  /** crease Avatar sizes: sm = 24px, default = 32px, lg = 40px — astryx AvatarGroup sm/md/lg. */
  size: 'sm' | 'default' | 'lg';
  ariaLabel?: string;
  avatars: ReadonlyArray<AvatarEntry>;
  overflow?: Readonly<{ count: number; onClick?: boolean }>;
}>;

export type StatusDotEntry = Readonly<{
  name: string;
  variant: 'success' | 'neutral' | 'error';
  label: string;
}>;

export type AvatarGroupFixture = Readonly<{
  title: string;
  description: string;
  kind: 'groups' | 'status';
  sections: ReadonlyArray<AvatarGroupSection>;
  statusDots?: ReadonlyArray<StatusDotEntry>;
}>;

const TEAM = [
  { name: 'Alex Daniels' },
  { name: 'Ann Smith' },
  { name: 'Carol Davis' },
  { name: 'Gina Wilson' },
  { name: 'Eve Park' },
];

const MEMBERS = [
  { name: 'Alex Daniels' },
  { name: 'Ann Smith' },
  { name: 'Carol Davis' },
];

const PHOTO_USERS = [
  { name: 'Ami Pena', src: NIGHT_FOREST },
  { name: 'Drew Young', src: MISTY_VALLEY },
  { name: 'Gabriela Fernandez', src: GOLDEN_SUNSET },
  { name: 'Jihoo Song', src: SNOWY_PEAKS },
  { name: 'Nam Tran', src: NIGHT_FOREST },
];

export const avatarGroupFixtures: Readonly<[AvatarGroupFixture, ...Array<AvatarGroupFixture>]> = [
  {
    title: 'Avatar Group',
    description: 'Overlapping avatar rows with a sliced visible set and a server-side overflow count. Shows team members in a compact facepile layout.',
    kind: 'groups',
    sections: [
      { label: 'Team members', size: 'lg', avatars: TEAM },
      { label: 'With overflow', size: 'lg', avatars: TEAM.slice(0, 3), overflow: { count: 2 } },
    ],
  },
  {
    title: 'Avatar Group — Interactive',
    description: 'Avatars can link and the overflow chip can open a full member list.',
    kind: 'groups',
    sections: [
      { label: 'Reviewers', size: 'lg', ariaLabel: 'Reviewers', avatars: MEMBERS, overflow: { count: 15, onClick: true } },
      { label: 'Compact, static', size: 'sm', ariaLabel: 'Attendees', avatars: MEMBERS, overflow: { count: 15 } },
    ],
  },
  {
    title: 'Avatar — Group',
    description: 'Overlap multiple avatars in a row to represent a group of people. Use for team lists, PR reviewers, or participant counts where you want to show faces without taking up much space.',
    kind: 'groups',
    sections: [
      { label: 'Team members', size: 'lg', avatars: PHOTO_USERS, overflow: { count: 3 } },
      { label: 'Larger group', size: 'lg', avatars: PHOTO_USERS.slice(0, 3), overflow: { count: 8 } },
    ],
  },
  {
    title: 'Avatar — Status Dot',
    description: 'Add a status dot to an avatar to show whether someone is online, away, or busy. Use in chat, messaging, or any UI where knowing availability matters.',
    kind: 'status',
    sections: [],
    statusDots: [
      { name: 'Itai Jordaan', variant: 'success', label: 'Online' },
      { name: 'Margot Schroder', variant: 'neutral', label: 'Offline' },
      { name: 'Pablo Morales', variant: 'error', label: 'Busy' },
    ],
  },
];

const initials = (name: string): string =>
  name
    .split(' ')
    .map(part => part[0] ?? '')
    .join('')
    .slice(0, 2);

const DATA_URIS: Record<string, string> = {
  NIGHT_FOREST,
  MISTY_VALLEY,
  GOLDEN_SUNSET,
  SNOWY_PEAKS,
};
const uriConstName = (src: string): string =>
  Object.entries(DATA_URIS).find(([, v]) => v === src)?.[0] ?? 'NIGHT_FOREST';

const avatarSource = (entry: AvatarEntry, size: string, isStyleX: boolean): string => {
  const children = entry.src === undefined
    ? `[Avatar.avatarFallback({ children: ['${initials(entry.name)}'] }, h)]`
    : `[Avatar.avatarImage({ src: ${uriConstName(entry.src)}, alt: '${entry.name}', model: { status: 'loaded' } }, h)]`;
  return isStyleX
    ? `Avatar.avatar({ size: '${size}', ring: true, layoutStyle: styles.${size === 'lg' ? 'memberLg' : size === 'sm' ? 'memberSm' : 'memberDefault'}, children: ${children} }, h)`
    : `Avatar.avatar({ size: '${size}', children: ${children} }, h)`;
};

const sectionSource = (section: AvatarGroupSection, isStyleX: boolean): string => {
  const overflow = section.overflow === undefined
    ? ''
    : `,
          AvatarGroup.avatarGroupOverflow({ avatarSize: '${section.size === 'default' ? 'md' : section.size}', count: ${section.overflow.count}${section.overflow.onClick === true ? ', onClick: NoOp()' : ''} }, h)`;
  return `h.div(
        [h.Class(${isStyleX ? "stylex.props(styles.section).className ?? ''" : "'flex flex-col gap-1.5'"})],
        [
          h.span([h.Class(${isStyleX ? "stylex.props(styles.caption).className ?? ''" : "'text-xs text-muted-foreground'"})], ['${section.label}']),
          AvatarGroup.avatarGroup({ ${section.ariaLabel === undefined ? '' : `ariaLabel: '${section.ariaLabel}', `}avatarSize: '${section.size === 'default' ? 'md' : section.size}', children: [
            ${section.avatars.map(a => avatarSource(a, section.size, isStyleX)).join(',\n            ')}${overflow},
          ] }, h),
        ],
      )`;
};

const statusDotSource = (isStyleX: boolean): string => `
      h.div(
        [h.Class(${isStyleX ? "stylex.props(styles.row).className ?? ''" : "'flex items-center gap-4'"})],
        [
          ${(avatarGroupFixtures[3]?.statusDots ?? [])
            .map(
              dot => `h.div(
            [h.Class(${isStyleX ? "stylex.props(styles.avatarWrap).className ?? ''" : "'relative'"})],
            [
              Avatar.avatar({ size: 'lg', children: [Avatar.avatarFallback({ children: ['${initials(dot.name)}'] }, h)] }, h),
              h.div(
                [h.Class(${isStyleX ? "stylex.props(styles.dotSlot).className ?? ''" : "'absolute -bottom-1 -end-1'"})],
                [AvatarGroup.avatarStatusDot({ variant: '${dot.variant}', label: '${dot.label}', avatarSize: 'lg' }, h)],
              ),
            ],
          )`,
            )
            .join(',\n          ')},
        ],
      )`;

const source = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  const fixture = avatarGroupFixtures[index] ?? avatarGroupFixtures[0];
  const isStyleX = renderer === 'stylex';
  const componentImports = [
    `import * as Avatar from '@/${isStyleX ? 'stylex' : 'ui'}/avatar'`,
    isStyleX
      ? `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({ column: { display: 'flex', flexDirection: 'column', gap: '2rem' }, section: { display: 'flex', flexDirection: 'column', gap: '0.375rem' }, caption: { fontSize: '0.75rem', lineHeight: '1.25rem', color: 'var(--muted-foreground)' }, row: { display: 'flex', gap: '1rem', alignItems: 'center' }, avatarWrap: { position: 'relative' }, dotSlot: { position: 'absolute', bottom: '-4px', insetInlineEnd: '-4px' }, memberSm: { marginInlineStart: '-0.375rem' }, memberDefault: { marginInlineStart: '-0.5rem' }, memberLg: { marginInlineStart: '-0.625rem' } })`
      : '',
    `const NIGHT_FOREST = '${NIGHT_FOREST}'`,
    `const MISTY_VALLEY = '${MISTY_VALLEY}'`,
    `const GOLDEN_SUNSET = '${GOLDEN_SUNSET}'`,
    `const SNOWY_PEAKS = '${SNOWY_PEAKS}'`,
  ]
    .filter(Boolean)
    .join('\n');

  const viewBody =
    fixture.kind === 'status'
      ? statusDotSource(isStyleX)
      : `h.div(
      [h.Class(${isStyleX ? "stylex.props(styles.column).className ?? ''" : "'flex flex-col gap-8'"})],
      [
        ${fixture.sections.map(s => sectionSource(s, isStyleX)).join(',\n        ')},
      ],
    )`;

  return staticComponentApplication({
    componentName: 'AvatarGroup',
    componentSlug: 'avatar-group',
    renderer,
    exampleName: fixture.title,
    componentImports,
    viewBody,
  });
};

export const avatarGroupExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  avatarGroupFixtures.map((fixture, index) => ({
    title: fixture.title,
    description: fixture.description,
    code: source(index, renderer),
  }));
