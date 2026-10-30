import { fileURLToPath } from 'node:url'
import { creaseui } from '@creaseui/lint'

export default [
  ...creaseui({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    renderer: 'tailwind',
    // The first slice was built quickly. Its views run in migration mode:
    // every rule still runs, but findings are warnings, counted by the
    // ratchet in package.json until they are gone.
    preset: 'migration',
    migrationFiles: ['src/view.ts', 'src/features/**/*.ts'],
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    tsconfig: './tsconfig.json',
    manifest: './crease.lock.json',
    policy: 'crease-default-v1',
    extensions: [
      {
        id: 'app-entry',
        reason:
          'The entry point loads the theme stylesheet and starts the runtime.',
        role: 'setup',
        files: ['src/main.ts'],
      },
    ],
  }),
]
