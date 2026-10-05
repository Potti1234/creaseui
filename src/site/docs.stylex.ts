import * as stylex from '@stylexjs/stylex'
import { Stream } from 'effect'
import { Mount, Subscription } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as CodeFile from '@/lib/code-file'
import * as Icon from '@/lib/icon'
import { componentDocsPath } from '@/route'
import { COMPONENTS, toSlug, apiPurpose } from '@/docs/component-metadata'
import { heroFrame } from '@/docs/hero-frame'
import type {
  ComponentPageConfig,
  ExampleConfig,
  HeroExampleConfig,
} from '../docs/component-page'
import { reset } from '@/stylex/reset'
import { className } from '@/stylex/style'
import { tokens } from '../stylex/tokens.stylex'

export { COMPONENTS, componentTitle, toSlug } from '@/docs/component-metadata'
export type {
  ComponentPageConfig,
  ExampleConfig,
  HeroExampleConfig,
} from '../docs/component-page'

const styles = stylex.create({
  layout: {
    marginInline: 'auto',
    display: 'grid',
    width: '100%',
    maxWidth: '1500px',
    gridTemplateColumns: {
      default: 'minmax(0,1fr)',
      '@media (min-width: 1024px)': '220px minmax(0,1fr) 190px',
    },
  },
  sidebar: {
    display: { default: 'none', '@media (min-width: 1024px)': 'block' },
    position: 'sticky',
    top: '3.5rem',
    height: 'calc(100vh - 3.5rem)',
    overflowY: 'auto',
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: tokens.border,
    padding: '2.5rem 1.25rem',
  },
  toc: {
    display: { default: 'none', '@media (min-width: 1024px)': 'block' },
    position: 'sticky',
    top: '3.5rem',
    height: 'calc(100vh - 3.5rem)',
    overflowY: 'auto',
    padding: '2.5rem 1.25rem',
  },
  mobile: {
    display: { default: 'block', '@media (min-width: 1024px)': 'none' },
    margin: '1.25rem 1.25rem 0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: '.5rem',
  },
  summary: {
    cursor: 'pointer',
    padding: '.75rem 1rem',
    fontSize: '.875rem',
    fontWeight: 600,
  },
  mobileNav: {
    maxHeight: '55vh',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    padding: '.5rem',
  },
  main: {
    minWidth: 0,
    paddingBlock: { default: '2.5rem', '@media (min-width: 1024px)': '3.5rem' },
    paddingInline: {
      default: '1.25rem',
      '@media (min-width: 640px)': '2rem',
      '@media (min-width: 1024px)': '3rem',
    },
  },
  content: {
    marginInline: 'auto',
    maxWidth: '56rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '3.5rem',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    scrollMarginTop: '6rem',
    minWidth: 0,
  },
  tight: { display: 'flex', flexDirection: 'column', gap: '.375rem' },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.5rem',
  },
  title: {
    fontSize: '2.25rem',
    lineHeight: 1.12,
    fontWeight: 600,
    letterSpacing: '-.035em',
    textWrap: 'balance',
  },
  heading: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    fontWeight: 600,
    letterSpacing: '-.025em',
  },
  label: { fontSize: '.875rem', fontWeight: 600, marginBottom: '.75rem' },
  description: {
    maxWidth: '70ch',
    color: tokens.mutedForeground,
    fontSize: '.875rem',
    lineHeight: '1.5rem',
  },
  lead: { fontSize: '1rem', lineHeight: '1.75rem' },
  link: {
    color: { default: tokens.mutedForeground, ':hover': tokens.foreground },
    fontSize: '.875rem',
    textUnderlineOffset: '4px',
  },
  underline: { textDecorationLine: 'underline' },
  navLink: {
    display: 'block',
    padding: '.375rem .5rem',
    borderRadius: '.375rem',
    fontSize: '.875rem',
    color: { default: tokens.mutedForeground, ':hover': tokens.foreground },
    backgroundColor: { default: tokens.transparent, ':hover': tokens.accent },
  },
  navActive: {
    color: tokens.foreground,
    backgroundColor: tokens.muted,
    fontWeight: 500,
  },
  navList: { display: 'grid', gap: '.125rem' },
  badge: {
    display: 'inline-flex',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: '999px',
    padding: '.25rem .625rem',
    backgroundColor: tokens.muted,
    color: tokens.mutedForeground,
    fontSize: '.75rem',
    fontWeight: 500,
  },
  architecture: {
    borderBlockStyle: 'solid',
    borderBlockWidth: 1,
    borderBlockColor: tokens.border,
    padding: '1.25rem',
    backgroundColor: tokens.muted,
  },
  frame: {
    overflow: 'hidden',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: '.5rem',
    backgroundColor: tokens.background,
  },
  preview: {
    display: 'flex',
    minHeight: '16rem',
    alignItems: 'center',
    justifyContent: 'center',
    padding: { default: '1.5rem', '@media (min-width: 640px)': '2.5rem' },
    overflowX: 'auto',
  },
  stretch: { justifyContent: 'stretch' },
  code: {
    position: 'relative',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: '.5rem',
    backgroundColor: tokens.muted,
  },
  codeContent: {
    minWidth: 0,
    maxWidth: '100%',
    overflowX: 'auto',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '13px',
    lineHeight: '1.5rem',
  },
  codeDetails: {
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: tokens.border,
    backgroundColor: tokens.muted,
  },
  codeSummary: {
    cursor: 'pointer',
    padding: '.75rem 1rem',
    fontSize: '.875rem',
    fontWeight: 500,
  },
  copy: {
    position: 'absolute',
    top: 0,
    right: '.625rem',
    display: 'inline-flex',
    width: '2.25rem',
    height: '2.25rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '.375rem',
    cursor: 'pointer',
    color: { default: tokens.mutedForeground, ':hover': tokens.foreground },
    backgroundColor: {
      default: tokens.transparent,
      ':hover': tokens.background,
    },
  },
  icon: { width: '1rem', height: '1rem' },
  scroll: {
    overflowX: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: '.5rem',
  },
  table: {
    width: '100%',
    minWidth: '54rem',
    textAlign: 'left',
    fontSize: '.875rem',
    borderCollapse: 'collapse',
  },
  tableHead: { backgroundColor: tokens.muted },
  cell: {
    padding: '.75rem 1rem',
    verticalAlign: 'top',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  mono: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: '.75rem',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
  },
  keyboard: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0,1fr)',
      '@media (min-width: 640px)': '10rem minmax(0,1fr)',
    },
    gap: '.25rem',
    padding: '.75rem 1rem',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  pagination: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '1rem',
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: tokens.border,
    paddingTop: '2rem',
  },
})

const codeKey = (code: string): number =>
  [...code].reduce((hash, char) => (hash * 33 + char.charCodeAt(0)) | 0, 5381)

export const codeBlock = <Msg>(
  code: string,
  fileName: string,
  copy: Readonly<{ onCopy: Msg; isCopied: boolean; label: string }> | undefined,
  dark: boolean,
  mapEvent: (message: CodeFile.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class(className(styles.code))],
    [
      h.keyed('div')(
        `codeview-${fileName}-${dark}-${codeKey(code)}`,
        [
          h.Class(className(styles.codeContent)),
          h.OnMount(
            Mount.mapMessage(
              CodeFile.MountCodeFile({
                fileName,
                contents: code,
                dark,
                lineNumbers: false,
              }),
              mapEvent,
            ),
          ),
        ],
        [],
      ),
      ...(copy === undefined
        ? []
        : [
            h.button(
              [
                h.Type('button'),
                h.OnClick(copy.onCopy),
                h.AriaLabel(
                  copy.isCopied ? `${copy.label} copied` : `Copy ${copy.label}`,
                ),
                h.Class(className(reset.button, styles.copy)),
              ],
              [
                Icon.icon(
                  copy.isCopied ? 'check' : 'copy',
                  { class: className(styles.icon) },
                  h,
                ),
              ],
            ),
          ]),
    ],
  )

const exampleCard = <Msg>(
  config: HeroExampleConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class(className(styles.frame))],
    [
      h.div(
        [
          h.DataAttribute('example-preview', ''),
          h.Class(
            className(
              styles.preview,
              config.previewClass === 'justify-stretch' && styles.stretch,
            ),
          ),
        ],
        [config.preview],
      ),
      h.details(
        [h.Class(className(styles.codeDetails))],
        [
          h.summary([h.Class(className(styles.codeSummary))], ['View Code']),
          codeBlock(
            config.code,
            'example.ts',
            {
              onCopy: config.onCopy,
              isCopied: config.isCopied,
              label: `${config.title} example code`,
            },
            config.dark,
            config.codeFileMessage,
            h,
          ),
        ],
      ),
    ],
  )

export const hero = <Msg>(
  config: HeroExampleConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html => heroFrame(config, exampleCard(config, h), h)

export const example = <Msg>(
  config: ExampleConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.section(
    [
      h.Id(config.sectionId ?? toSlug(config.title)),
      h.Class(className(styles.stack)),
    ],
    [
      h.div(
        [h.Class(className(styles.tight))],
        [
          h.h2(
            [h.Class(className(reset.text, styles.heading))],
            [config.title],
          ),
          ...(config.description === undefined
            ? []
            : [
                h.p(
                  [h.Class(className(reset.text, styles.description))],
                  [config.description],
                ),
              ]),
        ],
      ),
      exampleCard(config, h),
    ],
  )

export const componentPage = <Msg>(
  config: ComponentPageConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const link = (href: string, label: string) =>
    h.a([h.Href(href), h.Class(className(reset.link, styles.link))], [label])
  const paragraph = (copy: string) =>
    h.p([h.Class(className(reset.text, styles.description))], [copy])
  const section = (
    id: string,
    title: string,
    children: ReadonlyArray<Html | string>,
  ) =>
    h.section(
      [h.Id(id), h.Class(className(styles.stack))],
      [
        h.h2([h.Class(className(reset.text, styles.heading))], [title]),
        ...children,
      ],
    )
  const code = (source: string, file: string, label: string) =>
    codeBlock(
      source,
      file,
      config.onCopyCode === undefined
        ? undefined
        : {
            onCopy: config.onCopyCode(source),
            isCopied: config.copiedCode === source,
            label,
          },
      config.dark === true,
      config.codeFileMessage,
      h,
    )
  const navItem = (name: string) =>
    h.li(
      [],
      [
        h.a(
          [
            h.Href(componentDocsPath(toSlug(name))),
            ...(config.name === name ? [h.AriaCurrent('page')] : []),
            h.Class(
              className(
                reset.link,
                styles.navLink,
                config.name === name && styles.navActive,
              ),
            ),
          ],
          [name],
        ),
      ],
    )
  const position = COMPONENTS.findIndex(name => name === config.name)
  const previous = COMPONENTS[position - 1]
  const next = COMPONENTS[position + 1]
  const toc = [
    ['architecture', 'How it fits Foldkit'],
    ['installation', 'Installation'],
    ['usage', 'Usage'],
    ...(config.sections ?? []).map(section => [section.id, section.title]),
    ...(config.composition === undefined
      ? []
      : [['composition', 'Composition']]),
    ...(config.exampleTitles ?? []),
    ...(config.styling === undefined ? [] : [['styling', 'Styling']]),
    ...(config.keyboard === undefined
      ? []
      : [['keyboard-interaction', 'Keyboard']]),
    ...(config.accessibility === undefined
      ? []
      : [['accessibility', 'Accessibility']]),
    ['api-reference', 'API Reference'],
  ]
  return h.div(
    [h.Class(className(styles.layout))],
    [
      h.details(
        [h.Class(className(styles.mobile))],
        [
          h.summary(
            [h.Class(className(styles.summary))],
            ['Browse components'],
          ),
          h.nav(
            [h.AriaLabel('Component navigation')],
            [
              h.ul(
                [h.Class(className(reset.list, styles.mobileNav))],
                COMPONENTS.map(navItem),
              ),
            ],
          ),
        ],
      ),
      h.aside(
        [
          h.Class(className(styles.sidebar)),
          h.OnMount({
            name: 'docs-sidebar-scroll',
            f: element => {
              if (!(element instanceof HTMLElement)) return Stream.empty
              const saved = Number(
                sessionStorage.getItem('creaseui-docs-sidebar-scroll'),
              )
              if (Number.isFinite(saved)) element.scrollTop = saved
              return Subscription.fromEvent<HTMLElement, 'scroll', Msg>({
                target: element,
                type: 'scroll',
                options: { passive: true },
                mapEvent: () => {
                  sessionStorage.setItem(
                    'creaseui-docs-sidebar-scroll',
                    String(element.scrollTop),
                  )
                  return config.sidebarScrolled
                },
              })
            },
          }),
        ],
        [
          h.nav(
            [h.AriaLabel('Component navigation')],
            [
              h.p(
                [h.Class(className(reset.text, styles.label))],
                ['Components'],
              ),
              h.ul(
                [h.Class(className(reset.list, styles.navList))],
                COMPONENTS.map(navItem),
              ),
            ],
          ),
        ],
      ),
      h.main(
        [h.Class(className(styles.main))],
        [
          h.div(
            [h.Class(className(styles.content))],
            [
              h.header(
                [h.Class(className(styles.stack))],
                [
                  h.div(
                    [h.AriaLabel('Breadcrumb'), h.Class(className(styles.row))],
                    [
                      link(componentDocsPath('accordion'), 'Docs'),
                      ' / ',
                      link(componentDocsPath('accordion'), 'Components'),
                      ' / ',
                      config.name,
                    ],
                  ),
                  h.h1(
                    [h.Class(className(reset.text, styles.title))],
                    [config.name],
                  ),
                  h.p(
                    [
                      h.Class(
                        className(reset.text, styles.description, styles.lead),
                      ),
                    ],
                    [config.description],
                  ),
                  h.div(
                    [h.Class(className(styles.row))],
                    [
                      h.span(
                        [h.Class(className(styles.badge))],
                        [
                          config.kind === 'helper'
                            ? 'Stateless helper'
                            : config.kind === 'submodel'
                              ? 'Stateful submodel'
                              : 'Composed recipe',
                        ],
                      ),
                      'Installed as source',
                      link(config.apiHref, 'API reference'),
                      ...(config.sourceHref === undefined
                        ? []
                        : [link(config.sourceHref, 'Source')]),
                    ],
                  ),
                ],
              ),
              ...(config.heroExample === undefined ? [] : [config.heroExample]),
              h.section(
                [
                  h.Id('architecture'),
                  h.Class(className(styles.stack, styles.architecture)),
                ],
                [
                  h.h2(
                    [h.Class(className(reset.text, styles.label))],
                    ['How it fits Foldkit'],
                  ),
                  paragraph(config.architecture),
                ],
              ),
              section('installation', 'Installation', [
                paragraph(
                  'Copy the StyleX source and its imports into your application. Configure the StyleX compiler and provide the theme variables. No Tailwind reset is required.',
                ),
                code(
                  config.installation,
                  'install.txt',
                  'installation instructions',
                ),
              ]),
              section('usage', 'Usage', [
                code(config.usage, 'usage.ts', 'usage example'),
              ]),
              ...(config.sections ?? []).map(item =>
                section(item.id, item.title, [
                  paragraph(item.description),
                  ...(item.code === undefined
                    ? []
                    : [code(item.code, `${item.id}.ts`, item.title)]),
                ]),
              ),
              ...(config.composition === undefined
                ? []
                : [
                    section('composition', 'Composition', [
                      code(
                        config.composition,
                        'composition.ts',
                        'composition example',
                      ),
                    ]),
                  ]),
              ...config.examples,
              ...(config.styling === undefined
                ? []
                : [section('styling', 'Styling', [paragraph(config.styling)])]),
              ...(config.keyboard === undefined
                ? []
                : [
                    section('keyboard-interaction', 'Keyboard interaction', [
                      h.dl(
                        [h.Class(className(reset.text, styles.frame))],
                        config.keyboard.map(([key, behavior]) =>
                          h.div(
                            [h.Class(className(styles.keyboard))],
                            [
                              h.dt([h.Class(className(styles.mono))], [key]),
                              h.dd(
                                [
                                  h.Class(
                                    className(reset.text, styles.description),
                                  ),
                                ],
                                [behavior],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ]),
                  ]),
              ...(config.accessibility === undefined
                ? []
                : [
                    section('accessibility', 'Accessibility', [
                      paragraph(config.accessibility),
                    ]),
                  ]),
              section('api-reference', 'API Reference', [
                paragraph(
                  config.apiDescription ??
                    'Behavior, keyboard interaction, and accessibility follow Foldkit conventions.',
                ),
                h.div(
                  [
                    h.Class(className(styles.scroll)),
                    h.Attribute('tabindex', '0'),
                  ],
                  [
                    h.table(
                      [h.Class(className(styles.table))],
                      [
                        h.thead(
                          [h.Class(className(styles.tableHead))],
                          [
                            h.tr(
                              [],
                              ['Export', 'Kind', 'Signature', 'Purpose'].map(
                                title =>
                                  h.th(
                                    [h.Class(className(styles.cell))],
                                    [title],
                                  ),
                              ),
                            ),
                          ],
                        ),
                        h.tbody(
                          [],
                          config.apiEntries.map(entry =>
                            h.tr(
                              [],
                              [
                                entry.name,
                                entry.kind,
                                entry.signature,
                                apiPurpose(entry),
                              ].map((value, index) =>
                                h.td(
                                  [
                                    h.Class(
                                      className(
                                        styles.cell,
                                        (index === 0 || index === 2) &&
                                          styles.mono,
                                      ),
                                    ),
                                  ],
                                  [value],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                h.div(
                  [h.Class(className(styles.row))],
                  [
                    link(config.apiHref, 'Foldkit API'),
                    ...(config.sourceHref === undefined
                      ? []
                      : [link(config.sourceHref, 'View source')]),
                  ],
                ),
              ]),
              h.nav(
                [
                  h.AriaLabel('Component pagination'),
                  h.Class(className(styles.pagination)),
                ],
                [
                  ...(previous === undefined
                    ? []
                    : [
                        link(
                          componentDocsPath(toSlug(previous)),
                          `← ${previous}`,
                        ),
                      ]),
                  ...(next === undefined
                    ? []
                    : [link(componentDocsPath(toSlug(next)), `${next} →`)]),
                ],
              ),
            ],
          ),
        ],
      ),
      h.aside(
        [h.Class(className(styles.toc))],
        [
          h.nav(
            [h.AriaLabel('On this page')],
            [
              h.p(
                [h.Class(className(reset.text, styles.label))],
                ['On this page'],
              ),
              h.ul(
                [h.Class(className(reset.list, styles.tight))],
                toc.map(([id, title]) =>
                  h.li([], [link(`#${id}`, title ?? '')]),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
