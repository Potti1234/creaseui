#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

import ts from 'typescript'

import {
  CONTRACT_REPLACEMENTS,
  POLICY_VERSION,
  RENDERERS,
} from '../lib/strict/contracts.js'
import { CreaseConfigError } from '../lib/strict/ownership.js'

const USAGE = `Usage:
  creaseui-lint init   --renderer <tailwind|stylex|pleat> --components <dir> [--root <dir>] [--manifest crease.lock.json] [--dry-run]
  creaseui-lint doctor [--config creaseui-lint.config.mjs] [--root <dir>]

Exit codes: 0 ok, 1 findings, 2 invalid setup.`

const CONTRACT_BY_ITEM = new Map(
  [...CONTRACT_REPLACEMENTS].map(([contract, item]) => [item, contract]),
)
const SOURCE = /\.(?:ts|tsx|mts|js|jsx|mjs)$/u
const toPosix = value => value.split(path.sep).join('/')

const walk = directory =>
  existsSync(directory)
    ? readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(directory, entry.name)
        if (entry.isDirectory())
          return entry.name === 'node_modules' ? [] : walk(full)
        return SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts')
          ? [full]
          : []
      })
    : []

const exportedFunctions = file => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const names = []
  for (const statement of source.statements) {
    const exported = statement.modifiers?.some(
      modifier => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )
    if (!exported) continue
    if (ts.isFunctionDeclaration(statement) && statement.name)
      names.push(statement.name.text)
    if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations)
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer !== undefined &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer))
        )
          names.push(declaration.name.text)
  }
  return names
}

const rendersHtml = file => /\bHtmlBuilder\b/u.test(readFileSync(file, 'utf8'))

/** Receipt for the components installed in one directory. */
export const buildReceipt = ({ rootDir, components, renderer }) => {
  const prefix = renderer === 'tailwind' ? '' : `${renderer}-`
  const base = path.resolve(rootDir, components)
  const artifacts = walk(base)
    .sort()
    .map(file => {
      const relative = toPosix(path.relative(rootDir, file))
      const local = toPosix(path.relative(base, file)).replace(SOURCE, '')
      const item = path.basename(local)
      const behavior = local.split('/').includes('behavior')
      const contract = behavior
        ? `behavior.${item}`
        : (CONTRACT_BY_ITEM.get(item) ?? `component.${item}`)
      const raw = rendersHtml(file)
      const role = behavior ? 'behavior' : raw ? 'renderer' : 'theme'
      const exports = raw
        ? exportedFunctions(file)
            .filter(name => !/(?:Variants?|variants)$/u.test(name))
            .map(name => ({
              contract,
              file: relative,
              name,
              ...(behavior ? { visibility: 'implementation' } : {}),
            }))
        : []
      return {
        exports,
        files: [{ path: relative, rawRendering: raw, role }],
        id: `crease/${prefix}${local.split('/').join('-')}`,
      }
    })
  return {
    artifacts,
    policyVersion: POLICY_VERSION,
    renderer,
    schemaVersion: 1,
  }
}

const configFragment = ({
  renderer,
  manifest,
  tsconfig,
}) => `import { fileURLToPath } from 'node:url'
import { creaseui } from '@creaseui/lint'

export default [
  ...creaseui({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    renderer: '${renderer}',
    preset: 'strict',
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    tsconfig: '${tsconfig}',
    manifest: '${manifest}',
    policy: '${POLICY_VERSION}',
  }),
]
`

const ESLINT_CONFIGS = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
]

const init = values => {
  const rootDir = path.resolve(values.root ?? '.')
  if (!RENDERERS.includes(values.renderer))
    throw new CreaseConfigError([
      `--renderer must be one of ${RENDERERS.join(', ')}`,
    ])
  if (values.components === undefined)
    throw new CreaseConfigError([
      '--components <dir> (the installed component directory) is required',
    ])
  const manifest = values.manifest ?? 'crease.lock.json'
  const tsconfig = existsSync(path.join(rootDir, 'tsconfig.json'))
    ? './tsconfig.json'
    : './jsconfig.json'
  const receipt = buildReceipt({
    components: values.components,
    renderer: values.renderer,
    rootDir,
  })
  const writes = []
  const manifestPath = path.join(rootDir, manifest)
  if (existsSync(manifestPath))
    console.log(`keep    ${manifest} (already present; not overwritten)`)
  else writes.push([manifestPath, `${JSON.stringify(receipt, null, 2)}\n`])
  const existing = ESLINT_CONFIGS.find(name =>
    existsSync(path.join(rootDir, name)),
  )
  const fragment = configFragment({
    manifest: `./${manifest}`,
    renderer: values.renderer,
    tsconfig,
  })
  if (existing === undefined)
    writes.push([path.join(rootDir, 'eslint.config.js'), fragment])
  else {
    writes.push([path.join(rootDir, 'creaseui-lint.config.mjs'), fragment])
    console.log(
      `keep    ${existing} (existing config is never replaced)\n        add: import crease from './creaseui-lint.config.mjs'  and spread  ...crease  into its exported array`,
    )
  }
  for (const [file, content] of writes) {
    console.log(
      `${values['dry-run'] ? 'would write' : 'write  '} ${toPosix(path.relative(rootDir, file))}`,
    )
    if (!values['dry-run']) writeFileSync(file, content)
  }
  console.log(
    `receipt: ${receipt.artifacts.length} artifacts, ${receipt.artifacts.filter(artifact => artifact.files[0].rawRendering).length} raw-rendering files`,
  )
  return 0
}

const findConfigOptions = async values => {
  const rootDir = path.resolve(values.root ?? '.')
  const configFile = path.resolve(rootDir, values.config ?? 'eslint.config.js')
  if (!existsSync(configFile))
    throw new CreaseConfigError([
      `config '${toPosix(path.relative(rootDir, configFile))}' not found; run \`creaseui-lint init\``,
    ])
  const config = (await import(pathToFileURL(configFile).href)).default
  const entries = (Array.isArray(config) ? config : [config]).flat(Infinity)
  const entry = entries.find(item => item?.settings?.creaseui !== undefined)
  if (entry === undefined)
    throw new CreaseConfigError([
      `${toPosix(path.relative(rootDir, configFile))} does not spread creaseui() from @creaseui/lint`,
    ])
  return { configFile, entries, rootDir, strict: entry.settings.creaseui }
}

const doctor = async values => {
  const { configFile, rootDir, strict } = await findConfigOptions(values)
  const findings = []
  const ok = message => console.log(`ok      ${message}`)
  const fail = message => {
    findings.push(message)
    console.log(`problem ${message}`)
  }
  ok(
    `receipt valid (renderer ${strict.renderer}, policy ${strict.policy}, ${strict.ownership.files.size} owned files)`,
  )
  const { ESLint } = await import('eslint')
  const eslint = new ESLint({ cwd: rootDir, overrideConfigFile: configFile })
  const sources = walk(path.join(rootDir, 'src'))
  const ruleIds = [
    'no-raw-controls',
    'no-raw-composition',
    'no-unapproved-renderer',
    'no-application-styles',
    'component-contract',
    'no-unverifiable-ui',
  ]
  let uncovered = 0
  for (const file of sources) {
    const relative = toPosix(path.relative(rootDir, file))
    const owned = strict.ownership.fileFor(file)
    const effective = await eslint.calculateConfigForFile(file)
    const active = ruleId => {
      const setting = effective?.rules?.[`crease/${ruleId}`]
      const level = Array.isArray(setting) ? setting[0] : setting
      return level !== undefined && level !== 'off' && level !== 0
    }
    if (owned === undefined) {
      const missing = ruleIds.filter(ruleId => !active(ruleId))
      if (missing.length > 0 && rendersHtml(file)) {
        uncovered += 1
        fail(
          `${relative} renders UI but is not covered by ${missing.join(', ')}`,
        )
      }
    } else if (owned.rawRendering && !active('component-contract'))
      fail(`${relative} (registered ${owned.role}) lost component-contract`)
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(
      /eslint-disable(?:-next-line|-line)?\s+([^\n*]*crease\/[^\n*]*)/gu,
    ))
      if (!/--\s*\S/u.test(match[1]))
        fail(
          `${relative}: Crease suppression without a reason (${match[1].trim()})`,
        )
    if (
      effective?.languageOptions?.parserOptions?.projectService !== true &&
      effective?.languageOptions?.parserOptions?.project === undefined &&
      SOURCE.test(file)
    )
      fail(`${relative}: no typed parser configuration`)
  }
  ok(
    `${sources.length} source files inspected, ${uncovered} uncovered UI modules`,
  )
  const missingReplacements = [...CONTRACT_REPLACEMENTS.keys()].filter(
    contract => strict.ownership.publicExportFor(contract) === undefined,
  )
  if (missingReplacements.length > 0)
    console.log(
      `note    no installed replacement for: ${missingReplacements.join(', ')} (diagnostics show install commands)`,
    )
  return findings.length === 0 ? 0 : 1
}

const main = async () => {
  const [command, ...rest] = process.argv.slice(2)
  const { values } = parseArgs({
    allowPositionals: false,
    args: rest,
    options: {
      components: { type: 'string' },
      config: { type: 'string' },
      'dry-run': { type: 'boolean' },
      manifest: { type: 'string' },
      renderer: { type: 'string' },
      root: { type: 'string' },
    },
  })
  if (command === 'init') return init(values)
  if (command === 'doctor') return doctor(values)
  console.error(USAGE)
  return 2
}

main().then(
  code => process.exit(code),
  error => {
    console.error(
      error instanceof CreaseConfigError
        ? error.message
        : (error?.stack ?? String(error)),
    )
    process.exit(2)
  },
)
