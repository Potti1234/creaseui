import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
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
    assert.match(result.stdout, /ready \(foldkit 0\.164\.0/)
  })

  it('accepts a consumer with Foldkit core and Effect alone', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'crease-core-consumer-'))
    const manifest = join(cwd, 'package.json')
    try {
      writeFileSync(
        manifest,
        JSON.stringify({
          dependencies: { foldkit: '0.164.0', effect: '4.0.0-rc.117' },
        }),
      )
      const result = spawnSync(
        process.execPath,
        [resolve('scripts/crease.mjs'), 'doctor'],
        { cwd, encoding: 'utf8' },
      )
      assert.equal(result.status, 0)
      assert.match(result.stdout, /crease doctor: ready/)
    } finally {
      unlinkSync(manifest)
      rmdirSync(cwd)
    }
  })

  it('rejects unknown commands without mutating the project', () => {
    const result = run('unknown')

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Unknown command: unknown/)
  })
})
