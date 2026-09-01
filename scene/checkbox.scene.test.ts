import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXCheckbox from '@/stylex/checkbox'
import * as TailwindCheckbox from '@/ui/checkbox'

type Model = Readonly<{ checked: boolean }>
type Message = Readonly<{ _tag: 'Toggled'; checked: boolean }>

type CheckboxModule = Readonly<{
  checkbox: <Msg>(props: {
    id: string
    isChecked: boolean
    onToggle: (checked: boolean) => Msg
    label: string
    description?: string
    isReadOnly?: boolean
    isIndeterminate?: boolean
    name?: string
    value?: string
  }, h: HtmlBuilder<Msg>) => Html
}>

const verifyRenderer = (name: string, Checkbox: CheckboxModule) => {
  describe(`${name} Checkbox scene`, () => {
    it('keeps checked state parent-owned and exposes native form metadata', () => {
      Scene.scene(
        {
          update: (_model: Model, message: Message) => [{ checked: message.checked }, []] as const,
          view: (model, h) => Checkbox.checkbox({
            id: 'terms', isChecked: model.checked,
            onToggle: checked => ({ _tag: 'Toggled', checked }),
            label: 'Accept terms', description: 'Required to continue.',
            name: 'terms', value: 'accepted',
          }, h),
        },
        Scene.given({ checked: false }),
        Scene.expect(Scene.role('checkbox', { name: 'Accept terms' })).not.toBeChecked(),
        Scene.expect(Scene.role('checkbox', { name: 'Accept terms' })).toHaveAccessibleDescription('Required to continue.'),
        Scene.expect(Scene.selector('input[type="hidden"]')).toHaveAttr('name', 'terms'),
        Scene.click(Scene.role('checkbox', { name: 'Accept terms' })),
        Scene.expectHandled(),
        Scene.expect(Scene.role('checkbox', { name: 'Accept terms' })).toBeChecked(),
        Scene.expect(Scene.selector('input[type="hidden"]')).toHaveValue('accepted'),
      )
    })

    it('exposes mixed and read-only state without interaction handlers', () => {
      Scene.scene(
        {
          update: (model: Model) => [model, []] as const,
          view: (model, h) => Checkbox.checkbox({
            id: 'selection', isChecked: model.checked,
            onToggle: checked => ({ _tag: 'Toggled', checked }),
            label: 'Select all', isIndeterminate: true, isReadOnly: true,
          }, h),
        },
        Scene.given({ checked: false }),
        Scene.expect(Scene.role('checkbox', { name: 'Select all', checked: 'mixed' })).toHaveAttr('aria-readonly', 'true'),
        Scene.expect(Scene.role('checkbox', { name: 'Select all' })).not.toHaveHandler('OnClick'),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindCheckbox)
verifyRenderer('StyleX', StyleXCheckbox)
