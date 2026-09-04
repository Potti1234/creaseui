import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string): string => readFileSync(path, 'utf8')

test('both date picker skins expose controlled text and mobile presentation seams', () => {
  for (const path of ['src/ui/date-picker.ts', 'src/stylex/date-picker.ts']) {
    const source = read(path)
    assert.match(source, /query: string/)
    assert.match(source, /onQueryInput: \(value: string\) => Msg/)
    assert.match(source, /parseError\?: string/)
    assert.match(source, /mobilePresentation\?: 'dialog' \| 'popover'/)
    assert.match(source, /DatePickerPrimitive\.view/)
    assert.doesNotMatch(source, /CalendarDateFromIsoString/)
  }
})

test('the docs parent owns parsing, committed state, and external reflection', () => {
  const source = read('src/docs/components/pages/date-picker/tailwind.ts')
  assert.match(source, /CalendarDateFromIsoString/)
  assert.match(source, /ChangedDatePickerQuery/)
  assert.match(source, /DatePicker\.focusDate/)
  assert.match(source, /LoadedExternalDate/)
  assert.match(source, /fromDateInZone/)
  assert.match(source, /Europe\/Berlin/)
})
