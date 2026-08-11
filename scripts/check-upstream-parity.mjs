import { readdirSync } from 'node:fs'
import { basename, join } from 'node:path'

const UPSTREAM_TREE =
  'https://api.github.com/repos/shadcn-ui/ui/git/trees/main?recursive=1'
const UPSTREAM_PREFIX = 'apps/v4/registry/new-york-v4/ui/'
const LOCAL_RECIPES = new Set(['data-table', 'date-picker', 'typography', 'toast'])

const response = await fetch(UPSTREAM_TREE, {
  headers: { Accept: 'application/vnd.github+json' },
})

if (!response.ok) {
  throw new Error(
    `Unable to read the shadcn/ui tree: ${response.status} ${response.statusText}`,
  )
}

const payload = await response.json()
const upstream = new Set(
  payload.tree
    .filter(
      entry =>
        entry.type === 'blob' &&
        entry.path.startsWith(UPSTREAM_PREFIX) &&
        entry.path.endsWith('.tsx') &&
        !entry.path.slice(UPSTREAM_PREFIX.length).includes('/'),
    )
    .map(entry => basename(entry.path, '.tsx')),
)
const local = new Set(
  readdirSync(join(process.cwd(), 'src', 'ui'))
    .filter(file => file.endsWith('.ts'))
    .map(file => basename(file, '.ts')),
)

const missing = [...upstream].filter(name => !local.has(name)).sort()
const localOnly = [...local]
  .filter(name => !upstream.has(name) && !LOCAL_RECIPES.has(name))
  .sort()

if (missing.length > 0 || localOnly.length > 0) {
  process.stderr.write(
    [
      missing.length === 0
        ? undefined
        : `Missing upstream components: ${missing.join(', ')}`,
      localOnly.length === 0
        ? undefined
        : `Unclassified local components: ${localOnly.join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n') + '\n',
  )
  process.exitCode = 1
} else {
  process.stdout.write(
    `Parity check passed for ${upstream.size} upstream components.\n`,
  )
}
