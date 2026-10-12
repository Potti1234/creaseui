import { defineConfig } from 'vite'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { foldkit } from '@foldkit/vite-plugin'
import stylex from '@stylexjs/unplugin'
import tailwindcss from '@tailwindcss/vite'

import { stylexCompilerOptions } from './stylex.config.js'

const sourceRevision = (): string => {
  const environmentRevision =
    process.env.GITHUB_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.COMMIT_REF

  if (environmentRevision && /^[0-9a-f]{7,40}$/iu.test(environmentRevision)) {
    return environmentRevision.toLowerCase()
  }

  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const buildSha = sourceRevision()
const buildDirty = (() => {
  try {
    return (
      execFileSync('git', ['status', '--porcelain'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim().length > 0
    )
  } catch {
    return false
  }
})()

export default defineConfig(({ mode }) => {
  const renderer =
    mode === 'pleat' ? 'pleat' : mode === 'stylex' ? 'stylex' : 'tailwind'
  const isStyleX = renderer === 'stylex'
  const isPleat = renderer === 'pleat'
  const isTailwind = renderer === 'tailwind'
  const canonicalOrigin = isTailwind
    ? 'https://creaseui.com/'
    : `https://${renderer}.creaseui.com/`
  const source = (path: string) =>
    fileURLToPath(new URL(`./src/${path}`, import.meta.url))
  return {
    define: {
      __CREASEUI_BUILD_SHA__: JSON.stringify(buildSha),
      __CREASEUI_BUILD_DIRTY__: JSON.stringify(buildDirty),
      __CREASEUI_RENDERER__: JSON.stringify(renderer),
    },
    plugins: [
      stylex.vite(stylexCompilerOptions),
      ...(isTailwind ? [] : [tailwindcss()]),
      {
        name: 'creaseui:site-entry',
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            return html
              .replace(
                '<html lang="en">',
                `<html lang="en" data-renderer="${renderer}">`,
              )
              .replace('https://creaseui.com/', canonicalOrigin)
              .replace(
                '/src/styles.css',
                isTailwind ? '/src/styles.css' : `/src/site/${renderer}.css`,
              )
              .replace(
                '/src/entry.ts',
                isTailwind ? '/src/entry.ts' : `/src/entry-${renderer}.ts`,
              )
          },
        },
        generateBundle(_options, bundle) {
          if (isTailwind) return
          for (const item of Object.values(bundle)) {
            if (
              item.type === 'asset' &&
              item.fileName.endsWith('.css') &&
              /tailwindcss|--tw-|@layer\s+(?:theme|utilities)\s*\{/u.test(
                String(item.source),
              )
            ) {
              this.error(
                `Tailwind CSS leaked into the StyleX site: ${item.fileName}`,
              )
            }
          }
        },
      },
      foldkit(),
      {
        name: 'creaseui:foldkit-devtools-singleton',
        configResolved(config) {
          // The Foldkit plugin explicitly includes this entry. Prebundling it
          // separates overlay registration from the unbundled runtime, and Vite
          // removes the now-unused registration state. Drop the forced include
          // so optimizeDeps.exclude below can keep the host unbundled.
          config.optimizeDeps.include = config.optimizeDeps.include?.filter(
            specifier => specifier !== 'foldkit/devtools-host',
          )
        },
      },
    ],
    optimizeDeps: {
      // Keep overlay registration on the same Foldkit module as the app runtime.
      exclude: ['foldkit/devtools-host'],
    },
    resolve: {
      alias: {
        ...(isStyleX
          ? {
              '@/site/skin': source('site/skin.stylex.ts'),
              '@/site/docs-search-ui': source('site/docs-search-ui.stylex.ts'),
              '@/site/landing-skin': source('site/landing-skin.stylex.ts'),
              '@/site/landing-ui': source('site/landing-ui.stylex.ts'),
              '@/site/landing-tour-skin': source(
                'site/landing-tour-skin.stylex.ts',
              ),
              '@/site/landing-tour-ui': source(
                'site/landing-tour-ui.stylex.ts',
              ),
              '@/docs/component-page': source('site/docs.stylex.ts'),
              '@/docs/getting-started-view': source(
                'site/getting-started.stylex.ts',
              ),
              '@/ui/code': source('stylex/code.ts'),
              '@/ui/code-block': source('stylex/code-block.ts'),
              '@/ui/heading': source('stylex/heading.ts'),
              '@/ui/text': source('stylex/text.ts'),
              '@/ui/typography': source('stylex/typography.ts'),
              '@/demo/blocks/index-page': source('site/blocks.stylex.ts'),
            }
          : isPleat
            ? {
                '@/site/skin': source('site/skin.pleat.ts'),
                '@/site/docs-search-ui': source('site/docs-search-ui.pleat.ts'),
                '@/site/landing-skin': source('site/landing-skin.pleat.ts'),
                '@/site/landing-ui': source('site/landing-ui.pleat.ts'),
                '@/site/landing-tour-skin': source(
                  'site/landing-tour-skin.pleat.ts',
                ),
                '@/site/landing-tour-ui': source(
                  'site/landing-tour-ui.pleat.ts',
                ),
                '@/docs/component-page': source('site/docs.pleat.ts'),
                '@/docs/getting-started-view': source(
                  'site/getting-started.pleat.ts',
                ),
                '@/ui/code': source('pleat/code.ts'),
                '@/ui/code-block': source('pleat/code-block.ts'),
                '@/ui/heading': source('pleat/heading.ts'),
                '@/ui/text': source('pleat/text.ts'),
                '@/ui/typography': source('pleat/typography.ts'),
                '@/demo/blocks/index-page': source('site/blocks.pleat.ts'),
              }
            : {}),
        '@': source(''),
      },
    },
    cacheDir: `node_modules/.vite-${renderer}`,
    server: {
      port: isTailwind ? 5173 : isStyleX ? 5174 : 5175,
      strictPort: true,
    },
    preview: {
      port: isTailwind ? 4173 : isStyleX ? 4174 : 4175,
      strictPort: true,
    },
    build: { outDir: `dist/${renderer}` },
  }
})
