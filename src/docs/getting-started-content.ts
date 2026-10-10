import type { Html, HtmlBuilder } from 'foldkit/html'

import { COMPONENT_GROUPS, toSlug } from '@/docs/component-metadata'
import * as Code from '@/ui/code'
import * as CodeBlock from '@/ui/code-block'
import * as Heading from '@/ui/heading'
import * as Text from '@/ui/text'
import * as Typography from '@/ui/typography'
import {
  componentDocsPath,
  createPath,
  gettingStartedPath,
  themingPath,
} from '@/route'

export type DocsGuideStyles = Readonly<{
  layout: string
  mobile: string
  summary: string
  mobileNavOuter: string
  mobileNav: string
  sidebar: string
  main: string
  content: string
  breadcrumb: string
  lead: string
  section: string
  list: string
  link: string
  navLink: string
  navActive: string
  navGroup: string
  navLabel: string
  navList: string
  toc: string
  tocLabel: string
  tocList: string
  tokenTableWrapper: string
  tokenTable: string
  tokenHead: string
  tokenCell: string
  tokenName: string
}>

export type DocsGuideCodeProps<Msg> = Readonly<{
  model: CodeBlock.Model
  toParentMessage: (message: CodeBlock.Message) => Msg
}>

type Guide = 'getting-started' | 'theming'

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

const THEME_TOKEN_ROWS = [
  ['--background', 'Main page and app surface.'],
  ['--foreground', 'Default text on the main surface.'],
  ['--card', 'Card surface.'],
  ['--card-foreground', 'Text on cards.'],
  ['--popover', 'Menus, popovers, and other floating surfaces.'],
  ['--popover-foreground', 'Text on floating surfaces.'],
  ['--primary', 'Primary actions and selected states.'],
  ['--primary-foreground', 'Text and icons on primary surfaces.'],
  ['--secondary', 'Secondary action surfaces.'],
  ['--secondary-foreground', 'Text on secondary surfaces.'],
  ['--muted', 'Quiet surfaces such as placeholders and code panels.'],
  ['--muted-foreground', 'Supporting text and low emphasis labels.'],
  ['--accent', 'Hover and highlighted surfaces.'],
  ['--accent-foreground', 'Text on accent surfaces.'],
  ['--destructive', 'Destructive actions and error emphasis.'],
  ['--border', 'Dividers and default component borders.'],
  ['--input', 'Form control borders and input surfaces.'],
  ['--ring', 'Keyboard focus rings.'],
  ['--chart-1', 'First chart series.'],
  ['--chart-2', 'Second chart series.'],
  ['--chart-3', 'Third chart series.'],
  ['--chart-4', 'Fourth chart series.'],
  ['--chart-5', 'Fifth chart series.'],
  ['--sidebar', 'Sidebar surface.'],
  ['--sidebar-foreground', 'Default sidebar text and icons.'],
  ['--sidebar-primary', 'Primary actions inside a sidebar.'],
  ['--sidebar-primary-foreground', 'Text and icons on sidebar primary.'],
  ['--sidebar-accent', 'Hover and selected surfaces in a sidebar.'],
  ['--sidebar-accent-foreground', 'Text on sidebar accent surfaces.'],
  ['--sidebar-border', 'Sidebar dividers and component borders.'],
  ['--sidebar-ring', 'Keyboard focus rings inside a sidebar.'],
  ['--radius', 'Base corner radius used to derive component radii.'],
] as const

const TAILWIND_THEME_TOKEN_ROWS = [
  ['--font-sans', 'Sans-serif font stack used by the font-sans utility.'],
  ['--color-background', 'Maps to --background for background utilities.'],
  ['--color-foreground', 'Maps to --foreground for text utilities.'],
  ['--color-card', 'Maps to --card for card surface utilities.'],
  [
    '--color-card-foreground',
    'Maps to --card-foreground for card text utilities.',
  ],
  ['--color-popover', 'Maps to --popover for popover surface utilities.'],
  [
    '--color-popover-foreground',
    'Maps to --popover-foreground for popover text utilities.',
  ],
  ['--color-primary', 'Maps to --primary for primary surface utilities.'],
  [
    '--color-primary-foreground',
    'Maps to --primary-foreground for primary text utilities.',
  ],
  ['--color-secondary', 'Maps to --secondary for secondary surface utilities.'],
  [
    '--color-secondary-foreground',
    'Maps to --secondary-foreground for secondary text utilities.',
  ],
  ['--color-muted', 'Maps to --muted for muted surface utilities.'],
  [
    '--color-muted-foreground',
    'Maps to --muted-foreground for supporting text utilities.',
  ],
  ['--color-accent', 'Maps to --accent for highlighted surface utilities.'],
  [
    '--color-accent-foreground',
    'Maps to --accent-foreground for highlighted text utilities.',
  ],
  ['--color-destructive', 'Maps to --destructive for destructive utilities.'],
  ['--color-border', 'Maps to --border; this also powers border-border.'],
  ['--color-input', 'Maps to --input for form control utilities.'],
  ['--color-ring', 'Maps to --ring for focus ring utilities.'],
  ['--color-chart-1', 'Maps to --chart-1 for the first chart series.'],
  ['--color-chart-2', 'Maps to --chart-2 for the second chart series.'],
  ['--color-chart-3', 'Maps to --chart-3 for the third chart series.'],
  ['--color-chart-4', 'Maps to --chart-4 for the fourth chart series.'],
  ['--color-chart-5', 'Maps to --chart-5 for the fifth chart series.'],
  ['--color-sidebar', 'Maps to --sidebar for sidebar surface utilities.'],
  [
    '--color-sidebar-foreground',
    'Maps to --sidebar-foreground for sidebar text utilities.',
  ],
  [
    '--color-sidebar-primary',
    'Maps to --sidebar-primary for sidebar primary surfaces.',
  ],
  [
    '--color-sidebar-primary-foreground',
    'Maps to --sidebar-primary-foreground for sidebar primary text.',
  ],
  [
    '--color-sidebar-accent',
    'Maps to --sidebar-accent for sidebar highlighted surfaces.',
  ],
  [
    '--color-sidebar-accent-foreground',
    'Maps to --sidebar-accent-foreground for sidebar highlighted text.',
  ],
  [
    '--color-sidebar-border',
    'Maps to --sidebar-border for sidebar border utilities.',
  ],
  [
    '--color-sidebar-ring',
    'Maps to --sidebar-ring for sidebar focus ring utilities.',
  ],
  ['--radius-sm', 'Uses calc(var(--radius) - 4px).'],
  ['--radius-md', 'Uses calc(var(--radius) - 2px).'],
  ['--radius-lg', 'Uses --radius directly.'],
  ['--radius-xl', 'Uses calc(var(--radius) + 4px).'],
] as const

const STYLEX_THEME_TOKEN_ROWS = [
  ['--stylex-destructive-surface', 'Solid destructive surface.'],
  ['--stylex-soft-destructive-surface', 'Low emphasis destructive surface.'],
  [
    '--stylex-soft-destructive-hover',
    'Hover surface for soft destructive actions.',
  ],
  ['--stylex-muted-hover', 'Muted hover surface.'],
  [
    '--stylex-input-surface',
    'Input surface, including its dark mode treatment.',
  ],
  ['--stylex-outline-surface', 'Outline button surface.'],
  ['--stylex-outline-hover', 'Outline button hover surface.'],
] as const

const TAILWIND_THEME = `:root {
  --background: oklch(0.99 0.01 200);
  --foreground: oklch(0.2 0.03 250);
  --primary: oklch(0.55 0.18 205);
  --primary-foreground: oklch(0.99 0.01 200);
  --radius: 0.75rem;
}

.dark {
  --background: oklch(0.16 0.02 250);
  --foreground: oklch(0.96 0.01 200);
  --primary: oklch(0.72 0.13 190);
  --primary-foreground: oklch(0.16 0.02 250);
}`

const STYLEX_THEME_ALIASES = `:root {
  --stylex-destructive-surface: var(--destructive);
  --stylex-soft-destructive-surface: color-mix(in oklab, var(--destructive) 10%, transparent);
  --stylex-soft-destructive-hover: color-mix(in oklab, var(--destructive) 20%, transparent);
  --stylex-muted-hover: var(--muted);
  --stylex-input-surface: transparent;
  --stylex-outline-surface: var(--background);
  --stylex-outline-hover: var(--accent);
}

.dark {
  --stylex-destructive-surface: color-mix(in oklab, var(--destructive) 60%, transparent);
  --stylex-soft-destructive-surface: color-mix(in oklab, var(--destructive) 20%, transparent);
  --stylex-soft-destructive-hover: color-mix(in oklab, var(--destructive) 30%, transparent);
  --stylex-muted-hover: color-mix(in oklab, var(--muted) 50%, transparent);
  --stylex-input-surface: color-mix(in oklab, var(--input) 30%, transparent);
  --stylex-outline-surface: color-mix(in oklab, var(--input) 30%, transparent);
  --stylex-outline-hover: color-mix(in oklab, var(--input) 50%, transparent);
}`

const GETTING_STARTED_TOC = [
  ['before-you-start', 'Before you start'],
  ['configure-the-cli', 'Configure the CLI'],
  ['install-components', 'Install components'],
  ['use-components', 'Use components'],
  ['tailwind-and-stylex', 'Tailwind and StyleX'],
  ['next-steps', 'Next steps'],
] as const

const THEMING_TOC = [
  ['theme-contract', 'Theme tokens'],
  ['tailwind-theme', 'Tailwind themes'],
  ['stylex-theme', 'StyleX themes'],
  ['component-customization', 'Component customization'],
  ['theme-builder', 'Theme builder'],
] as const

export const view = <Msg>(
  guide: Guide,
  h: HtmlBuilder<Msg>,
  styles: DocsGuideStyles,
  codeBlock: DocsGuideCodeProps<Msg>,
): Html => {
  const title = guide === 'theming' ? 'Theming' : 'Get Started'
  const isGettingStarted = guide === 'getting-started'
  const toc = isGettingStarted ? GETTING_STARTED_TOC : THEMING_TOC
  const description = isGettingStarted
    ? 'Install typed Foldkit components as source, render them in your views, and compose interactive controls with your application model.'
    : 'Customize Crease UI through shared semantic tokens, with practical setup for Tailwind CSS and StyleX.'

  const text = (
    children: ReadonlyArray<Html | string>,
    options?: Readonly<{
      type?: Text.TextType
      color?: Text.TextColor
      weight?: Text.TextWeight
      display?: Text.TextDisplay
      as?: Text.TextElement
    }>,
  ): Html =>
    Text.text(
      {
        type: options?.type ?? 'body',
        color: options?.color ?? 'secondary',
        display: options?.display ?? 'block',
        ...(options?.weight === undefined ? {} : { weight: options.weight }),
        ...(options?.as === undefined ? {} : { as: options.as }),
        children,
      },
      h,
    )
  const heading = (
    level: Heading.HeadingLevel,
    children: ReadonlyArray<Html | string>,
    type?: Heading.HeadingType,
  ): Html =>
    Heading.heading(
      {
        level,
        ...(type === undefined ? {} : { type }),
        ...(level === 1
          ? { weight: 'semibold' as const, textWrap: 'balance' as const }
          : {}),
        children,
      },
      h,
    )
  const section = (
    id: string,
    title: string,
    contents: ReadonlyArray<Html | string>,
  ): Html =>
    h.section(
      [h.Id(id), h.Class(styles.section)],
      [heading(2, [title]), ...contents],
    )
  const paragraph = (children: ReadonlyArray<Html | string> | string): Html =>
    Typography.typographyMuted(
      { children: typeof children === 'string' ? [children] : children },
      h,
    )
  const inlineCode = (contents: string): Html =>
    Code.code({ children: [contents] }, h)
  const code = (contents: string, label: string, language: string): Html =>
    CodeBlock.codeBlock(
      {
        model: codeBlock.model,
        toParentMessage: codeBlock.toParentMessage,
        code: contents,
        title: label,
        language,
        hasCopyButton: true,
      },
      h,
    )
  const tokenTable = (rows: ReadonlyArray<readonly [string, string]>): Html =>
    h.div(
      [h.Class(styles.tokenTableWrapper)],
      [
        h.table(
          [h.Class(styles.tokenTable)],
          [
            h.thead(
              [],
              [
                h.tr(
                  [],
                  [
                    h.th(
                      [h.Class(styles.tokenHead)],
                      [text(['Token'], { type: 'label', color: 'primary' })],
                    ),
                    h.th(
                      [h.Class(styles.tokenHead)],
                      [text(['Purpose'], { type: 'label', color: 'primary' })],
                    ),
                  ],
                ),
              ],
            ),
            h.tbody(
              [],
              rows.map(([name, purpose]) =>
                h.tr(
                  [],
                  [
                    h.th(
                      [h.Class(`${styles.tokenCell} ${styles.tokenName}`)],
                      [inlineCode(name)],
                    ),
                    h.td(
                      [h.Class(styles.tokenCell)],
                      [text([purpose], { type: 'supporting' })],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    )
  const smallText = (contents: ReadonlyArray<Html | string> | string): Html =>
    Typography.typographySmall(
      { children: typeof contents === 'string' ? [contents] : contents },
      h,
    )
  const link = (href: string, label: string, isCurrent = false): Html =>
    h.a(
      [
        h.Href(href),
        ...(isCurrent ? [h.AriaCurrent('page')] : []),
        h.Class(`${styles.navLink}${isCurrent ? ` ${styles.navActive}` : ''}`),
      ],
      [text([label], { color: 'inherit' })],
    )
  const componentLink = (name: string): Html =>
    h.li(
      [],
      [
        h.a(
          [h.Href(componentDocsPath(toSlug(name))), h.Class(styles.navLink)],
          [text([name], { color: 'inherit' })],
        ),
      ],
    )
  const guideLinks = () =>
    h.ul(
      [h.Class(styles.navList)],
      [
        h.li([], [link(gettingStartedPath(), 'Get Started', isGettingStarted)]),
        h.li([], [link(themingPath(), 'Theming', !isGettingStarted)]),
      ],
    )
  const sidebarGroups = (isMobile: boolean) =>
    COMPONENT_GROUPS.map(group =>
      h.div(
        [h.Class(styles.navGroup)],
        [
          h.div(
            [h.Class(styles.navLabel)],
            [text([group.label], { type: 'label', color: 'primary' })],
          ),
          h.ul(
            [h.Class(isMobile ? styles.mobileNav : styles.navList)],
            group.components.map(componentLink),
          ),
        ],
      ),
    )
  const externalLink = (href: string, label: string): Html =>
    h.a(
      [
        h.Href(href),
        h.Class(styles.link),
        h.Attribute('target', '_blank'),
        h.Attribute('rel', 'noreferrer'),
      ],
      [text([label], { color: 'inherit', display: 'inline' })],
    )
  const contentLink = (href: string, label: string): Html =>
    h.a(
      [h.Href(href), h.Class(styles.link)],
      [text([label], { color: 'inherit', display: 'inline' })],
    )

  const pageSections = isGettingStarted
    ? [
        section('before-you-start', 'Before you start', [
          paragraph(
            'Crease UI is a source registry for Foldkit. The shadcn CLI copies the TypeScript files you choose into your application, where you can inspect and edit them. Your app continues to own its Foldkit and Effect versions.',
          ),
          paragraph([
            'Start with Node.js 22 or newer and a Foldkit Vite app using Foldkit, Foldkit UI, and Effect. For the currently validated versions, see the ',
            externalLink(
              'https://github.com/Potti1234/creaseui/blob/main/compatibility.json',
              'compatibility matrix',
            ),
            '.',
          ]),
          paragraph(
            'For Tailwind components, use Tailwind CSS 4 and the Foldkit Vite plugin. The StyleX option is covered below.',
          ),
        ]),
        section('configure-the-cli', 'Configure the CLI', [
          paragraph([
            'Add a ',
            inlineCode('components.json'),
            ' at your app root so the CLI knows where to write files and how to resolve imports. Set ',
            inlineCode('tsx'),
            ' to ',
            inlineCode('true'),
            ' because the CLI uses that flag for TypeScript output; Crease UI does not use JSX or React.',
          ]),
          code(CONFIGURATION, 'shadcn components.json configuration', 'json'),
          paragraph([
            'Keep the ',
            inlineCode('@'),
            ' alias in Vite and ',
            inlineCode('tsconfig.json'),
            '. For Tailwind, include the Foldkit and Tailwind Vite plugins, then load Tailwind from the stylesheet selected by ',
            inlineCode('tailwind.css'),
            '.',
          ]),
          code(
            VITE_TAILWIND_SETUP,
            'Configure Foldkit and Tailwind in Vite',
            'typescript',
          ),
          code(
            '@import "tailwindcss";',
            'Load Tailwind in the application stylesheet',
            'css',
          ),
        ]),
        section('install-components', 'Install components', [
          paragraph(
            'Run the shadcn CLI from your application directory. Choose only the components you need; registry dependencies bring along shared Crease helpers and theme tokens.',
          ),
          code(
            'npx --yes shadcn@latest add Potti1234/creaseui/button --yes\nnpx --yes shadcn@latest add Potti1234/creaseui/dialog --yes',
            'Install Button and Dialog from the Crease UI registry',
            'bash',
          ),
          paragraph([
            'The files are copied into the ',
            inlineCode('ui'),
            ' alias from ',
            inlineCode('components.json'),
            ' (shown above as ',
            inlineCode('@/ui'),
            '). Stateless components are usually a single view helper; interactive components also include their ',
            inlineCode('Model'),
            ', ',
            inlineCode('Message'),
            ', and update logic.',
          ]),
        ]),
        section('use-components', 'Use components', [
          heading(3, ['Render a stateless component']),
          paragraph([
            'A stateless helper takes its typed props and the current ',
            inlineCode('HtmlBuilder'),
            ', then returns ',
            inlineCode('Html'),
            '. Its events use messages from your application.',
          ]),
          code(
            STATELESS_USAGE,
            'Render a Crease UI Button in a Foldkit view',
            'typescript',
          ),
          heading(3, ['Compose a stateful component']),
          paragraph([
            'For a dialog, menu, calendar, or other stateful component, keep its ',
            inlineCode('Model'),
            ' in the parent model. Wrap its ',
            inlineCode('Message'),
            ' in your app message union, delegate messages to the component update function, map returned commands back to your app, and embed its view with ',
            inlineCode('h.submodel'),
            '. Keep durable values in the parent and pass them to the component as controlled props.',
          ]),
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
            'bash',
          ),
          paragraph([
            'StyleX source is placed in a stylex subdirectory under the configured ui alias, such as @/ui/stylex. Read the ',
            contentLink(themingPath(), 'Theming guide'),
            ' for its CSS variables and theme setup.',
          ]),
        ]),
        section('next-steps', 'Next steps', [
          h.ul(
            [h.Class(styles.list)],
            [
              h.li(
                [],
                [
                  text(
                    [
                      contentLink(
                        componentDocsPath('button'),
                        'Explore Button',
                      ),
                      ' for stateless rendering and variants.',
                    ],
                    { type: 'inherit', color: 'inherit', as: 'span' },
                  ),
                ],
              ),
              h.li(
                [],
                [
                  text(
                    [
                      contentLink(
                        componentDocsPath('dialog'),
                        'Explore Dialog',
                      ),
                      ' for state, messages, and parent composition.',
                    ],
                    { type: 'inherit', color: 'inherit', as: 'span' },
                  ),
                ],
              ),
              h.li(
                [],
                [
                  text(
                    [
                      contentLink(themingPath(), 'Read the Theming guide'),
                      ' to customize colors, radius, and dark mode.',
                    ],
                    { type: 'inherit', color: 'inherit', as: 'span' },
                  ),
                ],
              ),
            ],
          ),
        ]),
      ]
    : [
        section('theme-contract', 'Theme tokens', [
          paragraph(
            'Crease UI styles components with semantic CSS variables. This lets one palette update buttons, inputs, overlays, charts, and sidebars together while components keep their behavior and layout.',
          ),
          paragraph([
            'Tailwind registry components include ',
            inlineCode('crease-theme'),
            ' as a dependency. The CLI adds its default light and dark values and maps the variables to Tailwind utilities in the stylesheet named by ',
            inlineCode('tailwind.css'),
            ' in ',
            inlineCode('components.json'),
            '.',
          ]),
          paragraph(
            'These are the shared color, radius, and chart variables used by components. Change their values in both theme blocks to customize your app.',
          ),
          tokenTable(THEME_TOKEN_ROWS),
          heading(3, ['Tailwind utility tokens']),
          paragraph(
            'Tailwind publishes color aliases, the sans-serif font token, and four radius utilities. These names are generated from the shared variables above and are available to Tailwind classes.',
          ),
          tokenTable(TAILWIND_THEME_TOKEN_ROWS),
        ]),
        section('tailwind-theme', 'Theme Tailwind components', [
          paragraph([
            'Edit the ',
            inlineCode(':root'),
            ' and ',
            inlineCode('.dark'),
            ' values in the stylesheet selected by ',
            inlineCode('components.json'),
            '. Keep the generated ',
            inlineCode('@theme inline'),
            ' mapping: it makes semantic variables available as utilities such as ',
            inlineCode('bg-background'),
            ', ',
            inlineCode('text-foreground'),
            ', ',
            inlineCode('border-border'),
            ', and ',
            inlineCode('rounded-lg'),
            '.',
          ]),
          code(
            TAILWIND_THEME,
            'Override primary colors and radius for light and dark mode',
            'css',
          ),
          paragraph(
            'The example changes the page surface, foreground, primary color, and radius while keeping the rest of the default token palette. Add or adjust variables in both blocks so the theme remains legible in light and dark mode.',
          ),
          paragraph([
            'Your app’s theme toggle should add or remove the ',
            inlineCode('.dark'),
            ' class on the document root or an ancestor of the themed components. Existing utility classes then resolve against the active variable block.',
          ]),
        ]),
        section('stylex-theme', 'Theme StyleX components', [
          paragraph([
            'StyleX components read the same core variables directly from CSS. Their registry items install TypeScript source and StyleX dependencies, so the application must provide its own light and dark token blocks. A Tailwind reset is not needed.',
          ]),
          paragraph([
            'In addition to the core tokens above, StyleX source uses these semantic surface aliases. Add them to the same stylesheet as your ',
            inlineCode(':root'),
            ' and ',
            inlineCode('.dark'),
            ' values:',
          ]),
          tokenTable(STYLEX_THEME_TOKEN_ROWS),
          code(
            STYLEX_THEME_ALIASES,
            'StyleX theme surface aliases for light and dark modes',
            'css',
          ),
          paragraph(
            'Set your document font, line height, and body background in the application as well. StyleX components apply element defaults locally, so you do not need a global reset.',
          ),
        ]),
        section('component-customization', 'Component customization', [
          paragraph([
            'Use semantic tokens for changes that should apply across the app. Use a component’s documented ',
            inlineCode('variant'),
            ' and ',
            inlineCode('size'),
            ' for supported visual choices. In StyleX, use a wrapper for parent layout; component internals do not expose arbitrary ',
            inlineCode('className'),
            ' or ',
            inlineCode('style'),
            ' props.',
          ]),
          paragraph(
            'Theme variables control shared color and radius values. For a one-off layout, add layout rules to a wrapper you own rather than changing a shared token.',
          ),
        ]),
        section('theme-builder', 'Create a theme preset', [
          paragraph(
            'The Create page lets you adjust the color palette, chart colors, radius, typography, and sidebar treatment together. Copy its registry JSON to keep the preset reproducible, or inspect the generated CSS and use the values in your own stylesheet.',
          ),
          h.a(
            [h.Href(createPath()), h.Class(styles.link)],
            [
              text(['Open the theme builder'], {
                color: 'inherit',
                display: 'inline',
              }),
            ],
          ),
        ]),
      ]

  return h.div(
    [h.Class(styles.layout)],
    [
      h.details(
        [h.Class(styles.mobile)],
        [
          h.summary([h.Class(styles.summary)], [smallText('Browse docs')]),
          h.nav(
            [
              h.AriaLabel('Documentation navigation'),
              h.Class(styles.mobileNavOuter),
            ],
            [
              h.div([h.Class(styles.navGroup)], [guideLinks()]),
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
              h.div([h.Class(styles.navGroup)], [guideLinks()]),
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
                        [
                          text(['Docs'], {
                            color: 'inherit',
                            display: 'inline',
                          }),
                        ],
                      ),
                      h.span(
                        [h.AriaHidden(true)],
                        [
                          text(['/'], {
                            color: 'secondary',
                            display: 'inline',
                          }),
                        ],
                      ),
                      h.span(
                        [h.AriaCurrent('page')],
                        [
                          text([title], {
                            color: 'secondary',
                            display: 'inline',
                          }),
                        ],
                      ),
                    ],
                  ),
                  heading(1, [title], 'display-2'),
                  h.div(
                    [h.Class(styles.lead)],
                    [Typography.typographyLead({ children: [description] }, h)],
                  ),
                ],
              ),
              ...pageSections,
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
              h.div([h.Class(styles.tocLabel)], [smallText('On this page')]),
              h.ul(
                [h.Class(styles.tocList)],
                toc.map(([id, label]) =>
                  h.li(
                    [],
                    [
                      h.a(
                        [h.Href(`#${id}`), h.Class(styles.link)],
                        [
                          text([label], {
                            color: 'inherit',
                            display: 'inline',
                          }),
                        ],
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
  )
}
