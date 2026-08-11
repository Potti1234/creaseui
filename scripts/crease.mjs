#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const REGISTRY = 'Potti1234/creaseui'
const [command = 'help', ...args] = process.argv.slice(2)
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const runShadcn = shadcnArgs => {
  const result = spawnSync(npx, ['--yes', 'shadcn@latest', ...shadcnArgs], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
  })

  process.exitCode = result.status ?? 1
}

const registryItem = name => `${REGISTRY}/${name}`

const printHelp = () => {
  process.stdout.write(`crease/ui CLI

Usage:
  crease init                         Install the theme and core preset
  crease add <component...>           Add source-owned components
  crease diff <component>             Preview upstream registry changes
  crease upgrade <component...>       Preview upgrades
  crease upgrade --write <items...>   Apply upgrades with overwrite enabled
  crease doctor                       Validate the current consumer setup
`)
}

const doctor = () => {
  const packagePath = resolve(process.cwd(), 'package.json')

  if (!existsSync(packagePath)) {
    process.stderr.write('crease doctor: package.json was not found.\n')
    process.exitCode = 1
    return
  }

  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
  const packages = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
  const required = ['effect', 'foldkit', '@foldkit/ui']
  const missing = required.filter(name => packages[name] === undefined)

  if (missing.length > 0) {
    process.stderr.write(
      `crease doctor: missing ${missing.join(', ')}. Install Foldkit before adding components.\n`,
    )
    process.exitCode = 1
    return
  }

  process.stdout.write(
    `crease doctor: ready (foldkit ${packages.foldkit}, effect ${packages.effect}).\n`,
  )
}

switch (command) {
  case 'init':
    runShadcn(['add', registryItem('crease-core')])
    break
  case 'add':
    if (args.length === 0) {
      process.stderr.write('crease add requires at least one component.\n')
      process.exitCode = 1
      break
    }
    runShadcn(['add', ...args.map(registryItem)])
    break
  case 'diff':
    if (args.length !== 1) {
      process.stderr.write('crease diff requires exactly one component.\n')
      process.exitCode = 1
      break
    }
    runShadcn(['add', registryItem(args[0]), '--diff'])
    break
  case 'upgrade': {
    const isWrite = args[0] === '--write'
    const components = isWrite ? args.slice(1) : args
    if (components.length === 0) {
      process.stderr.write('crease upgrade requires at least one component.\n')
      process.exitCode = 1
      break
    }
    runShadcn([
      'add',
      ...components.map(registryItem),
      ...(isWrite ? ['--overwrite'] : ['--diff']),
    ])
    break
  }
  case 'doctor':
    doctor()
    break
  case 'help':
  case '--help':
  case '-h':
    printHelp()
    break
  default:
    process.stderr.write(`Unknown command: ${command}\n\n`)
    printHelp()
    process.exitCode = 1
}
