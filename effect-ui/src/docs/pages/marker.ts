import type { Html } from '@effect/ui/html'
import { Icon, Marker, Spinner } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './marker.css'

const marker = (
  h: Html.H<DocsMessage>,
  text: string,
  o: Readonly<{
    variant?: 'default' | 'separator' | 'border'
    icon?: 'git-branch' | 'search' | 'file-text'
    status?: boolean
    shimmer?: boolean
  }> = {},
) =>
  Marker(h, {
    children: [text],
    ...(o.variant === undefined ? {} : { variant: o.variant }),
    ...(o.status === true ? { purpose: 'status' as const } : {}),
    ...(o.shimmer === true ? { shimmer: true } : {}),
    ...(o.icon === undefined
      ? {}
      : { icon: Icon(h, { name: o.icon, size: 'sm' }) }),
  })
const statusMarker = (
  h: Html.H<DocsMessage>,
  text: string,
  variant?: 'separator',
) =>
  Marker(h, {
    children: [text],
    purpose: 'status',
    ...(variant === undefined ? {} : { variant }),
    icon: Spinner(h, { size: 'sm', label: 'Loading' }),
  })
const stack =
  (
    className: string,
    items: ReadonlyArray<
      (h: Html.H<DocsMessage>) => ReturnType<typeof Marker<DocsMessage>>
    >,
  ): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class('marker-docs-stack', className)
      .children(items.map(item => item(h)))
const source = exampleApplicationSource({
  imports: `import { Marker } from '@/ui/effect/ui'`,
  body: `Marker(h, { children: ['Switched to a new branch'] })`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Marker } from '@/ui/effect/ui'\n\nMarker(h, { children: ['Timeline note'] })`,
  examples: [
    {
      title: 'Basic',
      view: stack('', [
        h => marker(h, 'Switched to a new branch', { icon: 'git-branch' }),
        h => statusMarker(h, 'Thinking...'),
        h => marker(h, 'Conversation compacted', { variant: 'separator' }),
        h => marker(h, 'Explored 4 files', { icon: 'search' }),
      ]),
      source,
    },
    {
      title: 'Variants',
      view: stack('', [
        h => marker(h, 'A default marker for inline notes.'),
        h => marker(h, 'A separator marker', { variant: 'separator' }),
        h =>
          marker(h, 'A border marker for row boundaries.', {
            variant: 'border',
          }),
      ]),
      source,
    },
    {
      title: 'Status',
      view: stack('', [
        h => statusMarker(h, 'Compacting conversation'),
        h => statusMarker(h, 'Running tests', 'separator'),
      ]),
      source,
    },
    {
      title: 'Shimmer',
      view: stack('', [
        h => marker(h, 'Thinking...', { status: true, shimmer: true }),
        h =>
          marker(h, 'Reading 4 files', {
            variant: 'separator',
            status: true,
            shimmer: true,
          }),
      ]),
      source,
    },
    {
      title: 'Separator',
      view: stack('', [
        h => marker(h, 'Today', { variant: 'separator' }),
        h => marker(h, 'Worked for 42s', { variant: 'separator' }),
        h => marker(h, 'Conversation compacted', { variant: 'separator' }),
      ]),
      source,
    },
    {
      title: 'Border',
      view: stack('marker-docs-border', [
        h =>
          marker(h, 'Switched to release-candidate', {
            variant: 'border',
            icon: 'git-branch',
          }),
        h =>
          marker(h, 'Reviewed 8 related files', {
            variant: 'border',
            icon: 'search',
          }),
        h =>
          marker(h, 'Opened implementation notes', {
            variant: 'border',
            icon: 'file-text',
          }),
      ]),
      source,
    },
    {
      title: 'With Icon',
      view: stack('marker-docs-icon', [
        h => marker(h, 'Switched to a new branch', { icon: 'git-branch' }),
        h => marker(h, 'Explored 4 files', { icon: 'search' }),
        h => marker(h, 'Opened implementation notes', { icon: 'file-text' }),
      ]),
      source,
    },
    {
      title: 'Links and Buttons',
      view: h =>
        h.div.class('marker-docs-stack').children(
          Marker(h, { children: ['View commit'], href: '#commit' }),
          Marker(h, {
            children: ['Revert commit'],
            onClick: undefined as never,
          }),
        ),
      source,
    },
  ],
})
