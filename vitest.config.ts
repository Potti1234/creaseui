import { fileURLToPath } from 'node:url'

import stylex from '@stylexjs/unplugin'
import { defineConfig } from 'vitest/config'

import { stylexCompilerOptions } from './stylex.config.js'

export default defineConfig({
  plugins: [
    stylex.rollup({
      ...stylexCompilerOptions,
      test: true,
      dev: false,
      runtimeInjection: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['scene/**/*.scene.test.ts'],
    setupFiles: ['./scene/setup.ts'],
  },
})
