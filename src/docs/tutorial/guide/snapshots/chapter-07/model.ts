// @ts-nocheck: snapshot of creaseui-demo chapter-07:src/model.ts
import { Effect, Match as M, Schema as S } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import { Issue, SEED, Status } from './domain'
import { applyTheme } from './theme/mode'
import {
  type PickerContext,
  type PickerField,
  closedMenu,
  withProperty,
} from './design/property-picker'
import * as DropdownMenu from './ui/dropdown-menu'

/* What the main area shows: everything, the signed-in person's issues, one
   team's issues, or a saved view (src/features/views.ts). */
export const View = S.Literals([
  'all',
  'mine',
  'team:eng',
  'team:des',
  'urgent',
  'unassigned',
])
export type View = typeof View.Type

export const Sort = S.Literals(['priority', 'newest'])
export type Sort = typeof Sort.Type

/** The one property menu that is open, or was last open. */
export const OpenPicker = S.Struct({ key: S.String, menu: DropdownMenu.Model })

export const Model = S.Struct({
  issues: S.Array(Issue),
  view: View,
  query: S.String,
  isGrouped: S.Boolean,
  sort: Sort,
  isDark: S.Boolean,
  collapsed: S.Array(Status),
  picker: S.NullOr(OpenPicker),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  SelectedView: { view: View },
  ChangedQuery: { query: S.String },
  ClearedQuery: {},
  ToggledGrouping: {},
  ToggledSort: {},
  ToggledTheme: {},
  AppliedTheme: {},
  ToggledGroup: { status: Status },
  GotPickerMessage: { key: S.String, message: DropdownMenu.Message },
})
export type Message = typeof Message.Type

const ApplyTheme = Command.define('ApplyTheme', {
  args: { isDark: S.Boolean },
  messages: [Message.AppliedTheme],
  execute: ({ isDark }) =>
    applyTheme(isDark).pipe(Effect.as(Message.AppliedTheme())),
})

export const init = (): Update.Return<Model, Message> => ({
  model: {
    issues: SEED,
    view: 'all',
    query: '',
    isGrouped: true,
    sort: 'priority',
    collapsed: [],
    picker: null,
    isDark: false,
  },
})

const FIELDS: ReadonlyArray<PickerField> = ['status', 'priority', 'assignee']

/** The issue id and property a picker key names (`CRE-136--status`). */
const parseKey = (
  key: string,
): Readonly<{ id: string; field: PickerField }> | undefined => {
  const at = key.lastIndexOf('--')
  const field = FIELDS.find(each => each === key.slice(at + 2))
  return at < 0 || field === undefined
    ? undefined
    : { id: key.slice(0, at), field }
}

const menuOf = (model: Model, key: string): DropdownMenu.Model =>
  model.picker?.key === key ? model.picker.menu : closedMenu(key)

/** What the issue rows need to render and route their property pickers. */
export const pickersOf = (model: Model): PickerContext<Message> => ({
  menuFor: key => menuOf(model, key),
  toParentMessage: key => message => Message.GotPickerMessage({ key, message }),
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      SelectedView: ({ view }) => ({ model: { ...model, view, query: '' } }),
      ChangedQuery: ({ query }) => ({ model: { ...model, query } }),
      ClearedQuery: () => ({ model: { ...model, query: '' } }),
      ToggledGrouping: () => ({
        model: { ...model, isGrouped: !model.isGrouped },
      }),
      ToggledSort: () => {
        const sort: Sort = model.sort === 'priority' ? 'newest' : 'priority'
        return { model: { ...model, sort } }
      },
      ToggledTheme: () => ({
        model: { ...model, isDark: !model.isDark },
        commands: [ApplyTheme({ isDark: !model.isDark })],
      }),
      AppliedTheme: () => ({ model }),
      ToggledGroup: ({ status }) => ({
        model: {
          ...model,
          collapsed: model.collapsed.includes(status)
            ? model.collapsed.filter(each => each !== status)
            : [...model.collapsed, status],
        },
      }),
      GotPickerMessage: ({ key, message: menuMessage }) => {
        const result = DropdownMenu.update(menuOf(model, key), menuMessage)
        const target = parseKey(key)
        const chosen = result.outMessage
        const issues =
          chosen === undefined || target === undefined
            ? model.issues
            : model.issues.map(issue =>
                issue.id === target.id
                  ? withProperty(issue, target.field, chosen.value)
                  : issue,
              )
        return {
          model: { ...model, issues, picker: { key, menu: result.model } },
          commands: Command.mapMessages(result.commands, message =>
            Message.GotPickerMessage({ key, message }),
          ),
        }
      },
    }),
  )
