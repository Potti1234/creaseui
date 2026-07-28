import { cpSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const fixture = mkdtempSync(join(tmpdir(), 'creaseui-registry-'))
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: fixture,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

for (const file of [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
]) {
  cpSync(join(root, file), join(fixture, file))
}

mkdirSync(join(fixture, 'src'), { recursive: true })

writeFileSync(
  join(fixture, 'components.json'),
  `${JSON.stringify(
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
    },
    null,
    2,
  )}\n`,
)

writeFileSync(join(fixture, 'src', 'styles.css'), '@import "tailwindcss";\n')
writeFileSync(
  join(fixture, 'src', 'vite-env.d.ts'),
  '/// <reference types="vite/client" />\n',
)
writeFileSync(
  join(fixture, 'src', 'entry.ts'),
  `import './styles.css'

import { button } from '@/ui/button'
import * as Dialog from '@/ui/dialog'

export const smoke = {
  button,
  dialog: Dialog.dialog,
  dialogInit: Dialog.init,
  dialogUpdate: Dialog.update,
}
`,
)

run(npx, [
  '--yes',
  'shadcn@latest',
  'add',
  'Potti1234/creaseui/button',
  'Potti1234/creaseui/dialog',
  '--yes',
])
run(npm, ['install'])
run(npm, ['run', 'typecheck'])
run(npm, ['run', 'build'])

console.log(`Registry installation verified in ${fixture}`)
