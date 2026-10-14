/* tablecn data-grid view — Tailwind. Port of
   tablecn/src/app/data-grid/components/data-grid-demo.tsx: dense editable
   grid with column headers, cell focus/edit, row selection, context menu,
   search overlay, toolbar (direction/filter/sort/height/view) and add-row. */

import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { dateFromISO } from '@/lib/date-parse'
import { icon } from '@/lib/icon'
import * as Grid from '@/lib/tablecn-grid'
import {
  departments,
  personStatuses,
  skills as skillOptions,
  type FileCellData,
  type Person,
} from '@/lib/tablecn-data'
import { cn } from '@/lib/utils'
import * as Calendar from '@/ui/calendar'

import type { Message } from './tablecn-page'

const MENU_ITEM_CLASS =
  'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
const MENU_LABEL_CLASS = 'text-muted-foreground px-2 py-1.5 text-xs font-medium'
const MENU_SEPARATOR_CLASS = 'bg-border -mx-1 my-1 h-px'
const PANEL_CLASS =
  'bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-fit min-w-48 rounded-md border p-1 shadow-md crease-action-bar-in'

const TRIGGER_PANEL = (
  isOpen: boolean,
  trigger: Html,
  onClose: Message,
  panel: Html,
  h: HtmlBuilder<Message>,
  align: 'start' | 'end' = 'start',
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
                h.Class(cn(PANEL_CLASS, align === 'end' ? 'end-0' : 'start-0')),
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

const columnMenuItem =
  (
    iconName: string,
    label: string,
    onClick: Grid.Message,
    checked: boolean,
  ): ((h: HtmlBuilder<Grid.Message>) => Html) =>
  (h: HtmlBuilder<Grid.Message>) =>
    h.button(
      [
        h.Type('button'),
        h.Role('menuitemcheckbox'),
        h.AriaChecked(checked),
        h.OnClick(onClick),
        h.Class(
          'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        ),
      ],
      [
        icon(iconName, {}, h),
        label,
        ...(checked
          ? [icon('check', { class: 'ms-auto text-foreground!' }, h)]
          : []),
      ],
    )

const columnMenu =
  (
    column: GridColumn,
    entry: { id: string; desc: boolean } | undefined,
  ): ((h: HtmlBuilder<Grid.Message>) => Html) =>
  (h: HtmlBuilder<Grid.Message>) =>
    h.div(
      [
        h.Class(
          'bg-popover text-popover-foreground absolute top-full start-0 z-50 w-60 rounded-md border p-1 shadow-md crease-action-bar-in',
        ),
      ],
      [
        columnMenuItem(
          'chevron-up',
          'Sort asc',
          Grid.Message.SetSorting({ column: column.id, desc: false }),
          entry !== undefined && !entry.desc,
        )(h),
        columnMenuItem(
          'chevron-down',
          'Sort desc',
          Grid.Message.SetSorting({ column: column.id, desc: true }),
          entry !== undefined && entry.desc,
        )(h),
        ...(entry === undefined
          ? []
          : [
              columnMenuItem(
                'x',
                'Remove sort',
                Grid.Message.RemovedSort({ column: column.id }),
                false,
              )(h),
            ]),
        h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
        h.button(
          [
            h.Type('button'),
            h.OnClick(Grid.Message.HidColumn({ column: column.id })),
            h.Class(
              'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
            ),
          ],
          [icon('eye-off', {}, h), 'Hide column'],
        ),
      ],
    )

const toolButton = (
  label: string,
  iconName: string,
  onClick: Message,
  h: HtmlBuilder<Message>,
  active = false,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.AriaLabel(label),
      h.AriaPressed(String(active)),
      h.OnClick(onClick),
      h.Class(
        cn(
          'border-input inline-flex h-8 items-center gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground',
          active && 'bg-accent',
        ),
      ),
    ],
    [icon(iconName, {}, h), label],
  )

interface GridColumn {
  id: string
  header: string
  iconName: string
  width: number
  variant:
    | 'text'
    | 'number'
    | 'url'
    | 'long-text'
    | 'select'
    | 'multi-select'
    | 'checkbox'
    | 'date'
    | 'file'
  options?: ReadonlyArray<string>
  numberMin?: number
  numberMax?: number
  numberStep?: number
}

const GRID_COLUMNS: ReadonlyArray<GridColumn> = [
  { id: 'name', header: 'Name', iconName: 'text', width: 160, variant: 'text' },
  {
    id: 'age',
    header: 'Age',
    iconName: 'hash',
    width: 80,
    variant: 'number',
    numberMin: 18,
    numberMax: 100,
    numberStep: 1,
  },
  {
    id: 'email',
    header: 'Email',
    iconName: 'mail',
    width: 220,
    variant: 'text',
  },
  {
    id: 'website',
    header: 'Website',
    iconName: 'globe',
    width: 200,
    variant: 'url',
  },
  {
    id: 'notes',
    header: 'Notes',
    iconName: 'file-text',
    width: 320,
    variant: 'long-text',
  },
  {
    id: 'salary',
    header: 'Salary',
    iconName: 'hash',
    width: 120,
    variant: 'number',
    numberMin: 0,
    numberStep: 1000,
  },
  {
    id: 'department',
    header: 'Department',
    iconName: 'building-2',
    width: 160,
    variant: 'select',
    options: departments,
  },
  {
    id: 'status',
    header: 'Status',
    iconName: 'list-checks',
    width: 140,
    variant: 'select',
    options: personStatuses,
  },
  {
    id: 'skills',
    header: 'Skills',
    iconName: 'tags',
    width: 200,
    variant: 'multi-select',
    options: skillOptions,
  },
  {
    id: 'isActive',
    header: 'Active',
    iconName: 'check-square',
    width: 90,
    variant: 'checkbox',
  },
  {
    id: 'startDate',
    header: 'Start Date',
    iconName: 'calendar',
    width: 140,
    variant: 'date',
  },
  {
    id: 'attachments',
    header: 'Attachments',
    iconName: 'paperclip',
    width: 180,
    variant: 'file',
  },
]

const SELECT_COL_WIDTH = 48

const columnById = (id: string): GridColumn =>
  GRID_COLUMNS.find(c => c.id === id) ?? GRID_COLUMNS[0]!

/* ---------- cell render ---------- */

const cellContent = (
  person: Grid.Model['rows'][number],
  column: GridColumn,
  rowIndex: number,
  h: HtmlBuilder<Grid.Message>,
): Html | string => {
  const p = person as Person
  switch (column.variant) {
    case 'number':
      return h.div(
        [
          h.Class(
            'flex h-full w-full items-center justify-end px-2 tabular-nums',
          ),
        ],
        [Grid.cellText(p, column.id)],
      )
    case 'checkbox':
      return h.div(
        [h.Class('flex h-full w-full items-center justify-center')],
        [
          h.input([
            h.Type('checkbox'),
            ...(p.isActive === true ? [h.Attribute('checked', 'true')] : []),
            h.Tabindex(-1),
            h.Class('size-4 accent-primary cursor-pointer'),
            h.OnClick(
              Grid.Message.ToggledCellBoolean({
                row: rowIndex,
                column: column.id,
              }),
            ),
          ]),
        ],
      )
    case 'url':
      return h.div(
        [h.Class('flex h-full w-full items-center px-2 overflow-hidden')],
        p.website === undefined || p.website === ''
          ? []
          : [
              h.a(
                [
                  h.Href(p.website),
                  h.Target('_blank'),
                  h.Attribute('rel', 'noopener noreferrer'),
                  h.Tabindex(-1),
                  h.Class(
                    'truncate text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60',
                  ),
                ],
                [p.website],
              ),
            ],
      )
    case 'select':
      return h.div(
        [h.Class('flex h-full items-center px-2')],
        [
          h.span(
            [
              h.Class(
                'bg-secondary text-secondary-foreground inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md px-1.5 py-px text-xs font-medium whitespace-pre-wrap',
              ),
            ],
            [Grid.cellText(p, column.id)],
          ),
        ],
      )
    case 'multi-select':
      return h.div(
        [h.Class('flex h-full items-center gap-1 overflow-hidden px-2')],
        (p.skills ?? []).map(skill =>
          h.span(
            [
              h.Class(
                'bg-secondary inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-xs font-medium',
              ),
            ],
            [skill],
          ),
        ),
      )
    case 'file':
      return h.div(
        [h.Class('flex h-full items-center gap-1 overflow-hidden px-2')],
        (p.attachments ?? []).map(file =>
          h.span(
            [
              h.Class(
                'bg-muted inline-flex shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs',
              ),
            ],
            [icon('paperclip', { class: 'size-3' }, h), file.name],
          ),
        ),
      )
    case 'long-text':
      return h.div(
        [h.Class('flex h-full items-center px-2')],
        [h.span([h.Class('truncate text-muted-foreground')], [p.notes ?? ''])],
      )
    default:
      return h.div(
        [h.Class('flex h-full items-center px-2 truncate')],
        [Grid.cellText(p, column.id)],
      )
  }
}

/* ---------- cell editors ----------
   one editor per column variant, matching tablecn's
   data-grid-cell-variants.tsx (short-text input, number input with
   min/max/step, long-text textarea popover, select option list,
   multi-select badge/command popover, checkbox toggle, date calendar
   popover, file list + upload popover) */

const EDITOR_SCRIM = (
  onClose: Grid.Message,
  h: HtmlBuilder<Grid.Message>,
): Html =>
  h.button([
    h.Type('button'),
    h.AriaHidden(true),
    h.Tabindex(-1),
    h.Class('fixed inset-0 z-40 cursor-default bg-transparent'),
    h.OnClick(onClose),
  ])

const EDITOR_POPUP_CLASS =
  'bg-popover text-popover-foreground absolute start-0 top-full z-50 mt-0.5 rounded-md border shadow-md'

const textInputEditor = (
  model: Grid.Model,
  column: GridColumn,
  h: HtmlBuilder<Grid.Message>,
): Html =>
  h.input([
    h.Type('text'),
    h.Value(model.draftValue),
    h.OnInput(value => Grid.Message.ChangedDraft({ value })),
    h.Class(
      'absolute inset-0 h-full w-full bg-background px-2 text-sm outline-none ring-1 ring-inset ring-ring',
    ),
    h.OnMount(
      Grid.gridEditorFocusMount(() => Grid.Message.CompletedEditorFocus({})),
    ),
  ])

const numberInputEditor = (
  model: Grid.Model,
  column: GridColumn,
  h: HtmlBuilder<Grid.Message>,
): Html =>
  h.input([
    h.Type('number'),
    ...(column.numberMin === undefined
      ? []
      : [h.Min(String(column.numberMin))]),
    ...(column.numberMax === undefined
      ? []
      : [h.Max(String(column.numberMax))]),
    ...(column.numberStep === undefined
      ? []
      : [h.Step(String(column.numberStep))]),
    h.Value(model.draftValue),
    h.OnInput(value => Grid.Message.ChangedDraft({ value })),
    h.Class(
      // eslint-disable-next-line shadcn/no-arbitrary-values -- reason: mirrors tablecn's NumberCell spinner-stripping verbatim.
      'absolute inset-0 h-full w-full bg-background px-2 text-sm outline-none ring-1 ring-inset ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    ),
    h.OnMount(
      Grid.gridEditorFocusMount(() => Grid.Message.CompletedEditorFocus({})),
    ),
  ])

const cellEditor = (
  model: Grid.Model,
  person: Person,
  column: GridColumn,
  rowIndex: number,
  h: HtmlBuilder<Grid.Message>,
): Html => {
  switch (column.variant) {
    case 'number':
      return numberInputEditor(model, column, h)
    case 'long-text':
      return h.div(
        [h.Class('contents')],
        [
          EDITOR_SCRIM(Grid.Message.CommittedDraft({ move: 'none' }), h),
          h.div(
            [h.Class(cn(EDITOR_POPUP_CLASS, 'w-100 p-0'))],
            [
              h.textarea([
                h.Attribute('placeholder', 'Enter text...'),
                h.Value(model.draftValue),
                h.OnInput(value => Grid.Message.ChangedDraft({ value })),
                h.Class(
                  'max-h-75 min-h-37.5 w-full resize-none overflow-y-auto rounded-none border-0 bg-transparent p-3 text-sm shadow-none outline-none focus-visible:ring-1 focus-visible:ring-ring',
                ),
                h.OnMount(
                  Grid.gridEditorFocusMount(() =>
                    Grid.Message.CompletedEditorFocus({}),
                  ),
                ),
              ]),
            ],
          ),
        ],
      )
    case 'select':
      return h.div(
        [h.Class('contents')],
        [
          EDITOR_SCRIM(Grid.Message.CanceledEdit({}), h),
          h.div(
            [
              h.Class(
                cn(
                  EDITOR_POPUP_CLASS,
                  // eslint-disable-next-line shadcn/no-arbitrary-values -- reason: mirrors tablecn's SelectContent anchor-width+16px compensation verbatim.
                  'w-max min-w-[calc(100%+16px)] max-w-60 p-1',
                ),
              ),
              h.OnMount(
                Grid.cellEditorPopupFitMount(() =>
                  Grid.Message.CompletedEditorFocus({}),
                ),
              ),
            ],
            (column.options ?? []).map(option =>
              h.button(
                [
                  h.Type('button'),
                  h.Role('option'),
                  h.AriaSelected(option === Grid.cellText(person, column.id)),
                  h.OnClick(
                    Grid.Message.AppliedCellOption({
                      row: rowIndex,
                      column: column.id,
                      value: option,
                    }),
                  ),
                  h.Class(
                    'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none select-none hover:bg-accent',
                  ),
                ],
                [
                  h.span([], [option]),
                  ...(option === Grid.cellText(person, column.id)
                    ? [icon('check', { class: 'absolute right-2 size-4' }, h)]
                    : []),
                ],
              ),
            ),
          ),
        ],
      )
    case 'multi-select': {
      const selected = person.skills ?? []
      const query = model.draftValue.toLowerCase()
      const options = (column.options ?? []).filter(option =>
        option.toLowerCase().includes(query),
      )
      return h.div(
        [h.Class('contents')],
        [
          EDITOR_SCRIM(Grid.Message.CanceledEdit({}), h),
          h.div(
            [
              h.Class(cn(EDITOR_POPUP_CLASS, 'w-75 p-0')),
              h.OnMount(
                Grid.cellEditorPopupFitMount(() =>
                  Grid.Message.CompletedEditorFocus({}),
                ),
              ),
            ],
            [
              h.div(
                [
                  h.Class(
                    'flex min-h-9 flex-wrap items-center gap-1 border-b px-3 py-1.5',
                  ),
                ],
                [
                  ...selected.map(skill =>
                    h.span(
                      [
                        h.Class(
                          'bg-secondary inline-flex items-center gap-1 rounded-md px-1.5 py-px text-xs font-medium',
                        ),
                      ],
                      [
                        skill,
                        h.button(
                          [
                            h.Type('button'),
                            h.AriaLabel(`Remove ${skill}`),
                            h.OnClick(
                              Grid.Message.ToggledCellOption({
                                row: rowIndex,
                                column: column.id,
                                option: skill,
                              }),
                            ),
                          ],
                          [icon('x', { class: 'size-3' }, h)],
                        ),
                      ],
                    ),
                  ),
                  h.input([
                    h.Type('text'),
                    h.Value(model.draftValue),
                    h.Attribute('placeholder', 'Search...'),
                    h.OnInput(value => Grid.Message.ChangedDraft({ value })),
                    h.Class(
                      'min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground',
                    ),
                    h.OnMount(
                      Grid.gridEditorFocusMount(() =>
                        Grid.Message.CompletedEditorFocus({}),
                      ),
                    ),
                  ]),
                ],
              ),
              h.div(
                [h.Class('max-h-75 overflow-y-auto p-1')],
                options.length === 0
                  ? [
                      h.div(
                        [
                          h.Class(
                            'py-6 text-center text-sm text-muted-foreground',
                          ),
                        ],
                        ['No options found.'],
                      ),
                    ]
                  : options.map(option => {
                      const checked = selected.includes(option)
                      return h.button(
                        [
                          h.Type('button'),
                          h.OnClick(
                            Grid.Message.ToggledCellOption({
                              row: rowIndex,
                              column: column.id,
                              option,
                            }),
                          ),
                          h.Class(
                            'flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent',
                          ),
                        ],
                        [
                          h.span(
                            [
                              h.Class(
                                cn(
                                  'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                                  checked
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input',
                                ),
                              ),
                            ],
                            checked
                              ? [icon('check', { class: 'size-3' }, h)]
                              : [],
                          ),
                          h.span([], [option]),
                        ],
                      )
                    }),
              ),
              ...(selected.length > 0
                ? [
                    h.div(
                      [h.Class('border-t p-1')],
                      [
                        h.button(
                          [
                            h.Type('button'),
                            h.OnClick(
                              Grid.Message.ClearedCellOptions({
                                row: rowIndex,
                                column: column.id,
                              }),
                            ),
                            h.Class(
                              'w-full rounded-sm py-1.5 text-sm text-muted-foreground outline-none hover:bg-accent',
                            ),
                          ],
                          ['Clear all'],
                        ),
                      ],
                    ),
                  ]
                : []),
            ],
          ),
        ],
      )
    }
    case 'date':
      return h.div(
        [h.Class('contents')],
        [
          EDITOR_SCRIM(Grid.Message.CanceledEdit({}), h),
          h.div(
            [
              h.Class(cn(EDITOR_POPUP_CLASS, 'w-auto p-0')),
              h.OnMount(
                Grid.cellEditorPopupFitMount(() =>
                  Grid.Message.CompletedEditorFocus({}),
                ),
              ),
            ],
            [
              Calendar.calendar(
                {
                  model: model.cellCalendar,
                  maybeSelectedDate: dateFromISO(person.startDate ?? ''),
                  toParentMessage: message =>
                    Grid.Message.GotCellCalendarMessage({ message }),
                  captionLayout: 'dropdown',
                  direction: model.direction,
                },
                h,
              ),
            ],
          ),
        ],
      )
    case 'file': {
      const files = person.attachments ?? []
      return h.div(
        [h.Class('contents')],
        [
          EDITOR_SCRIM(Grid.Message.CanceledEdit({}), h),
          h.div(
            [
              h.Class(cn(EDITOR_POPUP_CLASS, 'w-75 p-2')),
              h.OnMount(
                Grid.cellEditorPopupFitMount(() =>
                  Grid.Message.CompletedEditorFocus({}),
                ),
              ),
            ],
            [
              ...files.map(file =>
                h.div(
                  [
                    h.Class(
                      'flex items-center gap-2 rounded-sm px-1 py-1.5 text-sm',
                    ),
                  ],
                  [
                    icon(
                      'paperclip',
                      { class: 'size-3.5 shrink-0 text-muted-foreground' },
                      h,
                    ),
                    h.span([h.Class('flex-1 truncate')], [file.name]),
                    h.span(
                      [h.Class('shrink-0 text-xs text-muted-foreground')],
                      [formatFileSize(file.size)],
                    ),
                    h.button(
                      [
                        h.Type('button'),
                        h.AriaLabel(`Remove ${file.name}`),
                        h.OnClick(
                          Grid.Message.RemovedCellFile({
                            row: rowIndex,
                            column: column.id,
                            fileId: file.id,
                          }),
                        ),
                        h.Class(
                          'inline-flex size-5 shrink-0 items-center justify-center rounded-sm outline-none hover:bg-accent',
                        ),
                      ],
                      [icon('x', { class: 'size-3' }, h)],
                    ),
                  ],
                ),
              ),
              h.label(
                [
                  h.Class(
                    'mt-1 flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground transition-colors hover:bg-accent/50',
                  ),
                ],
                [
                  h.input([
                    h.Type('file'),
                    h.Attribute('multiple', ''),
                    h.Class('hidden'),
                    h.OnMount(
                      Grid.cellFilePickerMount(mount =>
                        mount._tag === 'FilesPicked'
                          ? Grid.Message.PickedCellFiles({
                              files: mount.files,
                            })
                          : Grid.Message.CanceledEdit({}),
                      ),
                    ),
                  ]),
                  icon('upload', { class: 'size-4 text-muted-foreground' }, h),
                  'Click to upload files',
                  h.span([h.Class('text-xs')], ['Max 5 files, 10MB each']),
                ],
              ),
            ],
          ),
        ],
      )
    }
    default:
      return textInputEditor(model, column, h)
  }
}

const formatFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(Math.round(bytes / 1024), 1)} KB`

/* ---------- toolbar ---------- */

const toolbarButtonPanel = (
  model: Grid.Model,
  panelId: string,
  label: string,
  iconName: string,
  panel: Html,
  h: HtmlBuilder<Grid.Message>,
  align: 'start' | 'end' = 'start',
): Html => {
  const isOpen = model.openPanel === panelId
  return TRIGGER_PANEL(
    isOpen,
    h.button(
      [
        h.Type('button'),
        h.AriaLabel(label),
        h.AriaHasPopup('menu'),
        h.AriaExpanded(isOpen),
        h.OnClick(Grid.Message.SetPanel({ panel: panelId })),
        h.Class(
          cn(
            'border-input inline-flex h-8 items-center gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent [&_svg]:size-4',
            isOpen && 'bg-accent',
          ),
        ),
      ],
      [icon(iconName, {}, h), label],
    ),
    Grid.Message.SetPanel({ panel: '' }),
    panel,
    h as HtmlBuilder<Message>,
    align,
  )
}

const gridToolbar = (model: Grid.Model, h: HtmlBuilder<Grid.Message>): Html =>
  h.div(
    [h.Class('flex items-center justify-end gap-2')],
    [
      toolButton(
        model.direction === 'ltr' ? 'LTR' : 'RTL',
        'languages',
        Grid.Message.SetDirection({
          direction: model.direction === 'ltr' ? 'rtl' : 'ltr',
        }),
        h as HtmlBuilder<Message>,
      ),
      toolbarButtonPanel(
        model,
        'filter',
        'Filter',
        'funnel',
        h.div(
          [h.Class('w-72 p-3')],
          [
            h.div([h.Class('mb-2 text-sm font-medium')], ['Filter']),
            ...visibleCols(model).map(column =>
              h.div(
                [h.Class('mb-1.5 flex items-center gap-2')],
                [
                  h.span(
                    [h.Class('text-muted-foreground w-24 text-xs')],
                    [column.header],
                  ),
                  h.input([
                    h.Type('text'),
                    h.Class(
                      'border-input h-7 w-full min-w-0 rounded-md border bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    ),
                    h.Value(
                      model.filters.find(f => f.column === column.id)?.value ??
                        '',
                    ),
                    h.OnInput(value =>
                      value === ''
                        ? Grid.Message.RemovedFilter({ column: column.id })
                        : Grid.Message.AddedFilter({
                            column: column.id,
                            value,
                          }),
                    ),
                  ]),
                ],
              ),
            ),
          ],
        ),
        h,
      ),
      toolbarButtonPanel(
        model,
        'sort',
        'Sort',
        'arrow-down-up',
        h.div(
          [],
          [
            h.div([h.Class(MENU_LABEL_CLASS)], ['Sort by']),
            ...visibleCols(model).map(column => {
              const entry = model.sorting.find(s => s.id === column.id)
              return h.button(
                [
                  h.Type('button'),
                  h.OnClick(Grid.Message.ToggledSort({ column: column.id })),
                  h.Class(cn(MENU_ITEM_CLASS, 'pl-8')),
                ],
                [
                  icon(column.iconName, {}, h),
                  column.header,
                  h.span(
                    [h.Class('ml-auto text-muted-foreground')],
                    [entry === undefined ? '' : entry.desc ? '↓' : '↑'],
                  ),
                ],
              )
            }),
            ...(model.sorting.length > 0
              ? [
                  h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(
                        Grid.Message.SetSorting({ column: '', desc: false }),
                      ),
                      h.Class(cn(MENU_ITEM_CLASS, 'justify-center pl-8')),
                    ],
                    ['Clear sorting'],
                  ),
                ]
              : []),
          ],
        ),
        h,
      ),
      toolbarButtonPanel(
        model,
        'height',
        capitalize(model.rowHeight),
        'rows-3',
        h.div(
          [],
          [
            h.div([h.Class(MENU_LABEL_CLASS)], ['Row height']),
            ...Grid.ROW_HEIGHTS.map(entry =>
              h.button(
                [
                  h.Type('button'),
                  h.AriaChecked(model.rowHeight === entry.id),
                  h.OnClick(Grid.Message.SetRowHeight({ height: entry.id })),
                  h.Class(cn(MENU_ITEM_CLASS, 'pl-8')),
                ],
                [
                  ...(model.rowHeight === entry.id
                    ? [icon('check', { class: 'size-4' }, h)]
                    : []),
                  h.span([], [entry.label]),
                ],
              ),
            ),
          ],
        ),
        h,
        'end',
      ),
      toolbarButtonPanel(
        model,
        'view',
        'View',
        'eye',
        h.div(
          [],
          [
            h.div([h.Class(MENU_LABEL_CLASS)], ['Toggle columns']),
            h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
            ...GRID_COLUMNS.map(column =>
              h.button(
                [
                  h.Type('button'),
                  h.Role('menuitemcheckbox'),
                  h.AriaChecked(!model.hiddenColumnIds.includes(column.id)),
                  h.OnClick(
                    Grid.Message.ToggledColumnHidden({ column: column.id }),
                  ),
                  h.Class(cn(MENU_ITEM_CLASS, 'pl-8')),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        'absolute start-2 flex size-3.5 items-center justify-center',
                      ),
                    ],
                    [
                      !model.hiddenColumnIds.includes(column.id)
                        ? icon('check', { class: 'size-4' }, h)
                        : h.empty,
                    ],
                  ),
                  column.header,
                ],
              ),
            ),
          ],
        ),
        h,
        'end',
      ),
    ],
  )

const visibleCols = (model: Grid.Model): Array<GridColumn> =>
  Grid.visibleColumns(model)
    .map(columnById)
    .filter(c => c.id !== '')

const capitalize = (value: string): string =>
  value === '' ? value : value[0]!.toUpperCase() + value.slice(1)

/* ---------- search overlay ---------- */

const searchOverlay = (
  model: Grid.Model,
  h: HtmlBuilder<Grid.Message>,
): Html => {
  if (!model.searchOpen) return h.empty
  const matches = Grid.searchMatches(model)
  return h.div(
    [
      h.DataAttribute('slot', 'grid-search'),
      h.Class(
        'bg-popover absolute top-2 end-2 z-40 flex items-center gap-1 rounded-md border p-1 shadow-md crease-action-bar-in',
      ),
    ],
    [
      icon('search', { class: 'ml-1 size-4 text-muted-foreground' }, h),
      h.input([
        h.Type('text'),
        h.Placeholder('Search…'),
        h.Value(model.searchQuery),
        h.OnInput(value => Grid.Message.ChangedSearchQuery({ value })),
        h.Class(
          'h-7 w-40 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground',
        ),
      ]),
      h.span(
        [h.Class('text-muted-foreground px-1 text-xs tabular-nums')],
        [
          matches.length === 0
            ? '0/0'
            : `${String(model.matchIndex + 1)}/${String(matches.length)}`,
        ],
      ),
      h.button(
        [
          h.Type('button'),
          h.AriaLabel('Previous match'),
          h.OnClick(Grid.Message.NavigatedMatch({ direction: 'prev' })),
          h.Class(
            'inline-flex size-6 items-center justify-center rounded-sm hover:bg-accent [&_svg]:size-4',
          ),
        ],
        [icon('chevron-up', {}, h)],
      ),
      h.button(
        [
          h.Type('button'),
          h.AriaLabel('Next match'),
          h.OnClick(Grid.Message.NavigatedMatch({ direction: 'next' })),
          h.Class(
            'inline-flex size-6 items-center justify-center rounded-sm hover:bg-accent [&_svg]:size-4',
          ),
        ],
        [icon('chevron-down', {}, h)],
      ),
      h.button(
        [
          h.Type('button'),
          h.AriaLabel('Close search'),
          h.OnClick(Grid.Message.ToggledSearch({})),
          h.Class(
            'inline-flex size-6 items-center justify-center rounded-sm hover:bg-accent [&_svg]:size-4',
          ),
        ],
        [icon('x', {}, h)],
      ),
    ],
  )
}

/* ---------- context menu ---------- */

const contextMenu = (model: Grid.Model, h: HtmlBuilder<Grid.Message>): Html => {
  if (!model.contextMenu.open) return h.empty
  const item = (label: string, action: string, iconName?: string): Html =>
    h.button(
      [
        h.Type('button'),
        h.Role('menuitem'),
        h.OnClick(Grid.Message.AppliedContextAction({ action })),
        h.Class(cn(MENU_ITEM_CLASS, iconName === undefined ? 'pl-8' : 'pl-8')),
      ],
      [...(iconName === undefined ? [] : [icon(iconName, {}, h)]), label],
    )
  return h.div(
    [],
    [
      h.button([
        h.Type('button'),
        h.AriaHidden(true),
        h.Tabindex(-1),
        h.Class('fixed inset-0 z-40 cursor-default bg-transparent'),
        h.OnClick(Grid.Message.ClosedContextMenu({})),
        h.OnContextMenu(Grid.Message.ClosedContextMenu({})),
      ]),
      h.div(
        [
          h.Role('menu'),
          h.DataAttribute('slot', 'grid-context-menu'),
          h.Class(
            'bg-popover text-popover-foreground fixed z-50 w-48 rounded-md border p-1 shadow-md crease-action-bar-in',
          ),
          h.Style({
            left: `${String(model.contextMenu.x)}px`,
            top: `${String(model.contextMenu.y)}px`,
          }),
        ],
        [
          item('Copy', 'copy', 'clipboard-copy'),
          item('Cut', 'cut', 'scissors'),
          item('Paste', 'paste', 'clipboard-paste'),
          h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
          item('Add row above', 'add-row-above', 'arrow-up-to-line'),
          item('Add row below', 'add-row-below', 'arrow-down-to-line'),
          h.div([h.Class(MENU_SEPARATOR_CLASS)], []),
          item('Clear cell', 'clear-cell', 'eraser'),
          item('Delete row', 'delete-row', 'trash-2'),
        ],
      ),
    ],
  )
}

/* ---------- grid ---------- */

/* reference: height = max(400, window.innerHeight - 150) */
const viewportHeightPx = (model: Grid.Model): number =>
  Math.max(400, model.viewportHeight - 150)
const OVERSCAN = 5

export const gridView = (
  model: Grid.Model,
  h: HtmlBuilder<Grid.Message>,
): Html => {
  const people = Grid.sortedPeople(Grid.filteredPeople(model), model.sorting)
  const columns = visibleCols(model)
  const rowH = Grid.rowHeightPx(model.rowHeight)
  const totalHeight = people.length * rowH
  const viewHeight = viewportHeightPx(model)
  const startIndex = Math.max(0, Math.floor(model.scrollTop / rowH) - OVERSCAN)
  const endIndex = Math.min(
    people.length,
    Math.ceil((model.scrollTop + viewHeight) / rowH) + OVERSCAN,
  )
  const gridWidth = columns.reduce((acc, c) => acc + c.width, SELECT_COL_WIDTH)
  const isSelected = (row: number, column: string): boolean =>
    model.selectionAnchor.row !== -1 &&
    row >= Math.min(model.selectionAnchor.row, model.selectionEnd.row) &&
    row <= Math.max(model.selectionAnchor.row, model.selectionEnd.row) &&
    columns
      .slice(
        Math.min(
          columns.findIndex(c => c.id === model.selectionAnchor.column),
          columns.findIndex(c => c.id === model.selectionEnd.column),
        ),
        Math.max(
          columns.findIndex(c => c.id === model.selectionAnchor.column),
          columns.findIndex(c => c.id === model.selectionEnd.column),
        ) + 1,
      )
      .some(c => c.id === column)

  return h.div(
    [
      h.DataAttribute('slot', 'grid-wrapper'),
      h.Dir(model.direction),
      h.Class('relative flex h-dvh w-full flex-col gap-2 p-1'),
    ],
    [
      searchOverlay(model, h),
      contextMenu(model, h),
      gridToolbar(model, h),
      h.div(
        [
          h.Role('grid'),
          h.AriaLabel('Data grid'),
          h.DataAttribute('slot', 'grid'),
          h.Tabindex(0),
          h.Class(
            'relative isolate grid min-h-0 flex-1 overflow-auto rounded-md border select-none focus:outline-none',
          ),
          /* mount on the scroller: scroll events don't bubble, and toolbar
             inputs outside it can't leak ctrl/meta combos into grid keys */
          h.OnMount(
            Grid.gridKeysMount(mount => {
              if (mount._tag === 'GridKeydown')
                return Grid.Message.GridKey({
                  key: mount.key,
                  ctrl: mount.ctrl,
                  shift: mount.shift,
                  meta: mount.meta,
                })
              if (mount._tag === 'GridContextMenu')
                return Grid.Message.OpenedContextMenu({
                  x: mount.x,
                  y: mount.y,
                  row: mount.row,
                  column: mount.column,
                })
              if (mount._tag === 'GridViewportHeight')
                return Grid.Message.SetViewportHeight({
                  height: mount.height,
                })
              return Grid.Message.Scrolled({ scrollTop: mount.scrollTop })
            }),
          ),
        ],
        [
          /* header */
          h.div(
            [
              h.Role('rowgroup'),
              h.DataAttribute('slot', 'grid-header'),
              h.Class('sticky top-0 z-30 grid border-b bg-background'),
            ],
            [
              h.div(
                [
                  h.Role('row'),
                  h.DataAttribute('slot', 'grid-header-row'),
                  h.Tabindex(-1),
                  h.Class('flex w-full'),
                  h.Style({ width: `${String(gridWidth)}px` }),
                ],
                [
                  h.div(
                    [
                      h.Role('columnheader'),
                      h.DataAttribute('slot', 'grid-header-cell'),
                      h.Class(
                        'relative flex items-center justify-center border-e',
                      ),
                      h.Style({ width: `${String(SELECT_COL_WIDTH)}px` }),
                    ],
                    [
                      h.input([
                        h.Type('checkbox'),
                        h.AriaLabel('Select all'),
                        h.Tabindex(-1),
                        ...(model.selectedRowIndexes.length === people.length &&
                        people.length > 0
                          ? [h.Attribute('checked', 'true')]
                          : []),
                        h.Class('size-3.5 accent-primary'),
                        h.OnClick(
                          Grid.Message.ToggledAllRows({
                            checked:
                              model.selectedRowIndexes.length !== people.length,
                          }),
                        ),
                      ]),
                    ],
                  ),
                  ...columns.map(column => {
                    const entry = model.sorting.find(s => s.id === column.id)
                    const panelId = `column-${column.id}`
                    const isOpen = model.openPanel === panelId
                    return h.div(
                      [
                        h.Role('columnheader'),
                        h.DataAttribute('slot', 'grid-header-cell'),
                        h.DataAttribute('column-id', column.id),
                        h.Tabindex(-1),
                        h.Class('relative border-e last:border-e-0'),
                        h.Style({ width: `${String(column.width)}px` }),
                      ],
                      [
                        h.button(
                          [
                            h.Type('button'),
                            h.Tabindex(-1),
                            h.AriaHasPopup('menu'),
                            h.AriaExpanded(isOpen),
                            h.OnClick(
                              Grid.Message.SetPanel({ panel: panelId }),
                            ),
                            h.Class(
                              'flex h-full w-full items-center gap-2 px-3 py-1.5 text-left text-sm font-medium hover:bg-accent',
                            ),
                          ],
                          [
                            icon(
                              column.iconName,
                              { class: 'size-3.5 text-muted-foreground' },
                              h,
                            ),
                            column.header,
                            ...(entry === undefined
                              ? []
                              : [
                                  icon(
                                    entry.desc ? 'chevron-down' : 'chevron-up',
                                    { class: 'size-3.5' },
                                    h,
                                  ),
                                ]),
                            icon(
                              'chevron-down',
                              {
                                class:
                                  'ms-auto size-3.5 shrink-0 text-muted-foreground',
                              },
                              h,
                            ),
                          ],
                        ),
                        ...(isOpen
                          ? [
                              h.button([
                                h.Type('button'),
                                h.AriaHidden(true),
                                h.Tabindex(-1),
                                h.Class(
                                  'fixed inset-0 z-40 cursor-default bg-transparent',
                                ),
                                h.OnClick(Grid.Message.SetPanel({ panel: '' })),
                              ]),
                              columnMenu(column, entry)(h),
                            ]
                          : []),
                      ],
                    )
                  }),
                ],
              ),
            ],
          ),
          /* body */
          h.div(
            [
              h.Role('rowgroup'),
              h.DataAttribute('slot', 'grid-body'),
              h.Class('relative grid'),
              h.Style({
                height: `${String(totalHeight)}px`,
                width: `${String(gridWidth)}px`,
              }),
            ],
            people.slice(startIndex, endIndex).map((person, offset) => {
              const rowIndex = startIndex + offset
              const isRowSelected = model.selectedRowIndexes.includes(rowIndex)
              return h.div(
                [
                  h.Role('row'),
                  h.AriaRowindex(rowIndex + 1),
                  h.AriaSelected(isRowSelected),
                  h.DataAttribute('slot', 'grid-row'),
                  h.DataAttribute(
                    'state',
                    isRowSelected ? 'selected' : 'unselected',
                  ),
                  h.Class('absolute flex w-full'),
                  h.Style({
                    top: `${String(rowIndex * rowH)}px`,
                    height: `${String(rowH)}px`,
                  }),
                ],
                [
                  /* row marker / select cell */
                  h.div(
                    [
                      h.Role('gridcell'),
                      h.DataAttribute('slot', 'grid-cell'),
                      h.Class(
                        cn(
                          'group/marker relative flex items-center justify-center border-e border-b bg-background',
                          isRowSelected && 'bg-muted',
                        ),
                      ),
                      h.Style({ width: `${String(SELECT_COL_WIDTH)}px` }),
                      h.OnClick(
                        Grid.Message.SelectedRowIndex({
                          index: rowIndex,
                          shiftKey: false,
                          additive: false,
                        }),
                      ),
                    ],
                    [
                      h.span(
                        [
                          h.Class(
                            cn(
                              'text-muted-foreground text-xs tabular-nums',
                              'group-hover/marker:hidden',
                              isRowSelected && 'hidden',
                            ),
                          ),
                        ],
                        [String(rowIndex + 1)],
                      ),
                      h.input([
                        h.Type('checkbox'),
                        h.AriaLabel(`Select row ${String(rowIndex + 1)}`),
                        h.Tabindex(-1),
                        ...(isRowSelected
                          ? [h.Attribute('checked', 'true')]
                          : []),
                        h.Class(
                          cn(
                            'size-3.5 accent-primary absolute',
                            'hidden group-hover/marker:block',
                            isRowSelected && 'block',
                          ),
                        ),
                        h.OnClick(
                          Grid.Message.SelectedRowIndex({
                            index: rowIndex,
                            shiftKey: false,
                            additive: true,
                          }),
                        ),
                      ]),
                    ],
                  ),
                  /* data cells */
                  ...columns.map(column => {
                    const isFocused =
                      model.focusedCell.row === rowIndex &&
                      model.focusedCell.column === column.id
                    const isEditing =
                      model.editingCell.row === rowIndex &&
                      model.editingCell.column === column.id
                    const inSelection = isSelected(rowIndex, column.id)
                    return h.div(
                      [
                        h.Role('gridcell'),
                        h.DataAttribute('slot', 'grid-cell'),
                        h.DataAttribute('row-index', String(rowIndex)),
                        h.DataAttribute('column-id', column.id),
                        h.AriaSelected(inSelection || isFocused),
                        h.Class(
                          cn(
                            'relative border-e border-b text-sm',
                            inSelection && 'bg-accent/40',
                            isFocused && 'ring-1 ring-inset ring-ring z-10',
                            isRowSelected && 'bg-muted/50',
                          ),
                        ),
                        h.Style({ width: `${String(column.width)}px` }),
                        h.OnMouseDown(
                          Grid.Message.FocusedCell({
                            row: rowIndex,
                            column: column.id,
                          }),
                        ),
                        h.OnDoubleClick(
                          Grid.Message.StartedEditing({
                            row: rowIndex,
                            column: column.id,
                            seed: '',
                          }),
                        ),
                      ],
                      [
                        isEditing
                          ? cellEditor(
                              model,
                              person as Person,
                              column,
                              rowIndex,
                              h,
                            )
                          : cellContent(person, column, rowIndex, h),
                      ],
                    )
                  }),
                ],
              )
            }),
          ),
          /* footer — add row */
          h.div(
            [
              h.Role('rowgroup'),
              h.DataAttribute('slot', 'grid-footer'),
              h.Class('sticky bottom-0 z-30 grid border-t bg-background'),
            ],
            [
              h.div(
                [
                  h.Role('row'),
                  h.DataAttribute('slot', 'grid-add-row'),
                  h.Class('flex w-full'),
                ],
                [
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(Grid.Message.AddedRow({})),
                      h.Class(
                        'relative flex h-9 grow items-center bg-muted/30 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                      ),
                    ],
                    [
                      h.div(
                        [
                          h.Class(
                            'sticky inset-s-0 flex items-center gap-2 px-3 text-muted-foreground',
                          ),
                        ],
                        [
                          icon('plus', { class: 'size-3.5' }, h),
                          h.span([h.Class('text-sm')], ['Add row']),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
