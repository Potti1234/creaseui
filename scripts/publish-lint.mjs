import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Keep publication scoped to the lint workspace, even as other packages are added.
const root = fileURLToPath(new URL('..', import.meta.url))
const dryRun =
  process.argv.includes('--dry-run') ||
  process.env.npm_config_dry_run === 'true'
const { name, version } = JSON.parse(
  readFileSync(
    new URL('../packages/lint/package.json', import.meta.url),
    'utf8',
  ),
)
if (name !== '@creaseui/lint') throw new Error('Unexpected lint package name')
if (!process.env.npm_execpath)
  throw new Error('Run through npm run release:lint')

const npm = args =>
  spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: root,
    encoding: 'utf8',
  })
const existing = npm(['view', `${name}@${version}`, 'version', '--json'])
if (existing.error) throw existing.error
if (existing.status === 0) {
  const response = JSON.parse(existing.stdout)
  const publishedVersion = Array.isArray(response)
    ? response.length === 1
      ? response[0]
      : undefined
    : response
  if (publishedVersion !== version)
    throw new Error('Unexpected npm registry version response')
  console.log(`${name}@${version} is already published`)
  process.exit(0)
}
// Authentication and network errors must not be mistaken for an absent version.
if (!/\bE404\b/u.test(existing.stderr)) {
  process.stderr.write(existing.stderr)
  throw new Error('Could not check the published lint package version')
}

const tag = version.match(/-([a-z][a-z0-9-]*)/u)?.[1] ?? 'latest'
const result = npm([
  'publish',
  '--workspace=@creaseui/lint',
  '--access=public',
  `--tag=${tag}`,
  ...(dryRun ? ['--dry-run'] : []),
])
process.stdout.write(result.stdout ?? '')
process.stderr.write(result.stderr ?? '')
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

// Changesets v3 consumes these events to create package tags and GitHub releases.
if (process.env.CHANGESETS_OUTPUT && !dryRun)
  appendFileSync(
    process.env.CHANGESETS_OUTPUT,
    `${JSON.stringify({ type: 'git-tag', tag: `${name}@${version}`, packageName: name })}\n`,
  )
