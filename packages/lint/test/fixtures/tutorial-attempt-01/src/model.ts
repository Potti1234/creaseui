import { Effect, Schema as S } from 'effect'
import { Command, Dom, Subscription, type Runtime, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import * as Menu from '@/ui/dropdown-menu'
import * as Dialog from '@/ui/dialog'
import {
  Issue,
  Status,
  Priority,
  Assignee,
  priorities,
  seedIssues,
  type Issue as IssueValue,
} from './data'

export const View = S.Literals(['all', 'mine', 'active', 'workspace', 'editor'])
export type View = typeof View.Type
export const Field = S.Literals(['status', 'priority', 'assignee'])
export type Field = typeof Field.Type
const RowUi = S.Struct({
  status: Menu.Model,
  priority: Menu.Model,
  assignee: Menu.Model,
})
const Draft = S.Struct({
  title: S.String,
  description: S.String,
  status: Status,
  priority: Priority,
  assignee: Assignee,
})
export const Persisted = S.Struct({
  version: S.Literal(1),
  issues: S.Array(Issue),
  nextId: S.Number,
})
export const Flags = S.Struct({
  issues: S.Array(Issue),
  nextId: S.Number,
  storageNotice: S.String,
  modifierKey: S.String,
})
export const Model = S.Struct({
  issues: S.Array(Issue),
  nextId: S.Number,
  rows: S.Record(S.String, RowUi),
  view: View,
  query: S.String,
  filter: S.String,
  filterMenu: Menu.Model,
  displayMenu: Menu.Model,
  sortedByPriority: S.Boolean,
  collapsed: S.Array(Status),
  selectedId: S.String,
  dialog: Dialog.Model,
  resetDialog: Dialog.Model,
  draft: Draft,
  draftMenus: RowUi,
  attemptedSubmit: S.Boolean,
  notice: S.String,
  storageNotice: S.String,
  modifierKey: S.String,
})
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  ChoseView: { view: View },
  ChangedQuery: { value: S.String },
  ChangedMenu: { issueId: S.String, field: Field, message: Menu.Message },
  ChangedFilterMenu: { message: Menu.Message },
  ChangedDisplayMenu: { message: Menu.Message },
  ToggledGroup: { status: Status },
  SelectedIssue: { id: S.String },
  OpenedComposer: { status: Status },
  GotDialog: { message: Dialog.Message },
  RequestedReset: {},
  GotResetDialog: { message: Dialog.Message },
  ConfirmedReset: {},
  CanceledReset: {},
  ChangedDraft: {
    field: S.Literals(['title', 'description']),
    value: S.String,
  },
  ChangedDraftMenu: { field: Field, message: Menu.Message },
  SubmittedIssue: {},
  ClearedFilters: {},
  RequestedSearch: {},
  DismissedNotice: {},
  Persisted: {},
  FailedPersistence: {},
  CompletedEffect: {},
})
export type Message = typeof Message.Type

const rowUi = (id: string) => ({
  status: Menu.init({ id: 'status-' + id }),
  priority: Menu.init({ id: 'priority-' + id }),
  assignee: Menu.init({ id: 'assignee-' + id }),
})
const emptyDraft = {
  title: '',
  description: '',
  status: 'todo' as const,
  priority: 'none' as const,
  assignee: 'none' as const,
}
export const storageKey = 'crease-tasks-prototype-v1'
export const flags = Effect.sync(() => {
  const modifierKey = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved !== null) {
      const data = S.decodeUnknownSync(Persisted)(JSON.parse(saved))
      return {
        issues: data.issues,
        nextId: data.nextId,
        storageNotice: '',
        modifierKey,
      }
    }
  } catch {
    return {
      issues: seedIssues,
      nextId: 131,
      storageNotice:
        'Saved data could not be read. Showing the sample workspace.',
      modifierKey,
    }
  }
  return { issues: seedIssues, nextId: 131, storageNotice: '', modifierKey }
})
export const init: Runtime.ApplicationInit<
  Model,
  Message,
  typeof Flags.Type
> = data => ({
  model: {
    issues: data.issues,
    nextId: data.nextId,
    rows: Object.fromEntries(
      data.issues.map(issue => [issue.id, rowUi(issue.id)]),
    ),
    view: 'all',
    query: '',
    filter: 'all',
    filterMenu: Menu.init({ id: 'issue-filter' }),
    displayMenu: Menu.init({ id: 'issue-display' }),
    sortedByPriority: false,
    collapsed: ['done'],
    selectedId: '',
    dialog: Dialog.init({
      id: 'new-issue',
      isAnimated: true,
      focusSelector: '#new-issue-title',
    }),
    resetDialog: Dialog.init({ id: 'reset-workspace', isAnimated: true }),
    draft: emptyDraft,
    draftMenus: rowUi('draft'),
    attemptedSubmit: false,
    notice: '',
    storageNotice: data.storageNotice,
    modifierKey: data.modifierKey,
  },
})
const Persist = Command.define('PersistIssues', {
  args: { issues: S.Array(Issue), nextId: S.Number },
  messages: [Message.Persisted, Message.FailedPersistence],
  execute: data =>
    Effect.sync(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ version: 1, ...data }),
        )
        return Message.Persisted()
      } catch {
        return Message.FailedPersistence()
      }
    }),
})
const Focus = Command.define('FocusTaskControl', {
  args: { selector: S.String },
  messages: [Message.CompletedEffect],
  execute: ({ selector }) =>
    Dom.focus(selector, { preventScroll: true }).pipe(
      Effect.catch(() =>
        Dom.focus('#issue-list-heading', { preventScroll: true }),
      ),
      Effect.match({
        onFailure: () => Message.CompletedEffect(),
        onSuccess: () => Message.CompletedEffect(),
      }),
    ),
})
const persist = (model: Model) =>
  Persist({ issues: model.issues, nextId: model.nextId })
const menuFocus = (before: Menu.Model, after: Menu.Model) =>
  after.isOpen && (!before.isOpen || before.activeIndex !== after.activeIndex)
    ? [
        Focus({
          selector:
            '#' + after.id + '-content [data-active="true"][role^="menuitem"]',
        }),
      ]
    : before.isOpen && !after.isOpen
      ? [Focus({ selector: '#' + after.id + '-trigger' })]
      : []

export const visibleIssues = (model: Model): readonly IssueValue[] => {
  const query = model.query.trim().toLowerCase()
  const issues = model.issues.filter(
    issue =>
      (model.view !== 'mine' || issue.assignee === 'alex') &&
      (model.view !== 'active' ||
        issue.status === 'todo' ||
        issue.status === 'progress') &&
      (model.view !== 'workspace' ||
        issue.project === 'Workspace experience') &&
      (model.view !== 'editor' || issue.project === 'Editor') &&
      (model.filter !== 'high' ||
        issue.priority === 'urgent' ||
        issue.priority === 'high') &&
      (model.filter !== 'unassigned' || issue.assignee === 'none') &&
      (query === '' ||
        (issue.id + ' ' + issue.title + ' ' + issue.project)
          .toLowerCase()
          .includes(query)),
  )
  return model.sortedByPriority
    ? [...issues].sort(
        (a, b) =>
          priorities.indexOf(a.priority) - priorities.indexOf(b.priority),
      )
    : issues
}

const selectedFields = (
  field: Field,
  value: string,
): Partial<Pick<IssueValue, 'status' | 'priority' | 'assignee'>> => {
  switch (field) {
    case 'status':
      return S.is(Status)(value) ? { status: value } : {}
    case 'priority':
      return S.is(Priority)(value) ? { priority: value } : {}
    case 'assignee':
      return S.is(Assignee)(value) ? { assignee: value } : {}
  }
}

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ChoseView':
      return {
        model: {
          ...model,
          view: message.view,
          query: '',
          filter: 'all',
          selectedId: '',
        },
      }
    case 'ChangedQuery':
      return { model: { ...model, query: message.value } }
    case 'SelectedIssue':
      return {
        model: {
          ...model,
          selectedId: model.selectedId === message.id ? '' : message.id,
        },
      }
    case 'ToggledGroup':
      return {
        model: {
          ...model,
          collapsed: model.collapsed.includes(message.status)
            ? model.collapsed.filter(status => status !== message.status)
            : [...model.collapsed, message.status],
        },
      }
    case 'ClearedFilters':
      return { model: { ...model, query: '', filter: 'all' } }
    case 'RequestedSearch':
      return { model, commands: [Focus({ selector: '#issue-search' })] }
    case 'ChangedMenu': {
      const before = model.rows[message.issueId]?.[message.field]
      if (before === undefined) return { model }
      const result = Menu.update(before, message.message)
      let next = {
        ...model,
        rows: {
          ...model.rows,
          [message.issueId]: {
            ...model.rows[message.issueId],
            [message.field]: result.model,
          },
        },
      }
      if (result.outMessage !== undefined) {
        const value = result.outMessage.value
        next = {
          ...next,
          issues: model.issues.map(issue =>
            issue.id === message.issueId
              ? { ...issue, ...selectedFields(message.field, value) }
              : issue,
          ),
          collapsed:
            message.field === 'status'
              ? model.collapsed.filter(status => status !== value)
              : model.collapsed,
        }
      }
      return {
        model: next,
        commands: [
          ...menuFocus(before, result.model),
          ...(result.outMessage === undefined ? [] : [persist(next)]),
        ],
      }
    }
    case 'ChangedFilterMenu': {
      const result = Menu.update(model.filterMenu, message.message)
      return {
        model: {
          ...model,
          filterMenu: result.model,
          filter: result.outMessage?.value ?? model.filter,
        },
        commands: menuFocus(model.filterMenu, result.model),
      }
    }
    case 'ChangedDisplayMenu': {
      const result = Menu.update(model.displayMenu, message.message)
      return {
        model: {
          ...model,
          displayMenu: result.model,
          sortedByPriority:
            result.outMessage === undefined
              ? model.sortedByPriority
              : result.outMessage.value === 'priority',
        },
        commands: menuFocus(model.displayMenu, result.model),
      }
    }
    case 'OpenedComposer': {
      const result = Dialog.open(model.dialog)
      return {
        model: {
          ...model,
          dialog: result.model,
          draft: { ...model.draft, status: message.status },
          attemptedSubmit: false,
        },
        commands: Command.mapMessages(result.commands ?? [], message =>
          Message.GotDialog({ message }),
        ),
      }
    }
    case 'GotDialog': {
      const result = Dialog.update(model.dialog, message.message)
      return {
        model: { ...model, dialog: result.model },
        commands: Command.mapMessages(result.commands ?? [], message =>
          Message.GotDialog({ message }),
        ),
      }
    }
    case 'RequestedReset': {
      const result = Dialog.open(model.resetDialog)
      return {
        model: { ...model, resetDialog: result.model },
        commands: Command.mapMessages(result.commands ?? [], message =>
          Message.GotResetDialog({ message }),
        ),
      }
    }
    case 'GotResetDialog': {
      const result = Dialog.update(model.resetDialog, message.message)
      return {
        model: { ...model, resetDialog: result.model },
        commands: Command.mapMessages(result.commands ?? [], message =>
          Message.GotResetDialog({ message }),
        ),
      }
    }
    case 'ConfirmedReset': {
      const result = Dialog.close(model.resetDialog)
      const next = {
        ...model,
        issues: seedIssues,
        nextId: 131,
        rows: Object.fromEntries(
          seedIssues.map(issue => [issue.id, rowUi(issue.id)]),
        ),
        resetDialog: result.model,
        view: 'all' as const,
        query: '',
        filter: 'all',
        selectedId: '',
        sortedByPriority: false,
        collapsed: ['done'] as readonly Status[],
        draft: emptyDraft,
        draftMenus: rowUi('draft'),
        notice: 'Sample workspace restored',
      }
      return {
        model: next,
        commands: [
          persist(next),
          ...Command.mapMessages(result.commands ?? [], message =>
            Message.GotResetDialog({ message }),
          ),
        ],
      }
    }
    case 'CanceledReset': {
      const result = Dialog.close(model.resetDialog)
      return {
        model: { ...model, resetDialog: result.model },
        commands: Command.mapMessages(result.commands ?? [], message =>
          Message.GotResetDialog({ message }),
        ),
      }
    }
    case 'ChangedDraft':
      return {
        model: {
          ...model,
          draft: { ...model.draft, [message.field]: message.value },
        },
      }
    case 'ChangedDraftMenu': {
      const before = model.draftMenus[message.field]
      const result = Menu.update(before, message.message)
      return {
        model: {
          ...model,
          draftMenus: { ...model.draftMenus, [message.field]: result.model },
          draft:
            result.outMessage === undefined
              ? model.draft
              : {
                  ...model.draft,
                  ...selectedFields(message.field, result.outMessage.value),
                },
        },
        commands: menuFocus(before, result.model),
      }
    }
    case 'SubmittedIssue': {
      if (model.draft.title.trim() === '')
        return {
          model: { ...model, attemptedSubmit: true },
          commands: [Focus({ selector: '#new-issue-title' })],
        }
      const issue: IssueValue = {
        id: 'CRE-' + model.nextId,
        ...model.draft,
        title: model.draft.title.trim(),
        project: model.view === 'editor' ? 'Editor' : 'Workspace experience',
        label: '',
      }
      const result = Dialog.close(model.dialog)
      const next = {
        ...model,
        issues: [issue, ...model.issues],
        rows: { ...model.rows, [issue.id]: rowUi(issue.id) },
        nextId: model.nextId + 1,
        dialog: result.model,
        draft: emptyDraft,
        attemptedSubmit: false,
        notice: issue.id + ' created',
        query: '',
        filter: 'all',
        selectedId: issue.id,
        collapsed: model.collapsed.filter(status => status !== issue.status),
      }
      return {
        model: next,
        commands: [
          persist(next),
          ...Command.mapMessages(result.commands ?? [], message =>
            Message.GotDialog({ message }),
          ),
        ],
      }
    }
    case 'FailedPersistence':
      return {
        model: {
          ...model,
          storageNotice:
            'Your changes are visible, but could not be saved in this browser.',
        },
      }
    case 'Persisted':
      return { model: { ...model, storageNotice: '' } }
    case 'DismissedNotice':
      return { model: { ...model, notice: '' } }
    case 'CompletedEffect':
      return { model }
  }
}

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  shortcuts: entry(
    {
      isComposerOpen: S.Boolean,
      isResetOpen: S.Boolean,
      isMenuOpen: S.Boolean,
    },
    {
      modelToDependencies: model => ({
        isComposerOpen: model.dialog.isOpen,
        isResetOpen: model.resetDialog.isOpen,
        isMenuOpen: [
          model.filterMenu,
          model.displayMenu,
          ...Object.values(model.rows).flatMap(row => Object.values(row)),
          ...Object.values(model.draftMenus),
        ].some(menu => menu.isOpen),
      }),
      dependenciesToStream: ({ isComposerOpen, isResetOpen, isMenuOpen }) =>
        Subscription.keyBindings<Message>({
          bindings: [
            {
              keys: 'c',
              isEnabled: !isComposerOpen && !isResetOpen && !isMenuOpen,
              mapEvent: () => Message.OpenedComposer({ status: 'todo' }),
            },
            {
              keys: '/',
              isEnabled: !isComposerOpen && !isResetOpen && !isMenuOpen,
              mapEvent: () => Message.RequestedSearch(),
            },
            {
              keys: 'Mod+Enter',
              whileTyping: 'Allow',
              isEnabled: isComposerOpen && !isMenuOpen,
              mapEvent: () => Message.SubmittedIssue(),
            },
          ],
        }),
    },
  ),
}))
