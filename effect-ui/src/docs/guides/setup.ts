import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { CodeBlock } from '#components'
import type { DocsGuide, DocsMessage } from '../types'

const renderer =
  import.meta.env.MODE === 'stylex' || import.meta.env.MODE === 'pleat'
    ? import.meta.env.MODE
    : 'tailwind'
const rendererName = { tailwind: 'Tailwind', stylex: 'StyleX', pleat: 'Pleat' }[
  renderer
]
const snapshot = '5ea1d77'
const registryUrl = 'http://127.0.0.1:5181/.registry/{name}.json'
const componentPath =
  renderer === 'tailwind' ? '@/ui/effect/ui/button' : `@/ui/effect/${renderer}`

export const section = (
  h: Html.H<DocsMessage>,
  id: string,
  title: string,
  ...children: View.Input<DocsMessage>[]
) => h.section.attr('id', id).children(h.h2.children(title), ...children)

const snippet = (
  h: Html.H<DocsMessage>,
  id: string,
  language: string,
  code: string,
) => CodeBlock(h, { id, language, props: { code }, container: 'section' })

const componentsJson = JSON.stringify(
  {
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'new-york',
    rsc: false,
    tsx: true,
    tailwind: {
      config: '',
      css: 'src/styles.css',
      baseColor: 'neutral',
      cssVariables: true,
    },
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/ui',
      lib: '@/lib',
      hooks: '@/hooks',
    },
    registries: { '@crease-effect': registryUrl },
  },
  null,
  2,
)

const viteConfig = `import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
${renderer === 'tailwind' ? "import tailwindcss from '@tailwindcss/vite'\n" : renderer === 'stylex' ? "import stylex from '@stylexjs/unplugin'\n" : ''}
export default defineConfig({${
  renderer === 'tailwind'
    ? '\n  plugins: [tailwindcss()],'
    : renderer === 'stylex'
      ? `
  plugins: [stylex.vite({
    styleResolution: 'property-specificity',
    sxPropName: false,
  })],`
      : ''
}
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),${
        renderer === 'pleat'
          ? `
      '@pleat/core': fileURLToPath(
        new URL('./src/lib/pleat/core/src/index.ts', import.meta.url),
      ),`
          : ''
      }
    },
    dedupe: ['effect'],
  },
})`

const application = `import { BrowserHost } from '@effect/ui/html'
import { Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'
import { Button } from '${componentPath}'
import './styles.css'

const App = Html.component({
  name: 'Hello',
  model: Schema.Null,
}).make({
  init: () => null,
  view: h => Button(h, { variant: 'outline' }).children('Hello, Effect UI'),
})

const root = document.getElementById('root')
if (root) Layer.launch(BrowserHost.mount(App, {}, root)).pipe(Effect.runFork)`

export const gettingStarted: DocsGuide = {
  title: 'Get Started',
  description:
    'Install CreaseUI components in an Effect UI application and render your first view.',
  toc: [
    ['before-you-start', 'Before you start'],
    ['install-dependencies', 'Install dependencies'],
    ['configure-vite', 'Configure Vite'],
    ['add-the-stylesheet', 'Add the stylesheet'],
    ['configure-the-cli', 'Configure the CLI'],
    ['install-components', 'Install components'],
    ['use-components', 'Use components'],
    ['agent-history', 'Agent & history'],
    ['next-steps', 'Next steps'],
  ],
  view: h =>
    h.div.children(
      section(
        h,
        'before-you-start',
        'Before you start',
        h.p.children(
          'Crease UI is a source registry for Effect UI. The shadcn CLI copies the TypeScript files you choose into your application, where you can inspect and edit them. Your app keeps its own Effect UI and Effect versions.',
        ),
        h.p.children(
          'The ',
          rendererName,
          ' renderer styles components with Tailwind CSS 4 utility classes, compiled by the Tailwind Vite plugin. Start with Node.js 22 or newer and an Effect UI Vite app. For the currently validated versions, see the ',
          h.a
            .class('docs-inline-link')
            .attrs({
              href: 'https://github.com/Potti1234/creaseui/blob/main/compatibility.json',
              target: '_blank',
              rel: 'noreferrer',
            })
            .children('compatibility matrix'),
          '.',
        ),
      ),
      section(
        h,
        'install-dependencies',
        'Install dependencies',
        h.p.children(
          'Install the same Effect and Effect UI versions used by this catalog.',
        ),
        snippet(
          h,
          'guide-effect-dependencies',
          'sh',
          [
            'npm install effect@4.1.5',
            `  @effect/ui@https://pkg.pr.new/Effect-TS/ui/@effect/ui@${snapshot}`,
            `  @effect/ui-kit@https://pkg.pr.new/Effect-TS/ui/@effect/ui-kit@${snapshot}`,
          ].join(' \\\n'),
        ),
        snippet(
          h,
          'guide-renderer-dependencies',
          'sh',
          {
            tailwind:
              'npm install -D vite typescript @types/node tailwindcss @tailwindcss/vite',
            stylex:
              'npm install @stylexjs/stylex\nnpm install -D vite typescript @types/node @stylexjs/unplugin',
            pleat: 'npm install -D vite typescript @types/node',
          }[renderer],
        ),
      ),
      section(
        h,
        'configure-vite',
        'Configure Vite',
        h.p.children(
          'Point the TypeScript and Vite aliases at the same files. The registry installs source under the UI and library aliases.',
        ),
        snippet(h, 'guide-vite-config', 'ts', viteConfig),
        snippet(
          h,
          'guide-typescript-config',
          'json',
          JSON.stringify(
            {
              compilerOptions: {
                module: 'ESNext',
                moduleResolution: 'Bundler',
                target: 'ES2022',
                strict: true,
                paths: {
                  '@/*': ['./src/*'],
                  ...(renderer === 'pleat'
                    ? { '@pleat/core': ['./src/lib/pleat/core/src/index.ts'] }
                    : {}),
                },
              },
            },
            null,
            2,
          ),
        ),
      ),
      section(
        h,
        'add-the-stylesheet',
        'Add the stylesheet',
        h.p.children(
          'Create ',
          h.code.children('src/styles.css'),
          ' and import it once from the app entry. The installer adds the theme to this file.',
        ),
        renderer === 'tailwind'
          ? snippet(
              h,
              'guide-app-styles',
              'css',
              `@import 'tailwindcss';\n\n@custom-variant dark (&:is(.dark *));`,
            )
          : h.p.children(
              'An empty stylesheet is enough to start. After installation, keep the CSS custom properties and font import in this stylesheet.',
            ),
        snippet(h, 'guide-entry-import', 'ts', `import './styles.css'`),
      ),
      section(
        h,
        'configure-the-cli',
        'Configure the CLI',
        h.p.children(
          'Build and serve the registry from the CreaseUI checkout.',
        ),
        snippet(
          h,
          'guide-registry-server',
          'sh',
          'npm --prefix effect-ui run registry:build\nnpm --prefix effect-ui run dev -- --port 5181',
        ),
        h.p.children(
          'In your consumer project, add ',
          h.code.children('components.json'),
          ' with these aliases and the local registry URL.',
        ),
        snippet(h, 'guide-components-json', 'json', componentsJson),
      ),
      section(
        h,
        'install-components',
        'Install components',
        snippet(
          h,
          'guide-add-components',
          'sh',
          renderer === 'tailwind'
            ? 'npx shadcn@latest add @crease-effect/effect-button @crease-effect/effect-accordion'
            : `npx shadcn@latest add @crease-effect/${renderer}-effect-components`,
        ),
        h.p.children(
          'Each item brings its registry dependencies with it. Installing Button writes these files:',
        ),
        h.div.class('guide-token-table-wrapper').children(
          h.table.class('guide-token-table').children(
            h.tbody.children(
              [
                [
                  'src/ui/effect/ui/button.ts',
                  'The Tailwind Button source: variants, sizes, and view.',
                ],
                [
                  'src/ui/effect/behaviors/button.ts',
                  'Shared Button behavior used by the renderers.',
                ],
                [
                  'src/styles.css',
                  'crease-theme adds the light and dark theme variables and the @theme inline mapping.',
                ],
                [
                  'package.json',
                  'Component dependencies such as class-variance-authority.',
                ],
              ].map(([file, description]) =>
                h.tr
                  .key(file ?? '')
                  .children(
                    h.td.children(h.code.children(file)),
                    h.td.children(description ?? ''),
                  ),
              ),
            ),
          ),
        ),
        h.p.children(
          'Stateless components are a single view helper. Interactive components also include their Model, Message, and update logic. Every component page shows its install command in its Installation section.',
        ),
        h.p.children(
          'Install a standalone behavior with ',
          h.code.children(
            'npx shadcn@latest add @crease-effect/effect-button-behavior',
          ),
          '. Import it from ',
          h.code.children('@/ui/effect/behaviors/button'),
          '.',
        ),
      ),
      section(
        h,
        'use-components',
        'Use components',
        h.h3.children('Render a stateless component'),
        h.p.children(
          'Import the installed component helper and place it in your view. Its children, variant and event handlers are ordinary Effect UI view inputs.',
        ),
        h.p.children(
          'Place a ',
          h.code.children('<div id="root"></div>'),
          ' in your HTML and point the module script at the application entry.',
        ),
        snippet(h, 'guide-first-view', 'ts', application),
        h.h3.children('Compose a stateful component'),
        h.p.children(
          'For a dialog, menu, calendar, or other stateful component, declare it as a child component from the parent view. Keep durable values in the parent model, pass them as props, and map child events in onEmit. The child owns its transient interaction state; the parent owns the values that must survive navigation or be saved.',
        ),
        h.p.children(
          'Commands and subscriptions belong to the child unless the state is shared by several controls. Shared state moves up to the parent or a provider, as described in the Behaviors guide.',
        ),
        renderer === 'pleat'
          ? h.p.children(
              'For server rendering, place ',
              h.code.children('Sheet.styleTag(rendered.html)'),
              ' in the document head. Client rendering adds the active styles to the document.',
            )
          : undefined,
      ),
      section(
        h,
        'agent-history',
        'Agent & history',
        h.p.children(
          'Let an in-app agent help without handing it your component state. Describe the controls as data, validate a plan with Agent, and map RunStep back to your own messages. Observe selects changes; History records them and emits Apply when you seek or undo a source.',
        ),
        h.div
          .class('agent-history-demo')
          .children(
            h.div
              .class('agent-history-toolbar')
              .children(
                h.button.attrs({ type: 'button' }).children('Run agent'),
                h.button.attrs({ type: 'button' }).children('Undo agent'),
                h.button.attrs({ type: 'button' }).children('Back'),
                h.button.attrs({ type: 'button' }).children('Forward'),
              ),
            h.div
              .class('agent-history-grid')
              .children(
                h.div.children(
                  h.strong.children('Release title'),
                  h.p.children('Effects at scale'),
                ),
                h.div.children(
                  h.strong.children('Publish'),
                  h.p.children('Waiting for approval'),
                ),
                h.div.children(
                  h.strong.children('Secret token'),
                  h.p.children('••••••••'),
                ),
              ),
            h.p
              .class('docs-muted')
              .children(
                'The Effect UI Agent and History behaviors are not implemented yet; this static example preserves the guide’s walkthrough structure.',
              ),
          ),
        h.p.children(
          'Try Run agent, then approve publishing. Undo agent restores only agent edits; your own changes stay. Back and Forward seek through the same history. Secret controls redact both their values and previous values and cannot be restored.',
        ),
        h.p.children(
          'For development-time inspection, keep the Effect UI message log and runtime inspection tools. These behaviors are for the user-facing experience: confirmation, redaction and per-control history.',
        ),
      ),
      section(
        h,
        'next-steps',
        'Next steps',
        h.ul.children(
          h.li.children(
            h.a.attr('href', '/docs/components/button').children('Button'),
          ),
          h.li.children(
            h.a
              .attr('href', '/docs/components/accordion')
              .children('Accordion'),
          ),
          h.li.children(
            h.a.attr('href', '/docs/behaviors').children('Behaviors'),
          ),
          h.li.children(h.a.attr('href', '/docs/theming').children('Theming')),
        ),
      ),
    ),
}

const themeTokens = [
  ['--background', 'Page and application surface'],
  ['--foreground', 'Default text'],
  ['--card', 'Card surface'],
  ['--card-foreground', 'Text on cards'],
  ['--popover', 'Floating surface'],
  ['--popover-foreground', 'Text in floating panels'],
  ['--primary', 'Primary actions and selected states'],
  ['--primary-foreground', 'Text on primary surfaces'],
  ['--secondary', 'Secondary action surface'],
  ['--secondary-foreground', 'Text on secondary surfaces'],
  ['--muted', 'Quiet surfaces'],
  ['--muted-foreground', 'Supporting text'],
  ['--accent', 'Hover and highlighted surfaces'],
  ['--accent-foreground', 'Text on highlighted surfaces'],
  ['--destructive', 'Destructive actions and error state'],
  ['--border', 'Dividers and surface borders'],
  ['--input', 'Form control borders and surfaces'],
  ['--ring', 'Keyboard focus ring'],
  ...[1, 2, 3, 4, 5].map(
    index => [`--chart-${index}`, `Chart series ${index}`] as const,
  ),
  ['--sidebar', 'Sidebar surface'],
  ['--sidebar-foreground', 'Sidebar text and icons'],
  ['--sidebar-primary', 'Primary sidebar action'],
  ['--sidebar-primary-foreground', 'Text on primary sidebar actions'],
  ['--sidebar-accent', 'Hovered and selected sidebar surface'],
  ['--sidebar-accent-foreground', 'Text on highlighted sidebar surfaces'],
  ['--sidebar-border', 'Sidebar dividers and borders'],
  ['--sidebar-ring', 'Sidebar keyboard focus ring'],
  ['--radius', 'Base corner radius'],
] as const

const tailwindThemeTokens = [
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

export const theming: DocsGuide = {
  title: 'Theming',
  description:
    'Customize the Tailwind components through the shared semantic theme tokens.',
  toc: [
    ['theme-contract', 'Theme tokens'],
    ['change-the-theme', 'Change the theme'],
    ['dark-mode', 'Dark mode'],
    ['component-customization', 'Component customization'],
    ['theme-builder', 'Theme builder'],
  ],
  view: h =>
    h.div.children(
      section(
        h,
        'theme-contract',
        'Theme tokens',
        h.p.children(
          'This theming guide is for the Tailwind renderer. The StyleX theming guide and Pleat theming guide cover the other renderers. Every component exists in all three with the same props and behavior.',
        ),
        h.p.children(
          'Crease UI styles components with semantic CSS variables. One palette updates buttons, inputs, overlays, charts, and sidebars together, while components keep their behavior and layout.',
        ),
        h.p.children(
          'Tailwind registry components depend on ',
          h.code.children('crease-theme'),
          '. The CLI writes its light and dark values into the stylesheet named by ',
          h.code.children('tailwind.css'),
          ' in ',
          h.code.children('components.json'),
          ' and maps them to Tailwind utilities.',
        ),
        h.div
          .class('guide-token-table-wrapper')
          .children(
            h.table
              .class('guide-token-table')
              .children(
                h.thead.children(
                  h.tr.children(
                    h.th.attr('scope', 'col').children('Token'),
                    h.th.attr('scope', 'col').children('Purpose'),
                  ),
                ),
                h.tbody.children(
                  themeTokens.map(([token, purpose]) =>
                    h.tr.children(
                      h.th
                        .class('guide-token-name')
                        .attr('scope', 'row')
                        .children(h.code.children(token)),
                      h.td.children(purpose),
                    ),
                  ),
                ),
              ),
          ),
        h.h3.children('Tailwind utility tokens'),
        h.p.children(
          'The @theme inline block publishes color aliases, the sans-serif font token, and four radius utilities. They are generated from the variables above and power classes such as bg-background or rounded-lg.',
        ),
        h.div
          .class('guide-token-table-wrapper')
          .children(
            h.table
              .class('guide-token-table')
              .children(
                h.thead.children(
                  h.tr.children(
                    h.th.attr('scope', 'col').children('Token'),
                    h.th.attr('scope', 'col').children('Purpose'),
                  ),
                ),
                h.tbody.children(
                  tailwindThemeTokens.map(([token, purpose]) =>
                    h.tr.children(
                      h.th
                        .class('guide-token-name')
                        .attr('scope', 'row')
                        .children(h.code.children(token)),
                      h.td.children(purpose),
                    ),
                  ),
                ),
              ),
          ),
      ),
      section(
        h,
        'change-the-theme',
        'Change the theme',
        h.p.children(
          'Edit the ',
          h.code.children(':root'),
          ' and ',
          h.code.children('.dark'),
          ' values in the stylesheet selected by ',
          h.code.children('components.json'),
          '. Keep the generated ',
          h.code.children('@theme inline'),
          ' mapping: it makes the variables available as utilities such as ',
          h.code.children('bg-background'),
          ', ',
          h.code.children('text-foreground'),
          ', and ',
          h.code.children('rounded-lg'),
          '.',
        ),
        snippet(
          h,
          'guide-theme-override',
          'css',
          `:root,
.light {
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
}`,
        ),
        h.p.children(
          'The example changes the page surface, foreground, primary color, and radius and keeps the rest of the default palette. Set every variable you change in both blocks so the theme stays legible in light and dark mode.',
        ),
      ),
      section(
        h,
        'dark-mode',
        'Dark mode',
        h.p.children(
          'Add or remove the ',
          h.code.children('.dark'),
          ' class on the document root or on an ancestor of the themed components. Existing utility classes then resolve against the active variable block.',
        ),
      ),
      section(
        h,
        'component-customization',
        'Component customization',
        h.p.children(
          'Use semantic tokens for changes that should apply across the app, and a component’s documented ',
          h.code.children('variant'),
          ' and ',
          h.code.children('size'),
          ' for supported visual choices. The class prop accepts parent-layout utilities only.',
        ),
        h.p.children(
          'For anything beyond that, edit the installed source: it is your code, and the component pages document its exports.',
        ),
      ),
      section(
        h,
        'theme-builder',
        'Create a theme preset',
        h.p.children(
          'The Create page lets you adjust the color palette, chart colors, radius, typography, and sidebar treatment together. Copy its registry JSON to keep the preset reproducible, or copy the generated CSS variables into your stylesheet.',
        ),
        h.a
          .class('docs-guide-link')
          .attr('href', '/create')
          .children('Open the theme builder'),
      ),
    ),
}
