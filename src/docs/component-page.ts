import { Stream } from 'effect';
import { Subscription } from 'foldkit';
import { type Html, type HtmlBuilder } from 'foldkit/html';

import * as Icon from '@/lib/icon';
import { cn } from '@/lib/utils';
import { componentDocsPath } from '@/route';

export const COMPONENTS = [
  'Accordion',
  'Alert',
  'Alert Dialog',
  'Aspect Ratio',
  'Attachment',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Button Group',
  'Bubble',
  'Calendar',
  'Carousel',
  'Card',
  'Chart',
  'Checkbox',
  'Collapsible',
  'Combobox',
  'Command',
  'Context Menu',
  'Data Table',
  'Date Picker',
  'Dialog',
  'Direction',
  'Dropdown Menu',
  'Drawer',
  'Empty',
  'Field',
  'Form',
  'Hover Card',
  'Input',
  'Input Group',
  'Input OTP',
  'Item',
  'Kbd',
  'Label',
  'Marker',
  'Message',
  'Message Scroller',
  'Menubar',
  'Native Select',
  'Navigation Menu',
  'Pagination',
  'Popover',
  'Progress',
  'Radio Group',
  'Resizable',
  'Scroll Area',
  'Select',
  'Separator',
  'Sheet',
  'Sidebar',
  'Skeleton',
  'Slider',
  'Sonner',
  'Spinner',
  'Switch',
  'Table',
  'Tabs',
  'Textarea',
  'Toast',
  'Toggle',
  'Toggle Group',
  'Tooltip',
  'Typography',
] as const;

const toSlug = (name: string): string =>
  name.toLowerCase().replaceAll(' ', '-');

export const componentTitle = (slug: string): string | undefined =>
  COMPONENTS.find((name) => toSlug(name) === slug);

export type ExampleConfig<Msg> = Readonly<{
  title: string;
  description?: string;
  preview: Html;
  code: string;
  onCopy: Msg;
  isCopied: boolean;
  previewClass?: string;
}>;

export const codeBlock = <Msg>(
  code: string,
  copy: Readonly<{ onCopy: Msg; isCopied: boolean; label: string }> | undefined,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.Class(
        'relative min-w-0 max-w-full overflow-hidden rounded-lg border bg-muted/35',
      ),
    ],
    [
      h.pre(
        [
          h.Class(
            'overflow-x-auto p-4 pr-14 font-mono text-[13px] leading-6 text-foreground',
          ),
        ],
        [h.code([h.Class('block w-max min-w-full')], [code])],
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
                h.Title(copy.isCopied ? 'Copied' : 'Copy code'),
                h.Class(
                  'absolute top-2.5 right-2.5 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
                ),
              ],
              [
                Icon.icon<Msg>(
                  copy.isCopied ? 'check' : 'copy',
                  { class: 'size-4' },
                  h,
                ),
              ],
            ),
          ]),
    ],
  );
};

const heading = <Msg>(
  id: string,
  title: string,
  className = 'text-xl font-semibold tracking-tight',
  h: HtmlBuilder<Msg>,
): Html => {
  return h.h2(
    [h.Class(`${className} group flex items-center gap-2`)],
    [
      title,
      h.a(
        [
          h.Href(`#${id}`),
          h.AriaLabel(`Link to ${title}`),
          h.Class(
            'opacity-0 text-muted-foreground transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          ),
        ],
        ['#'],
      ),
    ],
  );
};

export const example = <Msg>(
  config: ExampleConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.section(
    [h.Id(toSlug(config.title)), h.Class('scroll-mt-24 space-y-4')],
    [
      h.div(
        [h.Class('space-y-1.5')],
        [
          heading<Msg>(
            toSlug(config.title),
            config.title,
            'text-xl font-semibold tracking-tight text-balance',
            h,
          ),
          ...(config.description === undefined
            ? []
            : [
                h.p(
                  [
                    h.Class(
                      'max-w-[70ch] text-sm leading-6 text-muted-foreground',
                    ),
                  ],
                  [config.description],
                ),
              ]),
        ],
      ),
      h.div(
        [h.Class('overflow-hidden rounded-lg border bg-background')],
        [
          h.div(
            [
              h.Class(
                cn(
                  'flex min-h-64 items-center justify-center p-6 sm:p-10',
                  config.previewClass,
                ),
              ),
            ],
            [config.preview],
          ),
          h.div(
            [h.Class('relative border-t bg-muted/35')],
            [
              h.input([
                h.Id(`example-code-${toSlug(config.title)}`),
                h.Type('checkbox'),
                h.Class('peer sr-only'),
              ]),
              h.div(
                [
                  h.Class(
                    'relative max-h-[7.25rem] overflow-hidden pb-11 [mask-image:linear-gradient(to_bottom,black_35%,transparent_100%)] peer-checked:max-h-none peer-checked:[mask-image:none]',
                  ),
                ],
                [
                  h.pre(
                    [
                      h.Class(
                        'min-w-0 max-w-full overflow-x-auto p-4 pr-14 font-mono text-[13px] leading-6 text-foreground',
                      ),
                    ],
                    [
                      h.code(
                        [h.Class('block w-max min-w-full')],
                        [config.code],
                      ),
                    ],
                  ),
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(config.onCopy),
                      h.AriaLabel(
                        config.isCopied
                          ? `${config.title} example code copied`
                          : `Copy ${config.title} example code`,
                      ),
                      h.Title(config.isCopied ? 'Copied' : 'Copy code'),
                      h.Class(
                        cn(
                          'absolute top-2.5 right-2.5 inline-flex size-10 items-center justify-center rounded-md outline-none transition-[color,background-color,transform] hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]',
                          config.isCopied
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground hover:text-foreground',
                        ),
                      ),
                    ],
                    [
                      Icon.icon<Msg>(
                        'copy',
                        {
                          class: cn(
                            'absolute size-4 transition-[scale,opacity,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                            config.isCopied
                              ? 'scale-25 opacity-0 blur-[4px]'
                              : 'scale-100 opacity-100 blur-0',
                          ),
                        },
                        h,
                      ),
                      Icon.icon<Msg>(
                        'check',
                        {
                          class: cn(
                            'absolute size-4 transition-[scale,opacity,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                            config.isCopied
                              ? 'scale-100 opacity-100 blur-0'
                              : 'scale-25 opacity-0 blur-[4px]',
                          ),
                        },
                        h,
                      ),
                    ],
                  ),
                ],
              ),
              h.label(
                [
                  h.For(`example-code-${toSlug(config.title)}`),
                  h.Class(
                    'absolute bottom-2.5 left-1/2 z-10 flex min-h-10 -translate-x-1/2 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-[color,background-color,transform] hover:bg-accent active:scale-[0.96] peer-checked:[&_.hide-code-label]:inline peer-checked:[&_.view-code-label]:hidden peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
                  ),
                ],
                [
                  Icon.codeXml<Msg>({ class: 'size-4' }, h),
                  h.span([h.Class('view-code-label')], ['View Code']),
                  h.span([h.Class('hide-code-label hidden')], ['Hide Code']),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

export type ComponentPageConfig<Msg> = Readonly<{
  name: string;
  description: string;
  installation: string;
  usage: string;
  examples: ReadonlyArray<Html>;
  apiHref: string;
  composition?: string;
  exampleTitles?: ReadonlyArray<string>;
  copiedCode?: string | null;
  onCopyCode?: (code: string) => Msg;
  sourceHref?: string;
  apiDescription?: string;
  sidebarScrolled: Msg;
}>;

const SIDEBAR_SCROLL_KEY = 'creaseui-docs-sidebar-scroll';

export const componentPage = <Msg>(
  config: ComponentPageConfig<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const navItem = (name: string): Html => {
    const slug = toSlug(name);
    const isCurrent = name === config.name;

    return h.li(
      [],
      [
        h.a(
          [
            h.Href(componentDocsPath(slug)),
            h.AriaCurrent(isCurrent ? 'page' : 'false'),
            h.Class(
              cn(
                'block rounded-md px-2 py-1.5 text-sm transition-colors',
                isCurrent
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              ),
            ),
          ],
          [name],
        ),
      ],
    );
  };

  const currentIndex = COMPONENTS.findIndex((name) => name === config.name);
  const previous = currentIndex > 0 ? COMPONENTS[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? COMPONENTS[currentIndex + 1] : undefined;
  const toc: ReadonlyArray<readonly [string, string]> = [
    ['installation', 'Installation'],
    ['usage', 'Usage'],
    ...(config.composition === undefined
      ? []
      : [['composition', 'Composition'] as const]),
    ...(config.exampleTitles ?? []).map(
      (title) => [toSlug(title), title] as const,
    ),
    ['api-reference', 'API Reference'],
  ];
  const copy = (code: string, label: string) =>
    config.onCopyCode === undefined
      ? undefined
      : {
          onCopy: config.onCopyCode(code),
          isCopied: config.copiedCode === code,
          label,
        };

  return h.div(
    [
      h.Class(
        'mx-auto grid w-full max-w-[1500px] lg:grid-cols-[220px_minmax(0,1fr)_190px]',
      ),
    ],
    [
      h.details(
        [h.Class('mx-5 mt-5 rounded-lg border bg-background lg:hidden')],
        [
          h.summary(
            [h.Class('cursor-pointer px-4 py-3 text-sm font-semibold')],
            ['Browse components'],
          ),
          h.nav(
            [
              h.AriaLabel('Component navigation'),
              h.Class('max-h-[55vh] overflow-y-auto border-t p-2'),
            ],
            [
              h.ul(
                [h.Class('grid grid-cols-2 gap-0.5 sm:grid-cols-3')],
                COMPONENTS.map(navItem),
              ),
            ],
          ),
        ],
      ),
      h.aside(
        [
          h.Class(
            'hidden border-r px-5 py-10 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto',
          ),
          h.OnMount({
            name: 'docs-sidebar-scroll',
            f: (element) => {
              if (!(element instanceof HTMLElement)) return Stream.empty;

              const savedScrollTop = Number(
                sessionStorage.getItem(SIDEBAR_SCROLL_KEY),
              );
              if (Number.isFinite(savedScrollTop))
                element.scrollTop = savedScrollTop;

              return Subscription.fromEvent<Event, Msg>({
                target: element,
                type: 'scroll',
                options: { passive: true },
                toMessage: () => {
                  sessionStorage.setItem(
                    SIDEBAR_SCROLL_KEY,
                    String(element.scrollTop),
                  );
                  return config.sidebarScrolled;
                },
              });
            },
          }),
        ],
        [
          h.nav(
            [h.AriaLabel('Component navigation')],
            [
              h.p([h.Class('mb-3 px-2 text-sm font-semibold')], ['Components']),
              h.ul([h.Class('space-y-0.5')], COMPONENTS.map(navItem)),
            ],
          ),
        ],
      ),
      h.main(
        [h.Class('min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14')],
        [
          h.div(
            [h.Class('mx-auto max-w-4xl space-y-14')],
            [
              h.header(
                [h.Class('space-y-4')],
                [
                  h.div(
                    [
                      h.AriaLabel('Breadcrumb'),
                      h.Class(
                        'flex flex-wrap items-center gap-2 text-sm text-muted-foreground',
                      ),
                    ],
                    [
                      h.a(
                        [
                          h.Href('/docs/components/accordion'),
                          h.Class('hover:text-foreground'),
                        ],
                        ['Docs'],
                      ),
                      h.span([h.AriaHidden(true)], ['/']),
                      h.a(
                        [
                          h.Href('/docs/components/accordion'),
                          h.Class('hover:text-foreground'),
                        ],
                        ['Components'],
                      ),
                      h.span([h.AriaHidden(true)], ['/']),
                      h.span([h.AriaCurrent('page')], [config.name]),
                    ],
                  ),
                  h.h1(
                    [
                      h.Class(
                        'text-4xl font-semibold tracking-[-0.035em] text-balance',
                      ),
                    ],
                    [config.name],
                  ),
                  h.p(
                    [
                      h.Class(
                        'max-w-[70ch] text-base leading-7 text-muted-foreground',
                      ),
                    ],
                    [config.description],
                  ),
                  h.p(
                    [
                      h.Class(
                        'inline-flex items-center rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground',
                      ),
                    ],
                    ['Foldkit-native · source-owned'],
                  ),
                ],
              ),
              h.section(
                [h.Id('installation'), h.Class('scroll-mt-24 space-y-4')],
                [
                  heading<Msg>('installation', 'Installation', '', h),
                  h.div(
                    [h.Class('space-y-3')],
                    [
                      h.div(
                        [
                          h.Class(
                            'flex flex-wrap gap-2 text-xs text-muted-foreground',
                          ),
                        ],
                        [
                          'CLI (npm / pnpm / yarn / bun)',
                          h.span([h.AriaHidden(true)], ['·']),
                          'Manual: copy the registry-owned source into your app',
                        ],
                      ),
                      codeBlock<Msg>(
                        config.installation,
                        copy(config.installation, 'installation command'),
                        h,
                      ),
                    ],
                  ),
                ],
              ),
              h.section(
                [h.Id('usage'), h.Class('scroll-mt-24 space-y-4')],
                [
                  heading<Msg>('usage', 'Usage', '', h),
                  codeBlock<Msg>(
                    config.usage,
                    copy(config.usage, 'usage example'),
                    h,
                  ),
                ],
              ),
              ...(config.composition === undefined
                ? []
                : [
                    h.section(
                      [h.Id('composition'), h.Class('scroll-mt-24 space-y-4')],
                      [
                        heading<Msg>('composition', 'Composition', '', h),
                        codeBlock<Msg>(
                          config.composition,
                          copy(config.composition, 'composition example'),
                          h,
                        ),
                      ],
                    ),
                  ]),
              ...config.examples,
              h.section(
                [
                  h.Id('api-reference'),
                  h.Class('scroll-mt-24 space-y-3 border-t pt-10'),
                ],
                [
                  heading<Msg>('api-reference', 'API Reference', '', h),
                  h.p(
                    [h.Class('text-sm leading-6 text-muted-foreground')],
                    [
                      config.apiDescription ??
                        'Behavior, keyboard interaction, and accessibility follow Foldkit conventions. ',
                      ' ',
                      h.a(
                        [
                          h.Href(config.apiHref),
                          h.Class(
                            'font-medium text-foreground underline underline-offset-4',
                          ),
                        ],
                        ['Read the Foldkit UI reference'],
                      ),
                      '.',
                    ],
                  ),
                  h.div(
                    [h.Class('flex flex-wrap gap-4 text-sm')],
                    [
                      h.a(
                        [
                          h.Href(config.apiHref),
                          h.Class('font-medium underline underline-offset-4'),
                        ],
                        ['Foldkit API'],
                      ),
                      ...(config.sourceHref === undefined
                        ? []
                        : [
                            h.a(
                              [
                                h.Href(config.sourceHref),
                                h.Class(
                                  'font-medium underline underline-offset-4',
                                ),
                              ],
                              ['View source'],
                            ),
                          ]),
                    ],
                  ),
                ],
              ),
              h.nav(
                [
                  h.AriaLabel('Component pagination'),
                  h.Class('grid gap-3 border-t pt-8 sm:grid-cols-2'),
                ],
                [
                  previous === undefined
                    ? h.span([], [])
                    : h.a(
                        [
                          h.Href(componentDocsPath(toSlug(previous))),
                          h.Class(
                            'rounded-lg border p-4 text-sm hover:bg-muted/50',
                          ),
                        ],
                        [`← ${previous}`],
                      ),
                  next === undefined
                    ? h.span([], [])
                    : h.a(
                        [
                          h.Href(componentDocsPath(toSlug(next))),
                          h.Class(
                            'rounded-lg border p-4 text-right text-sm hover:bg-muted/50',
                          ),
                        ],
                        [`${next} →`],
                      ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.aside(
        [
          h.Class(
            'hidden px-5 py-10 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)]',
          ),
        ],
        [
          h.nav(
            [h.AriaLabel('On this page')],
            [
              h.p([h.Class('mb-3 text-sm font-semibold')], ['On this page']),
              h.ul(
                [h.Class('space-y-2')],
                toc.map(([id, title]) =>
                  h.li(
                    [],
                    [
                      h.a(
                        [
                          h.Href(`#${id}`),
                          h.Class(
                            'text-sm text-muted-foreground hover:text-foreground',
                          ),
                        ],
                        [title],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
};
