import { Code, Heading, Text } from '#components'
import { defineComponentDocs } from '../types'
import { exampleApplicationSource } from './source'
import './code.css'

const rows = [
  ['Variable', 'const model = { count: 0 }'],
  ['Terminal', 'npm run dev'],
  ['CSS', 'border-radius: 8px'],
  ['File path', 'src/ui/button.ts'],
  ['Shortcut', '⌘ + K'],
] as const

const codeSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Code, Heading, Text } from '@/ui/effect/ui'
import './code.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Code } from '@/ui/effect/ui'

Code(h, { children: ['npm install'] })`,
  examples: [
    {
      title: 'Code',
      view: h =>
        h.div.class('code-docs-column').children(
          Text(h, {
            type: 'body',
            display: 'block',
            children: [
              'Install dependencies with ',
              Code(h, { children: ['npm install'] }),
              ' and start building.',
            ],
          }),
          Text(h, {
            type: 'body',
            display: 'block',
            children: [
              'Use the variant: ',
              Code(h, { children: ['v3.0.0'] }),
              ' release for the latest features.',
            ],
          }),
        ),
      source: codeSource(`Text(h, {
  type: 'body',
  display: 'block',
  children: ['Install dependencies with ', Code(h, { children: ['npm install'] })],
})`),
    },
    {
      title: 'Code — Inline',
      view: h =>
        Text(h, {
          type: 'body',
          display: 'block',
          children: [
            'Foldkit programs use ',
            Code(h, { children: ['Model'] }),
            ', ',
            Code(h, { children: ['update'] }),
            ', and ',
            Code(h, { children: ['view'] }),
            ' to model state, handle messages, and render HTML.',
          ],
        }),
      source: codeSource(`Text(h, {
  type: 'body',
  display: 'block',
  children: ['Foldkit programs use ', Code(h, { children: ['Model'] })],
})`),
    },
    {
      title: 'Code — Text Sizes',
      view: h =>
        h.div.class('code-docs-column').children(
          Heading(h, {
            level: 3,
            children: ['Configure ', Code(h, { children: ['config.json'] })],
          }),
          Text(h, {
            type: 'body',
            display: 'block',
            children: [
              'Run ',
              Code(h, { children: ['pnpm install'] }),
              ' to set up the workspace.',
            ],
          }),
          Text(h, {
            type: 'supporting',
            display: 'block',
            children: [
              'Supports ',
              Code(h, { children: ['ES2022'] }),
              ' and newer toolchains.',
            ],
          }),
          Text(h, {
            type: 'label',
            display: 'block',
            children: ['Shortcut: ', Code(h, { children: ['⌘ + K'] })],
          }),
        ),
      source: codeSource(`h.div.class('code-docs-column').children(
  Heading(h, { level: 3, children: ['Configure ', Code(h, { children: ['config.json'] })] }),
  Text(h, { type: 'body', children: ['Run ', Code(h, { children: ['pnpm install'] })] }),
)`),
    },
    {
      title: 'Code — Content Types',
      view: h =>
        h.div.class('code-docs-column').children(
          rows.map(([label, content]) =>
            h.div.class('code-docs-item').children(
              Text(h, {
                type: 'supporting',
                color: 'secondary',
                children: [label],
              }),
              Code(h, { children: [content] }),
            ),
          ),
        ),
      source: codeSource(`h.div.class('code-docs-column').children(
  h.div.class('code-docs-item').children(
    Text(h, { type: 'supporting', color: 'secondary', children: ['Terminal'] }),
    Code(h, { children: ['npm run dev'] }),
  ),
)`),
    },
  ],
})
