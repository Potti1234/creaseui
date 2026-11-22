import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createFolder,
  fuzzyScore,
  fuzzyFilter,
  matchRanges,
  matchSegments,
} from '../src/lib/behaviors/text-match.ts'
import { fuzzyScore as referenceScore } from '../node_modules/@ui-sdk/core/dist/foundation/text/fuzzy.js'
import {
  matchRanges as referenceRanges,
  matchSegments as referenceSegments,
  setMatchLocale,
} from '../node_modules/@ui-sdk/core/dist/foundation/text/match.js'

describe('Text Match', () => {
  it('folds without changing offsets and respects language', () => {
    assert.equal(createFolder('en').fold('Łódź'), 'lodz')
    assert.equal(createFolder('sv').fold('ä'), 'ä')
    assert.equal(createFolder('tr').fold('Iİ'), 'ıi')
    assert.equal(createFolder('lt').fold('İ😀').length, 'İ😀'.length)
  })
  it('ranks exact, prefix, word, contains and subsequences', () => {
    const scores = ['cat', 'cats', 'a cat', 'scat', 'coat'].map(text =>
      fuzzyScore(text, 'cat'),
    )
    assert.deepEqual(
      [...scores].sort((a, b) => b - a),
      scores,
    )
    assert.equal(fuzzyScore('cat', 'dog'), 0)
    assert.equal(fuzzyScore('cat', ''), 1)
    assert.equal(fuzzyFilter({ label: 'dog', keywords: ['cat'] }, 'cat'), 0.95)
  })
  it('matches upstream scoring, ranges and segments', () => {
    setMatchLocale(Intl.DateTimeFormat().resolvedOptions().locale)
    for (const [text, query] of [
      ['cat', 'cat'],
      ['  Cats ', ' ca '],
      ['Łódź', 'lodz'],
      ['banana band', 'ban'],
      ['a cat', 'cat'],
      ['coat', 'cat'],
      ['', 'x'],
      ['cat', ''],
      ['cat', 'dog'],
      ['😀cat', 'ct'],
    ]) {
      assert.equal(fuzzyScore(text!, query!), referenceScore(text!, query!))
      for (const mode of ['contains', 'startsWith', 'fuzzy'] as const) {
        const ranges = matchRanges(text!, query!, mode)
        assert.deepEqual(ranges, referenceRanges(text!, query!, mode))
        assert.deepEqual(
          matchSegments(text!, ranges),
          referenceSegments(text!, ranges),
        )
      }
    }
  })
  it('returns explicit segments for empty and discontiguous matches', () => {
    assert.deepEqual(matchSegments('', []), [{ text: '', match: false }])
    assert.deepEqual(matchRanges('  Cat', 'cat', 'startsWith'), [
      { start: 2, end: 5 },
    ])
    assert.deepEqual(matchRanges('coat', 'ct', 'fuzzy'), [
      { start: 0, end: 1 },
      { start: 3, end: 4 },
    ])
    assert.deepEqual(matchRanges('coat', 'ct', 'contains'), [])
  })
})
