import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const outputPath = 'docs/upstream-shadcn.json'
const repository = 'https://github.com/shadcn-ui/ui'
const registryPath = 'apps/v4/registry/new-york-v4/ui/_registry.ts'
const uiPathPattern = /^apps\/v4\/registry\/new-york-v4\/ui\/(?:_registry\.ts|[^/]+\.tsx)$/u

const componentNames = source => Array.from(
  source.matchAll(/^\s{4}name: "([^"]+)"/gmu),
  match => match[1],
)

const normalizedFiles = files => files
  .filter(file => uiPathPattern.test(file.path) && file.type === 'blob')
  .map(file => ({ path: file.path, sha: file.sha }))
  .sort((left, right) => left.path.localeCompare(right.path))

const optionValue = option => {
  const index = process.argv.indexOf(option)
  return index < 0 ? undefined : process.argv[index + 1]
}

if (process.argv.includes('--update')) {
  const upstreamRoot = optionValue('--upstream-root')
  if (!upstreamRoot) {
    throw new Error('Pass --upstream-root with a local shadcn-ui checkout.')
  }

  const git = (...args) => execFileSync('git', ['-C', upstreamRoot, ...args], {
    encoding: 'utf8',
  }).trim()
  const commit = git('rev-parse', 'HEAD')
  const registrySource = await readFile(join(upstreamRoot, registryPath), 'utf8')
  const files = git('ls-tree', '-r', 'HEAD', '--', 'apps/v4/registry/new-york-v4/ui')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const match = /^(\d+)\s+(\w+)\s+([0-9a-f]+)\t(.+)$/u.exec(line)
      if (!match) throw new Error(`Could not parse git tree entry: ${line}`)
      return { type: match[2], sha: match[3], path: match[4] }
    })

  const snapshot = {
    $schema: './upstream-shadcn.schema.json',
    repository,
    commit,
    date: new Date().toISOString().slice(0, 10),
    registryPath,
    components: componentNames(registrySource),
    files: normalizedFiles(files),
  }

  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  console.log(`Recorded ${snapshot.components.length} upstream items at ${commit.slice(0, 8)}.`)
} else {
  const snapshot = JSON.parse(await readFile(outputPath, 'utf8'))
  const response = await fetch(
    'https://api.github.com/repos/shadcn-ui/ui/git/trees/main?recursive=1',
    { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'creaseui-parity-check' } },
  )
  if (!response.ok) throw new Error(`GitHub tree request failed: ${response.status}`)
  const current = await response.json()
  const currentFiles = normalizedFiles(current.tree)

  if (JSON.stringify(currentFiles) !== JSON.stringify(snapshot.files)) {
    console.error('The upstream new-york-v4 UI sources changed after the recorded baseline.')
    console.error('Review the upstream diff, then refresh with:')
    console.error('npm run parity:upstream:update -- --upstream-root <path-to-shadcn-ui>')
    process.exitCode = 1
  } else {
    console.log(`Upstream UI sources still match ${snapshot.commit.slice(0, 8)}.`)
  }
}
