import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXSwitch from '@/stylex/switch'
import * as TailwindSwitch from '@/ui/switch'

type Model = Readonly<{ checked: boolean }>
type Message = Readonly<{ _tag: 'Toggled'; checked: boolean }>
type SwitchModule = Readonly<{
  switchControl: <Msg>(props: {
    id: string; isChecked: boolean; onToggle: (checked: boolean) => Msg
    label: string; description?: string; isReadOnly?: boolean
    name?: string; value?: string; direction?: 'ltr' | 'rtl'
  }, h: HtmlBuilder<Msg>) => Html
}>

const verifyRenderer = (name: string, Switch: SwitchModule) => {
  describe(`${name} Switch scene`, () => {
    it('keeps state parent-owned and exposes form metadata', () => {
      Scene.scene(
        {
          update: (_model: Model, message: Message) => [{ checked: message.checked }, []] as const,
          view: (model, h) => Switch.switchControl({
            id: 'notifications', isChecked: model.checked,
            onToggle: checked => ({ _tag: 'Toggled', checked }),
            label: 'Notifications', description: 'Deployment updates.',
            name: 'notifications', value: 'enabled',
          }, h),
        },
        Scene.given({ checked: false }),
        Scene.expect(Scene.role('switch', { name: 'Notifications' })).not.toBeChecked(),
        Scene.expect(Scene.role('switch', { name: 'Notifications' })).toHaveAccessibleDescription('Deployment updates.'),
        Scene.click(Scene.role('switch', { name: 'Notifications' })),
        Scene.expectHandled(),
        Scene.expect(Scene.role('switch', { name: 'Notifications' })).toBeChecked(),
        Scene.expect(Scene.selector('input[type="hidden"]')).toHaveValue('enabled'),
      )
    })

    it('keeps read-only RTL state focusable and inert', () => {
      Scene.scene(
        {
          update: (model: Model) => [model, []] as const,
          view: (model, h) => Switch.switchControl({
            id: 'managed', isChecked: model.checked,
            onToggle: checked => ({ _tag: 'Toggled', checked }),
            label: 'Managed setting', isReadOnly: true, direction: 'rtl',
          }, h),
        },
        Scene.given({ checked: true }),
        Scene.expect(Scene.role('switch', { name: 'Managed setting' })).toHaveAttr('aria-readonly', 'true'),
        Scene.expect(Scene.role('switch', { name: 'Managed setting' })).not.toHaveAttr('aria-describedby'),
        Scene.expect(Scene.role('switch', { name: 'Managed setting' })).not.toHaveHandler('OnClick'),
        Scene.expect(Scene.selector('[data-slot="switch-field"]')).toHaveAttr('dir', 'rtl'),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindSwitch)
verifyRenderer('StyleX', StyleXSwitch)
