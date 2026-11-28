import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { FileInput } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './file-input.css'

const Message = UiSchema.TaggedEnum({
  ChangedFiles: { names: Schema.Array(Schema.String) },
})

type Props = { readonly kind: 'basic' | 'controlled' }
const FileInputDemo = Html.component({
  name: 'DocsFileInputDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({ names: Schema.Array(Schema.String) }),
  message: Message,
}).make({
  init: () => ({ names: [] }),
  update: { ChangedFiles: ($, { names }) => $.evolve({ names }) },
  view: (h, model) => {
    const controlled = h.props.kind === 'controlled'
    return h.div.class('file-input-docs-frame').children(
      FileInput(h, {
        key: h.props.kind,
        id: `${h.props.kind}-file-input`,
        label: controlled ? 'Resume' : 'Upload file',
        ...(controlled
          ? {}
          : { placeholder: 'Drag files here or click to browse' }),
        ...(controlled
          ? { description: 'PDF or Word document, up to 5 MB' }
          : {}),
        files: model.names.map(name => ({ name })),
        props: controlled ? { accept: ['.pdf', '.docx'] } : {},
        ...(controlled ? { maxSize: 5 * 1024 * 1024 } : {}),
        onFiles: ({ accepted }) =>
          Message.ChangedFiles({ names: accepted.map(file => file.name) }),
      }),
    )
  },
})

const view =
  (kind: Props['kind']): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    FileInputDemo(h, { key: `${context.idPrefix}-${kind}`, props: { kind } })

const source = exampleApplicationSource({
  imports: `import { FileInput } from '@/ui/effect/ui'
import './file-input.css'`,
  body: `FileInput(h, {
  key: 'upload',
  id: 'upload',
  label: 'Upload file',
  placeholder: 'Drag files here or click to browse',
  props: {},
  onFiles: ({ accepted }) => ChangedFiles({ files: accepted }),
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { FileInput } from '@/ui/effect/ui'

FileInput(h, { key: 'upload', id: 'upload', label: 'Upload file', props: {} })`,
  examples: [
    { title: 'File Input', view: view('basic'), source },
    { title: 'FileInput — Basic', view: view('controlled'), source },
  ],
})
