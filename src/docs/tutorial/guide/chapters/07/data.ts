import type { Part } from './model'

/* The parts of IssueRow, with the rule that places each, from the comment
   at the top of src/design/issue-row.ts at chapter-07. */

export const PARTS: ReadonlyArray<
  Readonly<{ part: Part; label: string; rule: string; selector: string }>
> = [
  {
    part: 'priority',
    label: 'Priority',
    rule: 'First, so a scan down the left edge reads urgency. It is a PropertyPicker: the glyph opens the menu.',
    selector:
      '[&_[data-slot=item-media]>*:nth-child(1)]:outline-2 [&_[data-slot=item-media]>*:nth-child(1)]:outline-offset-2 [&_[data-slot=item-media]>*:nth-child(1)]:outline-primary [&_[data-slot=item-media]>*:nth-child(1)]:rounded-sm',
  },
  {
    part: 'identifier',
    label: 'Identifier',
    rule: 'Small secondary text with tabular numbers (D2), so identifiers line up and stay quiet.',
    selector:
      '[&_[data-slot=item-media]>*:nth-child(2)]:outline-2 [&_[data-slot=item-media]>*:nth-child(2)]:outline-offset-2 [&_[data-slot=item-media]>*:nth-child(2)]:outline-primary [&_[data-slot=item-media]>*:nth-child(2)]:rounded-sm',
  },
  {
    part: 'status',
    label: 'Status',
    rule: 'Directly before the title, so the glyph and the words read together. A PropertyPicker.',
    selector:
      '[&_[data-slot=item-media]>*:nth-child(3)]:outline-2 [&_[data-slot=item-media]>*:nth-child(3)]:outline-offset-2 [&_[data-slot=item-media]>*:nth-child(3)]:outline-primary [&_[data-slot=item-media]>*:nth-child(3)]:rounded-sm',
  },
  {
    part: 'title',
    label: 'Title',
    rule: 'The only part that gives way. On a narrow screen it truncates first, so the metadata keeps its place (D1).',
    selector:
      '[&_[data-slot=item-title]]:outline-2 [&_[data-slot=item-title]]:outline-offset-2 [&_[data-slot=item-title]]:outline-primary [&_[data-slot=item-title]]:rounded-sm',
  },
  {
    part: 'labels',
    label: 'Labels',
    rule: 'After the title, as outlined badges. A row without labels shows none; the date keeps its place.',
    selector:
      '[&_[data-slot=item-actions]>[data-slot=badge]]:outline-2 [&_[data-slot=item-actions]>[data-slot=badge]]:outline-offset-2 [&_[data-slot=item-actions]>[data-slot=badge]]:outline-primary',
  },
  {
    part: 'date',
    label: 'Date',
    rule: 'Small secondary text (D2), between the labels and the assignee.',
    selector:
      '[&_[data-slot=item-actions]>[data-slot=text]]:outline-2 [&_[data-slot=item-actions]>[data-slot=text]]:outline-offset-2 [&_[data-slot=item-actions]>[data-slot=text]]:outline-primary [&_[data-slot=item-actions]>[data-slot=text]]:rounded-sm',
  },
  {
    part: 'assignee',
    label: 'Assignee',
    rule: 'Last, always. An unassigned issue shows the empty avatar, so the column stays aligned. A PropertyPicker.',
    selector:
      '[&_[data-slot=item-actions]>*:last-child]:outline-2 [&_[data-slot=item-actions]>*:last-child]:outline-offset-2 [&_[data-slot=item-actions]>*:last-child]:outline-primary [&_[data-slot=item-actions]>*:last-child]:rounded-full',
  },
]

export type Fit = Readonly<{ pattern: string; children?: ReadonlyArray<Fit> }>

export type Request = Readonly<{
  text: string
  fits: boolean
  answer: string
  tree?: Fit
  sketch?: string
}>

const ROW: Fit = {
  pattern: 'IssueRow',
  children: [
    { pattern: 'PropertyPicker · priority' },
    { pattern: 'PropertyPicker · status' },
    { pattern: 'PropertyPicker · assignee' },
  ],
}

export const REQUESTS: ReadonlyArray<Request> = [
  {
    text: "A page with Sam's open issues",
    fits: true,
    answer:
      'An IssueCollection with a flat list, like My issues with another person.',
    tree: { pattern: 'IssueCollection · rows', children: [ROW] },
    sketch: `issueCollection({
  controls: [sortButton],
  body: { kind: 'rows', issues: openIssuesOf('sam') },
  pickers: pickersOf(model),
}, h)`,
  },
  {
    text: 'Everything in review, so we can plan the release',
    fits: true,
    answer:
      'An IssueCollection grouped by status, with only the In Review group.',
    tree: {
      pattern: 'IssueCollection · groups',
      children: [{ pattern: 'IssueGroup · In Review', children: [ROW] }],
    },
    sketch: `issueCollection({
  controls: [],
  body: { kind: 'groups', groups: [{ status: 'in_review', issues: inReview, isCollapsed: false, onToggle }] },
  pickers: pickersOf(model),
}, h)`,
  },
  {
    text: 'Find the issue about keyboard focus',
    fits: true,
    answer:
      'The search page that exists: an IssueCollection with a summary and a flat list.',
    tree: { pattern: 'IssueCollection · rows + summary', children: [ROW] },
    sketch: `issueCollection({
  controls: [clearButton],
  summary: '1 result for “focus”',
  body: { kind: 'rows', issues: results },
  pickers: pickersOf(model),
}, h)`,
  },
  {
    text: 'A board with a column per status',
    fits: false,
    answer:
      'No pattern fits. A board needs a card and columns, which are new decisions. That makes it a design-system question first; chapter 12 answers it.',
  },
  {
    text: 'What changed on this issue, and who changed it',
    fits: false,
    answer:
      'No pattern fits. An activity timeline is a new pattern, decided once before any page uses it; chapter 13 adds it.',
  },
]
