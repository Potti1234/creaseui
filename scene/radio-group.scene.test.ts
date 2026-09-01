import { Option } from 'effect'
import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import * as StyleXRadio from '@/stylex/radio-group'
import * as TailwindRadio from '@/ui/radio-group'

type Model = Readonly<{ value: string; radio: TailwindRadio.Model }>
type Message = Readonly<{ _tag: 'GotRadio'; message: TailwindRadio.Message }>
type RadioModule = Readonly<{
  init: typeof TailwindRadio.init
  update: typeof TailwindRadio.update
  radioGroup: <Msg>(props: {
    model: TailwindRadio.Model; toParentMessage: (message: TailwindRadio.Message) => Msg
    selectedValue: Option.Option<string>; ariaLabel: string
    options: ReadonlyArray<{ value: string; label: string; description?: string; isDisabled?: boolean }>
    name?: string; isReadOnly?: boolean; direction?: 'ltr' | 'rtl'; orientation?: 'Horizontal' | 'Vertical'
  }, h: HtmlBuilder<Msg>) => Html
}>

const options = [
  { value: 'default', label: 'Default' },
  { value: 'comfortable', label: 'Comfortable', description: 'More space.' },
  { value: 'compact', label: 'Compact', isDisabled: true },
]

const verifyRenderer = (name: string, Radio: RadioModule) => {
  describe(`${name} Radio Group scene`, () => {
    it('keeps selection in the parent and emits a native form value', () => {
      Scene.scene(
        {
          update: (model: Model, message: Message) => {
            const [radio, commands, selected] = Radio.update(model.radio, message.message)
            return [{ ...model, radio, value: Option.match(selected, { onNone: () => model.value, onSome: out => out.value }) }, Command.mapMessages(commands, child => ({ _tag: 'GotRadio', message: child }))] as const
          },
          view: (model, h) => Radio.radioGroup({
            model: model.radio, selectedValue: Option.some(model.value),
            toParentMessage: message => ({ _tag: 'GotRadio', message }),
            ariaLabel: 'Density', options, name: 'density',
          }, h),
        },
        Scene.given({ value: 'default', radio: Radio.init({ id: `${name}-density` }) }),
        Scene.expect(Scene.role('radio', { name: 'Default' })).toBeChecked(),
        Scene.expect(Scene.role('radio', { name: 'Default' })).not.toHaveAttr('aria-describedby'),
        Scene.expect(Scene.role('radio', { name: 'Comfortable' })).toHaveAccessibleDescription('More space.'),
        Scene.click(Scene.role('radio', { name: 'Comfortable' })),
        Scene.expectHandled(),
        Scene.expect(Scene.role('radio', { name: 'Comfortable' })).toBeChecked(),
        Scene.expect(Scene.selector('input[type="hidden"]')).toHaveValue('comfortable'),
        Scene.expect(Scene.role('radio', { name: 'Compact' })).toHaveAttr('aria-disabled', 'true'),
        Scene.Command.resolve(RadioGroupPrimitive.FocusOption, RadioGroupPrimitive.CompletedFocusOption()),
      )
    })

    it('keeps read-only selection inert in an RTL group', () => {
      Scene.scene(
        {
          update: (model: Model) => [model, []] as const,
          view: (model, h) => Radio.radioGroup({
            model: model.radio, selectedValue: Option.some(model.value),
            toParentMessage: message => ({ _tag: 'GotRadio', message }),
            ariaLabel: 'Density', options, isReadOnly: true,
            direction: 'rtl', orientation: 'Horizontal',
          }, h),
        },
        Scene.given({ value: 'default', radio: Radio.init({ id: `${name}-readonly` }) }),
        Scene.expect(Scene.role('radio', { name: 'Comfortable' })).not.toHaveHandler('OnClick'),
        Scene.expect(Scene.role('radiogroup', { name: 'Density' })).toHaveAttr('dir', 'rtl'),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindRadio)
verifyRenderer('StyleX', StyleXRadio)
