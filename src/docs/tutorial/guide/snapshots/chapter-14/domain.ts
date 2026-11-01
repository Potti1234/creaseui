// @ts-nocheck: snapshot of creaseui-demo chapter-14:src/domain.ts
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

export const Team = S.Struct({
  id: S.String,
  name: S.String,
  initial: S.String,
})
export type Team = typeof Team.Type

export const TEAMS: ReadonlyArray<Team> = [
  { id: 'eng', name: 'Engineering', initial: 'E' },
  { id: 'des', name: 'Design', initial: 'D' },
]

export const Issue = S.Struct({
  id: S.String,
  teamId: S.String,
  title: S.String,
  description: S.String,
  status: Status,
  priority: Priority,
  assigneeId: S.NullOr(S.String),
  labels: S.Array(S.String),
  updated: S.String,
})
export type Issue = typeof Issue.Type

/* The order the list groups issues in: work closest to done first. */
export const STATUSES: ReadonlyArray<Status> = [
  'in_review',
  'in_progress',
  'todo',
  'backlog',
  'done',
]

/* Workflow order, as a picker offers them. */
export const STATUSES_IN_ORDER: ReadonlyArray<Status> = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
]

export const PRIORITIES: ReadonlyArray<Priority> = [
  'urgent',
  'high',
  'medium',
  'low',
  'none',
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
    teamId: 'eng',
    title: 'Keyboard focus is lost after changing an issue status',
    description:
      'After choosing a status from the menu, focus goes to the top of the page. It should return to the status glyph of the same row, so the next arrow key moves within the list.',
    status: 'in_review',
    priority: 'urgent',
    assigneeId: 'alex',
    labels: ['Bug'],
    updated: 'Oct 26',
  },
  {
    id: 'CRE-139',
    teamId: 'des',
    title: 'Group headers stay visible while the list scrolls',
    description: '',
    status: 'in_review',
    priority: 'medium',
    assigneeId: 'jo',
    labels: ['Design'],
    updated: 'Oct 25',
  },
  {
    id: 'CRE-137',
    teamId: 'eng',
    title: 'Assignee picker filters by name and email',
    description: '',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 26',
  },
  {
    id: 'CRE-136',
    teamId: 'eng',
    title:
      'Very long issue titles wrap the row and push the assignee out of view on narrow windows',
    description:
      'At 1024px the title wraps onto a second line and pushes the assignee out of the row. Rows should keep one line and truncate the title.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'sam',
    labels: ['Bug', 'Design'],
    updated: 'Oct 24',
  },
  {
    id: 'CRE-133',
    teamId: 'eng',
    title: 'Draft of a new issue survives closing the composer',
    description: '',
    status: 'in_progress',
    priority: 'low',
    assigneeId: 'jo',
    labels: ['Feature'],
    updated: 'Oct 23',
  },
  {
    id: 'CRE-131',
    teamId: 'eng',
    title: 'Search matches issue identifiers',
    description: '',
    status: 'todo',
    priority: 'high',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 22',
  },
  {
    id: 'CRE-128',
    teamId: 'des',
    title: 'Empty state for a filter without results',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    labels: ['Design'],
    updated: 'Oct 21',
  },
  {
    id: 'CRE-127',
    teamId: 'des',
    title: 'Priority icons have enough contrast in the dark theme',
    description: '',
    status: 'todo',
    priority: 'low',
    assigneeId: 'sam',
    labels: ['Accessibility'],
    updated: 'Oct 21',
  },
  {
    id: 'CRE-124',
    teamId: 'eng',
    title: 'Undo for a status change',
    description: '',
    status: 'todo',
    priority: 'none',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 20',
  },
  {
    id: 'CRE-120',
    teamId: 'eng',
    title: 'Board view with drag and drop between columns',
    description: '',
    status: 'backlog',
    priority: 'medium',
    assigneeId: null,
    labels: ['Feature'],
    updated: 'Oct 18',
  },
  {
    id: 'CRE-118',
    teamId: 'eng',
    title: 'Export the current view as CSV',
    description: '',
    status: 'backlog',
    priority: 'low',
    assigneeId: 'jo',
    labels: ['Feature'],
    updated: 'Oct 17',
  },
  {
    id: 'CRE-115',
    teamId: 'eng',
    title: 'Command menu opens with Ctrl+K',
    description: '',
    status: 'backlog',
    priority: 'none',
    assigneeId: null,
    labels: [],
    updated: 'Oct 15',
  },
  {
    id: 'CRE-110',
    teamId: 'des',
    title: 'Sidebar shows the number of open issues',
    description: '',
    status: 'done',
    priority: 'medium',
    assigneeId: 'sam',
    labels: ['Design'],
    updated: 'Oct 14',
  },
  {
    id: 'CRE-104',
    teamId: 'eng',
    title: 'Issues persist in browser storage',
    description: '',
    status: 'done',
    priority: 'high',
    assigneeId: 'alex',
    labels: ['Feature'],
    updated: 'Oct 12',
  },
]
