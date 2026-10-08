import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Schema as S } from 'effect'
import { FileDrop } from '@foldkit/ui'
import * as File from 'foldkit/file'

import * as FileInput from '@/lib/file-input'
import { RoutedDocsPreviewMessage } from '@/docs/components/pages/authored-page'
import { fileInputTailwindPreviewProgram } from '@/docs/components/pages/file-input/tailwind'
import { inputTailwindPreviewProgram } from '@/docs/components/pages/input/tailwind'

const PreviewModel = S.Struct({
  _docsPage: S.Literal('file-input'),
  input: FileInput.Model,
  files: S.Array(File.File),
})

test('native preview messages retain selected file identity, metadata and bytes', async () => {
  const file = new globalThis.File(['resume contents'], 'resume.pdf', {
    type: 'application/pdf',
    lastModified: 1234,
  })
  const message = RoutedDocsPreviewMessage.RoutedNativeDocsPreviewMessage({
    message: {
      _tag: 'GotFileInputMessage',
      message: FileInput.Message.GotFileDropMessage({
        message: FileDrop.Message.DroppedFiles({ files: [file] }),
      }),
    },
  })
  const decoded = S.decodeUnknownSync(RoutedDocsPreviewMessage)(message)
  const next = fileInputTailwindPreviewProgram.update(
    fileInputTailwindPreviewProgram.init(1),
    decoded,
  )
  const model = S.decodeUnknownSync(PreviewModel)(next.model)
  assert.equal(model.files[0], file)
  assert.equal(model.files[0]?.lastModified, 1234)
  assert.equal(await model.files[0]?.text(), 'resume contents')

  const cleared = fileInputTailwindPreviewProgram.update(
    model,
    RoutedDocsPreviewMessage.RoutedDocsPreviewMessage({
      messageJson: JSON.stringify({
        _tag: 'GotFileInputMessage',
        message: FileInput.Message.ClearRequested(),
      }),
    }),
  )
  assert.deepEqual(S.decodeUnknownSync(PreviewModel)(cleared.model).files, [])
})

test('Input file example preserves selected files and clears the FileInput value', async () => {
  const file = new globalThis.File(['picture contents'], 'picture.png', {
    type: 'image/png',
    lastModified: 1234,
  })
  const next = inputTailwindPreviewProgram.update(
    inputTailwindPreviewProgram.init(5),
    RoutedDocsPreviewMessage.RoutedNativeDocsPreviewMessage({
      message: {
        _tag: 'GotFileInputMessage',
        message: FileInput.Message.GotFileDropMessage({
          message: FileDrop.Message.DroppedFiles({ files: [file] }),
        }),
      },
    }),
  )
  const Files = S.Struct({ files: S.Array(File.File) })
  const selected = S.decodeUnknownSync(Files)(next.model).files
  assert.equal(selected[0], file)
  assert.equal(await selected[0]?.text(), 'picture contents')

  const cleared = inputTailwindPreviewProgram.update(
    next.model,
    RoutedDocsPreviewMessage.RoutedNativeDocsPreviewMessage({
      message: {
        _tag: 'GotFileInputMessage',
        message: FileInput.Message.ClearRequested(),
      },
    }),
  )
  assert.deepEqual(S.decodeUnknownSync(Files)(cleared.model).files, [])
})
