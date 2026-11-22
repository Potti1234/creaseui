import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import { describe, it } from 'node:test'
import { Effect, Option } from 'effect'
import * as Storage from '../src/lib/behaviors/storage.ts'

describe('Storage', () => {
  it('reports silently rejected cookie writes and removals', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
    let cookie = ''
    const document = Object.defineProperty({}, 'cookie', {
      configurable: true,
      get: () => cookie,
      set: () => {},
    })
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: document,
    })
    try {
      const storage: Storage.Descriptor = {
        kind: 'cookie',
        id: 'test',
        secure: false,
      }
      assert.equal(Effect.runSync(Storage.set(storage, 'value')), false)
      cookie = 'test=value'
      assert.equal(Effect.runSync(Storage.remove(storage)), false)
      assert.equal(Effect.runSync(Storage.set(storage, 'value')), true)
      cookie = ''
      assert.equal(Effect.runSync(Storage.remove(storage)), true)
    } finally {
      if (original) Object.defineProperty(globalThis, 'document', original)
      else Reflect.deleteProperty(globalThis, 'document')
    }
  })
  it('handles unavailable storage and failed writes without throwing', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
    try {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => {
          throw new Error('denied')
        },
      })
      const storage: Storage.Descriptor = { kind: 'local', id: 'test' }
      assert.deepEqual(Effect.runSync(Storage.get(storage)), Option.none())
      assert.equal(Effect.runSync(Storage.available(storage)), false)
      assert.equal(Effect.runSync(Storage.set(storage, 'a')), false)
      assert.equal(Effect.runSync(Storage.remove(storage)), false)
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
          getItem: () => null,
          setItem: () => {
            throw new Error('quota')
          },
          removeItem: () => {
            throw new Error('denied')
          },
        },
      })
      assert.equal(Effect.runSync(Storage.available(storage)), true)
      assert.equal(Effect.runSync(Storage.set(storage, 'a')), false)
      assert.equal(Effect.runSync(Storage.remove(storage)), false)
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original)
      else Reflect.deleteProperty(window, 'localStorage')
    }
  })
  it('reads, writes and removes local and session values', () => {
    for (const kind of ['local', 'session'] as const) {
      const key = kind === 'local' ? 'localStorage' : 'sessionStorage'
      const values = new Map<string, string>()
      Object.defineProperty(window, key, {
        configurable: true,
        value: {
          getItem: (id: string) => values.get(id) ?? null,
          setItem: (id: string, value: string) => values.set(id, value),
          removeItem: (id: string) => values.delete(id),
        },
      })
      try {
        const storage = { kind, id: 'test' }
        assert.deepEqual(Effect.runSync(Storage.get(storage)), Option.none())
        assert.equal(Effect.runSync(Storage.set(storage, 'value')), true)
        assert.deepEqual(
          Effect.runSync(Storage.get(storage)),
          Option.some('value'),
        )
        assert.equal(Effect.runSync(Storage.remove(storage)), true)
        assert.deepEqual(Effect.runSync(Storage.get(storage)), Option.none())
      } finally {
        Reflect.deleteProperty(window, key)
      }
    }
  })
  it('generates a safe pre-paint script which ignores invalid values and blocked storage', () => {
    assert.deepEqual(
      Storage.script(
        { kind: 'cookie', id: 'test' },
        { attribute: 'data-test', values: ['a'] },
      ),
      Option.none(),
    )
    for (const raw of [null, 'invalid', 'a']) {
      let value = 'default'
      const script = Option.getOrThrow(
        Storage.script(
          { kind: 'local', id: '</script>' },
          { attribute: 'data-test', values: ['a'] },
        ),
      )
      assert.ok(script)
      assert.equal(script.includes('</script>'), false)
      const document = {
        currentScript: {
          previousElementSibling: {
            setAttribute: (_key: string, next: string) => {
              value = next
            },
          },
        },
      }
      runInNewContext(script, {
        localStorage: { getItem: () => raw },
        document,
      })
      assert.equal(value, raw === 'a' ? 'a' : 'default')
      runInNewContext(script, {
        localStorage: {
          getItem: () => {
            throw new Error('blocked')
          },
        },
        document,
      })
    }
  })
})
