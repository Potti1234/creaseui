import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const requested = process.argv.slice(2)
const files = requested.length
  ? requested
  : readdirSync('test')
      .filter(file => file.endsWith('.test.ts'))
      .sort()
      .map(file => join('test', file))
const result = spawnSync(
  process.execPath,
  ['--test', '--import', 'tsx', '--import', './test/setup.ts', ...files],
  {
    stdio: 'inherit',
    // Node's test workers do not inherit --max-old-space-size from CLI args.
    // An environment setting reaches both the harness and its worker processes.
    env: {
      ...process.env,
      NODE_OPTIONS:
        `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=8192`.trim(),
    },
  },
)
if (result.error) throw result.error
process.exitCode = result.status ?? 1
