import { fileURLToPath } from 'node:url'

import stylex from '@stylexjs/unplugin'
import { defineConfig } from 'vitest/config'

import { stylexCompilerOptions } from './stylex.config.js'

export default defineConfig({
  plugins: [
    // Vitest only needs StyleX's compile-time transform. The Vite adapter also
    // installs dev-server CSS/HMR middleware whose polling timer cannot be
    // closed in Vitest's middleware mode (StyleX issue #1533).
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
