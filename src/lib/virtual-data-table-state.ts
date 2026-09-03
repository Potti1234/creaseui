import { VirtualList } from '@foldkit/ui'
import { Schema as S } from 'effect'
import { Command, Subscription } from 'foldkit'
import { m } from 'foldkit/message'

export const Model = S.Struct({
  filter: S.String,
  sortKey: S.String,
  sortDirection: S.Literals(['ascending', 'descending']),
  selectedRowKeys: S.Array(S.String),
  list: VirtualList.Model,
})
export type Model = typeof Model.Type

export const Filtered = m('VirtualDataTableFiltered', { value: S.String })
export const Sorted = m('VirtualDataTableSorted', { key: S.String })
export const ToggledRow = m('VirtualDataTableToggledRow', { key: S.String, isSelected: S.Boolean })
export const ToggledRows = m('VirtualDataTableToggledRows', { keys: S.Array(S.String), isSelected: S.Boolean })
export const GotVirtualListMessage = m('GotVirtualDataTableListMessage', { message: VirtualList.Message })
export const Message = S.Union([Filtered, Sorted, ToggledRow, ToggledRows, GotVirtualListMessage])
export type Message = typeof Message.Type

export const init = (id: string, rowHeightPx = 52): Model => ({
  filter: '',
  sortKey: '',
  sortDirection: 'ascending',
  selectedRowKeys: [],
  list: VirtualList.init({ id, rowHeightPx }),
})

const withMembership = (values: ReadonlyArray<string>, key: string, included: boolean): ReadonlyArray<string> =>
  included ? [...new Set([...values, key])] : values.filter((value) => value !== key)

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'VirtualDataTableFiltered':
      return [{ ...model, filter: message.value }, []]
    case 'VirtualDataTableSorted':
      return [{
        ...model,
        sortKey: message.key,
        sortDirection: model.sortKey === message.key && model.sortDirection === 'ascending' ? 'descending' : 'ascending',
      }, []]
    case 'VirtualDataTableToggledRow':
      return [{ ...model, selectedRowKeys: withMembership(model.selectedRowKeys, message.key, message.isSelected) }, []]
    case 'VirtualDataTableToggledRows':
      return [{
        ...model,
        selectedRowKeys: message.keys.reduce(
          (keys, key) => withMembership(keys, key, message.isSelected),
          model.selectedRowKeys,
        ),
      }, []]
    case 'GotVirtualDataTableListMessage': {
      const [list, commands] = VirtualList.update(model.list, message.message)
      return [
        { ...model, list },
        Command.mapMessages(commands, (next) => GotVirtualListMessage({ message: next })),
      ]
    }
  }
}

export const subscriptions = Subscription.lift(VirtualList.subscriptions)<Model, Message>({
  toChildModel: (model) => model.list,
  toParentMessage: (message) => GotVirtualListMessage({ message }),
})

