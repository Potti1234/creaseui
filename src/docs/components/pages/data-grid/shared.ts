import type { DocsExample } from '@/docs/components/page-definition'
import { foldkitApplication } from '@/docs/components/pages/authored-page'
import type {
  DataGridColumn,
  DataGridConfig,
  FileCellData,
} from '@/lib/data-grid'

export type DocPerson = Readonly<{
  id: string
  name?: string | undefined
  age?: number | undefined
  email?: string | undefined
  website?: string | undefined
  notes?: string | undefined
  salary?: number | undefined
  department?: string | undefined
  status?: string | undefined
  skills?: Array<string> | undefined
  isActive?: boolean | undefined
  startDate?: string | undefined
  attachments?: Array<FileCellData> | undefined
}>

const file = (
  id: string,
  name: string,
  size: number,
  type: string,
): FileCellData => ({
  id,
  name,
  size,
  type,
  url: `https://example.com/files/${name}`,
})

export const docPeople: ReadonlyArray<DocPerson> = [
  {
    id: 'p-1',
    name: 'Ada Lovelace',
    age: 36,
    email: 'ada@example.com',
    website: 'https://ada.dev',
    notes: 'First programmer.',
    salary: 120_000,
    department: 'Engineering',
    status: 'Active',
    skills: ['TypeScript', 'SQL'],
    isActive: true,
    startDate: '2021-03-14',
    attachments: [file('f-1', 'cv.pdf', 84_200, 'application/pdf')],
  },
  {
    id: 'p-2',
    name: 'Grace Hopper',
    age: 85,
    email: 'grace@example.com',
    website: 'https://grace.dev',
    notes: 'Invented the compiler.',
    salary: 240_000,
    department: 'Engineering',
    status: 'In Office',
    skills: ['COBOL', 'JavaScript'],
    isActive: false,
    startDate: '1952-05-01',
    attachments: [
      file('f-2', 'notes.txt', 4_200, 'text/plain'),
      file('f-3', 'photo.png', 820_000, 'image/png'),
    ],
  },
  {
    id: 'p-3',
    name: 'Alan Turing',
    age: 41,
    email: 'alan@example.com',
    department: 'HR',
    status: 'On Leave',
    skills: [],
    isActive: true,
    startDate: '1938-09-23',
    attachments: [],
  },
  {
    id: 'p-4',
    name: 'Edsger Dijkstra',
    age: 72,
    email: 'edsger@example.com',
    website: 'https://dijkstra.dev',
    salary: 180_000,
    department: 'Finance',
    status: 'Remote',
    skills: ['Python'],
    isActive: true,
    startDate: '1962-08-11',
  },
  {
    id: 'p-5',
    name: 'Barbara Liskov',
    age: 84,
    email: 'barbara@example.com',
    notes: 'Liskov substitution principle.',
    salary: 210_000,
    department: 'Engineering',
    status: 'Active',
    skills: ['TypeScript', 'AWS'],
    isActive: true,
    startDate: '1972-01-30',
    attachments: [file('f-4', 'paper.pdf', 512_000, 'application/pdf')],
  },
  {
    id: 'p-6',
    name: 'Margaret Hamilton',
    age: 87,
    email: 'margaret@example.com',
    department: 'Sales',
    status: 'Active',
    skills: ['React'],
    isActive: false,
    startDate: '1965-07-20',
  },
  {
    id: 'p-7',
    name: 'Donald Knuth',
    age: 86,
    email: 'don@example.com',
    website: 'https://knuth.dev',
    salary: 195_000,
    department: 'Marketing',
    status: 'Remote',
    skills: ['Git', 'Docker'],
    isActive: true,
    startDate: '1968-11-04',
    attachments: [file('f-5', 'taocp.pdf', 1_400_000, 'application/pdf')],
  },
  {
    id: 'p-8',
    name: 'Radia Perlman',
    age: 72,
    email: 'radia@example.com',
    department: 'Engineering',
    status: 'In Office',
    skills: ['Node.js', 'TypeScript'],
    isActive: true,
    startDate: '1980-02-17',
  },
]

const docDepartments = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
] as const
const docStatuses = ['Active', 'On Leave', 'Remote', 'In Office'] as const
const docSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'SQL',
  'AWS',
  'Docker',
  'Git',
  'COBOL',
] as const

export const docDataGridColumns: ReadonlyArray<DataGridColumn<DocPerson>> = [
  {
    id: 'name',
    header: 'Name',
    iconName: 'text',
    width: 160,
    variant: 'text',
    get: row => row.name ?? '',
    set: (row, v) => ({ ...row, name: v }),
  },
  {
    id: 'age',
    header: 'Age',
    iconName: 'hash',
    width: 80,
    variant: 'number',
    numberMin: 18,
    numberMax: 100,
    numberStep: 1,
    get: row => (row.age === undefined ? '' : String(row.age)),
    set: (row, v) => ({ ...row, age: Number(v) || undefined }),
  },
  {
    id: 'email',
    header: 'Email',
    iconName: 'mail',
    width: 220,
    variant: 'text',
    get: row => row.email ?? '',
    set: (row, v) => ({ ...row, email: v }),
  },
  {
    id: 'website',
    header: 'Website',
    iconName: 'globe',
    width: 200,
    variant: 'url',
    get: row => row.website ?? '',
    set: (row, v) => ({ ...row, website: v }),
  },
  {
    id: 'notes',
    header: 'Notes',
    iconName: 'file-text',
    width: 320,
    variant: 'long-text',
    get: row => row.notes ?? '',
    set: (row, v) => ({ ...row, notes: v }),
  },
  {
    id: 'salary',
    header: 'Salary',
    iconName: 'hash',
    width: 120,
    variant: 'number',
    numberMin: 0,
    numberStep: 1000,
    get: row => (row.salary === undefined ? '' : String(row.salary)),
    set: (row, v) => ({ ...row, salary: Number(v) || undefined }),
  },
  {
    id: 'department',
    header: 'Department',
    iconName: 'building-2',
    width: 160,
    variant: 'select',
    options: docDepartments,
    get: row => row.department ?? '',
    set: (row, v) => ({ ...row, department: v }),
  },
  {
    id: 'status',
    header: 'Status',
    iconName: 'list-checks',
    width: 140,
    variant: 'select',
    options: docStatuses,
    get: row => row.status ?? '',
    set: (row, v) => ({ ...row, status: v }),
  },
  {
    id: 'skills',
    header: 'Skills',
    iconName: 'tags',
    width: 200,
    variant: 'multi-select',
    options: docSkills,
    get: row => (row.skills ?? []).join(', '),
    getOptions: row => row.skills ?? [],
    set: (row, v) => ({
      ...row,
      skills: v === '' ? [] : v.split(',').map(s => s.trim()),
    }),
  },
  {
    id: 'isActive',
    header: 'Active',
    iconName: 'check-square',
    width: 90,
    variant: 'checkbox',
    get: row => (row.isActive === true ? 'true' : 'false'),
    getBoolean: row => row.isActive === true,
    set: (row, v) => ({ ...row, isActive: v === 'true' }),
  },
  {
    id: 'startDate',
    header: 'Start Date',
    iconName: 'calendar',
    width: 140,
    variant: 'date',
    get: row => row.startDate ?? '',
    set: (row, v) => ({ ...row, startDate: v }),
  },
  {
    id: 'attachments',
    header: 'Attachments',
    iconName: 'paperclip',
    width: 180,
    variant: 'file',
    maxFiles: 5,
    get: row => (row.attachments ?? []).map(f => f.name).join(', '),
    getFiles: row => row.attachments ?? [],
    setFiles: (row, files) => ({ ...row, attachments: [...files] }),
    set: (row, v) => (v === '' ? { ...row, attachments: [] } : row),
  },
]

export const docDataGridConfig: DataGridConfig<DocPerson> = {
  columns: docDataGridColumns,
  rowKey: row => row.id,
  createRow: key => ({ id: key, skills: [], attachments: [] }),
}

export const dataGridFixtures = [
  {
    title: 'Editable grid',
    description:
      'Each column variant owns a focused editor — number input, long-text popover, select, multi-select, date calendar, file list, checkbox, URL — while the model owns focus, selection, sorting, filtering, and virtualization.',
    rtl: false,
  },
  {
    title: 'RTL',
    description:
      'Under dir="rtl" the grid mirrors toolbar anchors, panels, and the floating selection pill.',
    rtl: true,
  },
] as const

const source = (
  fixture: (typeof dataGridFixtures)[number],
  renderer: 'tailwind' | 'stylex',
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '')
  const stylex = renderer === 'stylex'
  return foldkitApplication({
    title: `Data Grid — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as DataGrid from '@/${stylex ? 'stylex' : 'ui'}/data-grid'
import { docDataGridConfig, docPeople, type DocPerson } from './data'`,
    model: `export const Model = S.Struct({ grid: DataGrid.Model })
export type Model = typeof Model.Type`,
    messages: `export const GotDataGridMessage = taggedStruct('GotDataGridMessage${tag}', { message: DataGrid.Message })
export const Message = S.Union([GotDataGridMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: { grid: DataGrid.init(docDataGridConfig, docPeople) },
})`,
    update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotDataGridMessage${tag}':
      return {
        model: { ...model, grid: DataGrid.update(model.grid, message.message, docDataGridConfig) },
      }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Data Grid — ${fixture.title}',
  body: h.main([], [
    h.div(${fixture.rtl ? "[h.Dir('rtl'), h.Class('h-dvh flex flex-col')]" : "[h.Class('h-dvh flex flex-col')]"}, [
      DataGrid.dataGrid({ model: model.grid, config: docDataGridConfig }, h),
    ]),
  ]),
})`,
  })
}

export const dataGridExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  dataGridFixtures.map(fixture => ({
    title: fixture.title,
    description: fixture.description,
    code: source(fixture, renderer),
    previewClass: 'justify-stretch',
  }))
