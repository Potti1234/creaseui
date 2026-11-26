import { fileURLToPath } from 'node:url'

import stylex from '@stylexjs/unplugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig(({ mode }) => {
  const renderer = mode === 'stylex' || mode === 'pleat' ? mode : 'tailwind'
  return {
    plugins:
      renderer === 'stylex'
        ? [
            stylex.vite({
              styleResolution: 'property-specificity',
              sxPropName: false,
            }),
          ]
        : renderer === 'tailwind'
          ? [tailwindcss()]
          : [],
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
    build: { outDir: `dist/${renderer}` },
  }
})
