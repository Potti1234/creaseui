import type { Html, HtmlBuilder } from 'foldkit/html'

import * as State from '@/lib/tanstack-table-state'
import { badge } from '@/stylex/badge'
import { button, buttonLink } from '@/stylex/button'
import { box, grid, inline, stack, text } from '@/stylex/composition'
import { className } from '@/stylex/style'
import {
  createTanStackTable,
  tanStackDataTable,
  type TanStackDataTableColumn,
  type TanStackDataTableProps,
} from '@/stylex/tanstack/data-table'
import { styles } from './tanstack-table-page.stylex'

export const Model = State.Model
export type Model = State.Model
export const Message = State.Message
export type Message = State.Message
export const init = State.init
export const update = (model: Model, message: Message): readonly [Model, readonly []] => [State.update(model, message), []]

type Status = 'Backlog' | 'In progress' | 'Done'
type Priority = 'Low' | 'Medium' | 'High'
type Task = Readonly<{
  id: string
  title: string
  status: Status
  team: 'Core' | 'Growth' | 'Platform'
  priority: Priority
  points: number
  assignee: string
  due: string
}>

const TITLES = [
  'Refine audit log filters', 'Ship keyboard shortcuts', 'Reduce dashboard latency', 'Document access policies',
  'Rebuild invoice export', 'Add workspace templates', 'Improve command palette', 'Review token rotation',
  'Add usage anomaly alerts', 'Tune search ranking', 'Migrate webhook signing', 'Polish empty states',
  'Fix timezone boundaries', 'Add bulk editing', 'Prototype saved views', 'Improve CSV imports',
  'Add role presets', 'Measure onboarding funnel', 'Cache activity summaries', 'Review mobile navigation',
  'Unify billing events', 'Add incident timeline', 'Improve focus management', 'Audit localization gaps',
  'Add retention cohorts', 'Rework retry policy', 'Expose API rate limits', 'Improve table density',
  'Add custom fields', 'Validate data residency', 'Build release checklist', 'Stream export progress',
] as const
const STATUSES: ReadonlyArray<Status> = ['Backlog', 'In progress', 'Done']
const TEAMS: ReadonlyArray<Task['team']> = ['Core', 'Growth', 'Platform']
const PRIORITIES: ReadonlyArray<Priority> = ['Low', 'Medium', 'High']
const ASSIGNEES = ['Maya Chen', 'Noah Williams', 'Ava Patel', 'Leo Martin', 'Sofia Rossi', 'Unassigned'] as const

const TASKS: ReadonlyArray<Task> = TITLES.map((title, index) => ({
  id: `TSK-${String(index + 101)}`,
  title,
  status: STATUSES[index % STATUSES.length] ?? 'Backlog',
  team: TEAMS[(index * 2) % TEAMS.length] ?? 'Core',
  priority: PRIORITIES[(index + Math.floor(index / 4)) % PRIORITIES.length] ?? 'Low',
  points: [1, 2, 3, 5, 8][index % 5] ?? 1,
  assignee: ASSIGNEES[(index * 5) % ASSIGNEES.length] ?? 'Unassigned',
  due: `2026-${String(9 + Math.floor(index / 14)).padStart(2, '0')}-${String(2 + ((index * 3) % 25)).padStart(2, '0')}`,
}))

const statusBadge = (status: Status, h: HtmlBuilder<Message>): Html =>
  h.span([h.Class(className(status === 'Done' ? styles.badgeDone : status === 'In progress' ? styles.badgeProgress : styles.badgeTodo))], [status])

const COLUMNS: ReadonlyArray<TanStackDataTableColumn<Task, Message>> = [
  { id: 'title', header: 'Task', value: (row) => row.title, cell: (row, h) => h.div([h.Title(row.title), h.Class(className(styles.titleCell))], [row.title]), canGroup: false, minSize: 200, size: 280 },
  { id: 'status', header: 'Status', value: (row) => row.status, cell: (row, h) => statusBadge(row.status, h) },
  { id: 'team', header: 'Team', value: (row) => row.team },
  { id: 'priority', header: 'Priority', value: (row) => row.priority, cell: (row, h) => h.span([h.Class(className(row.priority === 'High' && styles.priorityHigh))], [row.priority]) },
  { id: 'points', header: 'Points', value: (row) => row.points, cell: (row) => `${row.points} pts`, aggregate: (value) => `${String(value)} pts` },
  { id: 'assignee', header: 'Assignee', value: (row) => row.assignee, canGroup: false },
  { id: 'due', header: 'Due', value: (row) => row.due, cell: (row) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${row.due}T00:00:00`)), canGroup: false },
]

const tableProps = (model: Model): TanStackDataTableProps<Task, Message> => ({
  ariaLabel: 'TanStack task feature showcase',
  columns: COLUMNS,
  enableColumnOrder: true,
  enableColumnVisibility: true,
  enableDensity: true,
  enableRowPinning: true,
  enableRowSelection: true,
  facet: { columnId: 'status', label: 'Status facet', options: STATUSES },
  filterPlaceholder: 'Search tasks, teams, people…',
  grouping: { columnId: 'team', label: 'teams' },
  model,
  pageSizeOptions: [5, 8, 12, 20],
  pinnedColumn: { columnId: 'title', label: 'task' },
  rowKey: (row) => row.id,
  rows: TASKS,
  sizing: { columnId: 'title', label: 'Task column', min: 200, max: 440, step: 20 },
  toParentMessage: (message) => message,
})

const featureCard = (title: string, description: string, features: ReadonlyArray<string>, h: HtmlBuilder<Message>): Html =>
  box({ surface: 'card', radius: 'lg', padding: 'md', children: [stack({ gap: 'sm', children: [text({ as: 'h2', children: [title], variant: 'headingSm' }, h), text({ as: 'p', children: [description], tone: 'secondary', variant: 'caption' }, h), inline({ gap: 'sm', wrap: true, children: features.map((feature) => badge({ children: [feature], variant: 'outline' }, h)) }, h)] }, h)] }, h)

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const props = tableProps(model)
  const table = createTanStackTable(props)
  const stateSnapshot = {
    foldkitModel: model,
    tanstackDerived: {
      coreRows: table.getCoreRowModel().rows.length,
      filteredRows: table.getFilteredRowModel().rows.length,
      groupedRows: table.getGroupedRowModel().rows.length,
      pageRows: table.getRowModel().rows.length,
      pageCount: table.getPageCount(),
    },
  }
  return box({ as: 'main', surface: 'page', minHeight: 'createPage', padding: 'xl', children: [
    stack({ gap: 'xl', width: 'full', children: [
      stack({ gap: 'md', children: [inline({ align: 'center', justify: 'between', gap: 'md', wrap: true, children: [buttonLink({ href: '/blocks-stylex', children: ['← Featured blocks'], variant: 'outline' }, h), badge({ children: ['@tanstack/table-core · vanilla'], variant: 'secondary' }, h)] }, h), text({ as: 'h1', children: ['TanStack Table × Foldkit'], variant: 'display' }, h), text({ as: 'p', children: ['A headless TanStack v8 table whose complete controlled state lives in the Foldkit model. StyleX and the constrained composition primitives own every visual decision.'], tone: 'secondary', variant: 'body' }, h)] }, h),
      h.div([h.Class(className(styles.featureGrid))], [featureCard('Row pipeline', 'TanStack composes row models instead of embedding behavior in markup.', ['Filter', 'Facet', 'Group', 'Sort', 'Expand', 'Paginate'], h), featureCard('Interaction state', 'Every interaction returns a typed Foldkit message and remains inspectable.', ['Selection', 'Visibility', 'Order', 'Pinning', 'Sizing', 'Density'], h), featureCard('Framework boundary', 'No React adapter or component-local state. The table instance is derived during view.', ['Serializable model', 'Pure reducer', 'StyleX output'], h)]),
      box({ surface: 'card', radius: 'lg', padding: 'md', children: [tanStackDataTable(props, h)] }, h),
      grid({ columns: 'two', gap: 'md', children: [
        box({ surface: 'card', radius: 'lg', padding: 'md', children: [stack({ gap: 'md', children: [text({ as: 'h2', children: ['Controlled state'], variant: 'headingSm' }, h), text({ as: 'p', children: ['This is the serializable Foldkit model plus counts produced by TanStack’s row-model pipeline.'], tone: 'secondary', variant: 'caption' }, h), h.pre([h.Class(className(styles.code))], [JSON.stringify(stateSnapshot, null, 2)])] }, h)] }, h),
        box({ surface: 'card', radius: 'lg', padding: 'md', children: [stack({ gap: 'md', children: [text({ as: 'h2', children: ['Feature controls'], variant: 'headingSm' }, h), text({ as: 'p', children: ['Reset provides a deterministic baseline for agents and visual tests. Virtualization is intentionally separate because TanStack Table delegates it to TanStack Virtual.'], tone: 'secondary', variant: 'body' }, h), button({ children: ['Reset all table state'], variant: 'outline', onClick: State.ResetTable() }, h)] }, h)] }, h),
      ] }, h),
    ] }, h),
  ] }, h)
}
