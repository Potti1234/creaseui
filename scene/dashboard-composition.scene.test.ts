import * as Scene from 'foldkit/scene'
import { describe, it, expect } from 'vitest'
import * as TailwindSwitch from '@/ui/switch'
import * as StyleXSwitch from '@/stylex/switch'
import * as TailwindTable from '@/ui/data-table'
import * as StyleXTable from '@/stylex/data-table'
import * as Icon from '@/lib/icon'

describe('Dashboard composition', () => {
  for (const [name, Switch] of [
    ['Tailwind', TailwindSwitch],
    ['StyleX', StyleXSwitch],
  ] as const) {
    it(`${name} switch links external labels and descriptions through public IDs`, () => {
      Scene.scene(
        {
          update: (_model: boolean, message: boolean) => ({ model: message }),
          view: (model, h) => {
            const ids = Switch.switchIds('weekly')
            return h.div(
              [],
              [
                h.label(
                  [h.Id(ids.labelId), h.For(ids.controlId)],
                  ['Weekly digest'],
                ),
                h.p([h.Id(ids.descriptionId)], ['A weekly summary.']),
                Switch.switchControl(
                  {
                    id: 'weekly',
                    isChecked: model,
                    onToggle: value => value,
                    describedBy: ids.descriptionId,
                  },
                  h,
                ),
              ],
            )
          },
        },
        Scene.given(false),
        Scene.expect(
          Scene.role('switch', { name: 'Weekly digest' }),
        ).toHaveAccessibleDescription('A weekly summary.'),
        Scene.click(Scene.role('switch', { name: 'Weekly digest' })),
        Scene.expect(
          Scene.role('switch', { name: 'Weekly digest' }),
        ).toBeChecked(),
      )
    })

    it(`${name} switch supports ariaLabel without a dangling label reference`, () => {
      Scene.scene(
        {
          update: (_model: boolean, message: boolean) => ({ model: message }),
          view: (model, h) =>
            Switch.switchControl(
              {
                id: 'compact',
                ariaLabel: 'Enable digest',
                isChecked: model,
                onToggle: value => value,
              },
              h,
            ),
        },
        Scene.given(false),
        Scene.expect(
          Scene.role('switch', { name: 'Enable digest' }),
        ).toHaveAttr('aria-label', 'Enable digest'),
      )
    })

    it(`${name} switch accepts custom external label IDs`, () => {
      Scene.scene(
        {
          update: (_model: boolean, message: boolean) => ({ model: message }),
          view: (model, h) =>
            h.div(
              [],
              [
                h.span([h.Id('custom-label')], ['External label']),
                Switch.switchControl(
                  {
                    id: 'custom',
                    labelledBy: 'custom-label',
                    isChecked: model,
                    onToggle: value => value,
                  },
                  h,
                ),
              ],
            ),
        },
        Scene.given(false),
        Scene.expect(
          Scene.role('switch', { name: 'External label' }),
        ).toHaveAttr('aria-labelledby', 'custom-label'),
      )
    })

    it(`${name} switch renders a description alongside an accessible-label-only control`, () => {
      Scene.scene(
        {
          update: (_model: boolean, message: boolean) => ({ model: message }),
          view: (model, h) =>
            Switch.switchControl(
              {
                id: 'description-only',
                ariaLabel: 'Enable digest',
                description: 'A weekly summary.',
                isChecked: model,
                onToggle: value => value,
              },
              h,
            ),
        },
        Scene.given(false),
        Scene.expect(
          Scene.role('switch', { name: 'Enable digest' }),
        ).toHaveAccessibleDescription('A weekly summary.'),
      )
    })
  }

  for (const [name, Table] of [
    ['Tailwind', TailwindTable],
    ['StyleX', StyleXTable],
  ] as const) {
    it(`${name} table renders custom filters between search and columns`, () => {
      Scene.scene(
        {
          update: (model, message) => ({ model: Table.update(model, message) }),
          view: (model, h) =>
            Table.dataTable(
              {
                model,
                toParentMessage: message => message,
                rows: [{ id: '1', name: 'Ada' }],
                columns: [
                  { key: 'name', header: 'Name', cell: row => row.name },
                ],
                rowKey: row => row.id,
                filterText: row => row.name,
                enableColumnVisibility: true,
                toolbarContent: [
                  h.button([h.Type('button')], ['Active users']),
                ],
              },
              h,
            ),
        },
        Scene.given(Table.init()),
        Scene.expect(
          Scene.selector('[data-slot="data-table-toolbar"] input'),
        ).toExist(),
        Scene.expect(Scene.role('button', { name: 'Active users' })).toExist(),
        Scene.expect(Scene.role('button', { name: 'Columns' })).toExist(),
        Scene.type(Scene.role('searchbox'), 'Nobody'),
        Scene.expect(Scene.text('No results.')).toExist(),
      )
    })
  }

  it('publishes dashboard icons and renders a visible fallback for unknown names', () => {
    for (const name of ['banknote', 'user-check', 'mouse-pointer-2']) {
      expect(Icon.hasIcon(name)).toBe(true)
      expect(Icon.iconNames).toContain(name)
    }
    expect(Icon.hasIcon('toString')).toBe(false)
    Scene.scene(
      {
        update: (model: boolean) => ({ model }),
        view: (_model, h) =>
          Icon.icon('unknown-icon', { ariaLabel: 'Example metric' }, h),
      },
      Scene.given(false),
      Scene.expect(Scene.role('img', { name: 'Example metric' })).toHaveAttr(
        'data-icon-missing',
        'unknown-icon',
      ),
      Scene.expect(Scene.selector('svg path')).toExist(),
    )
  })
})
