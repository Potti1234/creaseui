import { type Html, html } from 'foldkit/html'

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

export type ExampleConfig = Readonly<{
  title: string
  description?: string
  preview: Html
  code: string
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

export const example = <Msg>(config: ExampleConfig): Html => {
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
        [
          h.Class(
            cn(
              'flex min-h-64 items-center justify-center rounded-lg border bg-background p-6 sm:p-10',
              config.previewClass,
            ),
          ),
        ],
        [config.preview],
      ),
      codeBlock<Msg>(config.code),
    ],
  )
}

export type ComponentPageConfig = Readonly<{
  name: string
  description: string
  installation: string
  usage: string
  examples: ReadonlyArray<Html>
  apiHref: string
  composition?: string
  apiDescription?: string
}>

export const componentPage = <Msg>(config: ComponentPageConfig): Html => {
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
