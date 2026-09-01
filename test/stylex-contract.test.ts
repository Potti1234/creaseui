import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const componentFiles = ['badge.ts', 'button.ts', 'card.ts', 'input.ts'] as const
const componentSources = componentFiles.map(file => ({
  file,
  source: readFileSync(`src/stylex/${file}`, 'utf8'),
}))

describe('StyleX component authoring contract', () => {
  it('does not expose unrestricted styling escape hatches at call sites', () => {
    for (const { file, source } of componentSources) {
      assert.doesNotMatch(source, /\b(?:style|class|className|unsafeStyle)\??\s*:/u, file)
      assert.doesNotMatch(source, /props\.(?:style|class|className|unsafeStyle)\b/u, file)
      assert.match(source, /layoutStyle\?: ComponentLayoutStyle/u, file)
    }
  })

  it('keeps the Foldkit adapter static-only so inline styles cannot be lost', () => {
    const adapter = readFileSync('src/stylex/style.ts', 'utf8')
    const contract = readFileSync('src/stylex/contracts.ts', 'utf8')

    assert.match(adapter, /ReadonlyArray<StaticStyles>/u)
    assert.doesNotMatch(adapter, /StyleXStyles/u)
    assert.match(contract, /ComponentLayoutStyle = StaticStyles/u)
    assert.match(contract, /_InlineLayoutStyleIsRejected/u)
  })

  it('centralizes component color, border-color, and shadow values in tokens', () => {
    const directVisualLiteral =
      /\b(?:backgroundColor|borderColor|boxShadow|color):\s*(?:'[^']*'|`[^`]*`|"[^"]*")/u

    for (const { file, source } of componentSources) {
      assert.doesNotMatch(source, directVisualLiteral, file)
    }
  })

  it('keeps Accordion behavior in the skin-neutral state module', () => {
    const accordion = readFileSync('src/stylex/accordion.ts', 'utf8')
    const viewInputs = accordion.slice(
      accordion.indexOf('export type ViewInputs'),
      accordion.indexOf('const itemDomId'),
    )

    assert.match(accordion, /from '@\/lib\/accordion-state'/u)
    assert.doesNotMatch(accordion, /export const Model =/u)
    assert.doesNotMatch(accordion, /export const update =/u)
    assert.match(accordion, /defineView</u)
    assert.doesNotMatch(viewInputs, /\b(?:style|class|className|unsafeStyle)\??\s*:/u)
    assert.match(viewInputs, /layoutStyle\?: ComponentLayoutStyle/u)
  })

  it('keeps Button behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/button.ts', 'utf8')
    const stylex = readFileSync('src/stylex/button.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/button'/u)
    assert.match(stylex, /from '@\/lib\/button'/u)
    assert.doesNotMatch(stylex, /from '@\/ui\/button'/u)
    assert.match(stylex, /renderButton\(/u)
    assert.match(stylex, /renderButtonLink\(/u)
  })

  it('keeps Input behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/input.ts', 'utf8')
    const stylex = readFileSync('src/stylex/input.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/input'/u)
    assert.match(stylex, /from '@\/lib\/input'/u)
    assert.doesNotMatch(stylex, /from '@\/ui\/input'/u)
    assert.match(stylex, /renderInput\(/u)
  })

  it('keeps Textarea behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/textarea.ts', 'utf8')
    const stylex = readFileSync('src/stylex/textarea.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/textarea'/u)
    assert.match(stylex, /from '@\/lib\/textarea'/u)
    assert.doesNotMatch(stylex, /from '@\/ui\/textarea'/u)
    assert.match(stylex, /renderTextarea\(/u)
  })

  it('keeps Field behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/field.ts', 'utf8')
    const stylex = readFileSync('src/stylex/field.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/field'/u)
    assert.match(stylex, /from "@\/lib\/field"/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/field['"]/u)
    assert.match(stylex, /renderControlField\(/u)
  })

  it('keeps Form behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/form.ts', 'utf8')
    const stylex = readFileSync('src/stylex/form.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/form'/u)
    assert.match(stylex, /from '@\/lib\/form'/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/form['"]/u)
    assert.match(stylex, /renderForm\(/u)
    assert.match(stylex, /renderErrorSummary\(/u)
  })

  it('keeps Checkbox behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/checkbox.ts', 'utf8')
    const stylex = readFileSync('src/stylex/checkbox.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/checkbox'/u)
    assert.match(stylex, /from '@\/lib\/checkbox'/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/checkbox['"]/u)
    assert.match(stylex, /renderCheckbox\(/u)
  })

  it('keeps Switch behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/switch.ts', 'utf8')
    const stylex = readFileSync('src/stylex/switch.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/switch'/u)
    assert.match(stylex, /from '@\/lib\/switch'/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/switch['"]/u)
    assert.match(stylex, /renderSwitch\(/u)
  })

  it('keeps Radio Group behavior in the skin-neutral behavior module', () => {
    const tailwind = readFileSync('src/ui/radio-group.ts', 'utf8')
    const stylex = readFileSync('src/stylex/radio-group.ts', 'utf8')

    assert.match(tailwind, /from '@\/lib\/radio-group'/u)
    assert.match(stylex, /from '@\/lib\/radio-group'/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/radio-group['"]/u)
    assert.match(stylex, /renderRadioGroup\(/u)
  })

  it('keeps both Dialog skins on the canonical Foldkit submodel', () => {
    const tailwind = readFileSync('src/ui/dialog.ts', 'utf8')
    const stylex = readFileSync('src/stylex/dialog.ts', 'utf8')

    assert.match(tailwind, /Dialog as DialogPrimitive/u)
    assert.match(stylex, /Dialog as DialogPrimitive/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/dialog['"]/u)
    assert.match(tailwind, /view: DialogPrimitive\.view/u)
    assert.match(stylex, /view: DialogPrimitive\.view/u)
  })

  it('keeps both Popover skins on the canonical Foldkit submodel', () => {
    const tailwind = readFileSync('src/ui/popover.ts', 'utf8')
    const stylex = readFileSync('src/stylex/popover.ts', 'utf8')

    assert.match(tailwind, /Popover as PopoverPrimitive/u)
    assert.match(stylex, /Popover as PopoverPrimitive/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/popover['"]/u)
    assert.match(tailwind, /view: PopoverPrimitive\.view/u)
    assert.match(stylex, /view: PopoverPrimitive\.view/u)
  })

  it('binds Select value types once and shares the canonical Listbox behavior', () => {
    const tailwind = readFileSync('src/ui/select.ts', 'utf8')
    const stylex = readFileSync('src/stylex/select.ts', 'utf8')

    assert.match(tailwind, /Listbox as ListboxPrimitive/u)
    assert.match(stylex, /Listbox as ListboxPrimitive/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/select['"]/u)
    assert.match(tailwind, /export const create = <Value extends string/u)
    assert.match(stylex, /export const create = <Value extends string/u)
    assert.doesNotMatch(tailwind, /const listbox = ListboxPrimitive\.create\(\);/u)
    assert.doesNotMatch(stylex, /const listbox = ListboxPrimitive\.create\(\);/u)
  })

  it('binds Combobox value types once and shares the canonical primitive behavior', () => {
    const tailwind = readFileSync('src/ui/combobox.ts', 'utf8')
    const stylex = readFileSync('src/stylex/combobox.ts', 'utf8')

    assert.match(tailwind, /Combobox as ComboboxPrimitive/u)
    assert.match(stylex, /Combobox as ComboboxPrimitive/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/combobox['"]/u)
    assert.match(tailwind, /export const create = <Value extends string/u)
    assert.match(stylex, /export const create = <Value extends string/u)
    assert.doesNotMatch(tailwind, /const comboboxPrimitive = ComboboxPrimitive\.create<Value>\(\);/u)
    assert.doesNotMatch(stylex, /const comboboxPrimitive = ComboboxPrimitive\.create<Value>\(\);/u)
  })

  it('keeps Dropdown Menu interaction policy in one skin-neutral module', () => {
    const behavior = readFileSync('src/lib/dropdown-menu-behavior.ts', 'utf8')
    const tailwind = readFileSync('src/ui/dropdown-menu.ts', 'utf8')
    const stylex = readFileSync('src/stylex/dropdown-menu.ts', 'utf8')

    assert.match(tailwind, /@\/lib\/dropdown-menu-behavior/u)
    assert.match(stylex, /@\/lib\/dropdown-menu-behavior/u)
    assert.match(behavior, /export const update/u)
    assert.match(behavior, /export const keyMessage/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/dropdown-menu['"]/u)
    assert.doesNotMatch(tailwind, /const enabled = items/u)
    assert.doesNotMatch(stylex, /const enabled = items/u)
    assert.doesNotMatch(tailwind, /window\.(?:innerWidth|innerHeight)/u)
    assert.doesNotMatch(stylex, /window\.(?:innerWidth|innerHeight)/u)
  })

  it('binds Tabs values once around the canonical roving-focus primitive', () => {
    const tailwind = readFileSync('src/ui/tabs.ts', 'utf8')
    const stylex = readFileSync('src/stylex/tabs.ts', 'utf8')

    assert.match(tailwind, /Tabs as TabsPrimitive/u)
    assert.match(stylex, /Tabs as TabsPrimitive/u)
    assert.match(tailwind, /export const create = <Value extends string/u)
    assert.match(stylex, /export const create = <Value extends string/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/tabs['"]/u)
    assert.doesNotMatch(tailwind, /activationMode\?: TabsPrimitive\.ActivationMode/u)
    assert.doesNotMatch(stylex, /activationMode\?: TabsPrimitive\.ActivationMode/u)
  })

  it('keeps the public layout override deliberately narrow', () => {
    const contract = readFileSync('src/stylex/contracts.ts', 'utf8')
    const properties = [...contract.matchAll(/^  \| '([^']+)'$/gmu)].map(match => match[1])

    assert.deepEqual(properties, [
      'aspectRatio',
      'alignSelf',
      'flexBasis',
      'flexGrow',
      'flexShrink',
      'gridArea',
      'gridColumn',
      'gridColumnEnd',
      'gridColumnStart',
      'gridRow',
      'gridRowEnd',
      'gridRowStart',
      'height',
      'justifySelf',
      'margin',
      'marginBlock',
      'marginBlockEnd',
      'marginBlockStart',
      'marginBottom',
      'marginInline',
      'marginInlineEnd',
      'marginInlineStart',
      'marginLeft',
      'marginRight',
      'marginTop',
      'maxHeight',
      'maxWidth',
      'minHeight',
      'minWidth',
      'order',
      'width',
    ])
  })
})

