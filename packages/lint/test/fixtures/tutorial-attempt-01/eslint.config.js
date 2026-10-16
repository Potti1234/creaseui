import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { creaseui } from '@creaseui/lint'

const manifest = JSON.parse(
  readFileSync(new URL('./crease.lock.json', import.meta.url), 'utf8'),
)
const productSources = manifest.artifacts.flatMap(artifact =>
  artifact.files.filter(file => file.rawRendering).map(file => file.path),
)
const foundationSources = [
  ...[
    'avatar',
    'badge',
    'button',
    'dialog',
    'dropdown-menu',
    'empty',
    'heading',
    'input',
    'label',
    'separator',
    'stack',
    'text',
    'textarea',
  ].map(name => 'src/ui/' + name + '.ts'),
  ...[
    'button',
    'dropdown-menu-behavior',
    'icon',
    'icon-nodes',
    'input',
    'textarea',
    'utils',
  ].map(name => 'src/lib/' + name + '.ts'),
]

export default [
  // This first checkpoint lints feature code. Authoring sources have exact paths,
  // rather than a directory exemption that could hide a new raw feature wrapper.
  { ignores: [...productSources, ...foundationSources] },
  ...creaseui({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    renderer: 'tailwind',
    tsconfig: './tsconfig.json',
    files: ['src/**/*.ts'],
  }),
  {
    files: ['src/**/*.ts'],
    ignores: ['src/model.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
              '**/ui/**',
              '**/lib/**',
                '@foldkit/ui',
                '@foldkit/ui/**',
              ],
              message:
                'Feature views compose the product patterns in src/design. Customize source-owned components there.',
            },
          ],
        },
      ],
    },
  },
]
