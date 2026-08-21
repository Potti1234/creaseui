import * as Table from '@/ui/table';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string => staticComponentApplication({ componentName: 'Table', componentSlug: 'table', exampleName: name, viewBody });
const rows = [['Accordion', 'Stateful'], ['Button', 'Stateless'], ['Dialog', 'Stateful']] as const;

export const tablePage = authoredPage({
  slug: 'table', title: 'Table', kind: 'helper',
  definition: {
    kind: 'helper', description: 'Presents structured data in semantic rows and columns with responsive horizontal overflow.',
    architecture: 'Table is stateless. Sorting, filtering, pagination, and selected rows belong to the parent Model; this component only renders semantic table parts.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'Table\n├── TableCaption\n├── TableHeader → TableRow → TableHead\n├── TableBody → TableRow → TableCell\n└── TableFooter',
    styling: 'Keep column alignment stable and avoid forcing data into a table when a stacked list is clearer on narrow screens.',
    accessibility: 'Use TableHead for header cells and add a caption when the table needs an accessible name or explanation.',
    examples: [
      {
        title: 'Component Inventory', description: 'Render one header row and map domain records into body rows.',
        preview: (_model, h) => Table.table({ class: 'max-w-xl', children: [Table.tableCaption({ children: ['Foldkit ownership by component.'] }, h), Table.tableHeader({ children: [Table.tableRow({ children: [Table.tableHead({ children: ['Component'] }, h), Table.tableHead({ children: ['State'] }, h)] }, h)] }, h), Table.tableBody({ children: rows.map(([name, state]) => Table.tableRow({ children: [Table.tableCell({ class: 'font-medium', children: [name] }, h), Table.tableCell({ children: [state] }, h)] }, h)) }, h)] }, h),
        code: source('Component Inventory', `Table.table({ children: [
  Table.tableCaption({ children: ['Foldkit ownership by component.'] }, h),
  Table.tableHeader({ children: [
    Table.tableRow({ children: [
      Table.tableHead({ children: ['Component'] }, h),
      Table.tableHead({ children: ['State'] }, h),
    ] }, h),
  ] }, h),
  Table.tableBody({ children: [
    { name: 'Accordion', state: 'Stateful' },
    { name: 'Button', state: 'Stateless' },
    { name: 'Dialog', state: 'Stateful' },
  ].map(row =>
    Table.tableRow({ children: [
      Table.tableCell({ children: [row.name] }, h),
      Table.tableCell({ children: [row.state] }, h),
    ] }, h),
  ) }, h),
] }, h),`),
      },
      {
        title: 'Footer', description: 'Use a semantic footer for totals that summarize the body columns.',
        preview: (_model, h) => Table.table({ class: 'max-w-xl', children: [Table.tableBody({ children: [Table.tableRow({ children: [Table.tableCell({ children: ['Authored pages'] }, h), Table.tableCell({ class: 'text-right', children: ['22'] }, h)] }, h)] }, h), Table.tableFooter({ children: [Table.tableRow({ children: [Table.tableCell({ children: ['Total routes'] }, h), Table.tableCell({ class: 'text-right', children: ['65'] }, h)] }, h)] }, h)] }, h),
        code: source('Footer', `Table.table({ children: [
  Table.tableBody({ children: [
    Table.tableRow({ children: [
      Table.tableCell({ children: ['Authored pages'] }, h),
      Table.tableCell({ class: 'text-right', children: ['22'] }, h),
    ] }, h),
  ] }, h),
  Table.tableFooter({ children: [
    Table.tableRow({ children: [
      Table.tableCell({ children: ['Total routes'] }, h),
      Table.tableCell({ class: 'text-right', children: ['65'] }, h),
    ] }, h),
  ] }, h),
] }, h),`),
      },
    ],
  },
});
