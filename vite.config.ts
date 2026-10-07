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
  const renderer = mode === 'stylex' ? 'stylex' : 'tailwind'
  const isStyleX = renderer === 'stylex'
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
      ...(isStyleX ? [] : [tailwindcss()]),
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
              .replace(
                'https://creaseui.com/',
                isStyleX
                  ? 'https://stylex.creaseui.com/'
                  : 'https://creaseui.com/',
              )
              .replace(
                '/src/styles.css',
                isStyleX ? '/src/site/stylex.css' : '/src/styles.css',
              )
              .replace(
                '/src/entry.ts',
                isStyleX ? '/src/entry-stylex.ts' : '/src/entry.ts',
              )
          },
        },
        generateBundle(_options, bundle) {
          if (!isStyleX) return
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
              '@/site/landing-skin': source('site/landing-skin.stylex.ts'),
              '@/site/landing-ui': source('site/landing-ui.stylex.ts'),
              '@/site/landing-tour-skin': source(
                'site/landing-tour-skin.stylex.ts',
              ),
              '@/site/landing-tour-ui': source(
                'site/landing-tour-ui.stylex.ts',
              ),
              '@/docs/component-page': source('site/docs.stylex.ts'),
              '@/demo/blocks/index-page': source('site/blocks.stylex.ts'),
            }
          : {}),
        '@': source(''),
      },
    },
    cacheDir: `node_modules/.vite-${renderer}`,
    server: { port: isStyleX ? 5174 : 5173, strictPort: true },
    preview: { port: isStyleX ? 4174 : 4173, strictPort: true },
    build: { outDir: `dist/${renderer}` },
  }
})
