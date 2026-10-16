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
    for (const field of ['contract', 'variants', 'renderKind', 'visibility'])
      if (!same(record[field], previous[field]))
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
  return changes
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
  for (const file of INPUTS) {
    const before = atBaseline(rootDir, baseline, file)
    const absolute = path.join(rootDir, file)
    const after = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null
    if (before === after) continue
    if (before === null) changes.push(`adds ${file}`)
    else if (after === null) changes.push(`removes ${file}`)
    else if (file === 'crease.lock.json')
      changes.push(...manifestChanges(before, after))
    else if (file === 'package.json')
      changes.push(...packageChanges(before, after))
    else changes.push(`changes ${file}`)
  }
  return changes
}
