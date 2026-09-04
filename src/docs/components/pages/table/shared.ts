import type { DocsExample } from '@/docs/components/page-definition'; import { staticComponentApplication } from '@/docs/components/pages/authored-page';
export const tableRows = [['Accordion', 'Stateful'], ['Button', 'Stateless'], ['Dialog', 'Stateful']] as const;
export const tableFixtures = [
  { title: 'Component Inventory', description: 'Render one header row and map domain records into body rows.' },
  { title: 'Footer', description: 'Use a semantic footer for totals that summarize the body columns.' },
  { title: 'Dense overflow', description: 'Dense native cells remain inside a horizontally scrollable container on narrow screens.' },
  { title: 'Empty body', description: 'An empty collection stays a real table with one explanatory spanning cell.' },
] as const;
const attr = (renderer: 'tailwind' | 'stylex', tailwind: string, style: string): string => renderer === 'stylex' ? `layoutStyle: styles.${style}` : `class: '${tailwind}'`;
const body = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  if (index === 0) return `Table.table({ ${attr(renderer, 'max-w-xl', 'table')}, children: [
  Table.tableCaption({ children: ['Foldkit ownership by component.'] }, h),
  Table.tableHeader({ children: [Table.tableRow({ children: [Table.tableHead({ children: ['Component'] }, h), Table.tableHead({ children: ['State'] }, h)] }, h)] }, h),
  Table.tableBody({ children: [{ name: 'Accordion', state: 'Stateful' }, { name: 'Button', state: 'Stateless' }, { name: 'Dialog', state: 'Stateful' }].map(row => Table.tableRow({ children: [Table.tableHead({ scope: 'row', children: [row.name] }, h), Table.tableCell({ children: [row.state] }, h)] }, h)) }, h),
] }, h)`;
  if (index === 1) return `Table.table({ ${attr(renderer, 'max-w-xl', 'table')}, children: [
  Table.tableBody({ children: [Table.tableRow({ children: [Table.tableCell({ children: ['Authored pages'] }, h), Table.tableCell({ children: [${renderer === 'stylex' ? "h.span([h.Class(stylex.props(styles.right).className ?? '')], ['22'])" : "'22'"}]${renderer === 'tailwind' ? ", class: 'text-right'" : ''} }, h)] }, h)] }, h),
  Table.tableFooter({ children: [Table.tableRow({ children: [Table.tableCell({ children: ['Total routes'] }, h), Table.tableCell({ children: [${renderer === 'stylex' ? "h.span([h.Class(stylex.props(styles.right).className ?? '')], ['65'])" : "'65'"}]${renderer === 'tailwind' ? ", class: 'text-right'" : ''} }, h)] }, h)] }, h),
] }, h)`;
  if (index === 2) return `Table.table({ ${attr(renderer, 'min-w-[44rem] text-xs', 'dense')}, children: [
  Table.tableCaption({ children: ['Deployment inventory with intentionally wide columns.'] }, h),
  Table.tableHeader({ children: [Table.tableRow({ children: ['Service', 'Owner', 'Region', 'Status', 'Last deployment'].map(label => Table.tableHead({ children: [label] }, h)) }, h)] }, h),
  Table.tableBody({ children: [Table.tableRow({ children: [Table.tableHead({ scope: 'row', children: ['Documentation'] }, h), ...['Platform', 'Europe', 'Healthy', 'Today at 10:42'].map(value => Table.tableCell({ children: [value] }, h))] }, h)] }, h),
] }, h)`;
  return `Table.table({ ${attr(renderer, 'max-w-xl', 'table')}, children: [
  Table.tableCaption({ children: ['Filtered component inventory.'] }, h),
  Table.tableHeader({ children: [Table.tableRow({ children: [Table.tableHead({ children: ['Component'] }, h), Table.tableHead({ children: ['State'] }, h)] }, h)] }, h),
  Table.tableBody({ children: [Table.tableRow({ children: [Table.tableCell({ colspan: 2, children: [${renderer === 'stylex' ? "h.span([h.Class(stylex.props(styles.empty).className ?? '')], ['No components match this filter.'])" : "'No components match this filter.'"}]${renderer === 'tailwind' ? ", class: 'h-24 text-center text-muted-foreground'" : ''} }, h)] }, h)] }, h),
] }, h)`;
};
const styleImports = "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ table: { maxWidth: '36rem' }, dense: { minWidth: '44rem' }, right: { display: 'block', textAlign: 'right' }, empty: { display: 'block', paddingBlock: '2rem', color: 'var(--muted-foreground)', textAlign: 'center' } })";
export const tableExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => tableFixtures.map((fixture, index) => ({ title: fixture.title, description: fixture.description, code: staticComponentApplication({ componentName: 'Table', componentSlug: 'table', renderer, exampleName: fixture.title, ...(renderer === 'stylex' ? { componentImports: styleImports } : {}), viewBody: body(index, renderer) }) }));
