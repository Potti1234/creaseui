// @ts-nocheck: snapshot of creaseui-demo chapter-05:src/domain.ts
import { Schema as S } from 'effect'

export const Status = S.Literals([
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
])
export type Status = typeof Status.Type

export const Priority = S.Literals(['urgent', 'high', 'medium', 'low', 'none'])
export type Priority = typeof Priority.Type

export const Person = S.Struct({
  id: S.String,
  name: S.String,
  initials: S.String,
})
export type Person = typeof Person.Type

export const Issue = S.Struct({
  id: S.String,
  title: S.String,
  status: Status,
  priority: Priority,
  assigneeId: S.NullOr(S.String),
  labels: S.Array(S.String),
  updated: S.String,
})
export type Issue = typeof Issue.Type

/* Workflow order, as the list groups it. */
export const STATUSES: ReadonlyArray<Status> = [
  'in_review',
  'in_progress',
  'todo',
  'backlog',
  'done',
]

export const STATUS_LABEL: Readonly<Record<Status, string>> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export const PRIORITY_LABEL: Readonly<Record<Priority, string>> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
}

export const PRIORITY_RANK: Readonly<Record<Priority, number>> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
}

export const PEOPLE: ReadonlyArray<Person> = [
  { id: 'alex', name: 'Alex Morgan', initials: 'AM' },
  { id: 'sam', name: 'Sam Rivera', initials: 'SR' },
  { id: 'jo', name: 'Jo Tanaka', initials: 'JT' },
]

export const ME = 'alex'

export const personOf = (id: string | null): Person | undefined =>
  PEOPLE.find(person => person.id === id)

export const SEED: ReadonlyArray<Issue> = [
  {
    id: 'CRE-142',
    title: 'Keyboard focus is lost after changing an issue status',
    status: 'in_review',
    priority: 'urgent',
    assigneeId: 'alex',
    labels: ['Bug'],
    updated: 'Oct 26',
  },
  {
    id: 'CRE-139',
    title: 'Group headers stay visible while the list scrolls',
    status: 'in_review',
    priority: 'medium',
    assigneeId: 'jo',
    labels: ['Design'],
    updated: 'Oct 25',
  },
  {
    id: 'CRE-137',
    title: 'Assignee picker filters by name and email',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 26',
  },
  {
    id: 'CRE-136',
    title:
      'Very long issue titles wrap the row and push the assignee out of view on narrow windows',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'sam',
    labels: ['Bug', 'Design'],
    updated: 'Oct 24',
  },
  {
    id: 'CRE-133',
    title: 'Draft of a new issue survives closing the composer',
    status: 'in_progress',
    priority: 'low',
    assigneeId: 'jo',
    labels: ['Feature'],
    updated: 'Oct 23',
  },
  {
    id: 'CRE-131',
    title: 'Search matches issue identifiers',
    status: 'todo',
    priority: 'high',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 22',
  },
  {
    id: 'CRE-128',
    title: 'Empty state for a filter without results',
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    labels: ['Design'],
    updated: 'Oct 21',
  },
  {
    id: 'CRE-127',
    title: 'Priority icons have enough contrast in the dark theme',
    status: 'todo',
    priority: 'low',
    assigneeId: 'sam',
    labels: ['Accessibility'],
    updated: 'Oct 21',
  },
  {
    id: 'CRE-124',
    title: 'Undo for a status change',
    status: 'todo',
    priority: 'none',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 20',
  },
  {
    id: 'CRE-120',
    title: 'Board view with drag and drop between columns',
    status: 'backlog',
    priority: 'medium',
    assigneeId: null,
    labels: ['Feature'],
    updated: 'Oct 18',
  },
  {
    id: 'CRE-118',
    title: 'Export the current view as CSV',
    status: 'backlog',
    priority: 'low',
    assigneeId: 'jo',
    labels: ['Feature'],
    updated: 'Oct 17',
  },
  {
    id: 'CRE-115',
    title: 'Command menu opens with Ctrl+K',
    status: 'backlog',
    priority: 'none',
    assigneeId: null,
    labels: [],
    updated: 'Oct 15',
  },
  {
    id: 'CRE-110',
    title: 'Sidebar shows the number of open issues',
    status: 'done',
    priority: 'medium',
    assigneeId: 'sam',
    labels: ['Design'],
    updated: 'Oct 14',
  },
  {
    id: 'CRE-104',
    title: 'Issues persist in browser storage',
    status: 'done',
    priority: 'high',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 12',
  },
]
