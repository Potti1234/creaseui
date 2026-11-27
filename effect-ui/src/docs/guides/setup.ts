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
  view: h =>
    h.div.children(
      section(
        h,
        'before-you-start',
        'Before you start',
        h.p.children(
          'You need an Effect UI project with TypeScript and Vite. Use a local checkout of the registry while the Effect UI port is in development.',
        ),
        h.p.children(
          'These steps use ',
          rendererName,
          '. Use the renderer links to see the other setups.',
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
        h.p.children(
          'Place a ',
          h.code.children('<div id="root"></div>'),
          ' in your HTML and point the module script at the application entry.',
        ),
        snippet(h, 'guide-first-view', 'ts', application),
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
  ['--success', 'Success state'],
  ['--warning', 'Warning state'],
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

export const theming: DocsGuide = {
  title: 'Theming',
  description:
    'Use semantic color and radius tokens to theme the Effect UI components across renderers.',
  view: h =>
    h.div.children(
      section(
        h,
        'theme-contract',
        'Theme tokens',
        h.p.children(
          'The registry adds shared CSS custom properties. Use the surface and foreground tokens together to keep text legible.',
        ),
        h.table.children(
          h.thead.children(
            h.tr.children(
              h.th.attr('scope', 'col').children('Token'),
              h.th.attr('scope', 'col').children('Purpose'),
            ),
          ),
          h.tbody.children(
            themeTokens.map(([token, purpose]) =>
              h.tr.children(
                h.th.attr('scope', 'row').children(h.code.children(token)),
                h.td.children(purpose),
              ),
            ),
          ),
        ),
      ),
      section(
        h,
        'how-components-read-the-theme',
        'How components read the theme',
        h.p.children(
          {
            tailwind:
              'Tailwind utilities read the semantic colors via the @theme inline aliases. Keep the alias definitions when changing the application colors.',
            stylex:
              'StyleX styles refer to the semantic CSS properties with var(). Compile the installed styles through the StyleX Vite plugin.',
            pleat:
              'Pleat styles refer to the semantic CSS properties with var(). The installed Pleat renderer emits the declarations it applies.',
          }[renderer],
        ),
      ),
      section(
        h,
        'change-the-theme',
        'Change the theme',
        h.p.children(
          'Set color pairs together. This example changes the main action colors and the shared corner radius.',
        ),
        snippet(
          h,
          'guide-theme-override',
          'css',
          `:root {\n  --primary: oklch(0.39 0.14 254);\n  --primary-foreground: oklch(0.99 0 0);\n  --radius: 0.5rem;\n}`,
        ),
      ),
      section(
        h,
        'dark-mode',
        'Dark mode',
        h.p.children(
          'Apply ',
          h.code.children('.dark'),
          ' to the document element to switch the same components to the dark palette. Update the corresponding dark tokens when replacing the light palette.',
        ),
        snippet(
          h,
          'guide-dark-theme',
          'css',
          `.dark {\n  color-scheme: dark;\n  --primary: oklch(0.8 0.11 254);\n  --primary-foreground: oklch(0.21 0.06 254);\n}`,
        ),
      ),
      section(
        h,
        'scoped-themes',
        'Scoped themes',
        h.p.children(
          'Apply overrides on a container for a local theme. Place overlay tokens on an ancestor shared by the anchor and its top-layer content.',
        ),
      ),
      section(
        h,
        'component-customization',
        'Component customization',
        h.p.children(
          'Use component variants for local appearance changes. Edit the installed renderer source to change a component recipe. Use the standalone behavior when composing your own elements and styles.',
        ),
        h.p.children(
          h.a
            .attr('href', '/docs/behaviors')
            .children('Browse the behavior reference'),
        ),
      ),
    ),
}
