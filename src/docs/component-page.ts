import { Stream } from 'effect'
import { Subscription } from 'foldkit'
import { type Html, html } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'
import { componentDocsPath } from '@/route'

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
  'Input Otp',
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
] as const

const toSlug = (name: string): string => name.toLowerCase().replaceAll(' ', '-')

export const componentTitle = (slug: string): string | undefined =>
  COMPONENTS.find(name => toSlug(name) === slug)

export type ExampleConfig<Msg> = Readonly<{
  title: string
  description?: string
  preview: Html
  code: string
  onCopy: Msg
  isCopied: boolean
  previewClass?: string
}>

export const codeBlock = <Msg>(code: string): Html => {
  const h = html<Msg>()

  return h.pre(
    [
      h.Class(
        'min-w-0 max-w-full overflow-x-auto rounded-lg border bg-muted/35 p-4 font-mono text-[13px] leading-6 text-foreground',
      ),
    ],
    [h.code([h.Class('block w-max min-w-full')], [code])],
  )
}

export const example = <Msg>(config: ExampleConfig<Msg>): Html => {
  const h = html<Msg>()

  return h.section(
    [h.Id(toSlug(config.title)), h.Class('scroll-mt-24 space-y-4')],
    [
      h.div(
        [h.Class('space-y-1.5')],
        [
          h.h2(
            [h.Class('text-xl font-semibold tracking-tight text-balance')],
            [config.title],
          ),
          ...(config.description === undefined
            ? []
            : [
                h.p(
                  [h.Class('max-w-[70ch] text-sm leading-6 text-muted-foreground')],
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
                    [h.code([h.Class('block w-max min-w-full')], [config.code])],
                  ),
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(config.onCopy),
                      h.AriaLabel(config.isCopied ? `${config.title} example code copied` : `Copy ${config.title} example code`),
                      h.Title(config.isCopied ? 'Copied' : 'Copy code'),
                      h.Class(
                        cn(
                          'absolute top-2.5 right-2.5 inline-flex size-10 items-center justify-center rounded-md outline-none transition-[color,background-color,transform] hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]',
                          config.isCopied ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground',
                        ),
                      ),
                    ],
                    [
                      Icon.icon<Msg>('copy', {
                        class: cn(
                          'absolute size-4 transition-[scale,opacity,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                          config.isCopied ? 'scale-25 opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-0',
                        ),
                      }),
                      Icon.icon<Msg>('check', {
                        class: cn(
                          'absolute size-4 transition-[scale,opacity,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                          config.isCopied ? 'scale-100 opacity-100 blur-0' : 'scale-25 opacity-0 blur-[4px]',
                        ),
                      }),
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
                  Icon.icon<Msg>('code-xml', { class: 'size-4' }),
                  h.span([h.Class('view-code-label')], ['View Code']),
                  h.span([h.Class('hide-code-label hidden')], ['Hide Code']),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

export type ComponentPageConfig<Msg> = Readonly<{
  name: string
  description: string
  installation: string
  usage: string
  examples: ReadonlyArray<Html>
  apiHref: string
  composition?: string
  apiDescription?: string
  sidebarScrolled: Msg
}>

const SIDEBAR_SCROLL_KEY = 'creaseui-docs-sidebar-scroll'

export const componentPage = <Msg>(config: ComponentPageConfig<Msg>): Html => {
  const h = html<Msg>()

  const navItem = (name: string): Html => {
    const slug = toSlug(name)
    const isCurrent = name === config.name

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
    )
  }

  return h.div(
    [h.Class('mx-auto grid w-full max-w-[1400px] lg:grid-cols-[220px_minmax(0,1fr)]')],
    [
      h.aside(
        [
          h.Class(
            'hidden border-r px-5 py-10 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto',
          ),
          h.OnMount({
            name: 'docs-sidebar-scroll',
            f: element => {
              if (!(element instanceof HTMLElement)) return Stream.empty

              const savedScrollTop = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY))
              if (Number.isFinite(savedScrollTop)) element.scrollTop = savedScrollTop

              return Subscription.fromEvent<Event, Msg>({
                target: element,
                type: 'scroll',
                options: { passive: true },
                toMessage: () => {
                  sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(element.scrollTop))
                  return config.sidebarScrolled
                },
              })
            },
          }),
        ],
        [
          h.p(
            [h.Class('mb-3 px-2 text-sm font-semibold')],
            ['Components'],
          ),
          h.ul([h.Class('space-y-0.5')], COMPONENTS.map(navItem)),
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
                    [h.Class('flex flex-wrap items-center gap-2 text-sm text-muted-foreground')],
                    [
                      h.a([h.Href('/docs/components/accordion'), h.Class('hover:text-foreground')], ['Docs']),
                      h.span([h.AriaHidden(true)], ['/']),
                      h.span([], ['Components']),
                    ],
                  ),
                  h.h1(
                    [h.Class('text-4xl font-semibold tracking-[-0.035em] text-balance')],
                    [config.name],
                  ),
                  h.p(
                    [h.Class('max-w-[70ch] text-base leading-7 text-muted-foreground')],
                    [config.description],
                  ),
                ],
              ),
              h.section(
                [h.Id('installation'), h.Class('scroll-mt-24 space-y-4')],
                [
                  h.h2([h.Class('text-xl font-semibold tracking-tight')], ['Installation']),
                  codeBlock<Msg>(config.installation),
                ],
              ),
              h.section(
                [h.Id('usage'), h.Class('scroll-mt-24 space-y-4')],
                [
                  h.h2([h.Class('text-xl font-semibold tracking-tight')], ['Usage']),
                  codeBlock<Msg>(config.usage),
                ],
              ),
              ...(config.composition === undefined
                ? []
                : [
                    h.section(
                      [h.Id('composition'), h.Class('scroll-mt-24 space-y-4')],
                      [
                        h.h2([h.Class('text-xl font-semibold tracking-tight')], ['Composition']),
                        codeBlock<Msg>(config.composition),
                      ],
                    ),
                  ]),
              ...config.examples,
              h.section(
                [h.Id('api-reference'), h.Class('scroll-mt-24 space-y-3 border-t pt-10')],
                [
                  h.h2([h.Class('text-xl font-semibold tracking-tight')], ['API Reference']),
                  h.p(
                    [h.Class('text-sm leading-6 text-muted-foreground')],
                    [
                      config.apiDescription ??
                        'Behavior, keyboard interaction, and accessibility follow Foldkit conventions. ',
                      ' ',
                      h.a(
                        [
                          h.Href(config.apiHref),
                          h.Class('font-medium text-foreground underline underline-offset-4'),
                        ],
                        ['Read the Foldkit UI reference'],
                      ),
                      '.',
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
