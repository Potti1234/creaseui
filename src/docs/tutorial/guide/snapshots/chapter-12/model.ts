// @ts-nocheck: snapshot of creaseui-demo chapter-12:src/model.ts
import { Effect, Match as M, Schema as S } from 'effect'
import { Command, Dom, Subscription, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import type * as KeyValueStore from 'effect/unstable/persistence/KeyValueStore'

import { Issue, Status } from './domain'
import { initCommandMenu } from './design/command-menu'
import {
  DRAFT_ID,
  TITLE_ID,
  emptyDraft,
  initComposer,
  validateTitle,
} from './design/issue-composer'
import { applyTheme } from './theme/mode'
import {
  type PickerContext,
  type PickerField,
  closedMenu,
  withProperty,
} from './design/property-picker'
import { type Flags, SaveIssues, SaveMessage } from './storage'
import * as CommandUi from './ui/command'
import * as Dialog from './ui/dialog'
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
  'active-bugs',
])
export type View = typeof View.Type

export const Sort = S.Literals(['priority', 'newest'])
export type Sort = typeof Sort.Type

/** The one property menu that is open, or was last open. */
export const OpenPicker = S.Struct({ key: S.String, menu: DropdownMenu.Model })

export const SaveState = S.Literals(['saved', 'failed'])
export type SaveState = typeof SaveState.Type

export const Model = S.Struct({
  issues: S.Array(Issue),
  nextNumber: S.Number,
  view: View,
  query: S.String,
  isGrouped: S.Boolean,
  sort: Sort,
  isDark: S.Boolean,
  collapsed: S.Array(Status),
  picker: S.NullOr(OpenPicker),
  composer: Dialog.Model,
  draft: Issue,
  /** The issue shown on its own page, if any. */
  openIssueId: S.NullOr(S.String),
  /** The title field of that page as typed; the issue keeps its last valid title. */
  issueTitle: S.String,
  issueTitleError: S.NullOr(S.String),
  menu: Dialog.Model,
  menuSearch: CommandUi.Model,
  titleError: S.NullOr(S.String),
  save: SaveState,
  /** Shown once at startup when saved data could not be read. */
  loadNotice: S.NullOr(S.String),
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
  ClickedNewIssue: {},
  GotComposerMessage: { message: Dialog.Message },
  ChangedDraftTitle: { title: S.String },
  SubmittedComposer: {},
  CancelledComposer: {},
  CompletedFocusTitle: {},
  SucceededSave: {},
  FailedSave: { reason: S.String },
  RetriedSave: {},
  DismissedLoadNotice: {},
  OpenedIssue: { id: S.String },
  ClosedIssue: {},
  ChangedIssueTitle: { title: S.String },
  ChangedIssueDescription: { description: S.String },
  PressedCommandMenuKey: {},
  PressedNewIssueKey: {},
  ClickedCommandMenu: {},
  GotMenuMessage: { message: Dialog.Message },
  GotMenuSearchMessage: { message: CommandUi.Message },
})
export type Message = typeof Message.Type

export const ApplyTheme = Command.define('ApplyTheme', {
  args: { isDark: S.Boolean },
  messages: [Message.AppliedTheme],
  execute: ({ isDark }) =>
    applyTheme(isDark).pipe(Effect.as(Message.AppliedTheme())),
})

/** update's result; saving needs the KeyValueStore service. */
type Return = Update.Return<Model, Message, KeyValueStore.KeyValueStore>

export const init = (flags: Flags): Update.Return<Model, Message> => ({
  commands: [ApplyTheme({ isDark: flags.isDark })],
  model: {
    issues: flags.issues,
    nextNumber: flags.nextNumber,
    view: 'all',
    query: '',
    isGrouped: true,
    sort: 'priority',
    collapsed: [],
    picker: null,
    isDark: flags.isDark,
    composer: initComposer(),
    draft: emptyDraft,
    openIssueId: null,
    issueTitle: '',
    issueTitleError: null,
    menu: initCommandMenu().dialog,
    menuSearch: initCommandMenu().command,
    titleError: null,
    save: 'saved',
    loadNotice: flags.notice,
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

const save = (model: Model) =>
  Command.mapMessages(
    [
      SaveIssues({
        issues: model.issues,
        nextNumber: model.nextNumber,
        isDark: model.isDark,
      }),
    ],
    message =>
      message._tag === 'SucceededSave'
        ? Message.SucceededSave()
        : Message.FailedSave({ reason: message.reason }),
  )[0]!

export const FocusTitle = Command.define('FocusComposerTitle', {
  messages: [Message.CompletedFocusTitle],
  execute: Dom.focus(`#${TITLE_ID}`).pipe(
    Effect.ignore,
    Effect.as(Message.CompletedFocusTitle()),
  ),
})

const toComposer = (
  commands: ReadonlyArray<Command.Command<Dialog.Message>> | undefined,
) =>
  Command.mapMessages(commands, message =>
    Message.GotComposerMessage({ message }),
  )

const submit = (model: Model): Return => {
  if (!model.composer.isOpen) return { model }
  const checked = validateTitle(model.draft.title)
  if (!checked.ok)
    return {
      model: { ...model, titleError: checked.error },
      commands: [FocusTitle()],
    }
  // A new issue belongs to the team whose page is open, otherwise to the draft's team.
  const teamId =
    model.view === 'team:des'
      ? 'des'
      : model.view === 'team:eng'
        ? 'eng'
        : model.draft.teamId
  const created: Issue = {
    ...model.draft,
    id: `CRE-${model.nextNumber}`,
    teamId,
    title: checked.title,
    updated: 'Just now',
  }
  const closed = Dialog.close(model.composer)
  const next: Model = {
    ...model,
    issues: [created, ...model.issues],
    nextNumber: model.nextNumber + 1,
    draft: emptyDraft,
    titleError: null,
    composer: closed.model,
  }
  return { model: next, commands: [...toComposer(closed.commands), save(next)] }
}

const toMenu = (
  commands: ReadonlyArray<Command.Command<Dialog.Message>> | undefined,
) =>
  Command.mapMessages(commands, message => Message.GotMenuMessage({ message }))

const openMenu = (model: Model): Return => {
  const opened = Dialog.open(model.menu)
  return {
    model: { ...model, menu: opened.model },
    commands: toMenu(opened.commands),
  }
}

/** Applies an edit to the open issue and saves it. */
const editOpenIssue = (
  model: Model,
  change: (issue: Issue) => Issue,
  extra: Partial<Model> = {},
): Return => {
  const next: Model = {
    ...model,
    ...extra,
    issues: model.issues.map(issue =>
      issue.id === model.openIssueId
        ? { ...change(issue), updated: 'Just now' }
        : issue,
    ),
  }
  return { model: next, commands: [save(next)] }
}

/** What a command menu entry does: the same Message as the control it stands for. */
const runEntry = (model: Model, entry: string): Return => {
  if (entry === 'new-issue') return update(model, Message.ClickedNewIssue())
  if (entry === 'theme') return update(model, Message.ToggledTheme())
  if (entry.startsWith('issue:'))
    return update(
      model,
      Message.OpenedIssue({ id: entry.slice('issue:'.length) }),
    )
  const view = entry.slice('go:'.length)
  return S.is(View)(view)
    ? update(model, Message.SelectedView({ view }))
    : { model }
}

export const update = (model: Model, message: Message): Return =>
  M.value(message).pipe(
    M.tagsExhaustive({
      SelectedView: ({ view }) => ({
        model: { ...model, view, query: '', openIssueId: null },
      }),
      ChangedQuery: ({ query }) => ({
        model: { ...model, query, openIssueId: null },
      }),
      ClearedQuery: () => ({ model: { ...model, query: '' } }),
      ToggledGrouping: () => ({
        model: { ...model, isGrouped: !model.isGrouped },
      }),
      ToggledSort: () => {
        const sort: Sort = model.sort === 'priority' ? 'newest' : 'priority'
        return { model: { ...model, sort } }
      },
      ToggledTheme: () => {
        const next = { ...model, isDark: !model.isDark }
        return {
          model: next,
          commands: [ApplyTheme({ isDark: next.isDark }), save(next)],
        }
      },
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
        const menuCommands = Command.mapMessages(result.commands, inner =>
          Message.GotPickerMessage({ key, message: inner }),
        )
        const withMenu: Model = {
          ...model,
          picker: { key, menu: result.model },
        }
        if (chosen === undefined || target === undefined)
          return { model: withMenu, commands: menuCommands }
        if (target.id === DRAFT_ID)
          return {
            model: {
              ...withMenu,
              draft: withProperty(model.draft, target.field, chosen.value),
            },
            commands: menuCommands,
          }
        const next: Model = {
          ...withMenu,
          issues: model.issues.map(issue =>
            issue.id === target.id
              ? withProperty(issue, target.field, chosen.value)
              : issue,
          ),
        }
        return { model: next, commands: [...menuCommands, save(next)] }
      },
      ClickedNewIssue: () => {
        const opened = Dialog.open(model.composer)
        return {
          model: { ...model, composer: opened.model },
          commands: toComposer(opened.commands),
        }
      },
      GotComposerMessage: ({ message: dialogMessage }) => {
        const result = Dialog.update(model.composer, dialogMessage)
        return {
          model: { ...model, composer: result.model },
          commands: toComposer(result.commands),
        }
      },
      ChangedDraftTitle: ({ title }) => ({
        model: {
          ...model,
          draft: { ...model.draft, title },
          titleError:
            model.titleError === null || !validateTitle(title).ok
              ? model.titleError
              : null,
        },
      }),
      SubmittedComposer: () => submit(model),
      CancelledComposer: () => {
        const closed = Dialog.close(model.composer)
        return {
          model: { ...model, composer: closed.model },
          commands: toComposer(closed.commands),
        }
      },
      CompletedFocusTitle: () => ({ model }),
      SucceededSave: () => ({
        model: { ...model, save: 'saved' as const, loadNotice: null },
      }),
      FailedSave: () => ({ model: { ...model, save: 'failed' as const } }),
      RetriedSave: () => ({ model, commands: [save(model)] }),
      DismissedLoadNotice: () => ({ model: { ...model, loadNotice: null } }),
      OpenedIssue: ({ id }) => {
        const issue = model.issues.find(each => each.id === id)
        return issue === undefined
          ? { model }
          : {
              model: {
                ...model,
                openIssueId: id,
                issueTitle: issue.title,
                issueTitleError: null,
                picker: null,
              },
            }
      },
      ClosedIssue: () => ({ model: { ...model, openIssueId: null } }),
      ChangedIssueTitle: ({ title }) => {
        const checked = validateTitle(title)
        return checked.ok
          ? editOpenIssue(
              model,
              issue => ({ ...issue, title: checked.title }),
              { issueTitle: title, issueTitleError: null },
            )
          : {
              model: {
                ...model,
                issueTitle: title,
                issueTitleError: checked.error,
              },
            }
      },
      ChangedIssueDescription: ({ description }) =>
        editOpenIssue(model, issue => ({ ...issue, description })),
      ClickedCommandMenu: () => openMenu(model),
      PressedCommandMenuKey: () => {
        if (!model.menu.isOpen) return openMenu(model)
        const closed = Dialog.close(model.menu)
        return {
          model: { ...model, menu: closed.model },
          commands: toMenu(closed.commands),
        }
      },
      PressedNewIssueKey: () =>
        model.composer.isOpen || model.menu.isOpen
          ? { model }
          : update(model, Message.ClickedNewIssue()),
      GotMenuMessage: ({ message: dialogMessage }) => {
        const result = Dialog.update(model.menu, dialogMessage)
        return {
          model: { ...model, menu: result.model },
          commands: toMenu(result.commands),
        }
      },
      GotMenuSearchMessage: ({ message: searchMessage }) => {
        const result = CommandUi.update(model.menuSearch, searchMessage)
        const commands = Command.mapMessages(result.commands, inner =>
          Message.GotMenuSearchMessage({ message: inner }),
        )
        const chosen = result.outMessage
        if (chosen === undefined || chosen._tag !== 'Selected')
          return { model: { ...model, menuSearch: result.model }, commands }
        const closed = Dialog.close(model.menu)
        const ran = runEntry(
          {
            ...model,
            menu: closed.model,
            menuSearch: initCommandMenu().command,
          },
          chosen.value,
        )
        return {
          model: ran.model,
          commands: [...toMenu(closed.commands), ...(ran.commands ?? [])],
        }
      },
    }),
  )

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  // Ctrl+K (Cmd+K) opens the command menu anywhere; C starts a new issue
  // when no dialog is open and focus is not in a field.
  appShortcuts: entry(
    { isDialogOpen: S.Boolean },
    {
      modelToDependencies: model => ({
        isDialogOpen: model.composer.isOpen || model.menu.isOpen,
      }),
      dependenciesToStream: ({ isDialogOpen }) =>
        Subscription.keyBindings<Message>({
          bindings: [
            {
              keys: 'Mod+K',
              whileTyping: 'Allow',
              mapEvent: () => Message.PressedCommandMenuKey(),
            },
            {
              keys: 'C',
              isEnabled: !isDialogOpen,
              mapEvent: () => Message.PressedNewIssueKey(),
            },
          ],
        }),
    },
  ),
  composerShortcut: entry(
    { isComposerOpen: S.Boolean },
    {
      modelToDependencies: model => ({ isComposerOpen: model.composer.isOpen }),
      dependenciesToStream: ({ isComposerOpen }) =>
        Subscription.keyBindings<Message>({
          bindings: [
            {
              keys: 'Mod+Enter',
              isEnabled: isComposerOpen,
              whileTyping: 'Allow',
              mapEvent: () => Message.SubmittedComposer(),
            },
          ],
        }),
    },
  ),
}))

export { SaveMessage }
