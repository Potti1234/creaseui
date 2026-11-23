import { Effect } from 'effect'
import * as Scene from 'foldkit/scene'
import { describe, expect, it } from 'vitest'
import * as Grid from '@/lib/behaviors/grid-focus'

describe('GridFocus view', () => {
  it('renders one tab stop and routes navigation and natural focus', () => {
    const first = Scene.role('button', { name: '0:0' })
    const last = Scene.role('button', { name: '1:1' })
    Scene.scene(
      {
        update: Grid.update,
        view: (model, h) =>
          h.submodel({
            slotId: model.id,
            model,
            view: Grid.view,
            viewInputs: {
              rows: 2,
              columns: 2,
              toView: cells =>
                h.div(
                  [],
                  cells.map(info =>
                    h.button(
                      [...info.attributes, h.Type('button')],
                      [`${info.cell.row}:${info.cell.column}`],
                    ),
                  ),
                ),
            },
            toParentMessage: message => message,
          }),
      },
      Scene.given(Grid.init({ id: 'grid' })),
      Scene.expect(first).toHaveAttr('tabIndex', '0'),
      Scene.focus(last),
      Scene.expectHandled(),
      Scene.expect(last).toHaveAttr('tabIndex', '0'),
      Scene.keydown(last, 'Home'),
      Scene.expectHandled(),
      Scene.Command.resolve(Grid.FocusCell, Grid.Message.CompletedFocusCell()),
      Scene.expect(last).toHaveAttr('tabIndex', '-1'),
      Scene.keydown(first, 'Tab'),
      Scene.expectIgnored(),
    )
  })
  it('completes focus when the cell is missing', async () => {
    await expect(
      Effect.runPromise(
        Grid.FocusCell({ id: 'missing', cell: { row: 0, column: 0 } }).effect,
      ),
    ).resolves.toEqual(Grid.Message.CompletedFocusCell())
  })
})
