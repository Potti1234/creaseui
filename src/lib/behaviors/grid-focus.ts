import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

export const GridCell = Schema.Struct({
  row: Schema.Number,
  column: Schema.Number,
})
export type GridCell = typeof GridCell.Type

export const Model = Schema.Struct({
  id: Schema.String,
  maybeActiveCell: Schema.Option(GridCell),
  revealVersion: Schema.optional(Schema.Number),
  pendingReveal: Schema.optional(GridCell),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  MovedFocus: { cell: GridCell },
  FocusedCell: { cell: GridCell },
  CompletedFocusCell: {},
  RevealedCell: { version: Schema.Number },
  CanceledReveal: { version: Schema.Number },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  RequestedReveal: { cell: GridCell, version: Schema.Number },
})
export type OutMessage = typeof OutMessage.Type

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>
type FocusOptions = Readonly<{ requiresReveal?: (cell: GridCell) => boolean }>

export const init = (config: Readonly<{ id: string }>): Model => ({
  id: config.id,
  maybeActiveCell: Option.none(),
})

export const cellId = (id: string, cell: GridCell): string =>
  `${id}-cell-${cell.row}-${cell.column}`

const cellSelector = (id: string, cell: GridCell): string =>
  `[id="${cellId(id, cell).replace(
    /["\\\n\r\f]/gu,
    character => `\\${character.charCodeAt(0).toString(16)} `,
  )}"]`

const sameCell = (a: GridCell, b: GridCell): boolean =>
  a.row === b.row && a.column === b.column

export const isActive = (model: Model, cell: GridCell): boolean =>
  Option.exists(model.maybeActiveCell, active => sameCell(active, cell))

export const FocusCell = Command.define('FocusCell', {
  args: { id: Schema.String, cell: GridCell },
  messages: [Message.CompletedFocusCell],
  execute: ({ id, cell }) =>
    Dom.focus(cellSelector(id, cell)).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusCell()),
    ),
})

export const focus = (
  model: Model,
  cell: GridCell,
  options: FocusOptions = {},
): UpdateReturn => {
  if (options.requiresReveal?.(cell)) {
    const version = (model.revealVersion ?? 0) + 1
    return {
      model: { ...model, revealVersion: version, pendingReveal: cell },
      outMessage: OutMessage.RequestedReveal({ cell, version }),
    }
  }
  return {
    model: { ...model, pendingReveal: undefined, maybeActiveCell: Option.some(cell) },
    commands: [FocusCell({ id: model.id, cell })],
  }
}

export const update = (
  model: Model,
  message: Message,
  options: FocusOptions = {},
): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    MovedFocus: ({ cell }) => focus(model, cell, options),
    FocusedCell: ({ cell }) => ({
      model: { ...model, pendingReveal: undefined, maybeActiveCell: Option.some(cell) },
    }),
    RevealedCell: ({ version }) =>
      version === model.revealVersion && model.pendingReveal !== undefined
        ? focus(model, model.pendingReveal)
        : { model },
    CanceledReveal: ({ version }) => ({
      model: version === model.revealVersion
        ? { ...model, pendingReveal: undefined }
        : model,
    }),
    CompletedFocusCell: () => ({ model }),
  })

export type NavigationInput = Readonly<{
  rows: number
  columns: number
  currentCell: GridCell
  pressedKey: string
  ctrl?: boolean
  direction?: 'ltr' | 'rtl'
  pageSize?: number
  isDisabled?: (cell: GridCell) => boolean
  focusDisabledWithArrows?: boolean
}>

type GridInput = Pick<NavigationInput, 'rows' | 'columns' | 'isDisabled'>

const cells = ({ rows, columns }: GridInput): ReadonlyArray<GridCell> =>
  Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => ({ row, column })),
  ).flat()

export const tabStop = (
  model: Model,
  input: GridInput,
): Option.Option<GridCell> => {
  const enabled = cells(input).filter(cell => !input.isDisabled?.(cell))
  return Option.fromUndefinedOr(
    enabled.find(cell => isActive(model, cell)) ?? enabled[0],
  )
}

export const navigate = ({
  rows,
  columns,
  currentCell,
  pressedKey,
  ctrl = false,
  direction = 'ltr',
  pageSize = 10,
  isDisabled = () => false,
  focusDisabledWithArrows = false,
}: NavigationInput): Option.Option<GridCell> => {
  if (rows <= 0 || columns <= 0) return Option.none()
  if (pressedKey === 'Home' || pressedKey === 'End') {
    const candidates = cells({ rows, columns }).filter(
      cell => (ctrl || cell.row === currentCell.row) && !isDisabled(cell),
    )
    return Option.fromUndefinedOr(
      pressedKey === 'Home' ? candidates[0] : candidates.at(-1),
    )
  }
  const horizontal = pressedKey === 'ArrowLeft' || pressedKey === 'ArrowRight'
  const vertical = pressedKey === 'ArrowUp' || pressedKey === 'ArrowDown'
  const page = pressedKey === 'PageUp' || pressedKey === 'PageDown'
  if (!horizontal && !vertical && !page) return Option.none()
  const step = horizontal
    ? (pressedKey === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1)
    : pressedKey === 'ArrowDown' || pressedKey === 'PageDown'
      ? 1
      : -1
  let row = currentCell.row
  let column = currentCell.column
  if (page)
    row = Math.min(rows - 1, Math.max(0, row + step * Math.max(1, pageSize)))
  else if (horizontal) column += step
  else row += step
  while (row >= 0 && row < rows && column >= 0 && column < columns) {
    const cell = { row, column }
    if ((focusDisabledWithArrows && !page) || !isDisabled(cell))
      return Option.some(cell)
    if (horizontal) column += step
    else row += step
  }
  return Option.none()
}

export type CellInfo = Readonly<{
  cell: GridCell
  isTabStop: boolean
  isActive: boolean
  isDisabled: boolean
  attributes: ReadonlyArray<ChildAttribute>
}>

export type ViewInputs = GridInput &
  Pick<NavigationInput, 'direction' | 'pageSize' | 'focusDisabledWithArrows'> &
  Readonly<{
    toView: (cells: ReadonlyArray<CellInfo>) => Html
  }>

export type Bundle = Readonly<{
  view: SubmodelView<Model, Message, ViewInputs>
  update: typeof update
}>

export const create = (): Bundle => ({
  update,
  view: defineView<Model, Message, ViewInputs>((model, inputs, h) => {
    const stop = tabStop(model, inputs)
    return inputs.toView(
      cells(inputs).map(cell => {
        const isTabStop = Option.exists(stop, target => sameCell(target, cell))
        const isDisabled = inputs.isDisabled?.(cell) ?? false
        return {
          cell,
          isTabStop,
          isActive: isActive(model, cell),
          isDisabled,
          attributes: childAttributes([
            h.Id(cellId(model.id, cell)),
            h.Tabindex(isTabStop ? 0 : -1),
            h.OnFocus(Message.FocusedCell({ cell })),
            h.OnKeyDownPreventDefault((pressedKey, modifiers) =>
              isDisabled && !inputs.focusDisabledWithArrows
                ? Option.none()
                : navigate({
                    ...inputs,
                    currentCell: cell,
                    pressedKey,
                    ctrl: modifiers.ctrlKey || modifiers.metaKey,
                  }).pipe(Option.map(cell => Message.MovedFocus({ cell }))),
            ),
          ]),
        }
      }),
    )
  }),
})

export const view = create().view
