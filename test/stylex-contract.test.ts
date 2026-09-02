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

  it('keeps Sheet as a render-only specialization of Dialog in both skins', () => {
    const tailwind = readFileSync('src/ui/sheet.ts', 'utf8')
    const stylex = readFileSync('src/stylex/sheet.ts', 'utf8')

    for (const source of [tailwind, stylex]) {
      assert.match(source, /Model = DialogPrimitive\.Model/u)
      assert.match(source, /update = DialogPrimitive\.update/u)
      assert.match(source, /open = DialogPrimitive\.open/u)
      assert.match(source, /close = DialogPrimitive\.close/u)
      assert.match(source, /side\?: SheetSide/u)
      assert.doesNotMatch(source, /S\.Struct/u)
    }
  })

  it('shares Drawer drag physics while retaining canonical Dialog behavior', () => {
    const behavior = readFileSync('src/lib/drawer.ts', 'utf8')
    const tailwind = readFileSync('src/ui/drawer.ts', 'utf8')
    const stylex = readFileSync('src/stylex/drawer.ts', 'utf8')

    assert.match(behavior, /import \{ Dialog \} from '@foldkit\/ui'/u)
    assert.match(behavior, /SnapDecision/u)
    assert.match(behavior, /dragVelocity/u)
    assert.match(behavior, /CancelledDrawerDrag/u)
    assert.match(tailwind, /@\/lib\/drawer/u)
    assert.match(stylex, /@\/lib\/drawer/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/drawer['"]/u)
  })

  it('keeps Collapsible controlled on canonical Disclosure in both skins', () => {
    const tailwind = readFileSync('src/ui/collapsible.ts', 'utf8')
    const stylex = readFileSync('src/stylex/collapsible.ts', 'utf8')

    for (const source of [tailwind, stylex]) {
      assert.match(source, /DisclosurePrimitive\.view/u)
      assert.match(source, /isOpen: props\.isOpen/u)
      assert.match(source, /onToggle: props\.onToggle/u)
      assert.doesNotMatch(source, /export const Model/u)
    }
  })

  it('shares stateless Progress normalization across both skins', () => {
    const behavior = readFileSync('src/lib/progress.ts', 'utf8')
    const tailwind = readFileSync('src/ui/progress.ts', 'utf8')
    const stylex = readFileSync('src/stylex/progress.ts', 'utf8')
    assert.match(behavior, /normalizeProgress/u)
    assert.match(tailwind, /@\/lib\/progress/u)
    assert.match(stylex, /@\/lib\/progress/u)
    assert.doesNotMatch(tailwind, /export const Model/u)
    assert.doesNotMatch(stylex, /export const Model/u)
  })

  it('keeps Skeleton and Spinner presentational with finite visual vocabularies', () => {
    for (const path of ['src/ui/skeleton.ts', 'src/stylex/skeleton.ts']) {
      const source = readFileSync(path, 'utf8')
      assert.match(source, /'text' \| 'rectangle' \| 'circle'/u)
      assert.match(source, /'sm' \| 'md' \| 'lg'/u)
      assert.match(source, /AriaHidden\(true\)/u)
      assert.doesNotMatch(source, /export const Model/u)
    }
    for (const path of ['src/ui/spinner.ts', 'src/stylex/spinner.ts']) {
      const source = readFileSync(path, 'utf8')
      assert.match(source, /isDecorative: true/u)
      assert.match(source, /'sm' \| 'md' \| 'lg'/u)
      assert.match(source, /'current' \| 'muted' \| 'primary'/u)
      assert.doesNotMatch(source, /export const Model/u)
    }
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

  it('keeps Toggle controlled on the canonical button primitive in both skins', () => {
    const tailwind = readFileSync('src/ui/toggle.ts', 'utf8')
    const stylex = readFileSync('src/stylex/toggle.ts', 'utf8')

    assert.match(tailwind, /Button as ButtonPrimitive/u)
    assert.match(stylex, /Button as ButtonPrimitive/u)
    assert.match(tailwind, /h\.AriaPressed/u)
    assert.match(stylex, /h\.AriaPressed/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/toggle['"]/u)
    assert.doesNotMatch(tailwind, /export const Model/u)
    assert.doesNotMatch(stylex, /export const Model/u)
  })

  it('binds Toggle Group values once around shared roving-focus behavior', () => {
    const behavior = readFileSync('src/lib/toggle-group.ts', 'utf8')
    const tailwind = readFileSync('src/ui/toggle-group.ts', 'utf8')
    const stylex = readFileSync('src/stylex/toggle-group.ts', 'utf8')

    assert.match(behavior, /Tabs as TabsPrimitive/u)
    assert.match(tailwind, /@\/lib\/toggle-group/u)
    assert.match(stylex, /@\/lib\/toggle-group/u)
    assert.match(tailwind, /export const create = <Value extends string/u)
    assert.match(stylex, /export const create = <Value extends string/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/toggle-group['"]/u)
    assert.match(tailwind, /selectedValues/u)
    assert.match(stylex, /selectedValues/u)
  })

  it('shares Slider range normalization across both skins', () => {
    const behavior = readFileSync('src/lib/slider.ts', 'utf8')
    const tailwind = readFileSync('src/ui/slider.ts', 'utf8')
    const stylex = readFileSync('src/stylex/slider.ts', 'utf8')

    assert.match(behavior, /export const normalizeRange/u)
    assert.match(behavior, /export const normalizeRangeValues/u)
    assert.match(tailwind, /@\/lib\/slider/u)
    assert.match(stylex, /@\/lib\/slider/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/slider['"]/u)
    assert.match(tailwind, /Slider as SliderPrimitive/u)
    assert.match(stylex, /Slider as SliderPrimitive/u)
  })

  it('binds Command actions once and shares query policy', () => {
    const behavior = readFileSync('src/lib/command.ts', 'utf8')
    const tailwind = readFileSync('src/ui/command.ts', 'utf8')
    const stylex = readFileSync('src/stylex/command.ts', 'utf8')

    assert.match(behavior, /export const filterCommandItems/u)
    assert.match(tailwind, /@\/lib\/command/u)
    assert.match(stylex, /@\/lib\/command/u)
    assert.match(tailwind, /export const create = <Item extends string/u)
    assert.match(stylex, /export const create = <Item extends string/u)
    assert.doesNotMatch(tailwind, /const commandPrimitive = ComboboxPrimitive\.create<Item>\(\)/u)
    assert.doesNotMatch(stylex, /const commandPrimitive = ComboboxPrimitive\.create<Item>\(\)/u)
  })

  it('keeps Navigation Menu route-free and disclosures on Popover behavior', () => {
    const tailwind = readFileSync('src/ui/navigation-menu.ts', 'utf8')
    const stylex = readFileSync('src/stylex/navigation-menu.ts', 'utf8')

    assert.match(tailwind, /import \* as Popover/u)
    assert.match(stylex, /import \* as Popover/u)
    assert.match(tailwind, /NavigationMenuLayout = 'inline' \| 'scroll' \| 'responsive'/u)
    assert.match(stylex, /NavigationMenuLayout = 'inline' \| 'scroll' \| 'responsive'/u)
    assert.match(tailwind, /Popover\.RequestedOpen/u)
    assert.match(stylex, /Popover\.RequestedOpen/u)
    assert.doesNotMatch(tailwind, /export const Model/u)
    assert.doesNotMatch(stylex, /export const Model/u)
  })

  it('shares Menubar roving focus while delegating menu behavior', () => {
    const behavior = readFileSync('src/lib/menubar.ts', 'utf8')
    const tailwind = readFileSync('src/ui/menubar.ts', 'utf8')
    const stylex = readFileSync('src/stylex/menubar.ts', 'utf8')

    assert.match(behavior, /FocusMenubarTrigger/u)
    assert.match(tailwind, /@\/lib\/menubar/u)
    assert.match(stylex, /@\/lib\/menubar/u)
    assert.match(tailwind, /DropdownMenu\.dropdownMenu/u)
    assert.match(stylex, /DropdownMenu\.dropdownMenu/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/menubar['"]/u)
  })

  it('shares Pagination range policy while keeping page state parent-owned', () => {
    const behavior = readFileSync('src/lib/pagination.ts', 'utf8')
    const tailwind = readFileSync('src/ui/pagination.ts', 'utf8')
    const stylex = readFileSync('src/stylex/pagination.ts', 'utf8')

    assert.match(behavior, /export const paginationItems/u)
    assert.match(tailwind, /@\/lib\/pagination/u)
    assert.match(stylex, /@\/lib\/pagination/u)
    assert.match(tailwind, /navigation\.kind === 'link'/u)
    assert.match(stylex, /navigation\.kind === 'link'/u)
    assert.doesNotMatch(tailwind, /export const Model/u)
    assert.doesNotMatch(stylex, /export const Model/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/pagination['"]/u)
  })

  it('shares Breadcrumb route-part and collapse policy without state', () => {
    const behavior = readFileSync('src/lib/breadcrumb.ts', 'utf8')
    const tailwind = readFileSync('src/ui/breadcrumb.ts', 'utf8')
    const stylex = readFileSync('src/stylex/breadcrumb.ts', 'utf8')

    assert.match(behavior, /export type BreadcrumbTrailItem/u)
    assert.match(behavior, /export const collapseBreadcrumbItems/u)
    assert.match(tailwind, /@\/lib\/breadcrumb/u)
    assert.match(stylex, /@\/lib\/breadcrumb/u)
    assert.doesNotMatch(tailwind, /export const Model/u)
    assert.doesNotMatch(stylex, /export const Model/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/breadcrumb['"]/u)
  })

  it('shares Alert severity and announcement semantics without state', () => {
    const behavior = readFileSync('src/lib/alert.ts', 'utf8')
    const tailwind = readFileSync('src/ui/alert.ts', 'utf8')
    const stylex = readFileSync('src/stylex/alert.ts', 'utf8')

    assert.match(behavior, /export const alertSemantics/u)
    assert.match(tailwind, /@\/lib\/alert/u)
    assert.match(stylex, /@\/lib\/alert/u)
    assert.match(tailwind, /announcement: AlertAnnouncement/u)
    assert.match(stylex, /announcement: AlertAnnouncement/u)
    assert.doesNotMatch(tailwind, /export const Model/u)
    assert.doesNotMatch(stylex, /export const Model/u)
  })

  it('keeps Alert Dialog decisions on canonical Dialog behavior', () => {
    const behavior = readFileSync('src/lib/alert-dialog.ts', 'utf8')
    const tailwind = readFileSync('src/ui/alert-dialog.ts', 'utf8')
    const stylex = readFileSync('src/stylex/alert-dialog.ts', 'utf8')

    assert.match(behavior, /import \{ Dialog \} from '@foldkit\/ui'/u)
    assert.match(behavior, /ConfirmedAlertDialog/u)
    assert.match(behavior, /CancelledAlertDialog/u)
    assert.match(tailwind, /@\/lib\/alert-dialog/u)
    assert.match(stylex, /@\/lib\/alert-dialog/u)
    assert.match(tailwind, /DialogPrimitive\.view/u)
    assert.match(stylex, /DialogPrimitive\.view/u)
  })

  it('keeps Toast and Sonner on one versioned notification behavior', () => {
    const behavior = readFileSync('src/lib/toast.ts', 'utf8')
    const tailwind = readFileSync('src/ui/sonner.ts', 'utf8')
    const stylex = readFileSync('src/stylex/sonner.ts', 'utf8')
    const toast = readFileSync('src/ui/toast.ts', 'utf8')

    assert.match(behavior, /timerVersion/u)
    assert.match(behavior, /export const updateToast/u)
    assert.match(behavior, /ActivatedToast/u)
    assert.match(tailwind, /@\/lib\/toast/u)
    assert.match(stylex, /@\/lib\/toast/u)
    assert.match(toast, /@\/ui\/sonner/u)
    assert.doesNotMatch(tailwind, /Command\.define/u)
    assert.doesNotMatch(stylex, /Command\.define/u)
  })

  it('shares Tooltip ownership and versioned delay behavior across skins', () => {
    const behavior = readFileSync('src/lib/tooltip.ts', 'utf8')
    const tailwind = readFileSync('src/ui/tooltip.ts', 'utf8')
    const stylex = readFileSync('src/stylex/tooltip.ts', 'utf8')

    assert.match(behavior, /WaitBeforeShowingTooltip/u)
    assert.match(behavior, /WaitBeforeClosingTooltip/u)
    assert.match(behavior, /showVersion/u)
    assert.match(behavior, /closeVersion/u)
    assert.match(tailwind, /@\/lib\/tooltip/u)
    assert.match(stylex, /@\/lib\/tooltip/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/tooltip['"]/u)
  })

  it('shares Hover Card ownership and versioned delay behavior across skins', () => {
    const behavior = readFileSync('src/lib/hover-card.ts', 'utf8')
    const tailwind = readFileSync('src/ui/hover-card.ts', 'utf8')
    const stylex = readFileSync('src/stylex/hover-card.ts', 'utf8')

    assert.match(behavior, /WaitBeforeShowingHoverCard/u)
    assert.match(behavior, /WaitBeforeClosingHoverCard/u)
    assert.match(tailwind, /@\/lib\/hover-card/u)
    assert.match(stylex, /@\/lib\/hover-card/u)
    assert.match(tailwind, /AnchorTooltip/u)
    assert.match(stylex, /AnchorTooltip/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/hover-card['"]/u)
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

