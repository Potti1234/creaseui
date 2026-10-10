import type { Html, HtmlBuilder } from 'foldkit/html'

import { COMPONENT_GROUPS, toSlug } from '@/docs/component-metadata'
import { componentDocsPath, gettingStartedPath } from '@/route'

export type GettingStartedStyles = Readonly<{
  layout: string
  mobile: string
  summary: string
  mobileNavOuter: string
  mobileNav: string
  sidebar: string
  main: string
  content: string
  breadcrumb: string
  title: string
  lead: string
  section: string
  heading: string
  subheading: string
  paragraph: string
  list: string
  code: string
  inlineCode: string
  link: string
  navLink: string
  navActive: string
  navGroup: string
  navLabel: string
  navList: string
  toc: string
  tocLabel: string
  tocList: string
}>

const CONFIGURATION = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}`

const STATELESS_USAGE = `import type { Html, HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'

const Saved = m('Saved')
type Message = ReturnType<typeof Saved>

export const view = (h: HtmlBuilder<Message>): Html =>
  Button.button({ children: ['Save changes'], onClick: Saved() }, h)`

const VITE_TAILWIND_SETUP = `import { defineConfig } from 'vite'
import { foldkit } from '@foldkit/vite-plugin'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [foldkit(), tailwindcss()],
  resolve: { alias: { '@': '/src' } },
})`

const ids = [
  ['before-you-start', 'Before you start'],
  ['configure-the-cli', 'Configure the CLI'],
  ['install-components', 'Install components'],
  ['use-components', 'Use components'],
  ['tailwind-and-stylex', 'Tailwind and StyleX'],
  ['next-steps', 'Next steps'],
] as const

export const view = <Msg>(
  h: HtmlBuilder<Msg>,
  styles: GettingStartedStyles,
): Html => {
  const getStartedLink = (isCurrent: boolean) =>
    h.a(
      [
        h.Href(gettingStartedPath()),
        ...(isCurrent ? [h.AriaCurrent('page')] : []),
        h.Class(`${styles.navLink}${isCurrent ? ` ${styles.navActive}` : ''}`),
      ],
      ['Get Started'],
    )
  const componentLink = (name: string): Html =>
    h.li(
      [],
      [
        h.a(
          [h.Href(componentDocsPath(toSlug(name))), h.Class(styles.navLink)],
          [name],
        ),
      ],
    )
  const sidebarGroups = (isMobile: boolean) =>
    COMPONENT_GROUPS.map(group =>
      h.div(
        [h.Class(styles.navGroup)],
        [
          h.p([h.Class(styles.navLabel)], [group.label]),
          h.ul(
            [h.Class(isMobile ? styles.mobileNav : styles.navList)],
            group.components.map(componentLink),
          ),
        ],
      ),
    )
  const code = (contents: string, label: string): Html =>
    h.pre(
      [h.Class(styles.code), h.AriaLabel(label)],
      [h.code([h.Class(styles.inlineCode)], [contents])],
    )
  const section = (
    id: string,
    title: string,
    contents: ReadonlyArray<Html | string>,
  ): Html =>
    h.section(
      [h.Id(id), h.Class(styles.section)],
      [h.h2([h.Class(styles.heading)], [title]), ...contents],
    )
  const paragraph = (copy: string): Html =>
    h.p([h.Class(styles.paragraph)], [copy])
  const externalLink = (href: string, label: string): Html =>
    h.a(
      [
        h.Href(href),
        h.Class(styles.link),
        h.Attribute('target', '_blank'),
        h.Attribute('rel', 'noreferrer'),
      ],
      [label],
    )

  return h.div(
    [h.Class(styles.layout)],
    [
      h.details(
        [h.Class(styles.mobile)],
        [
          h.summary([h.Class(styles.summary)], ['Browse docs']),
          h.nav(
            [
              h.AriaLabel('Documentation navigation'),
              h.Class(styles.mobileNavOuter),
            ],
            [
              h.div([h.Class(styles.navGroup)], [getStartedLink(true)]),
              ...sidebarGroups(true),
            ],
          ),
        ],
      ),
      h.aside(
        [h.Class(styles.sidebar)],
        [
          h.nav(
            [h.AriaLabel('Documentation navigation')],
            [
              h.div([h.Class(styles.navGroup)], [getStartedLink(true)]),
              ...sidebarGroups(false),
            ],
          ),
        ],
      ),
      h.main(
        [h.Class(styles.main)],
        [
          h.div(
            [h.Class(styles.content)],
            [
              h.header(
                [],
                [
                  h.div(
                    [h.AriaLabel('Breadcrumb'), h.Class(styles.breadcrumb)],
                    [
                      h.a(
                        [h.Href(gettingStartedPath()), h.Class(styles.link)],
                        ['Docs'],
                      ),
                      h.span([h.AriaHidden(true)], ['/']),
                      h.span([h.AriaCurrent('page')], ['Get Started']),
                    ],
                  ),
                  h.h1([h.Class(styles.title)], ['Get Started']),
                  h.p(
                    [h.Class(styles.lead)],
                    [
                      'Install typed Foldkit components as source, render them in your views, and compose interactive controls with your application model.',
                    ],
                  ),
                ],
              ),
              section('before-you-start', 'Before you start', [
                paragraph(
                  'Crease UI is a source registry for Foldkit. The shadcn CLI copies the TypeScript files you choose into your application, where you can inspect and edit them. Your app continues to own its Foldkit and Effect versions.',
                ),
                h.p(
                  [h.Class(styles.paragraph)],
                  [
                    'Start with Node.js 22 or newer and a Foldkit Vite app using Foldkit, Foldkit UI, and Effect. For the currently validated versions, see the ',
                    externalLink(
                      'https://github.com/Potti1234/creaseui/blob/main/compatibility.json',
                      'compatibility matrix',
                    ),
                    '.',
                  ],
                ),
                paragraph(
                  'For Tailwind components, use Tailwind CSS 4 and the Foldkit Vite plugin. The StyleX option is covered below.',
                ),
              ]),
              section('configure-the-cli', 'Configure the CLI', [
                paragraph(
                  'Add a components.json at your app root so the CLI knows where to write files and how to resolve imports. Set tsx to true because the CLI uses that flag for TypeScript output; Crease UI does not use JSX or React.',
                ),
                code(CONFIGURATION, 'shadcn components.json configuration'),
                paragraph(
                  'Keep the @ alias in Vite and tsconfig.json. For Tailwind, include the Foldkit and Tailwind Vite plugins, then load Tailwind from the stylesheet selected by tailwind.css.',
                ),
                code(
                  VITE_TAILWIND_SETUP,
                  'Configure Foldkit and Tailwind in Vite',
                ),
                code(
                  '@import "tailwindcss";',
                  'Load Tailwind in the application stylesheet',
                ),
              ]),
              section('install-components', 'Install components', [
                paragraph(
                  'Run the shadcn CLI from your application directory. Choose only the components you need; registry dependencies bring along shared Crease helpers and theme tokens.',
                ),
                code(
                  'npx --yes shadcn@latest add Potti1234/creaseui/button --yes\nnpx --yes shadcn@latest add Potti1234/creaseui/dialog --yes',
                  'Install Button and Dialog from the Crease UI registry',
                ),
                paragraph(
                  'The files are copied into the ui alias from components.json (shown above as @/ui). Stateless components are usually a single view helper; interactive components also include their Model, Message, and update logic.',
                ),
              ]),
              section('use-components', 'Use components', [
                h.h3(
                  [h.Class(styles.subheading)],
                  ['Render a stateless component'],
                ),
                paragraph(
                  'A stateless helper takes its typed props and the current HtmlBuilder, then returns Html. Its events use messages from your application.',
                ),
                code(
                  STATELESS_USAGE,
                  'Render a Crease UI Button in a Foldkit view',
                ),
                h.h3(
                  [h.Class(styles.subheading)],
                  ['Compose a stateful component'],
                ),
                paragraph(
                  'For a dialog, menu, calendar, or other stateful component, keep its Model in the parent model. Wrap its Message in your app message union, delegate messages to the component update function, map returned commands back to your app, and embed its view with h.submodel. Keep durable values in the parent and pass them to the component as controlled props.',
                ),
                paragraph(
                  'The component pages show runnable examples and API details. Start with Button for a stateless example or Dialog for a stateful one.',
                ),
              ]),
              section('tailwind-and-stylex', 'Tailwind and StyleX', [
                paragraph(
                  'The default registry item installs the Tailwind implementation. A StyleX implementation is available for components that support it; install it with the stylex- prefix:',
                ),
                code(
                  'npx --yes shadcn@latest add Potti1234/creaseui/stylex-button --yes',
                  'Install the StyleX Button implementation',
                ),
                h.p(
                  [h.Class(styles.paragraph)],
                  [
                    'StyleX source is placed in a stylex subdirectory under the configured ui alias, such as @/ui/stylex. Configure the StyleX compiler and provide the theme variables described in the ',
                    externalLink(
                      'https://github.com/Potti1234/creaseui/blob/main/src/stylex/README.md',
                      'read the setup instructions',
                    ),
                    '.',
                  ],
                ),
              ]),
              section('next-steps', 'Next steps', [
                h.ul(
                  [h.Class(styles.list)],
                  [
                    h.li(
                      [],
                      [
                        h.a(
                          [
                            h.Href(componentDocsPath('button')),
                            h.Class(styles.link),
                          ],
                          ['Explore Button'],
                        ),
                        ' for stateless rendering and variants.',
                      ],
                    ),
                    h.li(
                      [],
                      [
                        h.a(
                          [
                            h.Href(componentDocsPath('dialog')),
                            h.Class(styles.link),
                          ],
                          ['Explore Dialog'],
                        ),
                        ' for state, messages, and parent composition.',
                      ],
                    ),
                    h.li(
                      [],
                      [
                        externalLink(
                          'https://github.com/Potti1234/creaseui/blob/main/docs/registry.md',
                          'Read the registry guide',
                        ),
                        ' for all aliases, StyleX setup, local installs, and version pinning.',
                      ],
                    ),
                  ],
                ),
              ]),
            ],
          ),
        ],
      ),
      h.aside(
        [h.Class(styles.toc)],
        [
          h.nav(
            [h.AriaLabel('On this page')],
            [
              h.p([h.Class(styles.tocLabel)], ['On this page']),
              h.ul(
                [h.Class(styles.tocList)],
                ids.map(([id, title]) =>
                  h.li(
                    [],
                    [h.a([h.Href(`#${id}`), h.Class(styles.link)], [title])],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
