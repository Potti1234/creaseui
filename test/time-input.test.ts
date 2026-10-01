import assert from 'node:assert/strict';
import test from 'node:test';

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
} from '../src/lib/time-input.ts';
import { Option } from 'effect';

test('parses HH:MM[:SS] and rejects out-of-range parts', () => {
  assert.deepEqual(parseISOTime('09:05'), { minutes: 545, seconds: 0 });
  assert.deepEqual(parseISOTime('14:30:45'), { minutes: 870, seconds: 45 });
  assert.equal(parseISOTime('24:00'), null);
  assert.equal(parseISOTime('10:60'), null);
  assert.equal(parseISOTime('banana'), null);
});

test('parses flexible typed input including meridiem', () => {
  assert.equal(parseTimeInput('2:30 PM', false), '14:30');
  assert.equal(parseTimeInput('2pm', false), '14:00');
  assert.equal(parseTimeInput('14:30:45', true), '14:30:45');
  assert.equal(parseTimeInput('', false), null);
});

test('formats ISO and display times', () => {
  assert.equal(formatISOTime(545), '09:05');
  assert.equal(formatISOTime(870, 45, true), '14:30:45');
  assert.equal(formatDisplayTime('14:30', { hourFormat: '12h' }), '2:30 PM');
  assert.equal(formatDisplayTime('00:00', { hourFormat: '12h' }), '12:00 AM');
  assert.equal(formatDisplayTime('14:30', { hourFormat: '24h' }), '14:30');
});

test('range checks and minute-step adjustments wrap inside the day', () => {
  assert.equal(compareTime('09:00', '10:00') < 0, true);
  assert.equal(isTimeInRange('12:00', '09:00', '17:00'), true);
  assert.equal(isTimeInRange('08:00', '09:00', '17:00'), false);
  assert.equal(adjustTime('23:45', 30), '00:15');
  assert.equal(adjustTime('00:10', -30), '23:40');
  assert.equal(adjustTime('bad', 15), null);
});

test('draft resolution respects min/max windows', () => {
  const resolved = resolveTimeDraft('18:00', { includeSeconds: false, min: '17:00', max: '22:00' });
  assert.equal(Option.isSome(resolved), true);
  assert.equal(Option.isSome(resolveTimeDraft('12:00', { includeSeconds: false, min: '17:00', max: '22:00' })), false);
});

test('commit decisions: commit parsed, clear empty, revert invalid', () => {
  assert.deepEqual(
    resolveTimeInputCommit('22:15', { includeSeconds: false }),
    { kind: 'commit', value: '22:15' },
  );
  assert.deepEqual(
    resolveTimeInputCommit('  ', { includeSeconds: false }),
    { kind: 'clear' },
  );
  assert.deepEqual(
    resolveTimeInputCommit('nope', { includeSeconds: false }),
    { kind: 'revert' },
  );
  assert.deepEqual(
    resolveTimeInputCommit(undefined, { includeSeconds: false }),
    { kind: 'revert' },
  );
});

test('update reports ChangedValue on valid edits and clears', () => {
  const model = init({ id: 't' });
  const edited = update(
    model,
    Message.DraftEdited({ text: '14:30', resolved: Option.some('14:30') }),
  );
  assert.equal(edited.outMessage?._tag, 'ChangedValue');
  const step = update(model, Message.Stepped({ value: '09:15' }));
  assert.equal(step.outMessage?._tag, 'ChangedValue');
  const cleared = update(model, Message.ClearRequested());
  assert.equal(cleared.outMessage?._tag, 'ChangedValue');
});
