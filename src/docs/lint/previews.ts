import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import * as Heading from '@/ui/heading'
import * as Typography from '@/ui/typography'

export type LintPreviewKind = 'bad' | 'good'

export type LintButtonProps = Readonly<{
  variant?: 'default' | 'destructive' | 'outline'
  children: ReadonlyArray<string>
  fullWidth?: boolean
  broken?: 'padding' | 'restyle'
}>

export type LintDocsStyles = Readonly<{
  caseBlock: string
  caseHeader: string
  compare: string
  panel: string
  panelHeader: string
  badLabel: string
  goodLabel: string
  preview: string
  previewWide: string
  diagnostics: string
  diagnostic: string
  diagnosticMeta: string
  diagnosticRule: string
  diagnosticSource: string
  note: string
  terminal: string
}>

export type LintInviteFormProps<Msg> = Readonly<{
  formId: string
  submitsTo: string
  submitted: Msg
}>

export type LintRendererKit = Readonly<{
  styles: LintDocsStyles
  primaryVars: ReadonlyArray<string>
  button: <Msg>(props: LintButtonProps, h: HtmlBuilder<Msg>) => Html
  /** Form with a required email field and a footer submit outside it,
      linked through `form: submitsTo`. */
  inviteForm: <Msg>(
    props: LintInviteFormProps<Msg>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const DESTRUCTIVE = 'var(--destructive)'
const FIXED_PRIMARY = 'oklch(0.577 0.245 27.325)'

const heading = <Msg>(text: string, h: HtmlBuilder<Msg>): Html =>
  Heading.heading({ level: 3, children: [text] }, h)

const muted = <Msg>(text: string, h: HtmlBuilder<Msg>): Html =>
  Typography.typographyMuted({ children: [text] }, h)

const stack = <Msg>(
  kit: LintRendererKit,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Msg>,
): Html => h.div([h.Class(kit.styles.preview)], [...children])

/** Small annotation inside a preview panel — used for rules whose effect is
    device- or engine-specific and cannot be rendered here. */
const note = <Msg>(
  kit: LintRendererKit,
  text: string,
  h: HtmlBuilder<Msg>,
): Html => h.p([h.Class(kit.styles.note)], [text])

const previewCol = <Msg>(
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.Style({
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: '100%',
      }),
    ],
    [...children],
  )

const inlineIcon = <Msg>(name: string, h: HtmlBuilder<Msg>): Html =>
  h.span(
    [
      h.Style({
        display: 'inline-flex',
        fontSize: '1rem',
        verticalAlign: '-0.125em',
      }),
    ],
    [Icon.icon<Msg>(name, {}, h)],
  )

/** Live renders of each documented case: the bad version is the UI the
    flagged code actually produces, the good version uses the installed
    component on this site's renderer. */
export const lintPreview = <Msg>(
  kit: LintRendererKit,
  key: string,
  kind: LintPreviewKind,
  h: HtmlBuilder<Msg>,
  submitted: Msg,
): Html => {
  const bad = kind === 'bad'
  const one = (child: Html): Html => stack(kit, [child], h)
  const { button } = kit
  switch (key) {
    case 'no-raw-controls/raw-button':
      return one(
        bad
          ? h.button([h.Type('button')], ['Save changes'])
          : button({ children: ['Save changes'] }, h),
      )
    case 'no-raw-composition/raw-layout':
      return bad
        ? one(
            h.div([], [h.h1([], ['Billing']), h.p([], ['Manage your plan.'])]),
          )
        : stack(kit, [heading('Billing', h), muted('Manage your plan.', h)], h)
    case 'no-unapproved-renderer/implementation-export':
      return one(
        bad
          ? h.button(
              [h.Type('button'), h.DataAttribute('slot', 'button')],
              ['Delete'],
            )
          : button({ variant: 'outline', children: ['Delete'] }, h),
      )
    case 'no-application-styles/inline-style':
      return one(
        bad
          ? h.div(
              [h.Style({ color: 'red', padding: '13px' })],
              ['Plan renews on May 1'],
            )
          : muted('Plan renews on May 1', h),
      )
    case 'component-contract/unknown-variant':
      return one(
        button(
          { variant: bad ? 'default' : 'outline', children: ['Upgrade'] },
          h,
        ),
      )
    case 'component-contract/layout-padding':
      return h.div(
        [h.Class(kit.styles.previewWide)],
        [
          button(
            bad
              ? { broken: 'padding', children: ['Continue'] }
              : { children: ['Continue'] },
            h,
          ),
        ],
      )
    case 'no-unverifiable-ui/opaque-spread':
      return one(
        button({ variant: bad ? 'default' : 'outline', children: ['Save'] }, h),
      )
    case 'no-component-restyle/color-class':
      return one(
        button(
          bad
            ? { broken: 'restyle', children: ['Cancel plan'] }
            : { variant: 'destructive', children: ['Cancel plan'] },
          h,
        ),
      )
    case 'require-static-class/runtime-class':
      return one(
        button(
          bad
            ? { broken: 'restyle', children: ['Cancel plan'] }
            : { variant: 'destructive', children: ['Cancel plan'] },
          h,
        ),
      )
    case 'form-association/unknown-form-tailwind':
    case 'form-association/unknown-form-stylex':
    case 'form-association/unknown-form-pleat':
      return h.div(
        [h.Class(kit.styles.previewWide)],
        [
          kit.inviteForm(
            {
              formId: `lint-invite-member-form-${kind}`,
              submitsTo: bad
                ? `lint-invite-form-${kind}`
                : `lint-invite-member-form-${kind}`,
              submitted,
            },
            h,
          ),
        ],
      )
    case 'no-foldkit-inline-style/inline-style-tailwind':
    case 'no-foldkit-inline-style/inline-style-stylex':
    case 'no-foldkit-inline-style/inline-style-pleat':
      return one(
        bad
          ? h.div(
              [h.Style({ color: '#b91c1c', padding: '12px' })],
              ['Payment failed'],
            )
          : h.div([h.Style({ color: DESTRUCTIVE })], ['Payment failed']),
      )
    case 'stylex-component-contract/class-on-stylex':
    case 'stylex-component-contract/class-on-pleat':
      return h.div(
        [h.Class(kit.styles.previewWide)],
        [
          button(
            bad
              ? { children: ['Continue'] }
              : { fullWidth: true, children: ['Continue'] },
            h,
          ),
        ],
      )
    case 'no-stylex-escape/raw-stylex':
    case 'prefer-composition-primitives/raw-div':
      return one(
        bad
          ? h.div([h.Style({ color: 'red' })], ['Revenue'])
          : heading('Revenue', h),
      )
    case 'pleat-prop-limits/raw-color':
    case 'no-raw-colors/palette-class':
      return h.div(
        [
          h.Style({
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            width: '100%',
          }),
        ],
        ['light', 'dark'].map(scope =>
          h.div(
            [
              h.Class(scope),
              h.Style({
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                padding: '0.75rem 1rem',
              }),
            ],
            [
              h.span(
                [
                  h.Style({
                    color: 'var(--muted-foreground)',
                    fontSize: '0.75rem',
                  }),
                ],
                [scope === 'dark' ? 'Dark theme' : 'Light theme'],
              ),
              h.span(
                [
                  h.Style({
                    color: bad ? '#b91c1c' : DESTRUCTIVE,
                    fontWeight: '500',
                  }),
                ],
                ['Payment failed'],
              ),
            ],
          ),
        ),
      )
    case 'no-arbitrary-values/arbitrary-width': {
      const box = (width: string, label: string): Html =>
        h.div(
          [
            h.Style({
              alignItems: 'center',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              height: '2.25rem',
              justifyContent: 'center',
              width,
            }),
          ],
          [label],
        )
      return h.div(
        [h.Style({ display: 'flex', gap: '0.5rem' })],
        [box(bad ? '45px' : '2.25rem', '!'), box('2.25rem', '?')],
      )
    }
    case 'css/global-component-rule':
      return one(
        bad
          ? button({ broken: 'restyle', children: ['Save changes'] }, h)
          : h.div(
              [
                h.Style(
                  Object.fromEntries(
                    kit.primaryVars.map(name => [name, FIXED_PRIMARY]),
                  ),
                ),
              ],
              [button({ children: ['Save changes'] }, h)],
            ),
      )
    case 'theme/undefined-role':
      return one(
        h.div(
          [
            h.Style({
              border: `1px solid ${bad ? 'currentColor' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '1rem 1.25rem',
            }),
          ],
          ['Card with a border'],
        ),
      )
    case 'doctor/unregistered-component':
      return one(
        h.span(
          [
            h.Style(
              bad
                ? { background: '#facc15', color: '#000', padding: '2px 6px' }
                : {
                    background: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--secondary-foreground)',
                    fontSize: '.75rem',
                    fontWeight: '500',
                    padding: '2px 8px',
                  },
            ),
          ],
          ['Beta'],
        ),
      )
    case 'scope/loosened-config':
      return one(
        bad
          ? h.button([h.Type('button')], ['Save changes'])
          : button({ children: ['Save changes'] }, h),
      )
    case 'no-native-glyphs/arrow-glyph-tailwind':
    case 'no-native-glyphs/arrow-glyph-stylex':
    case 'no-native-glyphs/arrow-glyph-pleat':
      return one(
        h.a(
          [
            h.Href('#'),
            h.Style({ color: 'var(--primary)', textDecoration: 'none' }),
          ],
          bad
            ? ['Continue to installation →']
            : ['Continue to installation ', inlineIcon('arrow-right', h)],
        ),
      )
    case 'no-native-glyphs/emoji-label-tailwind':
    case 'no-native-glyphs/emoji-label-stylex':
    case 'no-native-glyphs/emoji-label-pleat':
      return one(
        h.span(
          [
            h.Style({
              alignItems: 'center',
              display: 'inline-flex',
              gap: '0.375rem',
            }),
          ],
          bad ? ['🚀 Deploy now'] : ['Deploy now', inlineIcon('rocket', h)],
        ),
      )
    case 'defensive-prefer-overflow-auto/forced-scrollbar': {
      const navItem = (label: string): Html =>
        h.div([h.Style({ fontSize: '0.8125rem' })], [label])
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  height: '5.5rem',
                  overflowY: bad ? 'scroll' : 'auto',
                  padding: '0.5rem 0.75rem',
                  width: '11rem',
                }),
              ],
              [navItem('Dashboard'), navItem('Billing'), navItem('Settings')],
            ),
            bad
              ? note(
                  kit,
                  'The scrollbar track renders even though everything fits.',
                  h,
                )
              : note(
                  kit,
                  'The scrollbar only appears when content overflows.',
                  h,
                ),
          ],
          h,
        ),
      )
    }
    case 'defensive-no-space-between-wrap/wrapped-rows-drift': {
      const chip = (label: string): Html =>
        h.span(
          [
            h.Style({
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              flexShrink: '0',
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
            }),
          ],
          [label],
        )
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  display: 'flex',
                  flexWrap: 'wrap',
                  width: '13rem',
                  ...(bad
                    ? { justifyContent: 'space-between' }
                    : { gap: '0.75rem' }),
                }),
              ],
              ['Status', 'Owner', 'Due date', 'Actions', 'Priority'].map(chip),
            ),
            bad
              ? note(
                  kit,
                  'Wrapped rows stretch to the edges — spacing is no longer controlled.',
                  h,
                )
              : note(kit, 'gap keeps the same spacing on every row.', h),
          ],
          h,
        ),
      )
    }
    case 'defensive-auto-fill-not-fit/stretching-empty-tracks': {
      const cell = (label: string): Html =>
        h.div(
          [
            h.Style({
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.75rem',
              padding: '0.5rem',
            }),
          ],
          [label],
        )
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  display: 'grid',
                  gap: '0.5rem',
                  gridTemplateColumns: `repeat(${bad ? 'auto-fit' : 'auto-fill'}, minmax(5.5rem, 1fr))`,
                  width: '100%',
                }),
              ],
              [cell('Card A'), cell('Card B')],
            ),
            bad
              ? note(
                  kit,
                  'auto-fit collapses the empty tracks, so both cards stretch.',
                  h,
                )
              : note(
                  kit,
                  'auto-fill keeps the empty tracks — cards stay their size.',
                  h,
                ),
          ],
          h,
        ),
      )
    }
    case 'defensive-hover-media/stuck-hover':
      return one(
        previewCol(
          [
            h.a(
              [
                h.Href('#'),
                h.Style({
                  color: 'var(--primary)',
                  textDecoration: 'underline',
                }),
              ],
              ['Docs link'],
            ),
            bad
              ? note(
                  kit,
                  'Touch-device issue, invisible here: after a tap, :hover stays applied until something else is tapped.',
                  h,
                )
              : note(
                  kit,
                  'Hover still works on a precise pointer; touch taps never trigger it.',
                  h,
                ),
          ],
          h,
        ),
      )
    case 'defensive-bg-image-fallback/missing-fallback-color':
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  alignItems: 'center',
                  backgroundImage: 'url(/lint-preview/missing-hero.png)',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  height: '4.5rem',
                  justifyContent: 'center',
                  ...(bad ? {} : { backgroundColor: '#1c1f2a' }),
                }),
              ],
              [
                h.span(
                  [
                    h.Style({
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }),
                  ],
                  ['Build faster'],
                ),
              ],
            ),
            bad
              ? note(
                  kit,
                  'The image 404s, so the white headline sits on the page background — invisible.',
                  h,
                )
              : note(kit, 'The fallback color keeps the headline readable.', h),
          ],
          h,
        ),
      )
    case 'defensive-background-repeat/tiling-texture': {
      const logo =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="9" fill="#6366f1"/><circle cx="10" cy="10" r="3" fill="#fff"/></svg>`,
        )
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  backgroundColor: 'var(--muted)',
                  backgroundImage: `url("${logo}")`,
                  borderRadius: 'var(--radius)',
                  height: '4rem',
                  width: '100%',
                  ...(bad
                    ? {}
                    : {
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }),
                }),
              ],
              [],
            ),
            bad
              ? note(
                  kit,
                  'background-repeat defaults to repeat — the logo tiles.',
                  h,
                )
              : note(kit, 'no-repeat renders the logo once, centered.', h),
          ],
          h,
        ),
      )
    }
    case 'defensive-css-var-fallback/undefined-variable':
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }),
              ],
              [
                h.div(
                  [
                    h.Style({
                      background: 'var(--secondary)',
                      borderRadius: 'var(--radius)',
                      height: '1rem',
                      position: 'relative',
                      top: bad ? 'var(--banner-top)' : 'var(--banner-top, 0px)',
                      width: '6rem',
                    }),
                  ],
                  [],
                ),
              ],
            ),
            note(
              kit,
              'No visual difference here: --banner-top is undefined, so var() drops the declaration silently. Only the fallback argument saves it.',
              h,
            ),
          ],
          h,
        ),
      )
    case 'defensive-flex-min-size/unshrinkable-truncate':
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  alignItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  fontSize: '0.8125rem',
                  gap: '0.5rem',
                  maxWidth: '15rem',
                  overflow: 'hidden',
                  padding: '0.5rem 0.75rem',
                }),
              ],
              [
                h.span(
                  [
                    h.Style({
                      flex: '1',
                      minWidth: bad ? 'auto' : '0',
                      ...(bad
                        ? {}
                        : { overflow: 'hidden', textOverflow: 'ellipsis' }),
                      whiteSpace: 'nowrap',
                    }),
                  ],
                  ['Q3 revenue report — final review notes for the board'],
                ),
                h.span(
                  [
                    h.Style({
                      color: 'var(--muted-foreground)',
                      flexShrink: '0',
                      fontSize: '0.75rem',
                    }),
                  ],
                  ['2h ago'],
                ),
              ],
            ),
            bad
              ? note(
                  kit,
                  'min-width: auto keeps the title at full size — the timestamp is pushed out of the row.',
                  h,
                )
              : note(kit, 'min-w-0 lets the title shrink and truncate.', h),
          ],
          h,
        ),
      )
    case 'defensive-image-object-fit/distorted-avatar': {
      const photo =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#0ea5e9"/><circle cx="80" cy="45" r="22" fill="#fbbf24"/><rect x="20" y="60" width="120" height="30" fill="#0c4a6e"/></svg>`,
        )
      return one(
        previewCol(
          [
            h.img([
              h.Src(photo),
              h.Alt('Team photo'),
              h.Style({
                borderRadius: '50%',
                height: '4rem',
                width: '4rem',
                ...(bad ? {} : { objectFit: 'cover' as const }),
              }),
            ]),
            bad
              ? note(kit, 'The landscape photo squashes into a square.', h)
              : note(kit, 'object-fit: cover crops instead of distorting.', h),
          ],
          h,
        ),
      )
    }
    case 'defensive-input-font-size/ios-zoom':
      return one(
        previewCol(
          [
            h.input([
              h.Type('text'),
              h.Placeholder('Search…'),
              h.Style({
                border: '1px solid var(--input)',
                borderRadius: 'var(--radius)',
                fontSize: bad ? '0.875rem' : '1rem',
                padding: '0.375rem 0.75rem',
                width: '100%',
              }),
            ]),
            bad
              ? note(
                  kit,
                  'iOS-Safari-only behavior: focusing a control under 16px zooms the page and leaves it zoomed.',
                  h,
                )
              : note(
                  kit,
                  '16px text keeps iOS Safari from zooming on focus.',
                  h,
                ),
          ],
          h,
        ),
      )
    case 'defensive-sticky-grid-align/unsticky-sidebar':
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  height: '6.5rem',
                  overflowY: 'auto',
                }),
              ],
              [
                h.div(
                  [
                    h.Style({
                      display: 'grid',
                      gap: '0.75rem',
                      gridTemplateColumns: '4.5rem 1fr',
                      padding: '0.5rem',
                    }),
                  ],
                  [
                    h.div(
                      [
                        h.Style({
                          background: 'var(--secondary)',
                          borderRadius: 'calc(var(--radius) - 2px)',
                          fontSize: '0.75rem',
                          padding: '0.375rem',
                          position: 'sticky',
                          top: '0',
                          ...(bad ? {} : { alignSelf: 'start' }),
                        }),
                      ],
                      ['Nav'],
                    ),
                    h.div(
                      [h.Style({ fontSize: '0.75rem', lineHeight: '1.5' })],
                      [
                        'Scroll me. ' +
                          'Content '.repeat(60) +
                          'end of the long column.',
                      ],
                    ),
                  ],
                ),
              ],
            ),
            bad
              ? note(
                  kit,
                  'Scroll the panel: the nav is stretched to the grid height, so sticky never engages and it scrolls away.',
                  h,
                )
              : note(kit, 'Scroll the panel: self-start pins the nav.', h),
          ],
          h,
        ),
      )
    case 'defensive-overscroll-contain/leaky-scroll':
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  height: '8rem',
                  overflowY: 'auto',
                  padding: '0.5rem',
                }),
              ],
              [
                h.div(
                  [
                    h.Style({
                      fontSize: '0.75rem',
                      lineHeight: '1.5',
                      marginBottom: '0.5rem',
                    }),
                  ],
                  ['Page content above the drawer.'],
                ),
                h.div(
                  [
                    h.Style({
                      background: 'var(--muted)',
                      borderRadius: 'calc(var(--radius) - 2px)',
                      fontSize: '0.75rem',
                      height: '4rem',
                      overflowY: 'auto',
                      padding: '0.375rem',
                      ...(bad ? {} : { overscrollBehavior: 'contain' }),
                    }),
                  ],
                  Array.from({ length: 10 }, (_, i) =>
                    h.div(
                      [
                        h.Style({
                          lineHeight: '1.8',
                          padding: '0 0.25rem',
                          whiteSpace: 'nowrap',
                        }),
                      ],
                      [`Drawer item ${i + 1}`],
                    ),
                  ),
                ),
                h.div(
                  [
                    h.Style({
                      fontSize: '0.75rem',
                      lineHeight: '1.5',
                      marginTop: '0.5rem',
                    }),
                  ],
                  [
                    'Page content below keeps scrolling once the drawer is exhausted. '.repeat(
                      4,
                    ),
                  ],
                ),
              ],
            ),
            note(
              kit,
              'Scroll the drawer list to its end: without overscroll-contain the wheel leaks to the page; with it, the page stays put.',
              h,
            ),
          ],
          h,
        ),
      )
    case 'defensive-prefer-min-size/clipped-content':
      return one(
        previewCol(
          [
            h.div(
              [
                h.Style({
                  alignItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  fontSize: '0.8125rem',
                  minHeight: '2.25rem',
                  overflow: 'hidden',
                  padding: '0 0.5rem',
                  ...(bad ? { width: '8.5rem' } : { minWidth: '8.5rem' }),
                }),
              ],
              ['Notificationssettings'],
            ),
            bad
              ? note(
                  kit,
                  'A longer label (translation, larger text) clips against the fixed width.',
                  h,
                )
              : note(kit, 'min-width keeps the default but lets it grow.', h),
          ],
          h,
        ),
      )
    case 'defensive-scrollbar-gutter/page-root-overflow':
      return one(
        previewCol(
          [
            note(
              kit,
              'Viewport-level behavior, not previewable here: the page jumps sideways when a scrollbar appears — scrollbar-gutter: stable reserves the space.',
              h,
            ),
          ],
          h,
        ),
      )
    default:
      return one(muted('No preview for this case.', h))
  }
}
