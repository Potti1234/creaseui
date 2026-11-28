import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'

import stylex from '@stylexjs/unplugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const docsRouting = (): Plugin => {
  const route = (
    request: IncomingMessage,
    _response: ServerResponse,
    next: () => void,
  ) => {
    const pathname = request.url?.split('?')[0] ?? ''
    if (
      pathname === '/' ||
      /^(?:\/docs|\/charts|\/blocks|\/create)(?:\/[^.?]*)?$/.test(pathname)
    )
      request.url = '/docs/index.html'
    next()
  }
  return {
    name: 'crease-effect-docs-routing',
    configureServer: server => {
      server.middlewares.use(route)
    },
    configurePreviewServer: server => {
      server.middlewares.use(route)
    },
  }
}

export default defineConfig(({ mode }) => {
  const renderer = mode === 'stylex' || mode === 'pleat' ? mode : 'tailwind'
  return {
    cacheDir: fromRoot(`./node_modules/.vite/${renderer}`),
    plugins: [
      docsRouting(),
      ...(renderer === 'stylex'
        ? [
            stylex.vite({
              styleResolution: 'property-specificity',
              sxPropName: false,
            }),
          ]
        : renderer === 'tailwind'
          ? [tailwindcss()]
          : []),
    ],
    resolve: {
      alias: {
        '#components': fromRoot(
          `./src/${renderer === 'tailwind' ? 'ui' : renderer}/index.ts`,
        ),
        '#theme': fromRoot(
          renderer === 'tailwind' ? '../src/styles.css' : '../src/theme.css',
        ),
      },
      dedupe: ['effect'],
    },
    build: {
      outDir: `dist/${renderer}`,
      rolldownOptions: {
        input: {
          preview: fromRoot('./index.html'),
          docs: fromRoot('./docs/index.html'),
        },
      },
    },
  }
})
