import { Html } from '@effect/ui/html'

import { DataGrid, Icon } from '#components'
import type { FileCellData } from '../../behaviors/data-grid'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Person = Readonly<{
  id: string
  name?: string
  age?: number
  email?: string
  website?: string
  notes?: string
  salary?: number
  department?: string
  status?: string
  skills?: readonly string[]
  isActive?: boolean
  startDate?: string
  attachments?: readonly FileCellData[]
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
const people: readonly Person[] = [
  {
    id: 'p-1',
    name: 'Ada Lovelace',
    age: 36,
    email: 'ada@example.com',
    website: 'https://ada.dev',
    notes: 'First programmer.',
    salary: 120000,
    department: 'Engineering',
    status: 'Active',
    skills: ['TypeScript', 'SQL'],
    isActive: true,
    startDate: '2021-03-14',
    attachments: [file('f-1', 'cv.pdf', 84200, 'application/pdf')],
  },
  {
    id: 'p-2',
    name: 'Grace Hopper',
    age: 85,
    email: 'grace@example.com',
    website: 'https://grace.dev',
    notes: 'Invented the compiler.',
    salary: 240000,
    department: 'Engineering',
    status: 'In Office',
    skills: ['COBOL', 'JavaScript'],
    isActive: false,
    startDate: '1952-05-01',
    attachments: [
      file('f-2', 'notes.txt', 4200, 'text/plain'),
      file('f-3', 'photo.png', 820000, 'image/png'),
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
    salary: 180000,
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
    salary: 210000,
    department: 'Engineering',
    status: 'Active',
    skills: ['TypeScript', 'AWS'],
    isActive: true,
    startDate: '1972-01-30',
    attachments: [file('f-4', 'paper.pdf', 512000, 'application/pdf')],
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
    salary: 195000,
    department: 'Marketing',
    status: 'Remote',
    skills: ['Git', 'Docker'],
    isActive: true,
    startDate: '1968-11-04',
    attachments: [file('f-5', 'taocp.pdf', 1400000, 'application/pdf')],
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
const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
const statuses = ['Active', 'On Leave', 'Remote', 'In Office']
const skills = [
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
]

const grid = (h: Html.H<DocsMessage>, key: string, rtl: boolean) => {
  const icon = (name: any) => Icon(h, { name, size: 'sm' })
  return DataGrid(h, {
    key,
    id: key,
    label: 'People data grid',
    rows: people,
    rowKey: row => row.id,
    createRow: key => ({ id: key, skills: [], attachments: [] }),
    height: 500,
    direction: rtl ? 'rtl' : 'ltr',
    columns: [
      {
        id: 'name',
        header: 'Name',
        icon: icon('text'),
        width: 85,
        variant: 'text',
        get: row => row.name ?? '',
        set: (row, v) => ({ ...row, name: v }),
      },
      {
        id: 'age',
        header: 'Age',
        icon: icon('hash'),
        width: 50,
        variant: 'number',
        numberMin: 18,
        numberMax: 100,
        numberStep: 1,
        get: row => (row.age === undefined ? '' : String(row.age)),
        set: (row, v) => ({ ...row, age: Number(v) || undefined }) as Person,
      },
      {
        id: 'email',
        header: 'Email',
        icon: icon('mail'),
        width: 150,
        variant: 'text',
        get: row => row.email ?? '',
        set: (row, v) => ({ ...row, email: v }),
      },
      {
        id: 'notes',
        header: 'Notes',
        icon: icon('file-text'),
        width: 145,
        variant: 'long-text',
        get: row => row.notes ?? '',
        set: (row, v) => ({ ...row, notes: v }),
      },
      {
        id: 'salary',
        header: 'Salary',
        icon: icon('hash'),
        width: 80,
        variant: 'number',
        numberMin: 0,
        numberStep: 1000,
        get: row => (row.salary === undefined ? '' : String(row.salary)),
        set: (row, v) => ({ ...row, salary: Number(v) || undefined }) as Person,
      },
      {
        id: 'department',
        header: 'Department',
        icon: icon('building-2'),
        width: 95,
        variant: 'select',
        options: departments,
        get: row => row.department ?? '',
        set: (row, v) => ({ ...row, department: v }),
      },
      {
        id: 'status',
        header: 'Status',
        icon: icon('list-checks'),
        width: 85,
        variant: 'select',
        options: statuses,
        get: row => row.status ?? '',
        set: (row, v) => ({ ...row, status: v }),
      },
      {
        id: 'skills',
        header: 'Skills',
        icon: icon('tags'),
        width: 110,
        variant: 'multi-select',
        options: skills,
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
        icon: icon('square-check'),
        width: 50,
        variant: 'checkbox',
        get: row => (row.isActive === true ? 'true' : 'false'),
        getBoolean: row => row.isActive === true,
        set: (row, v) => ({ ...row, isActive: v === 'true' }),
      },
      {
        id: 'startDate',
        header: 'Start Date',
        icon: icon('calendar'),
        width: 95,
        variant: 'date',
        get: row => row.startDate ?? '',
        set: (row, v) => ({ ...row, startDate: v }),
      },
      {
        id: 'attachments',
        header: 'Attachments',
        icon: icon('paperclip'),
        width: 115,
        variant: 'file',
        maxFiles: 5,
        get: row => (row.attachments ?? []).map(f => f.name).join(', '),
        getFiles: row => row.attachments ?? [],
        setFiles: (row, files) => ({ ...row, attachments: [...files] }),
        set: (row, v) => (v === '' ? { ...row, attachments: [] } : row),
      },
    ],
  })
}
const view =
  (rtl: boolean): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div
      .class('flex h-140 flex-col')
      .attrs({ dir: rtl ? 'rtl' : undefined })
      .children(
        grid(
          h,
          `${context.idPrefix}-${rtl ? 'rtl' : 'editable'}`,
          rtl,
        ) as never,
      )

const source = exampleApplicationSource({
  imports: `import { DataGrid } from '@/ui/effect/ui'`,
  body: `DataGrid(h, {
  id: 'people-grid',
  label: 'People data grid',
  rows: people,
  rowKey: row => row.id,
  height: 500,
  columns,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { DataGrid } from '@/ui/effect/ui'\n\nDataGrid(h, { id, rows, columns, rowKey })`,
  examples: [
    { title: 'Editable grid', view: view(false), source },
    { title: 'RTL', view: view(true), source },
  ],
})
