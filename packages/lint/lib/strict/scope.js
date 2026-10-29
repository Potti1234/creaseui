import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/* Enforcement inputs compared against a trusted baseline. A feature change
   that loosens them is reported; lint cannot sandbox the code it checks, so
   this must run from a checkout or CI job the patch does not control. */
const INPUTS = [
  'crease.lock.json',
  'creaseui-lint.config.mjs',
  'creaseui-lint.audit.mjs',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  '.eslintignore',
  'package.json',
  'AGENTS.md',
]

export class BaselineError extends Error {}

const git = (rootDir, args) =>
  execFileSync('git', args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

const atBaseline = (rootDir, baseline, file) => {
  try {
    return git(rootDir, ['show', `${baseline}:./${file}`])
  } catch {
    return null
  }
}

const parseJson = text => {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

const fileRecords = receipt => {
  const records = new Map()
  for (const artifact of receipt?.artifacts ?? [])
    for (const record of artifact?.files ?? []) records.set(record.path, record)
  return records
}

const exportRecords = receipt => {
  const records = new Map()
  for (const artifact of receipt?.artifacts ?? [])
    for (const record of artifact?.exports ?? [])
      records.set(`${record.file}#${record.name}`, record)
  return records
}

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)

const manifestChanges = (beforeText, afterText) => {
  const before = parseJson(beforeText)
  const after = parseJson(afterText)
  if (before === undefined || after === undefined)
    return ['crease.lock.json is not valid JSON on one side']
  const changes = []
  for (const key of [
    'policyVersion',
    'renderer',
    'schemaVersion',
    'exceptions',
  ])
    if (!same(before[key], after[key]))
      changes.push(`crease.lock.json changes ${key}`)
  const filesBefore = fileRecords(before)
  const filesAfter = fileRecords(after)
  for (const [file, record] of filesAfter) {
    const previous = filesBefore.get(file)
    if (previous === undefined) {
      changes.push(
        record.rawRendering === true
          ? `crease.lock.json registers ${file} with rawRendering`
          : `crease.lock.json registers ${file}`,
      )
      continue
    }
    if (record.rawRendering === true && previous.rawRendering !== true)
      changes.push(`crease.lock.json grants rawRendering to ${file}`)
    else if (
      record.rawRendering === true &&
      previous.rawElements !== undefined &&
      (record.rawElements === undefined ||
        record.rawElements.some(tag => !previous.rawElements.includes(tag)))
    )
      changes.push(`crease.lock.json widens rawElements for ${file}`)
    if (record.role !== previous.role)
      changes.push(
        `crease.lock.json changes the role of ${file} from ${previous.role} to ${record.role}`,
      )
  }
  for (const file of filesBefore.keys())
    if (!filesAfter.has(file))
      changes.push(`crease.lock.json removes ownership of ${file}`)
  const exportsBefore = exportRecords(before)
  const exportsAfter = exportRecords(after)
  for (const [key, previous] of exportsBefore) {
    const record = exportsAfter.get(key)
    if (record === undefined) {
      changes.push(`crease.lock.json removes the contract for ${key}`)
      continue
    }
    /* Every field shapes enforcement (`propsArgument` picks the checked
       argument); foundations may only grow. */
    const fields = new Set([...Object.keys(previous), ...Object.keys(record)])
    for (const field of [...fields].sort())
      if (
        !['file', 'foundations', 'name'].includes(field) &&
        !same(record[field], previous[field])
      )
        changes.push(`crease.lock.json changes ${field} of ${key}`)
    if (
      (previous.foundations ?? []).some(
        entry => !(record.foundations ?? []).includes(entry),
      )
    )
      changes.push(`crease.lock.json drops declared foundations of ${key}`)
  }
  for (const key of exportsAfter.keys())
    if (!exportsBefore.has(key))
      changes.push(`crease.lock.json adds the contract for ${key}`)
  return changes
}

const packageChanges = (beforeText, afterText) => {
  const before = parseJson(beforeText)
  const after = parseJson(afterText)
  if (before === undefined || after === undefined)
    return ['package.json is not valid JSON on one side']
  const changes = []
  const scripts = new Set([
    ...Object.keys(before.scripts ?? {}),
    ...Object.keys(after.scripts ?? {}),
  ])
  for (const name of [...scripts].sort())
    if (before.scripts?.[name] !== after.scripts?.[name])
      changes.push(`package.json changes script ${name}`)
  if (!same(before.eslintConfig, after.eslintConfig))
    changes.push('package.json changes eslintConfig')
  for (const field of DEPENDENCY_FIELDS) {
    const names = new Set([
      ...Object.keys(dependenciesIn(before, field)),
      ...Object.keys(dependenciesIn(after, field)),
    ])
    for (const name of [...names].filter(isEnforcementPackage).sort()) {
      const from = dependenciesIn(before, field)[name]
      const to = dependenciesIn(after, field)[name]
      if (!same(from, to))
        changes.push(
          `package.json changes ${field} ${name} (${JSON.stringify(from ?? null)} -> ${JSON.stringify(to ?? null)})`,
        )
    }
  }
  return changes
}

/* Packages that select the lint/policy implementation. Their declared
   versions, lockfile entries and local artifacts are enforcement inputs;
   deliberate upgrades go through the reviewed baseline like any other. */
const isEnforcementPackage = name =>
  name === '@creaseui/lint' ||
  name === 'eslint' ||
  name === 'typescript' ||
  name === 'typescript-eslint' ||
  name.startsWith('@typescript-eslint/') ||
  /^(?:@[^/]+\/)?eslint-plugin(?:-|$)/u.test(name)

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
  'overrides',
  'resolutions',
  'pnpm.overrides',
]

const dependenciesIn = (manifest, field) => {
  const value = field
    .split('.')
    .reduce((current, key) => current?.[key], manifest)
  return value !== null && typeof value === 'object' ? value : {}
}

const LOCKFILES = [
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lock',
]

/** Lockfile entries for enforcement packages: exact JSON entries for npm,
    complete indented records for text lockfiles. */
const lockEntries = (file, text) => {
  if (text === null) return null
  if (file.endsWith('.json')) {
    const lock = parseJson(text)
    if (lock === undefined) return text
    const entries = {}
    for (const [key, value] of Object.entries(lock.packages ?? {})) {
      const name = key.replace(/^.*node_modules\//u, '')
      if (key !== '' && isEnforcementPackage(name)) entries[key] = value
    }
    for (const [name, value] of Object.entries(lock.dependencies ?? {}))
      if (isEnforcementPackage(name)) entries[`dependencies/${name}`] = value
    const root = lock.packages?.['']
    for (const field of DEPENDENCY_FIELDS)
      for (const [name, value] of Object.entries(dependenciesIn(root, field)))
        if (isEnforcementPackage(name)) entries[`root/${field}/${name}`] = value
    return JSON.stringify(entries)
  }
  return textLockEntries(text)
}

const indentOf = line => /^\s*/u.exec(line)[0].length
const ENFORCEMENT_NAME = /@creaseui\/lint|eslint|typescript/u
/* Lockfile-wide inputs that change how any package resolves. */
const RESOLUTION_SECTION =
  /^\s*"?(?:overrides|resolutions|patchedDependencies|pnpmfileChecksum|packageExtensionsChecksum|catalogs?|settings|patches)"?\s*:/u

/** pnpm, yarn and bun lockfiles nest each record under its header line, so
    a record is its header plus every more-indented line after it: the
    version, integrity, resolution, dependencies and patch hash all belong
    to the entry even when they don't repeat the package name. */
const textLockEntries = text => {
  const lines = text.split(/\r?\n/u)
  const kept = []
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim() === '') continue
    if (!ENFORCEMENT_NAME.test(line) && !RESOLUTION_SECTION.test(line)) continue
    const indent = indentOf(line)
    let end = index + 1
    while (
      end < lines.length &&
      (lines[end].trim() === '' || indentOf(lines[end]) > indent)
    )
      end += 1
    kept.push(
      lines
        .slice(index, end)
        .filter(entry => entry.trim() !== '')
        .join('\n'),
    )
    index = end - 1
  }
  return kept.join('\n')
}

/** Local paths (`file:vendor/lint.tgz`, `link:../lint`) the enforcement
    packages resolve to on either side. */
const localArtifacts = (beforeText, afterText) => {
  const found = new Set()
  for (const text of [beforeText, afterText]) {
    const manifest = text === null ? undefined : parseJson(text)
    for (const field of DEPENDENCY_FIELDS)
      for (const [name, spec] of Object.entries(
        dependenciesIn(manifest, field),
      )) {
        if (!isEnforcementPackage(name) || typeof spec !== 'string') continue
        const local = /^(?:file:|link:|portal:)?(\.{0,2}\/.*)$/u.exec(spec)
        const prefixed = /^(?:file|link|portal):(.+)$/u.exec(spec)
        const target = prefixed?.[1] ?? local?.[1]
        if (target !== undefined)
          found.add(path.posix.normalize(target.replace(/^\.\//u, '')))
      }
  }
  return [...found].filter(target => !target.startsWith('..')).sort()
}

const artifactChanged = (rootDir, baseline, target) => {
  try {
    git(rootDir, ['diff', '--quiet', baseline, '--', target])
  } catch {
    return true
  }
  return (
    git(rootDir, [
      'ls-files',
      '--others',
      '--exclude-standard',
      '--',
      target,
    ]).trim() !== ''
  )
}

const LOCAL_IMPORT =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/gu

/** Local modules the ESLint/lint configs import, on either side: a rule
    switched off in `./policy.mjs` changes enforcement as much as one in
    eslint.config.js. */
const policyModules = (rootDir, baseline) => {
  const found = new Set()
  const visit = (file, read) => {
    const text = read(file)
    if (text === null) return
    for (const match of text.matchAll(LOCAL_IMPORT)) {
      const target = path.posix.normalize(
        path.posix.join(path.posix.dirname(file), match[1]),
      )
      if (target.startsWith('..') || found.has(target)) continue
      found.add(target)
      visit(target, read)
    }
  }
  const current = file => {
    const absolute = path.join(rootDir, file)
    return existsSync(absolute) ? readFileSync(absolute, 'utf8') : null
  }
  const previous = file => atBaseline(rootDir, baseline, file)
  for (const file of INPUTS.filter(input => /\.[cm]?[jt]s$/u.test(input))) {
    visit(file, current)
    visit(file, previous)
  }
  return [...found].filter(file => !INPUTS.includes(file)).sort()
}

export const enforcementChanges = ({ baseline, rootDir }) => {
  try {
    git(rootDir, ['rev-parse', '--verify', `${baseline}^{commit}`])
  } catch {
    throw new BaselineError(
      `baseline ${baseline} is not a commit in this repository`,
    )
  }
  const changes = []
  /* `git show` returns committed bytes while readFileSync returns the
     working-tree bytes; with core.autocrlf a checkout rewrites LF as CRLF,
     so compare on normalized line endings only. */
  const normalize = text =>
    text === null ? null : text.replace(/\r\n/gu, '\n')
  for (const file of [...INPUTS, ...policyModules(rootDir, baseline)]) {
    const before = normalize(atBaseline(rootDir, baseline, file))
    const absolute = path.join(rootDir, file)
    const after = normalize(
      existsSync(absolute) ? readFileSync(absolute, 'utf8') : null,
    )
    if (before === after) continue
    if (before === null) changes.push(`adds ${file}`)
    else if (after === null) changes.push(`removes ${file}`)
    else if (file === 'crease.lock.json')
      changes.push(...manifestChanges(before, after))
    else if (file === 'package.json')
      changes.push(...packageChanges(before, after))
    else changes.push(`changes ${file}`)
  }
  for (const file of LOCKFILES) {
    const absolute = path.join(rootDir, file)
    const before = lockEntries(file, atBaseline(rootDir, baseline, file))
    const after = lockEntries(
      file,
      existsSync(absolute) ? readFileSync(absolute, 'utf8') : null,
    )
    if (before !== after)
      changes.push(`${file} changes the resolved lint/policy packages`)
  }
  const manifestAfter = existsSync(path.join(rootDir, 'package.json'))
    ? readFileSync(path.join(rootDir, 'package.json'), 'utf8')
    : null
  for (const target of localArtifacts(
    atBaseline(rootDir, baseline, 'package.json'),
    manifestAfter,
  ))
    if (artifactChanged(rootDir, baseline, target))
      changes.push(`changes the local lint/policy package ${target}`)
  return changes
}
