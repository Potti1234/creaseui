/* tablecn data-grid view — StyleX. Port of
   tablecn/src/app/data-grid/components/data-grid-demo.tsx: dense editable
   grid with column headers, cell focus/edit, row selection, context menu,
   search overlay, toolbar (direction/filter/sort/height/view) and add-row. */

import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as stylex from '@stylexjs/stylex'
import { reset } from '@/stylex/reset'
import { className } from '@/stylex/style'
import { tokens } from '@/stylex/tokens.stylex'
import { foundationTokens } from '@/stylex/foundations-tokens.stylex'
import { interactionTokens } from '@/stylex/interaction-tokens.stylex.const'

import { icon } from '@/stylex/composition/icon'
import * as Grid from '@/lib/tablecn-grid'
import type { Person } from '@/lib/tablecn-data'

import type { Message } from './tablecn-page'

const st = stylex.create({
  c2: {
    paddingBlock: '0.375rem',
    paddingInline: '0.5rem',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1rem',
  },
  c3: {
    marginBlock: '0.25rem',
    marginInline: '-0.25rem',
    backgroundColor: tokens.border,
    height: '1px',
  },
  c4: {
    borderRadius: foundationTokens.radiusSm,
    gap: '0.5rem',
    paddingBlock: '0.375rem',
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
      ':focus': tokens.accent,
    },
    color: {
      default: null,
      ':hover': tokens.accentForeground,
      ':focus': tokens.accentForeground,
    },
    cursor: interactionTokens.cursorDefault,
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    paddingInlineEnd: '0.5rem',
    paddingInlineStart: '2rem',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
  },
  c6: { position: 'relative' },
  c7: {
    inset: '0',
    backgroundColor: 'transparent',
    cursor: interactionTokens.cursorDefault,
    position: 'fixed',
    zIndex: 40,
  },
  c15: { paddingInlineStart: '2rem' },
  c42: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    marginBottom: '0.5rem',
  },
  c110: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.375rem',
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    height: '2rem',
  },
  c111: { backgroundColor: tokens.accent },
  c112: {
    paddingInline: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    fontVariantNumeric: 'tabular-nums',
    justifyContent: 'flex-end',
    height: '100%',
    width: '100%',
  },
  c113: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  c114: {
    accentColor: tokens.primary,
    pointerEvents: 'none',
    height: '1rem',
    width: '1rem',
  },
  c115: {
    gap: '0.25rem',
    overflow: 'hidden',
    paddingInline: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    height: '100%',
  },
  c116: {
    borderRadius: foundationTokens.radiusSm,
    paddingBlock: '0.125rem',
    paddingInline: '0.375rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    display: 'inline-flex',
    flexShrink: '0',
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1rem',
  },
  c117: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusSm,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    paddingBlock: '0.125rem',
    paddingInline: '0.375rem',
    alignItems: 'center',
    backgroundColor: tokens.muted,
    display: 'inline-flex',
    flexShrink: '0',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  c118: {
    paddingInline: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    height: '100%',
  },
  c119: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  c120: {
    overflow: 'hidden',
    paddingInline: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    height: '100%',
  },
  c121: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.375rem',
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    height: '2rem',
  },
  c122: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  c123: { padding: '0.75rem', width: '18rem' },
  c124: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    marginBottom: '0.375rem',
  },
  c125: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    width: '6rem',
  },
  c126: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: '0.5rem',
    backgroundColor: 'transparent',
    boxShadow: {
      default: null,
      ':focus-visible': `inset 0 0 0 1px ${tokens.ring}`,
    },
    fontSize: '0.75rem',
    lineHeight: '1rem',
    outlineStyle: 'none',
    height: '1.75rem',
    minWidth: 0,
    width: '100%',
  },
  c127: { color: tokens.mutedForeground, marginInlineStart: 'auto' },
  c128: { justifyContent: 'center', paddingInlineStart: '2rem' },
  c129: {
    alignItems: 'center',
    display: 'flex',
    insetInlineStart: '0.5rem',
    justifyContent: 'center',
    position: 'absolute',
    height: '0.875rem',
    width: '0.875rem',
  },
  c130: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    alignItems: 'center',
    backgroundColor: foundationTokens.popover,
    boxShadow: foundationTokens.shadowMd,
    display: 'flex',
    insetInlineEnd: '0.5rem',
    position: 'absolute',
    zIndex: 40,
    top: '0.5rem',
  },
  c131: {
    paddingInline: '0.25rem',
    backgroundColor: 'transparent',
    color: { default: null, '::placeholder': tokens.mutedForeground },
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    height: '1.75rem',
    width: '10rem',
  },
  c132: {
    paddingInline: '0.25rem',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1rem',
  },
  c133: {
    borderRadius: foundationTokens.radiusSm,
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    display: 'inline-flex',
    justifyContent: 'center',
    height: '1.5rem',
    width: '1.5rem',
  },
  c134: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: foundationTokens.popover,
    boxShadow: foundationTokens.shadowMd,
    color: foundationTokens.popoverForeground,
    position: 'fixed',
    zIndex: 50,
    width: '12rem',
  },
  c135: {
    gap: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
  },
  c136: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'auto',
    display: 'grid',
    isolation: 'isolate',
    outlineStyle: { default: null, ':focus': 'none' },
    position: 'relative',
    userSelect: 'none',
  },
  c137: {
    backgroundColor: tokens.background,
    display: 'grid',
    position: 'sticky',
    zIndex: 30,
    borderBottomColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    top: '0rem',
  },
  c138: { display: 'flex', width: '100%' },
  c139: {
    alignItems: 'center',
    borderInlineEndColor: tokens.border,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: '1px',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  c140: { accentColor: tokens.primary, height: '0.875rem', width: '0.875rem' },
  c141: {
    borderInlineEndColor: tokens.border,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: '1px',
    position: 'relative',
  },
  c142: {
    gap: '0.5rem',
    paddingBlock: '0.375rem',
    paddingInline: '0.75rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    display: 'flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    textAlign: 'left',
    height: '100%',
    width: '100%',
  },
  c143: { display: 'grid', position: 'relative' },
  c144: { display: 'flex', position: 'absolute', width: '100%' },
  c145: {
    alignItems: 'center',
    backgroundColor: tokens.background,
    borderInlineEndColor: tokens.border,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: '1px',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    borderBottomColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  c146: { backgroundColor: tokens.muted },
  c147: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1rem',
  },
  c148: { opacity: '1' },
  c149: { display: 'none' },
  c150: {
    accentColor: tokens.primary,
    position: 'absolute',
    height: '0.875rem',
    width: '0.875rem',
  },
  c151: { display: 'none' },
  c152: { display: 'block' },
  c153: {
    borderInlineEndColor: tokens.border,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: '1px',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    position: 'relative',
    borderBottomColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  c154: {
    backgroundColor: `color-mix(in srgb, ${tokens.accent} 40%, transparent)`,
  },
  c155: { boxShadow: `inset 0 0 0 1px ${tokens.ring}`, zIndex: 10 },
  c156: {
    backgroundColor: `color-mix(in srgb, ${tokens.muted} 50%, transparent)`,
  },
  c157: {
    inset: '0',
    paddingInline: '0.5rem',
    backgroundColor: tokens.background,
    boxShadow: `inset 0 0 0 1px ${tokens.ring}`,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  c158: {
    backgroundColor: tokens.background,
    display: 'grid',
    position: 'sticky',
    zIndex: 30,
    borderTopColor: tokens.border,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    bottom: '0rem',
  },
  c159: {
    alignItems: 'center',
    backgroundColor: {
      default: `color-mix(in srgb, ${tokens.muted} 30%, transparent)`,
      ':hover': `color-mix(in srgb, ${tokens.muted} 50%, transparent)`,
      ':focus': `color-mix(in srgb, ${tokens.muted} 50%, transparent)`,
    },
    display: 'flex',
    flexGrow: '1',
    outlineStyle: { default: null, ':focus': 'none' },
    position: 'relative',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    height: '2.25rem',
  },
  c160: {
    gap: '0.5rem',
    paddingInline: '0.75rem',
    alignItems: 'center',
    color: tokens.mutedForeground,
    display: 'flex',
    insetInlineStart: '0',
    position: 'sticky',
  },
  c161: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  icon35: { display: 'inline-flex' },
  icon36: { display: 'inline-flex', fontSize: '0.75rem' },
  icon37: { display: 'inline-flex' },
  icon38: { display: 'inline-flex' },
  icon39: { display: 'inline-flex', fontSize: '1rem' },
  icon40: { display: 'inline-flex', fontSize: '1rem' },
  icon41: {
    color: tokens.mutedForeground,
    display: 'inline-flex',
    fontSize: '1rem',
    marginInlineStart: '0.25rem',
  },
  icon42: { display: 'inline-flex' },
  icon43: { display: 'inline-flex' },
  icon44: { display: 'inline-flex' },
  icon45: { display: 'inline-flex' },
  icon46: {
    color: tokens.mutedForeground,
    display: 'inline-flex',
    fontSize: '0.875rem',
  },
  icon47: { display: 'inline-flex', fontSize: '0.875rem' },
  icon48: { display: 'inline-flex', fontSize: '0.875rem' },
  selWrap: {
    paddingInline: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    height: '100%',
  },
  selBadge: {
    borderRadius: foundationTokens.radiusMd,
    gap: '0.25rem',
    paddingBlock: '1px',
    paddingInline: '0.375rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
    display: 'inline-flex',
    flexShrink: '0',
    fontSize: '0.75rem',
    fontWeight: 500,
    justifyContent: 'center',
    whiteSpace: 'pre-wrap',
    width: 'fit-content',
  },
  colPanel: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: foundationTokens.popover,
    boxShadow: foundationTokens.shadowMd,
    color: foundationTokens.popoverForeground,
    insetInlineStart: '0',
    outlineStyle: 'none',
    position: 'absolute',
    zIndex: 50,
    minWidth: '15rem',
    top: '100%',
    width: 'auto',
  },
  menuItemL: {
    borderRadius: foundationTokens.radiusSm,
    gap: '0.5rem',
    paddingBlock: '0.375rem',
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
      ':focus': tokens.accent,
    },
    color: { default: null, ':focus': tokens.accentForeground },
    cursor: interactionTokens.cursorDefault,
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    paddingInlineEnd: '2rem',
    paddingInlineStart: '0.5rem',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
  },
  chevEnd: {
    color: tokens.mutedForeground,
    display: 'inline-flex',
    flexShrink: '0',
    marginInlineStart: 'auto',
  },
  checkEnd: {
    color: tokens.foreground,
    display: 'inline-flex',
    marginInlineStart: 'auto',
  },
  panelStart: { insetInlineStart: '0' },
  panelEnd: { insetInlineEnd: '0' },
  toolPanel: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: foundationTokens.popover,
    boxShadow: foundationTokens.shadowMd,
    color: foundationTokens.popoverForeground,
    marginBlockStart: '0.25rem',
    outlineStyle: 'none',
    position: 'absolute',
    zIndex: 50,
    minWidth: '12rem',
    top: '100%',
    width: 'auto',
  },
})
const MENU_ITEM_CLASS = st.c4
const MENU_LABEL_CLASS = st.c2
const MENU_SEPARATOR_CLASS = st.c3
const TRIGGER_PANEL = (
  isOpen: boolean,
  trigger: Html,
  onClose: Message,
  panel: Html,
  h: HtmlBuilder<Message>,
  align: 'start' | 'end' = 'start',
): Html =>
  h.div(
    [h.Class(className(st.c6))],
    [
      trigger,
      ...(isOpen
        ? [
            h.button([
              h.Type('button'),
              h.AriaHidden(true),
              h.Tabindex(-1),
              h.Class(className(reset.button, st.c7)),
              h.OnClick(onClose),
            ]),
            h.div(
              [
                h.Class(
                  className(
                    st.toolPanel,
                    align === 'end' ? st.panelEnd : st.panelStart,
                  ),
                ),
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
        h.Class(className(reset.button, st.menuItemL)),
      ],
      [
        h.span(
          [h.Class(className(st.icon46))],
          [icon({ name: iconName, size: 'sm' }, h)],
        ),
        label,
        ...(checked
          ? [
              h.span(
                [h.Class(className(st.checkEnd))],
                [icon({ name: 'check', size: 'sm' }, h)],
              ),
            ]
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
      [h.Class(className(st.colPanel))],
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
        h.div([h.Class(className(st.c3))], []),
        h.button(
          [
            h.Type('button'),
            h.OnClick(Grid.Message.HidColumn({ column: column.id })),
            h.Class(className(reset.button, st.menuItemL)),
          ],
          [
            h.span(
              [h.Class(className(st.icon46))],
              [icon({ name: 'eye-off', size: 'sm' }, h)],
            ),
            'Hide column',
          ],
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
      h.Class(className(reset.button, st.c110, active && st.c111)),
    ],
    [
      h.span(
        [h.Class(className(st.icon35))],
        [icon({ name: iconName, size: 'sm' }, h)],
      ),
      label,
    ],
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
}

const GRID_COLUMNS: ReadonlyArray<GridColumn> = [
  { id: 'name', header: 'Name', iconName: 'text', width: 160, variant: 'text' },
  { id: 'age', header: 'Age', iconName: 'hash', width: 80, variant: 'number' },
  {
    id: 'email',
    header: 'Email',
    iconName: 'mail',
    width: 220,
    variant: 'url',
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
  },
  {
    id: 'department',
    header: 'Department',
    iconName: 'building-2',
    width: 160,
    variant: 'select',
  },
  {
    id: 'status',
    header: 'Status',
    iconName: 'list-checks',
    width: 140,
    variant: 'select',
  },
  {
    id: 'skills',
    header: 'Skills',
    iconName: 'tags',
    width: 200,
    variant: 'multi-select',
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
  h: HtmlBuilder<Grid.Message>,
): Html | string => {
  const p = person as Person
  switch (column.variant) {
    case 'number':
      return h.div([h.Class(className(st.c112))], [Grid.cellText(p, column.id)])
    case 'checkbox':
      return h.div(
        [h.Class(className(st.c113))],
        [
          h.input([
            h.Type('checkbox'),
            ...(p.isActive === true ? [h.Attribute('checked', 'true')] : []),
            h.Tabindex(-1),
            h.Class(className(reset.input, st.c114)),
          ]),
        ],
      )
    case 'select':
      return h.div(
        [h.Class(className(st.selWrap))],
        [
          h.span(
            [h.Class(className(st.selBadge))],
            [Grid.cellText(p, column.id)],
          ),
        ],
      )
    case 'multi-select':
      return h.div(
        [h.Class(className(st.c115))],
        (p.skills ?? []).map(skill =>
          h.span([h.Class(className(st.c116))], [skill]),
        ),
      )
    case 'file':
      return h.div(
        [h.Class(className(st.c115))],
        (p.attachments ?? []).map(file =>
          h.span(
            [h.Class(className(st.c117))],
            [
              h.span(
                [h.Class(className(st.icon36))],
                [icon({ name: 'paperclip', size: 'sm' }, h)],
              ),
              file.name,
            ],
          ),
        ),
      )
    case 'long-text':
      return h.div(
        [h.Class(className(st.c118))],
        [h.span([h.Class(className(st.c119))], [p.notes ?? ''])],
      )
    default:
      return h.div([h.Class(className(st.c120))], [Grid.cellText(p, column.id)])
  }
}

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
        h.Class(className(reset.button, st.c121, isOpen && st.c111)),
      ],
      [
        h.span(
          [h.Class(className(st.icon37))],
          [icon({ name: iconName, size: 'sm' }, h)],
        ),
        label,
      ],
    ),
    Grid.Message.SetPanel({ panel: '' }),
    panel,
    h as HtmlBuilder<Message>,
    align,
  )
}

const gridToolbar = (model: Grid.Model, h: HtmlBuilder<Grid.Message>): Html =>
  h.div(
    [h.Class(className(st.c122))],
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
          [h.Class(className(st.c123))],
          [
            h.div([h.Class(className(st.c42))], ['Filter']),
            ...visibleCols(model).map(column =>
              h.div(
                [h.Class(className(st.c124))],
                [
                  h.span([h.Class(className(st.c125))], [column.header]),
                  h.input([
                    h.Type('text'),
                    h.Class(className(reset.input, st.c126)),
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
            h.div([h.Class(className(MENU_LABEL_CLASS))], ['Sort by']),
            ...visibleCols(model).map(column => {
              const entry = model.sorting.find(s => s.id === column.id)
              return h.button(
                [
                  h.Type('button'),
                  h.OnClick(Grid.Message.ToggledSort({ column: column.id })),
                  h.Class(className(reset.button, MENU_ITEM_CLASS, st.c15)),
                ],
                [
                  h.span(
                    [h.Class(className(st.icon38))],
                    [icon({ name: column.iconName, size: 'sm' }, h)],
                  ),
                  column.header,
                  h.span(
                    [h.Class(className(st.c127))],
                    [entry === undefined ? '' : entry.desc ? '↓' : '↑'],
                  ),
                ],
              )
            }),
            ...(model.sorting.length > 0
              ? [
                  h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(
                        Grid.Message.SetSorting({ column: '', desc: false }),
                      ),
                      h.Class(
                        className(reset.button, MENU_ITEM_CLASS, st.c128),
                      ),
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
            h.div([h.Class(className(MENU_LABEL_CLASS))], ['Row height']),
            ...Grid.ROW_HEIGHTS.map(entry =>
              h.button(
                [
                  h.Type('button'),
                  h.AriaChecked(model.rowHeight === entry.id),
                  h.OnClick(Grid.Message.SetRowHeight({ height: entry.id })),
                  h.Class(className(reset.button, MENU_ITEM_CLASS, st.c15)),
                ],
                [
                  ...(model.rowHeight === entry.id
                    ? [
                        h.span(
                          [h.Class(className(st.icon39))],
                          [icon({ name: 'check', size: 'sm' }, h)],
                        ),
                      ]
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
            h.div([h.Class(className(MENU_LABEL_CLASS))], ['Toggle columns']),
            h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
            ...GRID_COLUMNS.map(column =>
              h.button(
                [
                  h.Type('button'),
                  h.Role('menuitemcheckbox'),
                  h.AriaChecked(!model.hiddenColumnIds.includes(column.id)),
                  h.OnClick(
                    Grid.Message.ToggledColumnHidden({ column: column.id }),
                  ),
                  h.Class(className(reset.button, MENU_ITEM_CLASS, st.c15)),
                ],
                [
                  h.span(
                    [h.Class(className(st.c129))],
                    [
                      !model.hiddenColumnIds.includes(column.id)
                        ? h.span(
                            [h.Class(className(st.icon40))],
                            [icon({ name: 'check', size: 'sm' }, h)],
                          )
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
    [h.DataAttribute('slot', 'grid-search'), h.Class(className(st.c130))],
    [
      h.span(
        [h.Class(className(st.icon41))],
        [icon({ name: 'search', size: 'sm' }, h)],
      ),
      h.input([
        h.Type('text'),
        h.Placeholder('Search…'),
        h.Value(model.searchQuery),
        h.OnInput(value => Grid.Message.ChangedSearchQuery({ value })),
        h.Class(className(reset.input, st.c131)),
      ]),
      h.span(
        [h.Class(className(st.c132))],
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
          h.Class(className(reset.button, st.c133)),
        ],
        [
          h.span(
            [h.Class(className(st.icon42))],
            [icon({ name: 'chevron-up', size: 'sm' }, h)],
          ),
        ],
      ),
      h.button(
        [
          h.Type('button'),
          h.AriaLabel('Next match'),
          h.OnClick(Grid.Message.NavigatedMatch({ direction: 'next' })),
          h.Class(className(reset.button, st.c133)),
        ],
        [
          h.span(
            [h.Class(className(st.icon43))],
            [icon({ name: 'chevron-down', size: 'sm' }, h)],
          ),
        ],
      ),
      h.button(
        [
          h.Type('button'),
          h.AriaLabel('Close search'),
          h.OnClick(Grid.Message.ToggledSearch({})),
          h.Class(className(reset.button, st.c133)),
        ],
        [
          h.span(
            [h.Class(className(st.icon44))],
            [icon({ name: 'x', size: 'sm' }, h)],
          ),
        ],
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
        h.Class(
          className(
            reset.button,
            MENU_ITEM_CLASS,
            iconName === undefined ? st.c15 : st.c15,
          ),
        ),
      ],
      [
        ...(iconName === undefined
          ? []
          : [
              h.span(
                [h.Class(className(st.icon45))],
                [icon({ name: iconName, size: 'sm' }, h)],
              ),
            ]),
        label,
      ],
    )
  return h.div(
    [],
    [
      h.button([
        h.Type('button'),
        h.AriaHidden(true),
        h.Tabindex(-1),
        h.Class(className(reset.button, st.c7)),
        h.OnClick(Grid.Message.ClosedContextMenu({})),
        h.OnContextMenu(Grid.Message.ClosedContextMenu({})),
      ]),
      h.div(
        [
          h.Role('menu'),
          h.DataAttribute('slot', 'grid-context-menu'),
          h.Class(className(st.c134)),
          h.Style({
            left: `${String(model.contextMenu.x)}px`,
            top: `${String(model.contextMenu.y)}px`,
          }),
        ],
        [
          item('Copy', 'copy', 'clipboard-copy'),
          item('Cut', 'cut', 'scissors'),
          item('Paste', 'paste', 'clipboard-paste'),
          h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
          item('Add row above', 'add-row-above', 'arrow-up-to-line'),
          item('Add row below', 'add-row-below', 'arrow-down-to-line'),
          h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
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
      h.Class(className(st.c135)),
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
          h.Class(className(st.c136)),
          h.Style({ maxHeight: `${String(viewHeight)}px` }),
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
              h.Class(className(st.c137)),
            ],
            [
              h.div(
                [
                  h.Role('row'),
                  h.DataAttribute('slot', 'grid-header-row'),
                  h.Tabindex(-1),
                  h.Class(className(st.c138)),
                  h.Style({ width: `${String(gridWidth)}px` }),
                ],
                [
                  h.div(
                    [
                      h.Role('columnheader'),
                      h.DataAttribute('slot', 'grid-header-cell'),
                      h.Class(className(st.c139)),
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
                        h.Class(className(reset.input, st.c140)),
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
                        h.Class(className(st.c141)),
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
                            h.Class(className(reset.button, st.c142)),
                          ],
                          [
                            h.span(
                              [h.Class(className(st.icon46))],
                              [icon({ name: column.iconName, size: 'sm' }, h)],
                            ),
                            column.header,
                            ...(entry === undefined
                              ? []
                              : [
                                  h.span(
                                    [h.Class(className(st.icon47))],
                                    [
                                      icon(
                                        {
                                          name: entry.desc
                                            ? 'chevron-down'
                                            : 'chevron-up',
                                          size: 'sm',
                                        },
                                        h,
                                      ),
                                    ],
                                  ),
                                ]),
                            h.span(
                              [h.Class(className(st.chevEnd))],
                              [icon({ name: 'chevron-down', size: 'sm' }, h)],
                            ),
                          ],
                        ),
                        ...(isOpen
                          ? [
                              h.button([
                                h.Type('button'),
                                h.AriaHidden(true),
                                h.Tabindex(-1),
                                h.Class(className(reset.button, st.c7)),
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
              h.Class(className(st.c143)),
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
                  h.Class(className(st.c144)),
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
                      h.Class(className(st.c145, isRowSelected && st.c146)),
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
                            className(
                              st.c147,
                              st.c148,
                              isRowSelected && st.c149,
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
                          className(
                            reset.input,
                            st.c150,
                            st.c151,
                            isRowSelected && st.c152,
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
                          className(
                            st.c153,
                            inSelection && st.c154,
                            isFocused && st.c155,
                            isRowSelected && st.c156,
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
                          ? h.input([
                              h.Type(
                                column.variant === 'number'
                                  ? 'number'
                                  : column.variant === 'date'
                                    ? 'date'
                                    : 'text',
                              ),
                              h.Value(model.draftValue),
                              h.OnInput(value =>
                                Grid.Message.ChangedDraft({ value }),
                              ),
                              h.Class(className(reset.input, st.c157)),
                              h.OnMount(
                                Grid.gridEditorFocusMount(() =>
                                  Grid.Message.CompletedEditorFocus({}),
                                ),
                              ),
                            ])
                          : cellContent(person, column, h),
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
              h.Class(className(st.c158)),
            ],
            [
              h.div(
                [
                  h.Role('row'),
                  h.DataAttribute('slot', 'grid-add-row'),
                  h.Class(className(st.c138)),
                ],
                [
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(Grid.Message.AddedRow({})),
                      h.Class(className(reset.button, st.c159)),
                    ],
                    [
                      h.div(
                        [h.Class(className(st.c160))],
                        [
                          h.span(
                            [h.Class(className(st.icon48))],
                            [icon({ name: 'plus', size: 'sm' }, h)],
                          ),
                          h.span([h.Class(className(st.c161))], ['Add row']),
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
