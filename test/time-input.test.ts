import assert from 'node:assert/strict'
import test from 'node:test'

import {
  parseISOTime,
  formatISOTime,
  formatDisplayTime,
  parseTimeInput,
  compareTime,
  isTimeInRange,
  adjustTime,
  resolveTimeDraft,
  resolveTimeInputCommit,
  init,
  update,
  Message,
  resolveTimePart,
  timePartValue,
  timePartOptions,
  pickerButtonId,
} from '../src/lib/time-input.ts'
import { Option } from 'effect'
import { Listbox } from '@foldkit/ui'

test('parses HH:MM[:SS] and rejects out-of-range parts', () => {
  assert.deepEqual(parseISOTime('09:05'), { minutes: 545, seconds: 0 })
  assert.deepEqual(parseISOTime('14:30:45'), { minutes: 870, seconds: 45 })
  assert.equal(parseISOTime('24:00'), null)
  assert.equal(parseISOTime('10:60'), null)
  assert.equal(parseISOTime('banana'), null)
})

test('parses flexible typed input including meridiem', () => {
  assert.equal(parseTimeInput('2:30 PM', false), '14:30')
  assert.equal(parseTimeInput('2pm', false), '14:00')
  assert.equal(parseTimeInput('14:30:45', true), '14:30:45')
  assert.equal(parseTimeInput('', false), null)
})

test('formats ISO and display times', () => {
  assert.equal(formatISOTime(545), '09:05')
  assert.equal(formatISOTime(870, 45, true), '14:30:45')
  assert.equal(formatDisplayTime('14:30', { hourFormat: '12h' }), '2:30 PM')
  assert.equal(formatDisplayTime('00:00', { hourFormat: '12h' }), '12:00 AM')
  assert.equal(formatDisplayTime('14:30', { hourFormat: '24h' }), '14:30')
})

test('range checks and minute-step adjustments wrap inside the day', () => {
  assert.equal(compareTime('09:00', '10:00') < 0, true)
  assert.equal(isTimeInRange('12:00', '09:00', '17:00'), true)
  assert.equal(isTimeInRange('08:00', '09:00', '17:00'), false)
  assert.equal(adjustTime('23:45', 30), '00:15')
  assert.equal(adjustTime('00:10', -30), '23:40')
  assert.equal(adjustTime('bad', 15), null)
})

test('draft resolution respects min/max windows', () => {
  const resolved = resolveTimeDraft('18:00', {
    includeSeconds: false,
    min: '17:00',
    max: '22:00',
  })
  assert.equal(Option.isSome(resolved), true)
  assert.equal(
    Option.isSome(
      resolveTimeDraft('12:00', {
        includeSeconds: false,
        min: '17:00',
        max: '22:00',
      }),
    ),
    false,
  )
})

test('commit decisions: commit parsed, clear empty, revert invalid', () => {
  assert.deepEqual(resolveTimeInputCommit('22:15', { includeSeconds: false }), {
    kind: 'commit',
    value: '22:15',
  })
  assert.deepEqual(resolveTimeInputCommit('  ', { includeSeconds: false }), {
    kind: 'clear',
  })
  assert.deepEqual(resolveTimeInputCommit('nope', { includeSeconds: false }), {
    kind: 'revert',
  })
  assert.deepEqual(
    resolveTimeInputCommit(undefined, { includeSeconds: false }),
    { kind: 'revert' },
  )
})

test('update reports ChangedValue on valid edits and clears', () => {
  const model = init({ id: 't' })
  const edited = update(
    model,
    Message.DraftEdited({ text: '14:30', resolved: Option.some('14:30') }),
  )
  assert.equal(edited.outMessage?._tag, 'ChangedValue')
  const step = update(model, Message.Stepped({ value: '09:15' }))
  assert.equal(step.outMessage?._tag, 'ChangedValue')
  const cleared = update(model, Message.ClearRequested())
  assert.equal(cleared.outMessage?._tag, 'ChangedValue')
})

test('segment choices preserve the other time parts and normalize empty values', () => {
  const options = { hourFormat: '24h' as const, hasSeconds: true }
  assert.equal(resolveTimePart('14:30:45', 'hour', '16', options), '16:30:45')
  assert.equal(resolveTimePart('14:30:45', 'minute', '05', options), '14:05:45')
  assert.equal(resolveTimePart('14:30:45', 'second', '09', options), '14:30:09')
  assert.equal(
    resolveTimePart(null, 'hour', '23', { ...options, hasSeconds: false }),
    '23:00',
  )
  assert.equal(resolveTimePart('14:30:45', 'hour', '99', options), null)
  assert.equal(resolveTimePart('14:30:45', 'minute', '60', options), null)
  assert.equal(
    resolveTimePart('14:30', 'second', '30', { ...options, hasSeconds: false }),
    null,
  )
})

test('12-hour segment selection handles noon, midnight and AM/PM', () => {
  const options = { hourFormat: '12h' as const, hasSeconds: false }
  assert.equal(resolveTimePart('00:30', 'hour', '12', options), '00:30')
  assert.equal(resolveTimePart('14:30', 'hour', '12', options), '12:30')
  assert.equal(resolveTimePart('12:30', 'period', 'AM', options), '00:30')
  assert.equal(resolveTimePart('00:30', 'period', 'PM', options), '12:30')
  assert.equal(resolveTimePart('14:30', 'period', 'AM', options), '02:30')
  assert.equal(resolveTimePart('14:30', 'period', 'noon', options), null)
  assert.equal(resolveTimePart('14:30', 'hour', '00', options), null)
  assert.equal(Option.getOrNull(timePartValue('00:30', 'hour', '12h')), '12')
  assert.equal(Option.getOrNull(timePartValue('12:30', 'period', '12h')), 'PM')
})

test('picker constraints allow boundary hours and disable unavailable minutes', () => {
  const options = {
    hourFormat: '24h' as const,
    hasSeconds: false,
    min: '09:15',
    max: '17:45',
  }
  assert.equal(resolveTimePart('14:05', 'hour', '09', options), '09:15')
  assert.equal(resolveTimePart('14:50', 'hour', '17', options), '17:45')
  assert.equal(resolveTimePart('14:30', 'hour', '08', options), null)
  assert.equal(resolveTimePart('09:15', 'minute', '00', options), null)
  assert.equal(resolveTimePart('17:30', 'minute', '59', options), null)
  assert.equal(resolveTimePart(undefined, 'hour', '10', options), '10:15')
  assert.equal(
    resolveTimePart('11:00', 'hour', '10', {
      ...options,
      min: '10:15:30',
      hasSeconds: true,
    }),
    '10:15:30',
  )
  assert.equal(
    resolveTimePart('11:00', 'hour', '10', { ...options, min: '10:15:30' }),
    '10:16',
  )
  assert.equal(
    resolveTimePart('14:30', 'hour', '14', {
      ...options,
      min: '18:00',
      max: '17:00',
    }),
    null,
  )
})

test('selector options cover every valid hour, minute and second without duplicates', () => {
  assert.deepEqual(
    timePartOptions('hour', '24h'),
    Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
  )
  assert.deepEqual(
    timePartOptions('hour', '12h'),
    Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
  )
  assert.equal(timePartOptions('minute', '24h').length, 60)
  assert.equal(timePartOptions('second', '12h')[59], '59')
  assert.deepEqual(timePartOptions('period', '12h'), ['AM', 'PM'])
  assert.equal(Option.isNone(timePartValue(null, 'minute', '24h')), true)
})

test('segment submodels route selection through ChangedValue and keep independent ids', () => {
  const model = init({ id: 'meeting' })
  const ids = Object.values(model.parts).map(part => part.id)
  assert.equal(new Set(ids).size, 4)
  assert.equal(pickerButtonId(model), 'meeting-hour-button')
  const next = update(
    model,
    Message.GotPartMessage({
      part: 'hour',
      message: Listbox.Message.SelectedItem({ item: '16' }),
      context: {
        value: '14:30',
        hourFormat: '24h',
        hasSeconds: false,
        min: null,
        max: null,
      },
    }),
  )
  assert.equal(Option.getOrNull(next.outMessage!.value), '16:30')
  assert.equal(next.model.parts.minute, model.parts.minute)
  assert.equal(Option.isNone(next.model.pendingInput), true)
  const invalid = update(
    model,
    Message.GotPartMessage({
      part: 'minute',
      message: Listbox.Message.SelectedItem({ item: '99' }),
      context: {
        value: '14:30',
        hourFormat: '24h',
        hasSeconds: false,
        min: null,
        max: null,
      },
    }),
  )
  assert.equal(invalid.outMessage, undefined)
})
