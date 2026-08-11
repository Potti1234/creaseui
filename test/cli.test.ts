import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'

const run = (...args: ReadonlyArray<string>) =>
  spawnSync(process.execPath, ['scripts/crease.mjs', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
  })

describe('crease CLI', () => {
  it('documents its source-owned component workflow', () => {
    const result = run('--help')

    assert.equal(result.status, 0)
    assert.match(result.stdout, /crease add <component\.\.\.>/)
    assert.match(result.stdout, /crease upgrade --write/)
  })

  it('recognizes a Foldkit consumer project', () => {
    const result = run('doctor')

    assert.equal(result.status, 0)
    assert.match(result.stdout, /ready \(foldkit 0\.137\.0/)
  })

  it('rejects unknown commands without mutating the project', () => {
    const result = run('unknown')

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Unknown command: unknown/)
  })
})
