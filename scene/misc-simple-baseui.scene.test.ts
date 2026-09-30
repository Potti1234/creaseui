import * as stylex from '@stylexjs/stylex'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import type { InputMode } from '@/lib/input'
import type { ComponentLayoutStyle } from '@/stylex/contracts'
import * as StyleXInput from '@/stylex/input'
import * as StyleXLabel from '@/stylex/label'
import * as StyleXNativeSelect from '@/stylex/native-select'
import * as StyleXSeparator from '@/stylex/separator'
import { className as stylexClassName } from '@/stylex/style'
import * as TailwindInput from '@/ui/input'
import * as TailwindLabel from '@/ui/label'
import * as TailwindNativeSelect from '@/ui/native-select'
import * as TailwindSeparator from '@/ui/separator'

/**
 * Behavioral parity suite for creaseui's `misc-simple` group (separator,
 * input, label, native-select), ported from Base UI's
 * `separator/Separator.test.tsx` and `input/Input.test.tsx` at base-ui HEAD.
 *
 * Base UI's `Input.test.tsx` is conformance-only: `Input` is a thin alias
 * for `Field.Control`, so its behavioral coverage lives in the field suite
 * (`field/control/FieldControl.test.tsx`), which is outside this
 * assignment's scope and largely exercises React-level rerender/validation
 * bookkeeping with no creaseui analogue. The input cases here therefore
 * port the element-level contract the conformance cases assert (a native
 * `<input>` receiving attributes, name, value, change callbacks) plus the
 * accessible label/description wiring that `Field.Label`/`Field.Description`
 * establish for the control.
 *
 * `label` and `native-select` have no Base UI suite to port: `Field.Label`
 * needs the React `Field` context (its `htmlFor` is auto-computed) and Base
 * UI's `Select` is a custom composite widget, not a native `<select>`.
 * Their sections below assert the native-element contract that the ported
 * separator/input cases establish (attrs, roles, handlers, label wiring).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - `describeConformance` React internals: ref forwarding, StrictMode,
 *    React 17 (`refForwarding` cases)
 *  - `render=` prop / element-substitution cases (`renderProp` cases) —
 *    foldkit fixes each component's element
 *  - Arbitrary prop/style forwarding (`propsSpread` cases) — creaseui
 *    components expose a fixed prop surface with no spread passthrough
 *  - `Input.spec.tsx` (browser render-prop fixture) — same render-prop gap
 */

type Model = Readonly<{
  value: string
}>

type Message = Readonly<
  | { _tag: 'Typed'; value: string }
  | { _tag: 'Changed'; value: string }
>

const initialModel = (value = ''): Model => ({ value })

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'Typed':
    case 'Changed':
      return { model: { value: message.value } }
  }
}

type SeparatorProps = Readonly<{
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  class?: string
  layoutStyle?: ComponentLayoutStyle
}>

type InputProps<Msg> = Readonly<{
  id: string
  value: string
  onInput?: (value: string) => Msg
  onChange?: (value: string) => Msg
  label?: Html | string
  description?: Html | string
  placeholder?: string
  type?: string
  name?: string
  form?: string
  autocomplete?: string
  inputMode?: InputMode
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  isRequired?: boolean
  class?: string
  layoutStyle?: ComponentLayoutStyle
}>

type LabelProps = Readonly<{
  for?: string
  isRequired?: boolean
  isDisabled?: boolean
  children: ReadonlyArray<Html | string>
  class?: string
  layoutStyle?: ComponentLayoutStyle
}>

type NativeSelectOption = Readonly<{
  value: string
  label: string
  isDisabled?: boolean
}>

type NativeSelectProps<Msg> = Readonly<{
  id: string
  value: string
  onChange: (value: string) => Msg
  options: ReadonlyArray<NativeSelectOption>
  groups?: ReadonlyArray<{
    label: string
    options: ReadonlyArray<NativeSelectOption>
    isDisabled?: boolean
  }>
  label?: string
  description?: string
  name?: string
  size?: 'sm' | 'default'
  isDisabled?: boolean
  isInvalid?: boolean
  direction?: 'ltr' | 'rtl'
  class?: string
  layoutStyle?: ComponentLayoutStyle
}>

type MiscModule = Readonly<{
  separator: <Msg>(props: SeparatorProps, h: HtmlBuilder<Msg>) => Html
  input: <Msg>(props: InputProps<Msg>, h: HtmlBuilder<Msg>) => Html
  label: <Msg>(props: LabelProps, h: HtmlBuilder<Msg>) => Html
  nativeSelect: <Msg>(props: NativeSelectProps<Msg>, h: HtmlBuilder<Msg>) => Html
}>

/**
 * How each renderer receives the "custom className" prop Base UI's
 * conformance `className` case asserts: Tailwind takes a literal `class`,
 * StyleX takes a `layoutStyle` style object. On `nativeSelect`, Tailwind's
 * `class` lands on the `<select>` while StyleX's `layoutStyle` lands on the
 * outer wrapper (layout positioning lives on the wrapper by design).
 */
type CustomStyling = Readonly<{
  props: Readonly<{ class?: string; layoutStyle?: ComponentLayoutStyle }>
  expectedClass: string
  nativeSelectTarget: 'native-select' | 'native-select-wrapper'
}>

const separatorEl = Scene.selector('[data-slot="separator"]')
const separatorRole = Scene.role('separator')
const inputEl = Scene.selector('[data-slot="input"]')
const selectEl = Scene.selector('[data-slot="native-select"]')
const combobox = Scene.role('combobox')

const verifyRenderer = (name: string, Module: MiscModule, custom: CustomStyling) => {
  describe(`${name} misc-simple (Base UI port)`, () => {
    describe('Separator', () => {
      it('renders a div with the separator role', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Module.separator({ decorative: false }, h),
          },
          Scene.given(initialModel()),
          Scene.expect(separatorRole).toExist(),
          Scene.expect(separatorEl).toHaveAttr('role', 'separator'),
        )
      })

      // DIVERGENCE (intentional): Base UI has no `decorative` prop — its
      // default `<Separator />` is a semantic `role=separator`. creaseui
      // ports shadcn/ui, which defaults `decorative` to true, so the default
      // separator is `role=none` with no `aria-orientation` (orientation
      // remains on the `data-orientation` hook).
      it('renders as a decorative separator by default', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) => Module.separator({}, h),
          },
          Scene.given(initialModel()),
          Scene.expect(separatorRole).not.toExist(),
          Scene.expect(separatorEl).toHaveAttr('role', 'none'),
          Scene.expect(separatorEl).not.toHaveAttr('aria-orientation'),
          Scene.expect(separatorEl).toHaveAttr('data-orientation', 'horizontal'),
        )
      })

      it('applies a custom class name', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Module.separator({ decorative: false, ...custom.props }, h),
          },
          Scene.given(initialModel()),
          Scene.expect(separatorEl).toHaveClass(custom.expectedClass),
        )
      })

      describe('prop: orientation', () => {
        it('horizontal', () => {
          Scene.scene(
            {
              update,
              view: (_model, h) =>
                Module.separator({ orientation: 'horizontal', decorative: false }, h),
            },
            Scene.given(initialModel()),
            Scene.expect(separatorEl).toHaveAttr('aria-orientation', 'horizontal'),
            Scene.expect(separatorEl).toHaveAttr('data-orientation', 'horizontal'),
          )
        })

        it('vertical', () => {
          Scene.scene(
            {
              update,
              view: (_model, h) =>
                Module.separator({ orientation: 'vertical', decorative: false }, h),
            },
            Scene.given(initialModel()),
            Scene.expect(separatorEl).toHaveAttr('aria-orientation', 'vertical'),
            Scene.expect(separatorEl).toHaveAttr('data-orientation', 'vertical'),
          )
        })
      })
    })

    describe('Input', () => {
      it('renders a native input element', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Module.input(
                {
                  id: 'field-email',
                  value: model.value,
                  onInput: value => ({ _tag: 'Typed', value }),
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(Scene.role('textbox')).toExist(),
          Scene.expect(inputEl).toHaveAttr('type', 'text'),
          Scene.expect(inputEl).toHaveAttr('id', 'field-email'),
        )
      })

      it('applies a custom class name to the input element', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Module.input(
                { id: 'field-email', value: model.value, ...custom.props },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(inputEl).toHaveClass(custom.expectedClass),
        )
      })

      describe('form metadata', () => {
        it('exposes name, placeholder, type, form, autocomplete and inputMode on the input element', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    name: 'email',
                    placeholder: 'name@example.com',
                    type: 'email',
                    form: 'signup',
                    autocomplete: 'email',
                    inputMode: 'email',
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.expect(inputEl).toHaveAttr('name', 'email'),
            Scene.expect(inputEl).toHaveAttr('placeholder', 'name@example.com'),
            Scene.expect(inputEl).toHaveAttr('type', 'email'),
            Scene.expect(inputEl).toHaveAttr('form', 'signup'),
            Scene.expect(inputEl).toHaveAttr('autocomplete', 'email'),
            Scene.expect(inputEl).toHaveAttr('inputmode', 'email'),
          )
        })

        it('associates its label through htmlFor', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    label: 'Email',
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.expect(Scene.label('Email')).toExist(),
            Scene.expect(Scene.selector('label')).toHaveAttr('htmlFor', 'field-email'),
            Scene.expect(inputEl).toHaveAccessibleName('Email'),
          )
        })

        it('links its description through aria-describedby', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    label: 'Email',
                    description: 'We never share your email.',
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.expect(inputEl).toHaveAttr(
              'aria-describedby',
              'field-email-description',
            ),
            Scene.expect(Scene.selector('[data-slot="input-description"]')).toHaveId(
              'field-email-description',
            ),
            Scene.expect(inputEl).toHaveAccessibleDescription(
              'We never share your email.',
            ),
          )
        })

        it('does not emit aria-describedby when no description is rendered', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    label: 'Email',
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.expect(inputEl).not.toHaveAttr('aria-describedby'),
            Scene.expect(Scene.selector('[data-slot="input-description"]')).toBeAbsent(),
          )
        })
      })

      describe('interactions', () => {
        it('dispatches onInput with the typed value', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    label: 'Email',
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.type(Scene.label('Email'), 'dev@crease.dev'),
            Scene.expectHandled(),
            Scene.expect(inputEl).toHaveValue('dev@crease.dev'),
          )
        })

        it('dispatches onChange on change events', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    label: 'Email',
                  },
                  h,
                ),
            },
            Scene.given(initialModel('dev@crease.dev')),
            Scene.change(Scene.label('Email'), 'new@crease.dev'),
            Scene.expectHandled(),
            Scene.expect(inputEl).toHaveValue('new@crease.dev'),
          )
        })
      })

      describe('prop: disabled', () => {
        it('uses the native disabled attribute and removes input handlers', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    onChange: value => ({ _tag: 'Changed', value }),
                    label: 'Email',
                    isDisabled: true,
                  },
                  h,
                ),
            },
            Scene.given(initialModel('dev@crease.dev')),
            Scene.expect(inputEl).toBeDisabled(),
            Scene.expect(inputEl).toHaveAttr('disabled'),
            Scene.expect(inputEl).toHaveAttr('data-disabled', ''),
            Scene.expect(inputEl).not.toHaveHandler('OnInput'),
            Scene.expect(inputEl).not.toHaveHandler('OnChange'),
            Scene.expect(inputEl).toHaveValue('dev@crease.dev'),
          )
        })
      })

      describe('prop: readOnly', () => {
        it('exposes readOnly and removes input handlers', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    onChange: value => ({ _tag: 'Changed', value }),
                    label: 'Email',
                    isReadOnly: true,
                  },
                  h,
                ),
            },
            Scene.given(initialModel('dev@crease.dev')),
            Scene.expect(inputEl).toHaveAttr('readOnly'),
            Scene.expect(inputEl).toHaveAttr('data-readonly', ''),
            Scene.expect(inputEl).not.toHaveHandler('OnInput'),
            Scene.expect(inputEl).not.toHaveHandler('OnChange'),
          )
        })
      })

      describe('prop: invalid', () => {
        it('exposes aria-invalid and marks the control and field with invalid hooks', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    label: 'Email',
                    isInvalid: true,
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.expect(inputEl).toHaveAttr('aria-invalid', 'true'),
            Scene.expect(inputEl).toHaveAttr('data-invalid', ''),
            Scene.expect(Scene.selector('[data-slot="input-field"]')).toHaveAttr(
              'data-state',
              'invalid',
            ),
          )
        })
      })

      describe('prop: required', () => {
        it('sets the required attribute and aria-required', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.input(
                  {
                    id: 'field-email',
                    value: model.value,
                    onInput: value => ({ _tag: 'Typed', value }),
                    label: 'Email',
                    isRequired: true,
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.expect(inputEl).toHaveAttr('required'),
            Scene.expect(inputEl).toHaveAttr('aria-required', 'true'),
          )
        })
      })

      it.todo(
        'emits field-state hooks (data-valid/data-touched/data-dirty/' +
          'data-filled/data-focused) — creaseui input has no field-state tracking',
      )
    })

    describe('Label', () => {
      it('renders a label element bound to a control id', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Module.label({ for: 'field-email', children: ['Email'] }, h),
          },
          Scene.given(initialModel()),
          Scene.expect(Scene.selector('label')).toHaveAttr('htmlFor', 'field-email'),
          Scene.expect(Scene.selector('label')).toHaveAttr('data-slot', 'label'),
          Scene.expect(Scene.selector('label')).toHaveAttr('data-required', 'false'),
          Scene.expect(Scene.selector('label')).toHaveAttr('data-disabled', 'false'),
        )
      })

      it('marks required labels and appends an aria-hidden asterisk', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Module.label({ isRequired: true, children: ['Email'] }, h),
          },
          Scene.given(initialModel()),
          Scene.expect(Scene.selector('label')).toHaveAttr('data-required', 'true'),
          Scene.expect(Scene.selector('label span')).toHaveAttr('aria-hidden', 'true'),
          Scene.expect(Scene.selector('label span')).toHaveText('*'),
        )
      })

      it('reflects disabled state on the label element', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Module.label({ isDisabled: true, children: ['Email'] }, h),
          },
          Scene.given(initialModel()),
          Scene.expect(Scene.selector('label')).toHaveAttr('data-disabled', 'true'),
          Scene.expect(Scene.selector('label')).toHaveAttr('aria-disabled', 'true'),
        )
      })

      it('applies a custom class name', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Module.label({ children: ['Email'], ...custom.props }, h),
          },
          Scene.given(initialModel()),
          Scene.expect(Scene.selector('label')).toHaveClass(custom.expectedClass),
        )
      })

      it.todo(
        'auto-associates with a field control like Field.Label — creaseui ' +
          'label is context-free and takes `for` explicitly',
      )
    })

    describe('NativeSelect', () => {
      const fruitOptions = [
        { value: 'apple', label: 'Apple' },
        { value: 'pear', label: 'Pear' },
      ]

      it('renders a combobox of native option elements', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Module.nativeSelect(
                {
                  id: 'fruit',
                  value: model.value,
                  onChange: value => ({ _tag: 'Changed', value }),
                  options: fruitOptions,
                },
                h,
              ),
          },
          Scene.given(initialModel('apple')),
          Scene.expect(combobox).toExist(),
          Scene.expect(Scene.selector('[data-slot="native-select-icon"]')).toExist(),
          Scene.expectAll(Scene.all.role('option')).toHaveCount(2),
          Scene.expect(Scene.role('option', { name: 'Pear' })).toExist(),
        )
      })

      it('groups options under labelled optgroups and honors option disabled state', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Module.nativeSelect(
                {
                  id: 'fruit',
                  value: model.value,
                  onChange: value => ({ _tag: 'Changed', value }),
                  options: [],
                  groups: [
                    {
                      label: 'Citrus',
                      options: [
                        { value: 'lemon', label: 'Lemon' },
                        { value: 'lime', label: 'Lime', isDisabled: true },
                      ],
                    },
                  ],
                },
                h,
              ),
          },
          Scene.given(initialModel('lemon')),
          Scene.expect(Scene.selector('optgroup')).toHaveAttr('label', 'Citrus'),
          Scene.expectAll(Scene.all.role('option')).toHaveCount(2),
          Scene.expect(Scene.role('option', { name: 'Lime' })).toHaveAttr('disabled'),
        )
      })

      it('reflects its value and name for form participation', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Module.nativeSelect(
                {
                  id: 'fruit',
                  value: model.value,
                  onChange: value => ({ _tag: 'Changed', value }),
                  options: fruitOptions,
                  name: 'fruit',
                },
                h,
              ),
          },
          Scene.given(initialModel('pear')),
          Scene.expect(selectEl).toHaveValue('pear'),
          Scene.expect(selectEl).toHaveAttr('name', 'fruit'),
        )
      })

      it('applies a custom class name to its styled root', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Module.nativeSelect(
                {
                  id: 'fruit',
                  value: model.value,
                  onChange: value => ({ _tag: 'Changed', value }),
                  options: fruitOptions,
                  ...custom.props,
                },
                h,
              ),
          },
          Scene.given(initialModel('apple')),
          Scene.expect(
            Scene.selector(`[data-slot="${custom.nativeSelectTarget}"]`),
          ).toHaveClass(custom.expectedClass),
        )
      })

      describe('interactions', () => {
        it('dispatches onChange with the selected value', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.change(combobox, 'pear'),
            Scene.expectHandled(),
            Scene.expect(selectEl).toHaveValue('pear'),
          )
        })
      })

      describe('prop: disabled', () => {
        it('uses the native disabled attribute and removes the change handler', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                    isDisabled: true,
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.expect(selectEl).toBeDisabled(),
            Scene.expect(selectEl).toHaveAttr('disabled'),
            Scene.expect(selectEl).toHaveAttr('data-disabled', ''),
            Scene.expect(selectEl).not.toHaveHandler('OnChange'),
          )
        })
      })

      describe('prop: invalid', () => {
        it('exposes aria-invalid and data-invalid', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                    isInvalid: true,
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.expect(selectEl).toHaveAttr('aria-invalid', 'true'),
            Scene.expect(selectEl).toHaveAttr('data-invalid', ''),
          )
        })
      })

      describe('prop: size', () => {
        it('defaults to data-size=default', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.expect(selectEl).toHaveAttr('data-size', 'default'),
          )
        })

        it('emits data-size=sm for the small variant', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                    size: 'sm',
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.expect(selectEl).toHaveAttr('data-size', 'sm'),
          )
        })
      })

      describe('prop: direction', () => {
        it('sets dir on the select element', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                    direction: 'rtl',
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.expect(selectEl).toHaveAttr('dir', 'rtl'),
          )
        })
      })

      describe('label and description', () => {
        it('associates its label through htmlFor', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                    label: 'Fruit',
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.expect(Scene.label('Fruit')).toExist(),
            Scene.expect(Scene.selector('label')).toHaveAttr('htmlFor', 'fruit'),
            Scene.expect(selectEl).toHaveAccessibleName('Fruit'),
          )
        })

        it('links its description through aria-describedby', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Module.nativeSelect(
                  {
                    id: 'fruit',
                    value: model.value,
                    onChange: value => ({ _tag: 'Changed', value }),
                    options: fruitOptions,
                    label: 'Fruit',
                    description: 'Pick your favorite.',
                  },
                  h,
                ),
            },
            Scene.given(initialModel('apple')),
            Scene.expect(selectEl).toHaveAttr('aria-describedby', 'fruit-description'),
            Scene.expect(Scene.selector('#fruit-description')).toExist(),
            Scene.expect(selectEl).toHaveAccessibleDescription('Pick your favorite.'),
          )
        })
      })

      it.todo(
        'renders a custom listbox popup like Base UI Select — creaseui ' +
          'renders a native <select>; the browser owns the popup',
      )
    })
  })
}

const stylexCustomStyle = stylex.create({ custom: { marginTop: '1rem' } })

verifyRenderer('Tailwind', {
  separator: TailwindSeparator.separator,
  input: TailwindInput.input,
  label: TailwindLabel.label,
  nativeSelect: TailwindNativeSelect.nativeSelect,
}, {
  props: { class: 'creaseui-custom' },
  expectedClass: 'creaseui-custom',
  nativeSelectTarget: 'native-select',
})

verifyRenderer('StyleX', {
  separator: StyleXSeparator.separator,
  input: StyleXInput.input,
  label: StyleXLabel.label,
  nativeSelect: StyleXNativeSelect.nativeSelect,
}, {
  props: { layoutStyle: stylexCustomStyle.custom },
  expectedClass: stylexClassName(stylexCustomStyle.custom),
  nativeSelectTarget: 'native-select-wrapper',
})
