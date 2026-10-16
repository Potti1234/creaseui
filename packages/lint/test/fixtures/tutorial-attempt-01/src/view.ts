import type { Html, HtmlBuilder } from 'foldkit/html'
import { Message, visibleIssues, type Model, type View } from './model'
import { statusNames, statuses, type Issue } from './data'
import {
  appShell,
  sidebar,
  pageHeader,
  toolbar,
  feedback,
} from './design/shell'
import { action } from './design/primitives'
import {
  issueCollection,
  issueGroup,
  issueRow,
  emptyIssues,
} from './design/issue-list'
import {
  statusPicker,
  priorityPicker,
  assigneePicker,
  filterPicker,
  displayPicker,
} from './design/pickers'
import { issueComposer, resetConfirmation } from './design/composer'

const viewTitles: Record<View, string> = {
  all: 'All issues',
  mine: 'My issues',
  active: 'Active issues',
  workspace: 'Workspace experience',
  editor: 'Editor',
}

const rowView = (
  issue: Issue,
  row: Model['rows'][string],
  isSelected: boolean,
  h: HtmlBuilder<Message>,
): Html =>
  issueRow(
    {
      ...issue,
      isSelected,
      statusControl: statusPicker(
        {
          model: row.status,
          value: issue.status,
          context: issue.id,
          toMessage: message =>
            Message.ChangedMenu({
              issueId: issue.id,
              field: 'status',
              message,
            }),
        },
        h,
      ),
      priorityControl: priorityPicker(
        {
          model: row.priority,
          value: issue.priority,
          context: issue.id,
          toMessage: message =>
            Message.ChangedMenu({
              issueId: issue.id,
              field: 'priority',
              message,
            }),
        },
        h,
      ),
      assigneeControl: assigneePicker(
        {
          model: row.assignee,
          value: issue.assignee,
          context: issue.id,
          toMessage: message =>
            Message.ChangedMenu({
              issueId: issue.id,
              field: 'assignee',
              message,
            }),
        },
        h,
      ),
    },
    h,
  )

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const issues = visibleIssues(model)
  const create = Message.OpenedComposer({ status: 'todo' })
  const clear = Message.ClearedFilters()
  return appShell(
    {
      sidebar: sidebar(
        {
          view: model.view,
          counts: {
            all: model.issues.length,
            mine: model.issues.filter(issue => issue.assignee === 'alex')
              .length,
            active: model.issues.filter(
              issue => issue.status === 'progress' || issue.status === 'todo',
            ).length,
          },
          onNavigate: view => Message.ChoseView({ view }),
          onSearch: Message.RequestedSearch(),
          onCreate: create,
          onReset: Message.RequestedReset(),
        },
        h,
      ),
      header: pageHeader(
        {
          title: viewTitles[model.view],
          count: issues.length,
          action: action(
            {
              label: 'New issue',
              icon: 'plus',
              onClick: create,
              keys: 'C',
              id: 'new-issue-trigger',
            },
            h,
          ),
        },
        h,
      ),
      toolbar: toolbar(
        {
          query: model.query,
          onQuery: value => Message.ChangedQuery({ value }),
          filterLabel:
            model.filter === 'high'
              ? 'High priority'
              : model.filter === 'unassigned'
                ? 'Unassigned'
                : '',
          onClear: clear,
          filter: filterPicker(
            {
              model: model.filterMenu,
              value: model.filter,
              toMessage: message => Message.ChangedFilterMenu({ message }),
            },
            h,
          ),
          display: displayPicker(
            {
              model: model.displayMenu,
              byPriority: model.sortedByPriority,
              toMessage: message => Message.ChangedDisplayMenu({ message }),
            },
            h,
          ),
        },
        h,
      ),
      content: issueCollection(
        {
          count: issues.length,
          isSaved: model.storageNotice === '',
          children:
            issues.length === 0
              ? [
                  emptyIssues(
                    {
                      isFiltered: model.query !== '' || model.filter !== 'all',
                      onClear: clear,
                      onCreate: create,
                    },
                    h,
                  ),
                ]
              : statuses.flatMap(status => {
                  const grouped = issues.filter(
                    issue => issue.status === status,
                  )
                  return grouped.length === 0
                    ? []
                    : [
                        issueGroup(
                          {
                            status,
                            label: statusNames[status],
                            count: grouped.length,
                            collapsed: model.collapsed.includes(status),
                            onToggle: Message.ToggledGroup({ status }),
                            onCreate: Message.OpenedComposer({ status }),
                            children: grouped.map(issue =>
                              rowView(
                                issue,
                                model.rows[issue.id]!,
                                model.selectedId === issue.id,
                                h,
                              ),
                            ),
                          },
                          h,
                        ),
                      ]
                }),
        },
        h,
      ),
      overlays: [
        issueComposer(
          {
            model: model.dialog,
            toMessage: message => Message.GotDialog({ message }),
            submitKeys: model.modifierKey + ' ↵',
            title: model.draft.title,
            description: model.draft.description,
            isInvalid: model.attemptedSubmit && model.draft.title.trim() === '',
            onTitle: value => Message.ChangedDraft({ field: 'title', value }),
            onDescription: value =>
              Message.ChangedDraft({ field: 'description', value }),
            onSubmit: Message.SubmittedIssue(),
            properties: [
              statusPicker(
                {
                  model: model.draftMenus.status,
                  value: model.draft.status,
                  context: 'new issue',
                  presentation: 'composer',
                  toMessage: message =>
                    Message.ChangedDraftMenu({ field: 'status', message }),
                },
                h,
              ),
              priorityPicker(
                {
                  model: model.draftMenus.priority,
                  value: model.draft.priority,
                  context: 'new issue',
                  presentation: 'composer',
                  toMessage: message =>
                    Message.ChangedDraftMenu({ field: 'priority', message }),
                },
                h,
              ),
              assigneePicker(
                {
                  model: model.draftMenus.assignee,
                  value: model.draft.assignee,
                  context: 'new issue',
                  presentation: 'composer',
                  toMessage: message =>
                    Message.ChangedDraftMenu({ field: 'assignee', message }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        resetConfirmation(
          {
            model: model.resetDialog,
            toMessage: message => Message.GotResetDialog({ message }),
            onConfirm: Message.ConfirmedReset(),
            onCancel: Message.CanceledReset(),
          },
          h,
        ),
      ],
      notice: feedback(
        {
          notice: model.notice,
          storageNotice: model.storageNotice,
          onDismiss: Message.DismissedNotice(),
        },
        h,
      ),
    },
    h,
  )
}
