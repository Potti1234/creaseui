import { Schema as S } from 'effect'

export const Status = S.Literals(['progress', 'todo', 'backlog', 'done'])
export type Status = typeof Status.Type
export const Priority = S.Literals(['urgent', 'high', 'medium', 'low', 'none'])
export type Priority = typeof Priority.Type
export const Assignee = S.Literals(['alex', 'maya', 'leo', 'nina', 'none'])
export type Assignee = typeof Assignee.Type
export const Issue = S.Struct({
  id: S.String,
  title: S.String,
  description: S.String,
  status: Status,
  priority: Priority,
  assignee: Assignee,
  project: S.String,
  label: S.String,
})
export type Issue = typeof Issue.Type
export const statuses: readonly Status[] = [
  'progress',
  'todo',
  'backlog',
  'done',
]
export const priorities: readonly Priority[] = [
  'urgent',
  'high',
  'medium',
  'low',
  'none',
]
export const assignees: readonly Assignee[] = [
  'alex',
  'maya',
  'leo',
  'nina',
  'none',
]
export const statusNames: Record<Status, string> = {
  progress: 'In progress',
  todo: 'Todo',
  backlog: 'Backlog',
  done: 'Done',
}
export const priorityNames: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
}
export const people: Record<Assignee, { name: string; initials: string }> = {
  alex: { name: 'Alex Morgan', initials: 'AM' },
  maya: { name: 'Maya Chen', initials: 'MC' },
  leo: { name: 'Leo Martin', initials: 'LM' },
  nina: { name: 'Nina Patel', initials: 'NP' },
  none: { name: 'Unassigned', initials: '' },
}
export const seedIssues: readonly Issue[] = [
  {
    id: 'CRE-128',
    title: 'Keep your place when returning to the issue list',
    description:
      'Restore the selected issue and scroll position after closing issue details.',
    status: 'progress',
    priority: 'high',
    assignee: 'alex',
    project: 'Workspace experience',
    label: 'Improvement',
  },
  {
    id: 'CRE-127',
    title: 'Make assignee search work with keyboard navigation',
    description:
      'Arrow keys should move through results without losing the current query.',
    status: 'progress',
    priority: 'high',
    assignee: 'maya',
    project: 'Workspace experience',
    label: '',
  },
  {
    id: 'CRE-124',
    title: 'Preserve unsaved issue drafts',
    description:
      'Reopening the composer should restore the title and description you were writing.',
    status: 'progress',
    priority: 'medium',
    assignee: 'leo',
    project: 'Editor',
    label: 'Improvement',
  },
  {
    id: 'CRE-121',
    title: 'Fix the menu position near the bottom of the viewport',
    description:
      'Keep every menu option visible and reachable when the anchor is near an edge.',
    status: 'progress',
    priority: 'urgent',
    assignee: 'nina',
    project: 'Workspace experience',
    label: 'Bug',
  },
  {
    id: 'CRE-130',
    title: 'Add a clear empty state for filtered results',
    description:
      'Explain which filters are active and offer a direct way to clear them.',
    status: 'todo',
    priority: 'medium',
    assignee: 'maya',
    project: 'Workspace experience',
    label: '',
  },
  {
    id: 'CRE-129',
    title: 'Align status icons across list and detail views',
    description:
      'The status vocabulary should have one consistent visual treatment.',
    status: 'todo',
    priority: 'low',
    assignee: 'alex',
    project: 'Workspace experience',
    label: 'Design',
  },
  {
    id: 'CRE-126',
    title: 'Support pasting a link into the issue description',
    description:
      'Pasted URLs should stay readable and retain their full destination.',
    status: 'todo',
    priority: 'medium',
    assignee: 'leo',
    project: 'Editor',
    label: '',
  },
  {
    id: 'CRE-125',
    title: 'Show the next action after creating an issue',
    description:
      'Confirm the created issue without interrupting the user’s next task.',
    status: 'todo',
    priority: 'high',
    assignee: 'none',
    project: 'Workspace experience',
    label: 'Improvement',
  },
  {
    id: 'CRE-122',
    title: 'Improve contrast for secondary text in light mode',
    description:
      'Keep supporting content quiet while meeting the intended readability target.',
    status: 'todo',
    priority: 'medium',
    assignee: 'nina',
    project: 'Workspace experience',
    label: 'Design',
  },
  {
    id: 'CRE-119',
    title: 'Keep the selected priority when creating another issue',
    description:
      'Repeated creation should preserve the useful context from the previous issue.',
    status: 'backlog',
    priority: 'low',
    assignee: 'none',
    project: 'Editor',
    label: '',
  },
  {
    id: 'CRE-117',
    title: 'Add a keyboard shortcut reference',
    description:
      'Make shortcuts discoverable beside their corresponding actions.',
    status: 'backlog',
    priority: 'none',
    assignee: 'alex',
    project: 'Workspace experience',
    label: '',
  },
  {
    id: 'CRE-114',
    title: 'Make view preferences survive a refresh',
    description:
      'Persist display preferences alongside the local issue dataset.',
    status: 'backlog',
    priority: 'medium',
    assignee: 'none',
    project: 'Workspace experience',
    label: '',
  },
  {
    id: 'CRE-112',
    title: 'Make long issue titles readable without changing row height',
    description:
      'Retain access to the complete title while keeping list geometry stable.',
    status: 'backlog',
    priority: 'low',
    assignee: 'maya',
    project: 'Workspace experience',
    label: 'Design',
  },
  {
    id: 'CRE-123',
    title: 'Use the same priority names everywhere',
    description: 'Rows, pickers and the composer now share one vocabulary.',
    status: 'done',
    priority: 'medium',
    assignee: 'leo',
    project: 'Editor',
    label: '',
  },
  {
    id: 'CRE-120',
    title: 'Return focus to the trigger after dismissing a menu',
    description:
      'Closing a picker should leave keyboard users where they expect.',
    status: 'done',
    priority: 'high',
    assignee: 'alex',
    project: 'Workspace experience',
    label: 'Improvement',
  },
]
