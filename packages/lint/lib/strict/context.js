import path from 'node:path'

import {
  DOCS_URL,
  POLICY_VERSION,
  RENDERERS,
  installInstruction,
  registryItemFor,
} from './contracts.js'
import {
  CreaseConfigError,
  buildOwnership,
  createModuleResolver,
  readReceipt,
} from './ownership.js'

export const PRESETS = ['strict', 'migration']

/** Validate consumer options once and build the shared ownership/resolution state. */
export const createStrictContext = (options = {}) => {
  const problems = []
  if (typeof options.rootDir !== 'string' || !path.isAbsolute(options.rootDir))
    problems.push(
      "rootDir: pass an absolute path, e.g. fileURLToPath(new URL('.', import.meta.url))",
    )
  if (options.renderer !== undefined && !RENDERERS.includes(options.renderer))
    problems.push(
      `renderer: '${options.renderer}' must be one of ${RENDERERS.join(', ')}`,
    )
  const preset = options.preset ?? 'strict'
  if (!PRESETS.includes(preset))
    problems.push(`preset: '${preset}' must be 'strict' or 'migration'`)
  if (preset === 'migration' && !(options.migrationFiles?.length > 0))
    problems.push(
      'preset: migration needs the explicit legacy file list `migrationFiles`',
    )
  const policy = options.policy ?? POLICY_VERSION
  if (policy !== POLICY_VERSION)
    problems.push(
      `policy: '${policy}' is not supported (available: ${POLICY_VERSION})`,
    )
  const typeInformation = options.typeInformation ?? 'required'
  if (!['required', 'syntactic'].includes(typeInformation))
    problems.push("typeInformation: must be 'required' or 'syntactic'")
  if (problems.length > 0) throw new CreaseConfigError(problems)

  const rootDir = path.resolve(options.rootDir)
  const receipt = readReceipt(rootDir, options.manifest ?? './crease.lock.json')
  const ownership = buildOwnership({
    extensions: options.extensions ?? [],
    receipt,
    renderer: options.renderer,
    rootDir,
  })
  return Object.freeze({
    modules: createModuleResolver({ rootDir, tsconfig: options.tsconfig }),
    ownership,
    policy,
    preset,
    renderer: ownership.renderer,
    rootDir,
    tsconfig: options.tsconfig,
    typeInformation,
  })
}

export const strictContextOf = context => context.settings?.creaseui ?? null

export const fileRecord = (strict, filename) =>
  strict?.ownership.fileFor(filename)

export const docsUrl = rule => `${DOCS_URL}#${rule}`

export const importPathFor = (fromFile, targetRelative, rootDir) => {
  const target = path
    .resolve(rootDir, targetRelative)
    .replace(/\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/u, '')
  const relative = path
    .relative(path.dirname(fromFile), target)
    .split(path.sep)
    .join('/')
  return relative.startsWith('.') ? relative : `./${relative}`
}

/** Replacement guidance that only names components really installed. */
export const replacementFor = (strict, contract, filename) => {
  if (strict === null)
    return 'Configure @creaseui/lint through creaseui() to get replacement guidance.'
  const record = strict.ownership.publicExportFor(contract)
  if (record !== undefined)
    return `Use \`${record.name}\` from '${importPathFor(filename, record.file, strict.rootDir)}'.`
  if (contract.startsWith('adapter.'))
    return `Render it through a registered ${contract} adapter (crease.lock.json role "adapter").`
  const item = registryItemFor(contract, strict.renderer)
  return item === undefined
    ? `No installed component implements ${contract}; register one in crease.lock.json.`
    : `Install the replacement with \`${installInstruction(item)}\`.`
}
