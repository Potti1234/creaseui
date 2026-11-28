import type { Html } from '@effect/ui/html'

import { CodeBlock } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const SHOWCASE_CODE = `import { Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Model = S.Struct({ count: S.Number })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ClickedIncrement: {},
  ClickedReset: {},
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { count: 0 },
})

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedIncrement: () => ({
      model: { ...model, count: model.count + 1 },
    }),
    ClickedReset: () => ({ model: { ...model, count: 0 } }),
  })`

const JSON_CODE = `{
  "name": "creaseui-example",
  "version": "0.1.0",
  "dependencies": {
    "@foldkit/ui": "0.164.0",
    "foldkit": "0.164.0",
    "effect": "4.0.0-rc.117"
  },
  "scripts": {
    "build": "vite build",
    "test": "vitest"
  }
}`

const SCROLLABLE_CODE = `import { Runtime } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'

\${SHOWCASE_CODE}

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'CreaseUI counter',
  body: h.main([], [
    h.h1([], ['Counter']),
    h.p([h.AriaLive('polite')], ['Count: ' + String(model.count)]),
    h.button([h.OnClick(Message.ClickedIncrement())], ['Increment']),
    h.button([h.OnClick(Message.ClickedReset())], ['Reset']),
  ]),
})

Runtime.run(
  Runtime.makeApplication({
    Model,
    init,
    update,
    view,
    container: document.getElementById('root'),
  }),
)`

const TERMINAL_CODE = `$ npx creaseui init
✓ CreaseUI theme and core components installed
$ npx creaseui add code-block`

const HIGHLIGHT_CODE = SHOWCASE_CODE

type Block = Readonly<{
  id: string
  code: string
  language?: string
  title?: string
  lineNumbers?: boolean
  copyButton?: boolean
  highlightLines?: ReadonlyArray<number>
  maxHeight?: number
}>

const render =
  (blocks: ReadonlyArray<Block>): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div.class('grid w-full max-w-3xl gap-4').children(
      blocks.map(block =>
        CodeBlock(h, {
          key: `${context.idPrefix}-${block.id}`,
          id: `${context.idPrefix}-${block.id}`,
          props: { code: block.code },
          ...(block.language === undefined ? {} : { language: block.language }),
          ...(block.title === undefined ? {} : { title: block.title }),
          ...(block.lineNumbers === true ? { lineNumbers: true } : {}),
          ...(block.copyButton === undefined
            ? {}
            : { copyButton: block.copyButton }),
          ...(block.highlightLines === undefined
            ? {}
            : { highlightLines: block.highlightLines }),
          ...(block.maxHeight === undefined
            ? {}
            : { maxHeight: block.maxHeight }),
        }),
      ),
    )

const source = exampleApplicationSource({
  imports: `import { CodeBlock } from '@/ui/effect/ui'`,
  body: `CodeBlock(h, {
  key: 'example',
  id: 'example',
  code: 'npx creaseui add code-block',
  language: 'bash',
})`,
})

const examples: ReadonlyArray<readonly [string, ReadonlyArray<Block>]> = [
  [
    'CodeBlock',
    [
      {
        id: 'showcase',
        code: SHOWCASE_CODE,
        language: 'typescript',
        title: 'counter.ts',
        lineNumbers: true,
        copyButton: true,
      },
    ],
  ],
  [
    'Code — Snippet',
    [
      {
        id: 'npm',
        code: 'npx creaseui add code-block',
        language: 'bash',
        copyButton: true,
      },
      {
        id: 'yarn',
        code: 'npx creaseui init',
        language: 'bash',
        copyButton: true,
      },
    ],
  ],
  [
    'Code — Highlighted',
    [
      {
        id: 'highlighted',
        code: HIGHLIGHT_CODE,
        language: 'typescript',
        title: 'counter.ts',
        lineNumbers: true,
        highlightLines: [20, 21, 22, 23],
      },
    ],
  ],
  [
    'Code — Config',
    [
      {
        id: 'config',
        code: JSON_CODE,
        language: 'json',
        title: 'package.json',
        lineNumbers: true,
      },
    ],
  ],
  [
    'Code — Scrollable',
    [
      {
        id: 'scrollable',
        code: SCROLLABLE_CODE,
        language: 'typescript',
        title: 'main.ts',
        lineNumbers: true,
        maxHeight: 280,
      },
    ],
  ],
  [
    'Code — Terminal',
    [
      {
        id: 'terminal',
        code: TERMINAL_CODE,
        language: 'bash',
        copyButton: true,
      },
    ],
  ],
]

export const componentDocs = defineComponentDocs({
  usage: `import { CodeBlock } from '@/ui/effect/ui'

CodeBlock(h, { key: 'example', id: 'example', code: 'const answer = 42' })`,
  examples: examples.map(([title, blocks]) => ({
    title,
    view: render(blocks),
    source,
  })),
})
