/* tablecn block — 1:1 port of sadmann7/tablecn's tasks data-table
   (src/app/components/tasks-table.tsx) + data-grid demo. Tailwind renderer.
   The block owns its state via lib/tablecn-table + lib/tablecn-grid. */

import { Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import type { Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'

import {
  actionBar,
  actionBarClose,
  actionBarGroup,
  actionBarItem,
  actionBarSelection,
  actionBarSeparator,
} from '@/ui/action-bar'
import { button } from '@/ui/button'
import { checkbox } from '@/ui/checkbox'
import { icon } from '@/lib/icon'
import * as TableState from '@/lib/tablecn-table'
import * as Grid from '@/lib/tablecn-grid'
import type { Task } from '@/lib/tablecn-data'
import { taskLabels, taskPriorities, taskStatuses } from '@/lib/tablecn-data'
import { cn } from '@/lib/utils'
import { gridView } from '@/demo/blocks/tablecn-grid-view'

export const ActiveView = S.Literals(['data-table', 'data-grid'])
export type ActiveView = typeof ActiveView.Type

export const Model = S.Struct({
  view: ActiveView,
  table: TableState.Model,
  grid: Grid.Model,
})
export type Model = typeof Model.Type

export const SwitchView = taggedStruct('TablecnSwitchView', {
  view: ActiveView,
})
/* Mount streams (action-bar escape + toolbar roving focus) emit their own
   message unions; forward them into the page union. */
export const GotActionBarMount = taggedStruct('TablecnActionBarMount', {
  message: S.Any,
})
export const GotToolbarMount = taggedStruct('TablecnToolbarMount', {
  message: S.Any,
})

export const Message = S.Union([
  SwitchView,
  GotActionBarMount,
  GotToolbarMount,
  TableState.Message,
  Grid.Message,
])
export type Message = typeof Message.Type

export const init = (): Model => ({
  view: 'data-table',
  table: TableState.init(100),
  grid: Grid.init(500),
})

type UpdateReturn = Update.Return<Model, Message>

const liftTable = (model: Model, message: TableState.Message): UpdateReturn => {
  const { model: table, commands } = TableState.update(model.table, message)
  return {
    model: { ...model, table },
    commands: Command.mapMessages(commands ?? [], m => m as Message),
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag === 'TablecnSwitchView')
    return { model: { ...model, view: message.view } }
  if (message._tag === 'TablecnActionBarMount') {
    const inner = message.message as { _tag: string }
    return inner._tag === 'RequestedClose'
      ? liftTable(model, TableState.Message.ClosedActionBar({}))
      : { model }
  }
  if (message._tag === 'TablecnToolbarMount') return { model }
  // Grid and TableState share several message tags (SetPanel, ToggledSort,
  // ToggledAllRows, ToggledColumnHidden, SetDirection, RemovedSort), so route
  // by which view emitted the message — only one subview is mounted at a time.
  if (model.view === 'data-grid') {
    if (message._tag in Grid.Message)
      return {
        model: {
          ...model,
          grid: Grid.update(model.grid, message as Grid.Message),
        },
      }
    return { model }
  }
  if (message._tag in TableState.Message)
    return liftTable(model, message as TableState.Message)
  return { model }
}

/* ---------- shared chrome ---------- */

const PANEL_CLASS =
  'bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-48 rounded-md border p-1 shadow-md outline-none crease-action-bar-in'

const MENU_ITEM_CLASS =
  'focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground'

const MENU_LABEL_CLASS = 'text-muted-foreground px-2 py-1.5 text-xs font-medium'

const MENU_SEPARATOR_CLASS = 'bg-border -mx-1 my-1 h-px'

/* relative trigger wrapper + click-outside scrim + anchored panel.
   Callers attach their own onClick to the trigger element. */
const TRIGGER_PANEL = <Msg>(
  isOpen: boolean,
  trigger: Html,
  onClose: Msg,
  panel: Html,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class('relative')],
    [
      trigger,
      ...(isOpen
        ? [
            h.button([
              h.Type('button'),
              h.AriaHidden(true),
              h.Tabindex(-1),
              h.Class('fixed inset-0 z-40 cursor-default bg-transparent'),
              h.OnClick(onClose),
            ]),
            h.div(
              [
                h.OnKeyDownPreventDefault(key =>
                  key === 'Escape' ? Option.some(onClose) : Option.none(),
                ),
              ],
              [panel],
            ),
          ]
        : []),
    ],
  )

const capitalize = (value: string): string =>
  value === '' ? value : value[0]!.toUpperCase() + value.slice(1)

const checkItem = <Msg>(
  label: string,
  isChecked: boolean,
  onSelect: Msg,
  iconNode: Html | undefined,
  h: HtmlBuilder<Msg>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.Role('menuitemcheckbox'),
      h.AriaChecked(isChecked),
      h.OnClick(onSelect),
      h.Class(MENU_ITEM_CLASS),
    ],
    [
      h.span(
        [
          h.Class(
            'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
          ),
        ],
        [isChecked ? icon('check', { class: 'size-4' }, h) : h.empty],
      ),
      ...(iconNode === undefined ? [] : [iconNode]),
      h.span([], [label]),
    ],
  )

const sortIcon = (
  model: TableState.Model,
  columnId: string,
  h: HtmlBuilder<Message>,
): Html => {
  const entry = model.sorting.find(e => e.id === columnId)
  if (entry === undefined) return icon('chevrons-up-down', {}, h)
  return entry.desc ? icon('chevron-down', {}, h) : icon('chevron-up', {}, h)
}

/* ---------- tasks table ---------- */

const STATUS_ICONS: Record<string, string> = {
  todo: 'circle',
  'in-progress': 'timer',
  done: 'circle-check-big',
  canceled: 'circle-x',
}
const PRIORITY_ICONS: Record<string, string> = {
  low: 'arrow-down',
  medium: 'arrow-right',
  high: 'arrow-up',
}
const LABEL_ICONS: Record<string, string> = {
  bug: 'bug',
  feature: 'sparkles',
  enhancement: 'arrow-up-circle',
  documentation: 'book',
}

const statusBadge = (status: string, h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.Class(
        'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all text-foreground py-1 capitalize [&>svg]:size-3.5',
      ),
    ],
    [
      icon(STATUS_ICONS[status] ?? 'circle', {}, h),
      status === 'in-progress' ? 'In-Progress' : status,
    ],
  )

const priorityBadge = (priority: string, h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.Class(
        'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all text-foreground py-1 capitalize [&>svg]:size-3.5',
      ),
    ],
    [icon(PRIORITY_ICONS[priority] ?? 'minus', {}, h), priority],
  )

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

/* column defs used by toolbar + header + view menu */
interface TableColumn {
  id: string
  header: string
  sortable: boolean
  hideable: boolean
  filterVariant?: string
}

const COLUMNS: ReadonlyArray<TableColumn> = [
  { id: 'select', header: '', sortable: false, hideable: false },
  { id: 'code', header: 'Task', sortable: true, hideable: false },
  {
    id: 'title',
    header: 'Title',
    sortable: true,
    hideable: true,
    filterVariant: 'text',
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    hideable: true,
    filterVariant: 'multiSelect',
  },
  {
    id: 'priority',
    header: 'Priority',
    sortable: true,
    hideable: true,
    filterVariant: 'multiSelect',
  },
  {
    id: 'estimatedHours',
    header: 'Est. Hours',
    sortable: true,
    hideable: true,
    filterVariant: 'range',
  },
  {
    id: 'createdAt',
    header: 'Created At',
    sortable: true,
    hideable: true,
    filterVariant: 'dateRange',
  },
  { id: 'actions', header: '', sortable: false, hideable: false },
]

const visibleColumns = (model: TableState.Model): Array<TableColumn> =>
  COLUMNS.filter(c => !model.hiddenColumnIds.includes(c.id))

const headerCell = (
  model: TableState.Model,
  column: TableColumn,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.headerMenuColumnId === column.id
  const close = TableState.Message.SetHeaderMenu({ columnId: '' })
  if (column.id === 'select') {
    const { rows } = TableState.pageTasks(model)
    const selected = new Set(model.selectedIds)
    const allSelected = rows.length > 0 && rows.every(r => selected.has(r.id))
    const someSelected = rows.some(r => selected.has(r.id)) && !allSelected
    return h.th(
      [
        h.DataAttribute('slot', 'table-head'),
        h.Class(
          'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap w-10',
        ),
      ],
      [
        h.span(
          [h.Class('inline-flex translate-y-0.5')],
          [
            checkbox(
              {
                id: 'select-all',
                isChecked: allSelected,
                isIndeterminate: someSelected,
                onToggle: checked =>
                  TableState.Message.ToggledAllRows({ checked }),
              },
              h,
            ),
          ],
        ),
      ],
    )
  }
  if (!column.sortable) {
    return h.th(
      [
        h.DataAttribute('slot', 'table-head'),
        h.Class(
          'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap',
        ),
      ],
      [column.header],
    )
  }
  const ascChecked = model.sorting.some(e => e.id === column.id && !e.desc)
  const descChecked = model.sorting.some(e => e.id === column.id && e.desc)
  return h.th(
    [
      h.DataAttribute('slot', 'table-head'),
      h.Class(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap',
      ),
    ],
    [
      TRIGGER_PANEL(
        isOpen,
        h.button(
          [
            h.Type('button'),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(isOpen),
            h.OnClick(
              TableState.Message.SetHeaderMenu({ columnId: column.id }),
            ),
            h.Class(
              '-ms-1.5 flex h-8 w-auto cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left font-medium hover:bg-accent focus:ring-1 focus:ring-ring data-[state=open]:bg-accent rtl:flex-row-reverse [&_svg]:size-4 [&_svg]:text-muted-foreground',
            ),
            h.DataAttribute('state', isOpen ? 'open' : 'closed'),
          ],
          [column.header, sortIcon(model, column.id, h)],
        ),
        close,
        h.div(
          [
            h.Role('menu'),
            h.DataAttribute('slot', 'dropdown-menu-content'),
            h.Class(cn(PANEL_CLASS, 'left-0 w-28')),
          ],
          [
            checkItem(
              'Asc',
              ascChecked,
              TableState.Message.ToggledSort({
                columnId: column.id,
                desc: false,
              }),
              icon('chevron-up', {}, h),
              h,
            ),
            checkItem(
              'Desc',
              descChecked,
              TableState.Message.ToggledSort({
                columnId: column.id,
                desc: true,
              }),
              icon('chevron-down', {}, h),
              h,
            ),
            ...(column.hideable
              ? [
                  h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
                  h.button(
                    [
                      h.Type('button'),
                      h.Role('menuitem'),
                      h.OnClick(
                        TableState.Message.ToggledColumnHidden({
                          columnId: column.id,
                        }),
                      ),
                      h.Class(cn(MENU_ITEM_CLASS, 'pl-8')),
                    ],
                    [icon('eye-off', {}, h), 'Hide'],
                  ),
                ]
              : []),
          ],
        ),
        h,
      ),
    ],
  )
}

const taskCell = (
  model: TableState.Model,
  task: Task,
  columnId: string,
  h: HtmlBuilder<Message>,
): Html => {
  switch (columnId) {
    case 'select':
      return h.span(
        [h.Class('inline-flex translate-y-0.5')],
        [
          checkbox(
            {
              id: `select-${task.id}`,
              isChecked: model.selectedIds.includes(task.id),
              onToggle: () =>
                TableState.Message.ToggledRowSelected({
                  id: task.id,
                  shiftKey: false,
                }),
            },
            h,
          ),
        ],
      )
    case 'code':
      return h.span(
        [h.Class('font-mono text-xs text-muted-foreground')],
        [task.code],
      )
    case 'title':
      return h.div(
        [h.Class('flex items-center gap-2')],
        [
          h.span(
            [
              h.Class(
                'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all text-foreground capitalize shrink-0',
              ),
            ],
            [icon(LABEL_ICONS[task.label] ?? 'tag', {}, h), task.label],
          ),
          h.span([h.Class('min-w-0 truncate font-medium')], [task.title]),
        ],
      )
    case 'status':
      return statusBadge(task.status, h)
    case 'priority':
      return priorityBadge(task.priority, h)
    case 'estimatedHours':
      return h.div(
        [h.Class('w-20 text-right tabular-nums')],
        [String(task.estimatedHours)],
      )
    case 'createdAt':
      return h.span(
        [h.Class('text-muted-foreground text-sm tabular-nums')],
        [formatDate(task.createdAt)],
      )
    case 'actions': {
      const isOpen = model.rowMenuRowId === task.id
      const close = TableState.Message.SetRowMenu({ rowId: '' })
      return h.div(
        [h.Class('flex justify-end')],
        [
          TRIGGER_PANEL(
            isOpen,
            h.button(
              [
                h.Type('button'),
                h.AriaLabel(`Open actions for ${task.code}`),
                h.AriaHasPopup('menu'),
                h.AriaExpanded(isOpen),
                h.OnClick(TableState.Message.SetRowMenu({ rowId: task.id })),
                h.Class(
                  'inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-muted [&_svg]:size-4',
                ),
                h.DataAttribute('state', isOpen ? 'open' : 'closed'),
              ],
              [icon('ellipsis', {}, h)],
            ),
            close,
            h.div(
              [
                h.Role('menu'),
                h.DataAttribute('slot', 'dropdown-menu-content'),
                h.Class(cn(PANEL_CLASS, 'right-0 w-40')),
              ],
              [
                h.div([h.Class(MENU_LABEL_CLASS)], ['Actions']),
                h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
                h.button(
                  [
                    h.Type('button'),
                    h.Role('menuitem'),
                    h.OnClick(
                      TableState.Message.OpenedUpdateSheet({
                        taskId: task.id,
                      }),
                    ),
                    h.Class(cn(MENU_ITEM_CLASS, 'pl-8')),
                  ],
                  [icon('pencil', {}, h), 'Edit'],
                ),
                h.button(
                  [
                    h.Type('button'),
                    h.Role('menuitem'),
                    h.Class(cn(MENU_ITEM_CLASS, 'pl-8', 'opacity-50')),
                  ],
                  [
                    icon('tag', {}, h),
                    'Labels',
                    h.span(
                      [h.Class('ml-auto')],
                      [icon('chevron-right', {}, h)],
                    ),
                  ],
                ),
                h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
                h.button(
                  [
                    h.Type('button'),
                    h.Role('menuitem'),
                    h.DataAttribute('variant', 'destructive'),
                    h.OnClick(
                      TableState.Message.OpenedDeleteDialog({
                        ids: [task.id],
                      }),
                    ),
                    h.Class(cn(MENU_ITEM_CLASS, 'pl-8')),
                  ],
                  [icon('trash-2', {}, h), 'Delete'],
                ),
              ],
            ),
            h,
          ),
        ],
      )
    }
    default:
      return h.empty
  }
}

/* ---------- toolbar ---------- */

const facetedFilter = (
  model: TableState.Model,
  columnId: 'status' | 'priority',
  title: string,
  options: ReadonlyArray<{ value: string; label: string; iconName: string }>,
  selected: ReadonlyArray<string>,
  toggle: (value: string) => TableState.Message,
  h: HtmlBuilder<Message>,
): Html => {
  const panelId = `filter-${columnId}` as const
  const isOpen = model.openPanel === panelId
  const counts = new Map<string, number>()
  for (const task of TableState.filteredTasks({
    ...model,
    statusFilter: columnId === 'status' ? [] : model.statusFilter,
    priorityFilter: columnId === 'priority' ? [] : model.priorityFilter,
  })) {
    const key = columnId === 'status' ? task.status : task.priority
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: panelId })),
      h.Class(
        cn(
          'border-input inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium whitespace-nowrap shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0',
          selected.length === 0 && 'border-dashed',
        ),
      ),
    ],
    [
      icon('circle-plus', {}, h),
      title,
      ...(selected.length > 0
        ? [
            h.span([h.Class('bg-border mx-1 h-4 w-px')], []),
            ...(selected.length > 2
              ? [
                  h.span(
                    [
                      h.Class(
                        'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal lg:hidden',
                      ),
                    ],
                    [`${String(selected.length)} selected`],
                  ),
                  ...selected
                    .slice(0, 2)
                    .map(
                      value =>
                        h.span(
                          [
                            h.Class(
                              'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal capitalize',
                            ),
                          ],
                          [value === 'in-progress' ? 'In-Progress' : value],
                        ) as Html,
                    ),
                ]
              : selected.map(
                  value =>
                    h.span(
                      [
                        h.Class(
                          'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal capitalize',
                        ),
                      ],
                      [value === 'in-progress' ? 'In-Progress' : value],
                    ) as Html,
                )),
          ]
        : []),
    ],
  )
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.Role('menu'),
        h.DataAttribute('slot', 'popover-content'),
        h.Class(cn(PANEL_CLASS, 'left-0 w-50 p-0')),
      ],
      [
        h.div(
          [h.Class('max-h-72 overflow-y-auto p-1')],
          [
            ...options.map(option =>
              h.button(
                [
                  h.Type('button'),
                  h.Role('menuitemcheckbox'),
                  h.AriaChecked(selected.includes(option.value)),
                  h.OnClick(toggle(option.value)),
                  h.Class(MENU_ITEM_CLASS),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        cn(
                          'border-primary absolute left-2 flex size-4 items-center justify-center rounded-sm border',
                          selected.includes(option.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible',
                        ),
                      ),
                    ],
                    [icon('check', { class: 'size-3.5' }, h)],
                  ),
                  icon(option.iconName, {}, h),
                  h.span([], [option.label]),
                  h.span(
                    [
                      h.Class(
                        'ml-auto font-mono text-xs text-muted-foreground',
                      ),
                    ],
                    [String(counts.get(option.value) ?? 0)],
                  ),
                ],
              ),
            ),
            ...(selected.length > 0
              ? [
                  h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
                  h.button(
                    [
                      h.Type('button'),
                      h.Role('menuitem'),
                      h.OnClick(TableState.Message.ClearedFilters({})),
                      h.Class(
                        cn(MENU_ITEM_CLASS, 'justify-center pl-8 text-center'),
                      ),
                    ],
                    ['Clear filters'],
                  ),
                ]
              : []),
          ],
        ),
      ],
    ),
    h,
  )
}

const rangeFilter = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.openPanel === 'filter-hours'
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'filter-hours' })),
      h.Class(
        cn(
          'border-input inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium whitespace-nowrap shadow-xs transition-colors hover:bg-accent [&_svg]:size-4',
          !model.hasHoursFilter && 'border-dashed',
        ),
      ),
    ],
    [
      icon('circle-plus', {}, h),
      'Est. Hours',
      ...(model.hasHoursFilter
        ? [
            h.span([h.Class('bg-border mx-1 h-4 w-px')], []),
            h.span(
              [
                h.Class(
                  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal',
                ),
              ],
              [
                model.hoursMax > 0
                  ? `${String(model.hoursMin)}-${String(model.hoursMax)}`
                  : `${String(model.hoursMin)}+`,
              ],
            ),
          ]
        : []),
    ],
  )
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.DataAttribute('slot', 'popover-content'),
        h.Class(cn(PANEL_CLASS, 'left-0 w-56 p-3')),
      ],
      [
        h.div([h.Class('mb-2 text-sm font-medium')], ['Estimated hours']),
        h.div(
          [h.Class('flex items-center gap-2')],
          [
            h.input([
              h.Type('number'),
              h.Placeholder('Min'),
              h.Class(
                'border-input h-8 w-full rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
              ),
              h.Value(model.hasHoursFilter ? String(model.hoursMin) : ''),
              h.OnInput(value =>
                TableState.Message.ChangedHoursMin({
                  value,
                }),
              ),
            ]),
            h.span([h.Class('text-muted-foreground')], ['–']),
            h.input([
              h.Type('number'),
              h.Placeholder('Max'),
              h.Class(
                'border-input h-8 w-full rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
              ),
              h.Value(
                model.hasHoursFilter && model.hoursMax > 0
                  ? String(model.hoursMax)
                  : '',
              ),
              h.OnInput(value =>
                TableState.Message.ChangedHoursMax({
                  value,
                }),
              ),
            ]),
          ],
        ),
      ],
    ),
    h,
  )
}

const dateRangeFilter = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.openPanel === 'filter-created'
  const hasRange = model.createdFrom !== '' || model.createdTo !== ''
  const label =
    model.createdFrom !== '' && model.createdTo !== ''
      ? `${model.createdFrom.slice(5)} – ${model.createdTo.slice(5)}`
      : model.createdFrom !== ''
        ? `After ${model.createdFrom.slice(5)}`
        : model.createdTo !== ''
          ? `Before ${model.createdTo.slice(5)}`
          : ''
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'filter-created' })),
      h.Class(
        cn(
          'border-input inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium whitespace-nowrap shadow-xs transition-colors hover:bg-accent [&_svg]:size-4',
          !hasRange && 'border-dashed',
        ),
      ),
    ],
    [
      icon('circle-plus', {}, h),
      'Created At',
      ...(hasRange
        ? [
            h.span([h.Class('bg-border mx-1 h-4 w-px')], []),
            h.span(
              [
                h.Class(
                  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal',
                ),
              ],
              [label],
            ),
          ]
        : []),
    ],
  )
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.DataAttribute('slot', 'popover-content'),
        h.Class(cn(PANEL_CLASS, 'left-0 w-56 p-3')),
      ],
      [
        h.div([h.Class('mb-2 text-sm font-medium')], ['Created']),
        h.div(
          [h.Class('flex items-center gap-2')],
          [
            h.input([
              h.Type('date'),
              h.Class(
                'border-input h-8 w-full rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
              ),
              h.Value(model.createdFrom),
              h.OnInput(value =>
                TableState.Message.ChangedCreatedFrom({
                  value,
                }),
              ),
            ]),
            h.input([
              h.Type('date'),
              h.Class(
                'border-input h-8 w-full rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
              ),
              h.Value(model.createdTo),
              h.OnInput(value =>
                TableState.Message.ChangedCreatedTo({
                  value,
                }),
              ),
            ]),
          ],
        ),
      ],
    ),
    h,
  )
}

const viewOptions = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.openPanel === 'view-options'
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaLabel('View columns'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'view-options' })),
      h.Class(
        'border-input ml-auto hidden h-8 items-center gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground lg:flex [&_svg]:size-4',
      ),
    ],
    [icon('settings-2', {}, h), 'View', icon('chevron-down', {}, h)],
  )
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.Role('menu'),
        h.DataAttribute('slot', 'dropdown-menu-content'),
        h.Class(cn(PANEL_CLASS, 'right-0 w-44')),
      ],
      [
        h.div([h.Class(MENU_LABEL_CLASS)], ['Toggle columns']),
        h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
        ...COLUMNS.filter(c => c.hideable).map(column =>
          checkItem(
            column.header,
            !model.hiddenColumnIds.includes(column.id),
            TableState.Message.ToggledColumnHidden({ columnId: column.id }),
            undefined,
            h,
          ),
        ),
      ],
    ),
    h,
  )
}

const sortMenu = (model: TableState.Model, h: HtmlBuilder<Message>): Html => {
  const isOpen = model.openPanel === 'sort-menu'
  const sortable = COLUMNS.filter(
    c => c.sortable && !model.hiddenColumnIds.includes(c.id),
  )
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaLabel('Sort options'),
      h.AriaHasPopup('dialog'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'sort-menu' })),
      h.Class(
        'border-input inline-flex h-8 items-center gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground [&_svg]:size-4',
      ),
    ],
    [
      icon('arrow-down-up', { class: 'size-4 text-muted-foreground' }, h),
      'Sort',
      ...(model.sorting.length > 0
        ? [
            h.span(
              [
                h.Class(
                  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-all border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full px-1.5 font-mono',
                ),
              ],
              [String(model.sorting.length)],
            ) as Html,
          ]
        : []),
    ],
  )
  const unused = sortable.filter(c => !model.sorting.some(e => e.id === c.id))
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.DataAttribute('slot', 'popover-content'),
        h.Class(
          cn(PANEL_CLASS, 'right-0 w-auto min-w-95 flex-col gap-3.5 p-4'),
        ),
      ],
      [
        h.div(
          [h.Class('flex flex-col gap-1')],
          [
            h.h4(
              [h.Class('font-medium leading-none')],
              [model.sorting.length > 0 ? 'Sort by' : 'No sorting applied'],
            ),
            h.p(
              [h.Class('text-muted-foreground text-sm')],
              [
                model.sorting.length > 0
                  ? 'Modify sorting to organize your rows.'
                  : 'Add sorting to organize your rows.',
              ],
            ),
          ],
        ),
        ...(model.sorting.length > 0
          ? [
              h.ul(
                [h.Class('flex max-h-75 flex-col gap-2 overflow-y-auto p-1')],
                model.sorting.map((entry, index) => {
                  const column = sortable.find(c => c.id === entry.id)
                  return h.li(
                    [h.Class('flex w-full items-center gap-2 rounded-md p-1')],
                    [
                      icon(
                        'grip-vertical',
                        { class: 'size-4 text-muted-foreground' },
                        h,
                      ),
                      h.span(
                        [h.Class('w-44 text-sm font-medium')],
                        [column?.header ?? entry.id],
                      ),
                      h.div(
                        [h.Class('ml-auto flex items-center gap-1')],
                        [
                          h.button(
                            [
                              h.Type('button'),
                              h.AriaPressed(String(!entry.desc)),
                              h.OnClick(
                                TableState.Message.ChangedSortDirection({
                                  index,
                                  desc: false,
                                }),
                              ),
                              h.Class(
                                cn(
                                  'h-7 rounded-sm px-2 text-xs',
                                  !entry.desc
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-accent',
                                ),
                              ),
                            ],
                            ['Asc'],
                          ),
                          h.button(
                            [
                              h.Type('button'),
                              h.AriaPressed(String(entry.desc)),
                              h.OnClick(
                                TableState.Message.ChangedSortDirection({
                                  index,
                                  desc: true,
                                }),
                              ),
                              h.Class(
                                cn(
                                  'h-7 rounded-sm px-2 text-xs',
                                  entry.desc
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-accent',
                                ),
                              ),
                            ],
                            ['Desc'],
                          ),
                          h.button(
                            [
                              h.Type('button'),
                              h.AriaLabel(`Remove sort on ${entry.id}`),
                              h.OnClick(
                                TableState.Message.RemovedSort({ index }),
                              ),
                              h.Class(
                                'inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive [&_svg]:size-4',
                              ),
                            ],
                            [icon('trash-2', {}, h)],
                          ),
                        ],
                      ),
                    ],
                  )
                }),
              ),
            ]
          : []),
        h.div(
          [h.Class('flex w-full items-center gap-2')],
          [
            h.div(
              [h.Class('relative')],
              [
                button<Message>(
                  {
                    variant: 'outline',
                    size: 'sm',
                    // eslint-disable-next-line crease/no-component-restyle -- reason: mirrors tablecn's gap-1.5 Add-sort trigger verbatim.
                    class: 'gap-1.5',
                    children: ['Add sort'],
                    isDisabled: unused.length === 0,
                    ...(unused.length === 0
                      ? {}
                      : {
                          onClick: TableState.Message.AddedSort({
                            columnId: unused[0]!.id,
                          }),
                        }),
                  },
                  h,
                ),
              ],
            ),
            ...(model.sorting.length > 0
              ? [
                  button(
                    {
                      variant: 'outline',
                      size: 'sm',
                      class: 'ml-auto',
                      children: ['Reset sorting'],
                      onClick: TableState.Message.ResetSorting({}),
                    },
                    h,
                  ) as Html,
                ]
              : []),
          ],
        ),
      ],
    ),
    h,
  )
}

const controlMenu = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.openPanel === 'control-menu'
  const seg = (
    label: string,
    iconName: string,
    active: boolean,
    onClick: TableState.Message,
  ): Html =>
    h.button(
      [
        h.Type('button'),
        h.AriaPressed(String(active)),
        h.OnClick(onClick),
        h.Class(
          cn(
            'flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium [&_svg]:size-3.5',
            active
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ),
        ),
      ],
      [icon(iconName, {}, h), label],
    )
  return h.div(
    [h.Class('relative ml-auto')],
    [
      h.button(
        [
          h.Type('button'),
          h.AriaLabel('Toggle control menu'),
          h.OnClick(TableState.Message.SetPanel({ panel: 'control-menu' })),
          h.Class(
            'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground [&_svg]:size-4',
          ),
        ],
        [icon('ellipsis-vertical', {}, h)],
      ),
      ...(isOpen
        ? [
            h.button([
              h.Type('button'),
              h.AriaHidden(true),
              h.Tabindex(-1),
              h.Class('fixed inset-0 z-40 cursor-default bg-transparent'),
              h.OnClick(TableState.Message.SetPanel({ panel: 'none' })),
            ]),
            h.div(
              [
                h.DataAttribute('slot', 'popover-content'),
                h.Class(
                  cn(PANEL_CLASS, 'right-0 flex w-auto flex-col gap-2 p-2'),
                ),
              ],
              [
                h.div([h.Class(MENU_LABEL_CLASS)], ['Mode']),
                h.div(
                  [h.Class('bg-muted inline-flex rounded-md p-0.5 gap-0.5')],
                  [
                    seg(
                      'Server',
                      'server',
                      model.dataMode === 'server',
                      TableState.Message.SetDataMode({ mode: 'server' }),
                    ),
                    seg(
                      'Client',
                      'monitor-down',
                      model.dataMode === 'client',
                      TableState.Message.SetDataMode({ mode: 'client' }),
                    ),
                  ],
                ),
                h.div([h.Class(MENU_LABEL_CLASS)], ['Filter']),
                h.div(
                  [h.Class('bg-muted inline-flex rounded-md p-0.5 gap-0.5')],
                  [
                    seg(
                      'Plain',
                      'funnel',
                      model.filterMode === 'plain',
                      TableState.Message.SetFilterMode({ mode: 'plain' }),
                    ),
                    seg(
                      'Advanced',
                      'sliders-horizontal',
                      model.filterMode === 'advanced',
                      TableState.Message.SetFilterMode({ mode: 'advanced' }),
                    ),
                    seg(
                      'Command',
                      'terminal',
                      model.filterMode === 'command',
                      TableState.Message.SetFilterMode({ mode: 'command' }),
                    ),
                  ],
                ),
                h.div([h.Class(MENU_LABEL_CLASS)], ['Direction']),
                h.div(
                  [h.Class('bg-muted inline-flex rounded-md p-0.5 gap-0.5')],
                  [
                    seg(
                      'LTR',
                      'languages',
                      model.direction === 'ltr',
                      TableState.Message.SetDirection({ direction: 'ltr' }),
                    ),
                    seg(
                      'RTL',
                      'languages',
                      model.direction === 'rtl',
                      TableState.Message.SetDirection({ direction: 'rtl' }),
                    ),
                  ],
                ),
              ],
            ),
          ]
        : []),
    ],
  )
}

/* ---------- update sheet + delete dialog ---------- */

const updateSheet = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.updateSheetTaskId === '') return h.empty
  const field = (
    label: string,
    name: string,
    options: ReadonlyArray<string>,
  ): Html =>
    h.div(
      [h.Class('grid gap-2')],
      [
        h.label([h.Class('text-sm font-medium leading-none')], [label]),
        h.select(
          [
            h.Name(name),
            h.Class(
              'border-input flex h-8 w-full rounded-md border bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
            ),
            h.OnInput(value =>
              TableState.Message.ChangedDraftField({
                field: name,
                value,
              }),
            ),
          ],
          options.map(option =>
            h.option(
              [
                h.Value(option),
                ...(option ===
                (name === 'label'
                  ? model.draftLabel
                  : name === 'status'
                    ? model.draftStatus
                    : model.draftPriority)
                  ? [h.Attribute('selected', '')]
                  : []),
              ],
              [capitalize(option)],
            ),
          ),
        ),
      ],
    )
  return h.div(
    [],
    [
      h.div([
        h.Class('fixed inset-0 z-50 bg-black/50'),
        h.OnClick(TableState.Message.ClosedUpdateSheet({})),
      ]),
      h.div(
        [
          h.Role('dialog'),
          h.AriaModal(true),
          h.DataAttribute('slot', 'sheet-content'),
          h.Class(
            'bg-background fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col gap-4 border-l p-6 shadow-lg sm:max-w-sm',
          ),
        ],
        [
          h.button(
            [
              h.Type('button'),
              h.AriaLabel('Close'),
              h.OnClick(TableState.Message.ClosedUpdateSheet({})),
              h.Class(
                'ring-offset-background absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:size-4',
              ),
            ],
            [icon('x', {}, h)],
          ),
          h.div(
            [h.Class('flex flex-col gap-1.5')],
            [
              h.h2([h.Class('text-lg font-semibold')], ['Update task']),
              h.p(
                [h.Class('text-muted-foreground text-sm')],
                ['Update the task details and save the changes'],
              ),
            ],
          ),
          h.div(
            [h.Class('grid gap-4 py-4')],
            [
              h.div(
                [h.Class('grid gap-2')],
                [
                  h.label(
                    [h.Class('text-sm font-medium leading-none')],
                    ['Title'],
                  ),
                  h.input([
                    h.Class(
                      'border-input flex h-8 w-full rounded-md border bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    ),
                    h.Value(model.draftTitle),
                    h.OnInput(value =>
                      TableState.Message.ChangedDraftField({
                        field: 'title',
                        value,
                      }),
                    ),
                  ]),
                ],
              ),
              field('Label', 'label', taskLabels),
              field('Status', 'status', taskStatuses),
              field('Priority', 'priority', taskPriorities),
              h.div(
                [h.Class('grid gap-2')],
                [
                  h.label(
                    [h.Class('text-sm font-medium leading-none')],
                    ['Estimated Hours'],
                  ),
                  h.input([
                    h.Type('number'),
                    h.Class(
                      'border-input flex h-8 w-full rounded-md border bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    ),
                    h.Value(model.draftHours),
                    h.OnInput(value =>
                      TableState.Message.ChangedDraftField({
                        field: 'estimatedHours',
                        value,
                      }),
                    ),
                  ]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('mt-auto flex justify-end gap-2')],
            [
              button(
                {
                  variant: 'outline',
                  size: 'sm',
                  children: ['Cancel'],
                  onClick: TableState.Message.ClosedUpdateSheet({}),
                },
                h,
              ),
              button(
                {
                  variant: 'default',
                  size: 'sm',
                  children: ['Save'],
                  onClick: TableState.Message.SavedTask({}),
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

const deleteDialog = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.deleteDialogIds.length === 0) return h.empty
  const count = model.deleteDialogIds.length
  return h.div(
    [],
    [
      h.div([
        h.Class('fixed inset-0 z-50 bg-black/50'),
        h.OnClick(TableState.Message.ClosedDeleteDialog({})),
      ]),
      h.div(
        [
          h.Role('alertdialog'),
          h.AriaModal(true),
          h.DataAttribute('slot', 'alert-dialog-content'),
          h.Class(
            // eslint-disable-next-line shadcn/no-arbitrary-values -- reason: mirrors tablecn's sheet max-w calc verbatim.
            'bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
          ),
        ],
        [
          h.div(
            [h.Class('flex flex-col gap-2 text-center sm:text-left')],
            [
              h.h2(
                [h.Class('text-lg font-semibold')],
                ['Are you absolutely sure?'],
              ),
              h.p(
                [h.Class('text-muted-foreground text-sm')],
                [
                  `This action cannot be undone. This will permanently delete ${count === 1 ? 'this task' : `${String(count)} tasks`} from our servers.`,
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end')],
            [
              button(
                {
                  variant: 'outline',
                  size: 'sm',
                  children: ['Cancel'],
                  onClick: TableState.Message.ClosedDeleteDialog({}),
                },
                h,
              ),
              button(
                {
                  variant: 'destructive',
                  size: 'sm',
                  children: ['Delete'],
                  onClick: TableState.Message.ConfirmedDelete({}),
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/* ---------- action bar (diceui ActionBar port) ---------- */

const tasksActionBar = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const { rows } = TableState.pageTasks(model)
  const selected = new Set(model.selectedIds)
  const visible = rows.filter(row => selected.has(row.id))
  const open = visible.length > 0
  const menuItem = (label: string, onSelect: TableState.Message): Html =>
    h.button(
      [
        h.Type('button'),
        h.Role('menuitem'),
        h.OnClick(onSelect),
        h.Class(cn(MENU_ITEM_CLASS, 'pl-8')),
      ],
      [label],
    )
  const enumMenu = (
    menuId: string,
    label: string,
    iconName: string,
    options: ReadonlyArray<string>,
    apply: (value: string) => TableState.Message,
  ): Html => {
    const isOpen = model.actionBarMenu === menuId
    return h.div(
      [h.Class('relative')],
      [
        actionBarItem(
          {
            onSelect: TableState.Message.SetActionBarMenu({ menu: menuId }),
            class: 'gap-1.5',
            children: [
              icon(iconName, { class: 'size-4' }, h),
              label,
              icon('chevron-down', { class: 'size-3.5 opacity-60' }, h),
            ],
          },
          h,
        ),
        ...(isOpen
          ? [
              h.button([
                h.Type('button'),
                h.AriaHidden(true),
                h.Tabindex(-1),
                h.Class('fixed inset-0 z-40 cursor-default bg-transparent'),
                h.OnClick(TableState.Message.SetActionBarMenu({ menu: '' })),
              ]),
              h.div(
                [
                  h.Role('menu'),
                  h.DataAttribute('slot', 'dropdown-menu-content'),
                  h.Class(
                    cn(PANEL_CLASS, 'bottom-full left-0 top-auto mb-1 w-36'),
                  ),
                ],
                [
                  h.div([h.Class(MENU_LABEL_CLASS)], [label]),
                  ...options.map(option =>
                    menuItem(capitalize(option), apply(option)),
                  ),
                ],
              ),
            ]
          : []),
      ],
    )
  }
  return actionBar(
    {
      open,
      toParentMessage: message =>
        /* Forward mount-stream messages; update() closes the bar on
           RequestedClose and ignores the rest. */
        message._tag === 'RequestedClose'
          ? GotActionBarMount({ message })
          : GotToolbarMount({ message }),
      children: [
        actionBarSelection(
          {
            children: [
              h.span([h.Class('font-medium')], [String(visible.length)]),
              h.span([h.Class('text-muted-foreground')], ['selected']),
              actionBarSeparator({}, h),
              actionBarClose(
                {
                  onClose: TableState.Message.ClosedActionBar({}),
                  ariaLabel: 'Clear selection',
                  children: [icon('x', { class: 'size-4' }, h)],
                },
                h,
              ),
            ],
          },
          h,
        ),
        actionBarGroup(
          {
            children: [
              enumMenu(
                'status',
                'Status',
                'check-circle-2',
                [...taskStatuses],
                status => TableState.Message.AppliedBulkStatus({ status }),
              ),
              enumMenu(
                'priority',
                'Priority',
                'arrow-up',
                [...taskPriorities],
                priority =>
                  TableState.Message.AppliedBulkPriority({ priority }),
              ),
              actionBarItem(
                {
                  onSelect: TableState.Message.RequestedExport({}),
                  class: 'gap-1.5',
                  children: [
                    icon('download', { class: 'size-4' }, h),
                    'Export',
                  ],
                },
                h,
              ),
              actionBarItem(
                {
                  variant: 'destructive',
                  onSelect: TableState.Message.OpenedDeleteDialog({
                    ids: [...selected],
                  }),
                  class: 'gap-1.5',
                  children: [icon('trash-2', { class: 'size-4' }, h), 'Delete'],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

/* ---------- pagination ---------- */

const pagination = (
  model: TableState.Model,
  pageCount: number,
  h: HtmlBuilder<Message>,
): Html => {
  const page = Math.min(model.pageIndex, pageCount - 1)
  const selected = model.selectedIds.length
  const pageBtn = (
    label: string,
    iconName: string,
    onClick: TableState.Message,
    isDisabled: boolean,
    extra?: string,
  ): Html =>
    h.button(
      [
        h.Type('button'),
        h.AriaLabel(label),
        h.OnClick(onClick),
        ...(isDisabled ? [h.Attribute('disabled', '')] : []),
        h.Class(
          cn(
            'border-input inline-flex size-8 items-center justify-center rounded-md border bg-transparent shadow-xs transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:rtl:rotate-180',
            extra ?? '',
          ),
        ),
      ],
      [icon(iconName, {}, h)],
    )
  return h.div(
    [
      h.DataAttribute('slot', 'data-table-pagination'),
      h.Class(
        'flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8',
      ),
    ],
    [
      h.div(
        [
          h.Role('status'),
          h.Class('text-muted-foreground flex-1 text-sm whitespace-nowrap'),
        ],
        [`${String(selected)} row${selected === 1 ? '' : 's'} selected.`],
      ),
      h.div(
        [
          h.Class(
            'flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8',
          ),
        ],
        [
          h.div(
            [h.Class('flex items-center gap-2')],
            [
              h.p(
                [h.Class('text-sm font-medium whitespace-nowrap')],
                ['Rows per page'],
              ),
              h.select(
                [
                  h.AriaLabel('Rows per page'),
                  h.Class(
                    'border-input flex h-8 w-18 rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  ),
                  h.OnInput(value =>
                    TableState.Message.SetPageSize({
                      size: Number(value),
                    }),
                  ),
                ],
                [10, 20, 30, 40, 50].map(size =>
                  h.option(
                    [
                      h.Value(String(size)),
                      ...(size === model.pageSize
                        ? [h.Attribute('selected', '')]
                        : []),
                    ],
                    [String(size)],
                  ),
                ),
              ),
            ],
          ),
          h.div(
            [
              h.Class(
                'flex items-center justify-center text-sm font-medium whitespace-nowrap',
              ),
            ],
            [`Page ${String(page + 1)} of ${String(pageCount)}`],
          ),
          h.div(
            [h.Class('flex items-center gap-2')],
            [
              pageBtn(
                'Go to first page',
                'chevrons-left',
                TableState.Message.SetPage({ index: 0 }),
                page === 0,
                'hidden lg:flex',
              ),
              pageBtn(
                'Go to previous page',
                'chevron-left',
                TableState.Message.SetPage({ index: page - 1 }),
                page === 0,
              ),
              pageBtn(
                'Go to next page',
                'chevron-right',
                TableState.Message.SetPage({ index: page + 1 }),
                page >= pageCount - 1,
              ),
              pageBtn(
                'Go to last page',
                'chevrons-right',
                TableState.Message.SetPage({ index: pageCount - 1 }),
                page >= pageCount - 1,
                'hidden lg:flex',
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/* ---------- the data table ---------- */

const tasksTable = (model: TableState.Model, h: HtmlBuilder<Message>): Html => {
  const { rows, pageCount } = TableState.pageTasks(model)
  const columns = visibleColumns(model)
  const filterCount = TableState.filterCount(model)
  return h.div(
    [
      h.DataAttribute('slot', 'data-table'),
      h.Dir(model.direction),
      h.Class('flex w-full flex-col gap-2.5 overflow-auto'),
    ],
    [
      h.div(
        [h.Class('flex items-start justify-between gap-2 p-1')],
        [
          h.div([h.Class('text-sm font-medium')], ['Tasks']),
          controlMenu(model, h),
        ],
      ),
      h.div(
        [
          h.DataAttribute('slot', 'data-table-toolbar'),
          h.Class('flex w-full items-start justify-between gap-2 p-1'),
        ],
        [
          h.div(
            [h.Class('flex flex-1 flex-wrap items-center gap-2')],
            [
              h.input([
                h.Type('text'),
                h.Placeholder('Search titles...'),
                h.AriaLabel('Search titles'),
                h.Value(model.titleQuery),
                h.OnInput(value =>
                  TableState.Message.ChangedTitleQuery({
                    value,
                  }),
                ),
                h.Class(
                  'border-input placeholder:text-muted-foreground flex h-8 w-40 rounded-md border bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring lg:w-56',
                ),
              ]),
              facetedFilter(
                model,
                'status',
                'Status',
                taskStatuses.map(value => ({
                  value,
                  label:
                    value === 'in-progress' ? 'In-Progress' : capitalize(value),
                  iconName: STATUS_ICONS[value] ?? 'circle',
                })),
                model.statusFilter,
                value => TableState.Message.ToggledStatusFilter({ value }),
                h,
              ),
              facetedFilter(
                model,
                'priority',
                'Priority',
                taskPriorities.map(value => ({
                  value,
                  label: capitalize(value),
                  iconName: PRIORITY_ICONS[value] ?? 'minus',
                })),
                model.priorityFilter,
                value => TableState.Message.ToggledPriorityFilter({ value }),
                h,
              ),
              rangeFilter(model, h),
              dateRangeFilter(model, h),
              ...(filterCount > 0
                ? [
                    button(
                      {
                        variant: 'outline',
                        size: 'sm',
                        // eslint-disable-next-line crease/no-component-restyle -- reason: mirrors tablecn's dashed Reset-filter button verbatim.
                        class: 'border-dashed',
                        children: [icon('x', { class: 'size-4' }, h), 'Reset'],
                        onClick: TableState.Message.ClearedFilters({}),
                      },
                      h,
                    ) as Html,
                  ]
                : []),
            ],
          ),
          h.div(
            [h.Class('flex items-center gap-2')],
            [sortMenu(model, h), viewOptions(model, h)],
          ),
        ],
      ),
      h.div(
        [h.Class('isolate overflow-hidden rounded-md border')],
        [
          h.table(
            [
              h.Role('table'),
              h.AriaLabel('Tasks'),
              h.Class('w-full table-fixed caption-bottom text-sm'),
              h.Style({ minWidth: '100%' }),
            ],
            [
              h.thead(
                [h.Class('[&_tr]:border-b')],
                [
                  h.tr(
                    [h.Class('border-b transition-colors')],
                    columns.map(column => headerCell(model, column, h)),
                  ),
                ],
              ),
              h.tbody(
                [h.Class('[&_tr:last-child]:border-0')],
                rows.map(task =>
                  h.tr(
                    [
                      h.DataAttribute(
                        'state',
                        model.selectedIds.includes(task.id)
                          ? 'selected'
                          : 'unselected',
                      ),
                      h.Class(
                        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                      ),
                    ],
                    columns.map(column =>
                      h.td(
                        [
                          h.Class('p-2 align-middle'),
                          ...(column.id === 'title'
                            ? [h.Class('min-w-0')]
                            : []),
                        ],
                        [taskCell(model, task, column.id, h)],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex flex-col gap-2.5')],
        [pagination(model, pageCount, h), tasksActionBar(model, h)],
      ),
      updateSheet(model, h),
      deleteDialog(model, h),
    ],
  )
}

/* ---------- page ---------- */

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const hg = h as HtmlBuilder<Grid.Message>
  return h.div(
    [h.Class('flex w-full flex-col gap-4')],
    [
      h.div(
        [
          h.Role('tablist'),
          h.AriaLabel('tablecn examples'),
          h.Class(
            'bg-muted inline-flex w-fit items-center gap-1 rounded-md p-1',
          ),
        ],
        (['data-table', 'data-grid'] as const).map(tab =>
          h.button(
            [
              h.Type('button'),
              h.Role('tab'),
              h.AriaSelected(model.view === tab),
              h.OnClick(SwitchView({ view: tab })),
              h.Class(
                cn(
                  'rounded-sm px-3 py-1 text-sm font-medium transition-colors',
                  model.view === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ),
              ),
            ],
            [tab === 'data-table' ? 'Data Table' : 'Data Grid'],
          ),
        ),
      ),
      model.view === 'data-table'
        ? tasksTable(model.table, h)
        : gridView(model.grid, hg),
    ],
  )
}
