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

test('both date picker skins expose trigger content and RTL seams', () => {
  for (const path of ['src/ui/date-picker.ts', 'src/stylex/date-picker.ts']) {
    const source = read(path)
    assert.match(source, /triggerContent\?: /)
    assert.match(source, /direction\?: 'ltr' \| 'rtl'/)
    assert.match(source, /updateForRtl/)
    assert.match(source, /mirrorNavigationKeyForRtl/)
  }
})

test('the docs page composes range, input, natural, and RTL examples around shared models', () => {
  const source = read('src/docs/components/pages/date-picker/tailwind.ts')
  assert.match(source, /parseNaturalDate/)
  assert.match(source, /parseInputDate/)
  assert.match(source, /PressedKeyInInput/)
  assert.match(source, /DatePicker\.focusDate/)
  assert.match(source, /updateForRtl/)
  assert.match(source, /arabicCalendarLocale/)
  assert.match(source, /triggerContent/)
  assert.match(source, /fromDateInZone/)
  assert.match(source, /rangeStart/)
})
