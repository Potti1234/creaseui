import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Attachment, AttachmentGroup, Icon, Spinner } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type ItemSpec = Readonly<{
  name: string
  meta?: string
  icon?: string
  spinner?: boolean
  src?: string
  alt?: string
  state?: 'idle' | 'uploading' | 'processing' | 'error' | 'done'
  size?: 'default' | 'sm' | 'xs'
  orientation?: 'vertical'
  actions: readonly Readonly<{ icon: string; label: string }>[]
  triggerLabel?: string
}>
type RowSpec = Readonly<{
  name: string
  grouped?: boolean
  itemWidth?: string
  groupFullWidth?: boolean
  items: readonly ItemSpec[]
}>
type Fixture = Readonly<{
  kind: string
  title: string
  description?: string
  heroOnly?: boolean
  frame: 'gap-2' | 'gap-3' | 'plain'
  rows: readonly RowSpec[]
}>
const fixtures: readonly Fixture[] = [
  {
    kind: 'demo',
    title: 'Demo',
    description:
      'A file list combining a vertical image strip with standalone uploads.',
    heroOnly: true,
    frame: 'gap-3',
    rows: [
      {
        name: 'images',
        grouped: true,
        items: [
          {
            name: 'workspace.png',
            meta: 'PNG · 820 KB',
            src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80',
            alt: 'Workspace',
            orientation: 'vertical',
            actions: [],
          },
          {
            name: 'desk-reference.jpg',
            meta: 'JPG · 1.1 MB',
            src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80',
            alt: 'Desk',
            orientation: 'vertical',
            actions: [],
          },
          {
            name: 'office-reference.jpg',
            meta: 'JPG · 940 KB',
            src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80',
            alt: 'Office',
            orientation: 'vertical',
            actions: [],
          },
        ],
      },
      {
        name: 'files',
        items: [
          {
            name: 'sales-dashboard.pdf',
            meta: 'Uploading · 64%',
            spinner: true,
            state: 'uploading',
            actions: [
              {
                icon: 'x',
                label: 'Cancel upload',
              },
            ],
          },
          {
            name: 'message-renderer.ts',
            meta: 'TypeScript · 12 KB',
            icon: 'file-code',
            actions: [
              {
                icon: 'x',
                label: 'Remove message-renderer.ts',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'image',
    title: 'Image',
    description:
      'Media attachments can render an image preview and still expose remove actions and a fill trigger.',
    frame: 'plain',
    rows: [
      {
        name: 'images',
        grouped: true,
        groupFullWidth: true,
        items: [
          {
            name: 'workspace.png',
            meta: 'PNG · 820 KB',
            src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80',
            alt: 'Workspace',
            orientation: 'vertical',
            actions: [
              {
                icon: 'x',
                label: 'Remove workspace.png',
              },
            ],
            triggerLabel: 'Open workspace.png',
          },
          {
            name: 'desk-reference.jpg',
            meta: 'JPG · 1.1 MB',
            src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80',
            alt: 'Desk',
            orientation: 'vertical',
            actions: [
              {
                icon: 'x',
                label: 'Remove desk-reference.jpg',
              },
            ],
            triggerLabel: 'Open desk-reference.jpg',
          },
          {
            name: 'office-reference.jpg',
            meta: 'JPG · 940 KB',
            src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80',
            alt: 'Office',
            orientation: 'vertical',
            actions: [
              {
                icon: 'x',
                label: 'Remove office-reference.jpg',
              },
            ],
            triggerLabel: 'Open office-reference.jpg',
          },
        ],
      },
    ],
  },
  {
    kind: 'states',
    title: 'States',
    description:
      'Render upload lifecycle as domain data: idle, uploading, processing, error, and done.',
    frame: 'gap-2',
    rows: [
      {
        name: 'items',
        items: [
          {
            name: 'selected-file.pdf',
            meta: 'Ready to upload',
            icon: 'clock',
            state: 'idle',
            actions: [
              {
                icon: 'x',
                label: 'Remove selected-file.pdf',
              },
            ],
          },
          {
            name: 'design-system.zip',
            meta: 'Uploading · 64%',
            spinner: true,
            state: 'uploading',
            actions: [
              {
                icon: 'x',
                label: 'Cancel upload',
              },
            ],
          },
          {
            name: 'market-research.pdf',
            meta: 'Processing document',
            icon: 'file-text',
            state: 'processing',
            actions: [
              {
                icon: 'x',
                label: 'Remove market-research.pdf',
              },
            ],
          },
          {
            name: 'financial-model.xlsx',
            meta: 'Upload failed. Try again.',
            icon: 'file-exclamation-point',
            state: 'error',
            actions: [
              {
                icon: 'refresh-cw',
                label: 'Retry upload',
              },
              {
                icon: 'x',
                label: 'Remove financial-model.xlsx',
              },
            ],
          },
          {
            name: 'uploaded-report.pdf',
            meta: 'Uploaded · 1.8 MB',
            icon: 'check',
            state: 'done',
            actions: [
              {
                icon: 'x',
                label: 'Remove uploaded-report.pdf',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'sizes',
    title: 'Sizes',
    description: "Use size 'sm' or 'xs' to make the attachment smaller.",
    frame: 'gap-3',
    rows: [
      {
        name: 'items',
        items: [
          {
            name: 'Default attachment',
            meta: 'PDF · 2.4 MB',
            icon: 'file-text',
            size: 'default',
            actions: [],
          },
          {
            name: 'Small attachment',
            meta: 'PDF · 2.4 MB',
            icon: 'file-text',
            size: 'sm',
            actions: [],
          },
          {
            name: 'Extra small attachment',
            icon: 'file-text',
            size: 'xs',
            actions: [],
          },
        ],
      },
    ],
  },
  {
    kind: 'group',
    title: 'Group',
    description:
      'AttachmentGroup lays out attachments in a horizontally scrollable snap row.',
    frame: 'plain',
    rows: [
      {
        name: 'items',
        grouped: true,
        groupFullWidth: true,
        itemWidth: 'w-64',
        items: [
          {
            name: 'briefing-notes.pdf',
            meta: 'PDF · 1.4 MB',
            icon: 'file-text',
            actions: [
              {
                icon: 'x',
                label: 'Remove briefing-notes.pdf',
              },
            ],
          },
          {
            name: 'workspace.png',
            meta: 'PNG · 820 KB',
            src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80',
            actions: [
              {
                icon: 'x',
                label: 'Remove workspace.png',
              },
            ],
          },
          {
            name: 'customers.csv',
            meta: 'CSV · 18 KB',
            icon: 'table',
            actions: [
              {
                icon: 'x',
                label: 'Remove customers.csv',
              },
            ],
          },
          {
            name: 'renderer.ts',
            meta: 'TSX · 12 KB',
            icon: 'file-code',
            actions: [
              {
                icon: 'x',
                label: 'Remove renderer.ts',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'trigger',
    title: 'Trigger',
    description:
      'The attachment trigger fills the card and opens the preview dialog, while the actions stay independently clickable above it.',
    frame: 'plain',
    rows: [
      {
        name: 'items',
        items: [
          {
            name: 'research-summary.pdf',
            meta: 'Open preview dialog',
            icon: 'file-search',
            actions: [
              {
                icon: 'copy',
                label: 'Copy link',
              },
              {
                icon: 'x',
                label: 'Remove research-summary.pdf',
              },
            ],
            triggerLabel: 'Preview research-summary.pdf',
          },
        ],
      },
    ],
  },
]

const Message = UiSchema.TaggedEnum({
  ClickedRemove: { name: Schema.String },
  ClickedRetry: { name: Schema.String },
  ClickedCopy: { name: Schema.String },
  ClickedPreview: { name: Schema.String },
  ClickedClosePreview: {},
})

const AttachmentDemo = Html.component({
  name: 'DocsAttachmentDemo',
  props: Schema.Struct({
    idPrefix: Schema.String,
    fixtureIndex: Schema.Number,
  }),
  model: Schema.Struct({
    removed: Schema.Array(Schema.String),
    previewFor: Schema.NullOr(Schema.String),
  }),
  message: Message,
}).make({
  init: () => ({ removed: [], previewFor: null }),
  update: {
    ClickedRemove: ($, { name }) =>
      $.evolve({ removed: [...$.model.removed, name] }),
    ClickedRetry: ($, { name }) =>
      $.evolve({ removed: $.model.removed.filter(entry => entry !== name) }),
    ClickedCopy: $ => $.model,
    ClickedPreview: ($, { name }) => $.evolve({ previewFor: name }),
    ClickedClosePreview: $ => $.evolve({ previewFor: null }),
  },
  view: (h, model) => {
    const fixture = (fixtures[h.props.fixtureIndex] ?? fixtures[0]) as Fixture
    const itemView = (row: RowSpec, item: ItemSpec) =>
      Attachment(h, {
        ...(item.state === undefined ? {} : { state: item.state }),
        ...(item.size === undefined ? {} : { size: item.size }),
        ...(item.orientation === undefined
          ? {}
          : { orientation: item.orientation }),
        ...(row.grouped === true
          ? row.itemWidth === undefined
            ? {}
            : { className: row.itemWidth }
          : { className: 'w-full' }),
        children: attachment => [
          attachment.media({
            variant: item.src === undefined ? 'icon' : 'image',
            children: [
              item.spinner === true
                ? Spinner(h, { size: 'md', isDecorative: true })
                : item.src !== undefined
                  ? h.img.attrs({ src: item.src, alt: item.alt ?? item.name })
                  : Icon(h, { name: (item.icon ?? 'file') as never }),
            ],
          }),
          attachment.content({
            children: [
              attachment.title({ children: [item.name] }),
              item.meta === undefined
                ? undefined
                : attachment.description({ children: [item.meta] }),
            ],
          }),
          item.actions.length === 0
            ? undefined
            : attachment.actions({
                children: item.actions.map(action =>
                  attachment.action({
                    onClick:
                      action.icon === 'refresh-cw'
                        ? Message.ClickedRetry({ name: item.name })
                        : action.icon === 'copy'
                          ? Message.ClickedCopy({ name: item.name })
                          : Message.ClickedRemove({ name: item.name }),
                    label: action.label,
                    children: [Icon(h, { name: action.icon as never })],
                  }),
                ),
              }),
          item.triggerLabel === undefined
            ? undefined
            : attachment.trigger({
                onClick: Message.ClickedPreview({ name: item.name }),
                label: item.triggerLabel,
                children: [],
              }),
        ],
      }) as unknown as View.Content<typeof Message.Type>
    const rows = fixture.rows.flatMap(row => {
      const visible = row.items.filter(
        item => !model.removed.includes(item.name),
      )
      return row.grouped === true
        ? [
            AttachmentGroup(h, {
              ...(row.groupFullWidth === true ? { className: 'w-full' } : {}),
              children: visible.map(item => itemView(row, item)),
            }) as unknown as View.Content<typeof Message.Type>,
          ]
        : visible.map(item => itemView(row, item))
    })
    const frame =
      fixture.frame === 'plain'
        ? 'mx-auto w-full max-w-sm py-12'
        : `mx-auto flex w-full max-w-sm flex-col ${fixture.frame} py-12`
    return h.div.class(frame).children(
      rows,
      model.previewFor === null
        ? undefined
        : h.div.children(
            h.div
              .class('fixed inset-0 z-50 bg-black/50')
              .on('click', Message.ClickedClosePreview()),
            h.div
              .class(
                'fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4',
              )
              .children(
                h.div
                  .class(
                    'relative grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg',
                  )
                  .attrs({ role: 'dialog', 'aria-modal': 'true' })
                  .children(
                    h.h2
                      .class('pr-14 text-lg leading-none font-semibold')
                      .children(model.previewFor),
                    h.p
                      .class('text-sm text-muted-foreground')
                      .children(
                        'The attachment trigger fills the card and opens the dialog, while the actions stay independently clickable above it.',
                      ),
                    h.button
                      .class(
                        'absolute top-4 right-4 cursor-pointer rounded-sm border-0 bg-transparent text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2',
                      )
                      .attrs({ type: 'button' })
                      .on('click', Message.ClickedClosePreview())
                      .children('Close'),
                  ),
              ),
          ),
    )
  },
})

const example =
  (fixtureIndex: number): DocsExampleImplementation['view'] =>
  (h, context) =>
    AttachmentDemo(h, {
      key: `${context.idPrefix}-attachment-demo`,
      props: { idPrefix: context.idPrefix, fixtureIndex },
    }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { Attachment } from '@/ui/effect/ui'`,
  body: `Attachment(h, {
  state: 'done',
  children: attachment => [
    attachment.media({ children: [icon] }),
    attachment.content({ children: [title, description] }),
  ],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Attachment } from '@/ui/effect/ui'\n\nAttachment(h, { state, children })`,
  examples: fixtures.map((fixture, index) => ({
    title: fixture.title,
    view: example(index),
    source,
  })),
})
