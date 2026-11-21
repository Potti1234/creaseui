import { Option, Schema } from 'effect'
import { Command } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Picker from '@/lib/behaviors/scroll-picker'
import {
  definePreviewProgram,
  foldkitApplication,
  type ErasedPreviewProgram,
} from '@/docs/components/pages/authored-page'
import type { DocsExample } from '@/docs/components/page-definition'
import { timeInputFixtures } from '@/docs/components/pages/time-input/shared'

const Wheel = Picker.create()
const Part = Schema.Literals(['hour', 'minute'])
const PreviewModel = Schema.Struct({
  _docsPage: Schema.Literal('scroll-picker'),
  hour: Picker.Model,
  minute: Picker.Model,
  selectedHour: Schema.Int,
  selectedMinute: Schema.Int,
})
const PreviewMessage = defineMessageUnion({
  GotPickerMessage: { part: Part, message: Picker.Message },
  SelectedOption: { part: Part, index: Schema.Int },
})
type PreviewModel = typeof PreviewModel.Type
type PreviewMessage = typeof PreviewMessage.Type
export type Classes = Readonly<
  Record<
    | 'shell'
    | 'caption'
    | 'time'
    | 'wheels'
    | 'column'
    | 'label'
    | 'list'
    | 'option'
    | 'hint',
    string
  >
>

export const previewView =
  (classes: Classes) =>
  (_index: number, model: PreviewModel, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [h.Class(classes.shell)],
      [
        h.p([h.Class(classes.caption)], ['SCROLL TO SET YOUR TIME']),
        h.p(
          [h.Class(classes.time), h.DataAttribute('slot', 'picker-value')],
          [
            `${String(model.selectedHour).padStart(2, '0')}:${String(model.selectedMinute * 5).padStart(2, '0')}`,
          ],
        ),
        h.div(
          [h.Class(classes.wheels)],
          (['hour', 'minute'] as const).map(part => {
            const count = part === 'hour' ? 24 : 12
            const selected =
              part === 'hour' ? model.selectedHour : model.selectedMinute
            return h.div(
              [h.Class(classes.column)],
              [
                h.p(
                  [h.Class(classes.label)],
                  [part === 'hour' ? 'Hours' : 'Minutes'],
                ),
                h.submodel({
                  slotId: model[part].id,
                  model: model[part],
                  view: Wheel.view,
                  toParentMessage: message =>
                    PreviewMessage.GotPickerMessage({ part, message }),
                  viewInputs: {
                    count,
                    toView: ({ attributes, items }) =>
                      h.div(
                        [
                          ...attributes,
                          h.Class(classes.list),
                          h.Role('listbox'),
                          h.AriaLabel(part === 'hour' ? 'Hours' : 'Minutes'),
                          h.AriaOrientation('vertical'),
                          h.OnKeyDownPreventDefault(key => {
                            const index =
                              key === 'Home'
                                ? 0
                                : key === 'End'
                                  ? count - 1
                                  : key === 'ArrowDown'
                                    ? Math.min(count - 1, selected + 1)
                                    : key === 'ArrowUp'
                                      ? Math.max(0, selected - 1)
                                      : undefined
                            return index === undefined
                              ? Option.none()
                              : Option.some(
                                  PreviewMessage.SelectedOption({
                                    part,
                                    index,
                                  }),
                                )
                          }),
                        ],
                        items.map(({ index, attributes: itemAttributes }) =>
                          h.div(
                            [
                              ...itemAttributes,
                              h.Class(classes.option),
                              h.Role('option'),
                              h.Tabindex(index === selected ? 0 : -1),
                              h.AriaSelected(index === selected),
                              h.OnClick(
                                PreviewMessage.SelectedOption({ part, index }),
                              ),
                            ],
                            [
                              String(
                                part === 'hour' ? index : index * 5,
                              ).padStart(2, '0'),
                            ],
                          ),
                        ),
                      ),
                  },
                }),
              ],
            )
          }),
        ),
        h.p(
          [h.Class(classes.hint)],
          ['Scroll, drag, or use ↑ ↓ and Page Up / Down.'],
        ),
      ],
    )

export const createPreview = (classes: Classes) =>
  definePreviewProgram<PreviewModel, PreviewMessage>({
    Model: PreviewModel,
    Message: PreviewMessage,
    init: index => ({
      _docsPage: 'scroll-picker',
      hour: Picker.init({ id: `docs-picker-${index}-hour` }),
      minute: Picker.init({ id: `docs-picker-${index}-minute` }),
      selectedHour: 9,
      selectedMinute: 6,
    }),
    update: (model, message) => {
      const part = message.part
      const childMessage =
        message._tag === 'SelectedOption'
          ? Picker.Message.ChangedSelection({ index: message.index })
          : message.message
      const next = Picker.update(model[part], childMessage)
      const selected =
        message._tag === 'SelectedOption'
          ? message.index
          : next.outMessage?.index
      return {
        model: {
          ...model,
          [part]: next.model,
          ...(selected === undefined
            ? {}
            : part === 'hour'
              ? { selectedHour: selected }
              : { selectedMinute: selected }),
        },
        commands: Command.mapMessages(next.commands ?? [], message =>
          PreviewMessage.GotPickerMessage({ part, message }),
        ),
      }
    },
    view: previewView(classes),
  })

export const withScrollPicker = (
  base: ErasedPreviewProgram,
  picker: ErasedPreviewProgram,
): ErasedPreviewProgram => ({
  Model: Schema.Union([base.Model, picker.Model]),
  Message: base.Message,
  init: index =>
    index === timeInputFixtures.length ? picker.init(index) : base.init(index),
  update: (model, message) =>
    typeof model === 'object' && model !== null && 'hour' in model
      ? picker.update(model, message)
      : base.update(model, message),
  view: (index, model, h) =>
    index === timeInputFixtures.length
      ? picker.view(index, model, h)
      : base.view(index, model, h),
})

export const scrollPickerExamples = (
  renderer: 'tailwind' | 'stylex' | 'pleat',
): readonly DocsExample[] => [
  {
    title: 'Time wheels',
    keepIdsCanonical: true,
    description:
      'Native scrolling, pointer dragging and keyboard paging with parent-owned selection.',
    code: foldkitApplication({
      title: 'ScrollPicker — Hour wheel',
      imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, type Update } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Picker from '@/lib/behaviors/scroll-picker'
import type { TimeValue } from '@/${renderer === 'tailwind' ? 'ui' : renderer}/time-input'
const Wheel = Picker.create()`,
      model: `export const Model = S.Struct({ wheel: Picker.Model, selected: S.Int })
export type Model = typeof Model.Type`,
      messages: `export const Message = defineMessageUnion({ GotPickerMessage: { message: Picker.Message } })
export type Message = typeof Message.Type`,
      init: `export const init = (): Update.Return<Model, Message> => ({ model: { wheel: Picker.init({ id: 'hours' }), selected: 9 } })`,
      update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  const next = Picker.update(model.wheel, message.message)
  return { model: { wheel: next.model, selected: next.outMessage?.index ?? model.selected },
    commands: Command.mapMessages(next.commands ?? [], message => Message.GotPickerMessage({ message })) }
}`,
      view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const value: TimeValue = String(model.selected).padStart(2, '0') + ':00'
  return { title: 'Hour wheel', body: h.div([], [
    h.p([], [value]),
    h.submodel({ slotId: model.wheel.id, model: model.wheel, view: Wheel.view,
      toParentMessage: message => Message.GotPickerMessage({ message }),
      viewInputs: { count: 24, toView: ({ attributes, items }) => h.div([
        ...attributes, h.Role('listbox'), h.AriaLabel('Hours'),
        h.Style({ height: '180px', boxSizing: 'border-box', paddingBlock: '72px', overflowY: 'auto', scrollSnapType: 'y mandatory', width: '96px' }),
      ], items.map(({ index, attributes }) => h.div([
        ...attributes, h.Role('option'), h.AriaSelected(index === model.selected), h.Tabindex(index === model.selected ? 0 : -1),
        h.Style({ height: '36px', scrollSnapAlign: 'center', textAlign: 'center', opacity: 'calc(1 - min(1, abs(var(--picker-offset, 0)) * .3))' }),
      ], [String(index).padStart(2, '0')]))), },
    }),
  ]) }
}`,
    }),
  },
]
