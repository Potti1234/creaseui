import { defineConfig } from 'vite'
import { execFileSync } from 'node:child_process'

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

export default defineConfig({
  define: {
    __CREASEUI_BUILD_SHA__: JSON.stringify(buildSha),
    __CREASEUI_BUILD_DIRTY__: JSON.stringify(buildDirty),
  },
  plugins: [
    stylex.vite(stylexCompilerOptions),
    tailwindcss(),
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
      '@': '/src',
    },
  },
})
