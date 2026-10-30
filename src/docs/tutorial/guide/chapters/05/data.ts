import lintChapter04 from '../../generated/05/lint-chapter-04.json'
import type { Owner } from './model'

/* The thirteen findings `npm run lint` reported at chapter-04, parsed into
   the classes each one passed to a component. */

type Finding = Readonly<{
  file: string
  line: number
  rule: string
  message: string
}>

export type Override = Readonly<{
  file: string
  view: string
  line: number
  component: string
  classes: ReadonlyArray<string>
}>

const VIEW_OF: Readonly<Record<string, string>> = {
  'src/features/issues.ts': 'All issues',
  'src/features/my-issues.ts': 'My issues',
  'src/features/search.ts': 'Search',
  'src/view.ts': 'Header',
}

const FINDING = /^`([^`]+)` (?:on|overrides the named size of) `([^`]+)`/u

export const overrides: ReadonlyArray<Override> = (
  lintChapter04 as ReadonlyArray<Finding>
).flatMap(finding => {
  const match = FINDING.exec(finding.message)
  return match === null
    ? []
    : [
        {
          file: finding.file,
          view: VIEW_OF[finding.file] ?? finding.file,
          line: finding.line,
          component: match[2] ?? '',
          classes: (match[1] ?? '').split(/\s+/u),
        },
      ]
})

export const findingCount = (lintChapter04 as ReadonlyArray<Finding>).length

export type ClassGroup = Readonly<{
  component: string
  className: string
  views: ReadonlyArray<string>
}>

/** Every class, per component, with the views that passed it. */
export const byClass: ReadonlyArray<ClassGroup> = (() => {
  const groups = new Map<
    string,
    { component: string; className: string; views: Array<string> }
  >()
  for (const override of overrides)
    for (const className of override.classes) {
      const key = `${override.component} ${className}`
      const group = groups.get(key) ?? {
        component: override.component,
        className,
        views: [],
      }
      group.views.push(override.view)
      groups.set(key, group)
    }
  return [...groups.values()].sort(
    (a, b) =>
      b.views.length - a.views.length || a.component.localeCompare(b.component),
  )
})()

export const OWNER_LABEL: Readonly<Record<Owner, string>> = {
  component: 'The component',
  parent: 'The parent',
  theme: 'The theme',
  nobody: 'Nobody',
}

export type SortItem = Readonly<{
  id: string
  classes: string
  on: string
  where: string
  answer: Owner
  why: string
}>

export const SORT_ITEMS: ReadonlyArray<SortItem> = [
  {
    id: 'nowrap',
    classes: 'flex-nowrap',
    on: 'item',
    where: 'All issues, My issues, Search',
    answer: 'component',
    why: "Three views need the same behaviour for the same reason. That is a variant: `layout: 'inline'`.",
  },
  {
    id: 'truncate',
    classes: 'truncate',
    on: 'itemTitle',
    where: 'All issues, My issues, Search',
    answer: 'component',
    why: "Part of the same need. The title reads the row's layout, so callers stop styling it.",
  },
  {
    id: 'padding',
    classes: 'px-4, px-3, gap-2 py-1.5',
    on: 'item',
    where: 'one view each',
    answer: 'parent',
    why: "Each view moved its rows in from the edge. The list's container decides that inset; the row keeps its own padding.",
  },
  {
    id: 'border',
    classes: 'rounded-none border-b',
    on: 'item',
    where: 'All issues',
    answer: 'parent',
    why: 'Lines between rows belong to the list. crease already has `itemGroupSeparator` for them.',
  },
  {
    id: 'input',
    classes: 'h-7 text-xs',
    on: 'input',
    where: 'Header',
    answer: 'theme',
    why: "Chapter 4's theme sets inputs to 28 pixels and 13 pixel text. These classes now repeat it.",
  },
  {
    id: 'button',
    classes: 'h-7, px-0',
    on: 'button',
    where: 'My issues, Search',
    answer: 'component',
    why: "Two views changed a button's height or padding. Decision D4 gives every button one height, so Button decides.",
  },
  {
    id: 'hover',
    classes: 'hover:bg-accent',
    on: 'item',
    where: 'Search',
    answer: 'nobody',
    why: 'It highlights results nobody can click yet. Rows become interactive in chapter 7, with their own states.',
  },
]
