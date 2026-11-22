import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import * as Connect from '../src/lib/behaviors/connect.ts'
import { componentKind } from '../src/docs/components/catalog.ts'
import { connectPage } from '../src/docs/components/pages/connect.ts'
import { authoredPages } from '../src/docs/components/pages/index.ts'

describe('Connect behavior documentation', () => {
  const definition = connectPage.definition

  it('uses the authored pages index and renderer provider manifests', () => {
    assert.deepEqual(authoredPages.connect, connectPage)
    assert.doesNotMatch(
      readFileSync('src/docs/components/catalog.ts', 'utf8'),
      /connectPage|connectPreviewProgram|['"]connect['"]/u,
    )
    for (const [renderer, install] of [
      ['stylex', 'installStyleXPreviewView'],
      ['pleat', 'installPleatPreviewView'],
    ]) {
      assert.ok(
        readFileSync(
          `src/docs/components/${renderer}-provider-manifest.ts`,
          'utf8',
        ).includes(`${install}('connect', connectPreviewProgram.view)`),
        renderer,
      )
    }
  })

  it('documents a copied behavior Submodel, not a registry renderer', () => {
    assert.equal(definition.kind, 'submodel')
    assert.equal(componentKind('connect'), 'submodel')
    assert.equal(definition.sourcePath, 'src/lib/behaviors/connect.ts')
    assert.ok(existsSync(definition.sourcePath))
    assert.equal(
      definition.apiHref,
      `https://github.com/Potti1234/creaseui/blob/main/${definition.sourcePath}`,
    )
    const registry = JSON.parse(
      readFileSync('src/ui/registry.json', 'utf8'),
    ) as { items: ReadonlyArray<{ name: string }> }
    assert.equal(
      registry.items.some(item => item.name === 'connect'),
      false,
    )
  })

  it('shows real create/update/OutMessage wiring shared by every renderer', () => {
    assert.ok(definition.usage)
    for (const operation of [
      'Connect.create<PortKey>()',
      'Connect.update(',
      'RequestedConnection',
      'Connect.Message.Connected(',
      'Command.mapMessages(',
      'view: connect.view',
      '...port.attributes',
      "h.AriaLive('assertive')",
    ])
      assert.ok(definition.usage.includes(operation), operation)
    for (const examples of [
      definition.examples,
      definition.stylexExamples,
      definition.pleatExamples,
    ]) {
      assert.ok(examples)
      assert.equal(examples[0]?.code, definition.usage)
    }
    assert.doesNotMatch(
      definition.usage,
      /@\/(?:ui|stylex|pleat)\/connect|Connect\.connect\(/u,
    )
  })

  it('lists real exported schemas, operations and effects in the API and composition', () => {
    const expected = [
      'ConnectDraft',
      'Model',
      'Message',
      'OutMessage',
      'init',
      'update',
      'create',
      'view',
      'role',
      'keyboardTarget',
      'nearestInDirection',
      'connectMessage',
      'ObservePorts',
      'MeasurePorts',
      'Announce',
    ]
    assert.deepEqual(
      definition.apiEntries?.map(entry => entry.name),
      expected,
    )
    for (const entry of definition.apiEntries ?? []) {
      assert.ok(entry.name in Connect, entry.name)
      assert.ok(entry.signature.length > 0, entry.name)
      assert.ok(entry.kind.length > 0, entry.name)
      assert.ok(definition.composition?.includes(entry.name), entry.name)
    }
    assert.doesNotMatch(
      definition.composition ?? '',
      /Connect\.connect\(|viewConfig/u,
    )
  })

  it('documents Option results for fallible public helpers', () => {
    for (const name of ['role', 'nearestInDirection']) {
      const entry = definition.apiEntries?.find(entry => entry.name === name)
      assert.ok(entry, name)
      assert.match(entry.signature, /: Option</u)
      assert.doesNotMatch(entry.signature, /undefined|null/u)
    }
  })
})
