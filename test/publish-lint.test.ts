import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(
  new URL('../scripts/publish-lint.mjs', import.meta.url),
)

test('lint publication scopes writes, fails closed and respects dry runs', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-publish-test-'))
  const cli = path.join(root, 'npm.mjs')
  const log = path.join(root, 'calls.jsonl')
  const output = path.join(root, 'events.jsonl')
  writeFileSync(
    cli,
    `import { appendFileSync } from 'node:fs'
const args = process.argv.slice(2)
appendFileSync(process.env.MOCK_LOG, JSON.stringify(args) + '\\n')
if (args[0] === 'view') {
  if (process.env.MOCK_SCENARIO.startsWith('published')) {
    const version = args[1].slice(args[1].lastIndexOf('@') + 1)
    console.log(JSON.stringify(process.env.MOCK_SCENARIO === 'published-array' ? [version] :
      process.env.MOCK_SCENARIO === 'published-mismatch' ? '99.0.0' : version))
  } else {
    console.error(process.env.MOCK_SCENARIO === 'auth' ? 'E401 Unauthorized' :
      process.env.MOCK_SCENARIO === 'network' ? 'ECONNRESET' : 'E404 Not Found')
    process.exit(1)
  }
} else if (process.env.MOCK_SCENARIO === 'publish-failure') {
  process.exit(1)
}
`,
  )
  try {
    for (const scenario of [
      'new',
      'published',
      'published-array',
      'published-mismatch',
      'auth',
      'network',
      'publish-failure',
      'dry-run',
      'env-dry-run',
    ]) {
      rmSync(log, { force: true })
      rmSync(output, { force: true })
      const result = spawnSync(
        process.execPath,
        [script, ...(scenario === 'dry-run' ? ['--dry-run'] : [])],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            npm_execpath: cli,
            npm_config_dry_run: scenario === 'env-dry-run' ? 'true' : 'false',
            MOCK_LOG: log,
            MOCK_SCENARIO: scenario,
            CHANGESETS_OUTPUT: output,
          },
        },
      )
      const calls: string[][] = readFileSync(log, 'utf8')
        .trim()
        .split('\n')
        .map(line => JSON.parse(line))
      const shouldPublish =
        !scenario.startsWith('published') &&
        !['auth', 'network'].includes(scenario)
      assert.equal(calls.length, shouldPublish ? 2 : 1, scenario)
      assert.equal(
        result.status,
        ['auth', 'network', 'publish-failure', 'published-mismatch'].includes(
          scenario,
        )
          ? 1
          : 0,
        `${scenario}: ${result.stderr}`,
      )
      if (shouldPublish) {
        assert.deepEqual(calls[1], [
          'publish',
          '--workspace=@creaseui/lint',
          '--access=public',
          '--tag=latest',
          ...(['dry-run', 'env-dry-run'].includes(scenario)
            ? ['--dry-run']
            : []),
        ])
      }
      assert.equal(existsSync(output), scenario === 'new', scenario)
      if (scenario === 'new') {
        const event = JSON.parse(readFileSync(output, 'utf8'))
        assert.equal(event.type, 'git-tag')
        assert.equal(event.packageName, '@creaseui/lint')
        assert.match(event.tag, /^@creaseui\/lint@\d/u)
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
