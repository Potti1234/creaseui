import type { DocsExample } from '@/docs/components/page-definition'
import { foldkitApplication } from '@/docs/components/pages/authored-page'

export type CodeBlockExampleKind =
  | 'showcase'
  | 'bashCommand'
  | 'highlighted'
  | 'jsonConfig'
  | 'scrollable'
  | 'terminal'

export type CodeBlockSpec = Readonly<{
  id: string
  code: string
  language?: 'bash' | 'json' | 'typescript'
  title?: string
  hasLineNumbers?: boolean
  hasCopyButton?: boolean
  highlightLines?: ReadonlyArray<number>
  maxHeight?: number
}>

export type CodeBlockFixture = Readonly<{
  title: string
  description?: string
  kind: CodeBlockExampleKind
  blocks: ReadonlyArray<CodeBlockSpec>
}>

/* Example set ported from Meta Astryx
   packages/cli/assets/templates/blocks/components/CodeBlock/*.tsx — same
   demos, same code content. The Terminal demo drops astryx's SyntaxTheme
   wrapper (theme objects are astryx-only); the bash content is kept. */
export const SHOWCASE_CODE = `import {useState, useEffect} from 'react';

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(\`/api/users/\${id}\`)
      .then(res => res.json())
      .then(setUser);
  }, [id]);

  return user;
}`

export const HIGHLIGHT_CODE = `interface User {
  id: string;
  name: string;
}

export function useUser(id: string) {
  const [user, setUser] = useState<User>();
  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);
  return user;
}`

export const JSON_CODE = `{
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

export const SCROLLABLE_CODE = Array.from(
  { length: 50 },
  (_, i) => `const line${String(i + 1)} = ${String(i + 1)};`,
).join('\n')

export const TERMINAL_CODE = `$ npx creaseui init
✓ CreaseUI theme and core components installed
$ npx creaseui add code-block`

export const codeBlockFixtures: Readonly<
  [CodeBlockFixture, ...Array<CodeBlockFixture>]
> = [
  {
    title: 'CodeBlock',
    description:
      'A TypeScript code block with line numbers, file name header, and copy button.',
    kind: 'showcase',
    blocks: [
      {
        id: 'showcase',
        code: SHOWCASE_CODE,
        language: 'typescript',
        title: 'useUser.ts',
        hasLineNumbers: true,
        hasCopyButton: true,
      },
    ],
  },
  {
    title: 'Code — Snippet',
    description: 'Short bash commands with copy buttons.',
    kind: 'bashCommand',
    blocks: [
      {
        id: 'npm',
        code: 'npx creaseui add code-block',
        language: 'bash',
        hasCopyButton: true,
      },
      {
        id: 'yarn',
        code: 'npx creaseui init',
        language: 'bash',
        hasCopyButton: true,
      },
    ],
  },
  {
    title: 'Code — Highlighted',
    description:
      'A TypeScript code block with specific lines highlighted for emphasis.',
    kind: 'highlighted',
    blocks: [
      {
        id: 'highlighted',
        code: HIGHLIGHT_CODE,
        language: 'typescript',
        title: 'useUser.ts',
        hasLineNumbers: true,
        highlightLines: [8, 9, 10],
      },
    ],
  },
  {
    title: 'Code — Config',
    description: 'A JSON configuration file rendered as a code block.',
    kind: 'jsonConfig',
    blocks: [
      {
        id: 'config',
        code: JSON_CODE,
        language: 'json',
        title: 'package.json',
        hasLineNumbers: true,
      },
    ],
  },
  {
    title: 'Code — Scrollable',
    description:
      'A long TypeScript snippet constrained to a max height with scrolling.',
    kind: 'scrollable',
    blocks: [
      {
        id: 'scrollable',
        code: SCROLLABLE_CODE,
        language: 'typescript',
        title: 'many-lines.ts',
        hasLineNumbers: true,
        maxHeight: 280,
      },
    ],
  },
  {
    title: 'Code — Terminal',
    description: 'Terminal output rendered as a code block.',
    kind: 'terminal',
    blocks: [
      {
        id: 'terminal',
        code: TERMINAL_CODE,
        language: 'bash',
        hasCopyButton: true,
      },
    ],
  },
]

const blockCall = (block: CodeBlockSpec, isStyleX: boolean): string => {
  const props: string[] = [
    `model: model.codeBlocks['${block.id}'] ?? CodeBlock.init()`,
    `toParentMessage: message => GotCodeBlockMessage({ id: '${block.id}', message })`,
    `code: CODE_${block.id === 'scrollable' ? 'SCROLLABLE' : block.id.toUpperCase()}`,
  ]
  if (block.language !== undefined) {
    props.push(`language: '${block.language}'`)
  }
  if (block.title !== undefined) {
    props.push(`title: '${block.title}'`)
  }
  if (block.hasLineNumbers === true) {
    props.push('hasLineNumbers: true')
  }
  if (block.hasCopyButton === true) {
    props.push('hasCopyButton: true')
  }
  if (block.highlightLines !== undefined) {
    props.push(`highlightLines: [${block.highlightLines.join(', ')}]`)
  }
  if (block.maxHeight !== undefined) {
    props.push(`maxHeight: ${String(block.maxHeight)}`)
  }
  if (isStyleX) {
    props.push('layoutStyle: styles.block')
  } else {
    props.push("class: 'w-full'")
  }
  return `CodeBlock.codeBlock({\n      ${props.join(',\n      ')}\n    }, h)`
}

const codeConsts = (fixture: CodeBlockFixture): string =>
  fixture.blocks
    .map(block => {
      const name = `CODE_${block.id === 'scrollable' ? 'SCROLLABLE' : block.id.toUpperCase()}`
      if (block.id === 'scrollable') {
        return `const ${name} = Array.from(\n  { length: 50 },\n  (_, i) => \`const line\${i + 1} = \${i + 1};\`,\n).join('\\n')`
      }
      return `const ${name} = ${JSON.stringify(block.code)}`
    })
    .join('\n\n')

const emitBody = (fixture: CodeBlockFixture, isStyleX: boolean): string => {
  const calls = fixture.blocks
    .map(block => blockCall(block, isStyleX))
    .join(',\n    ')
  if (fixture.blocks.length === 1) {
    return `    ${calls}`
  }
  const wrap = isStyleX
    ? 'className(styles.column)'
    : "'flex flex-col gap-4 w-full max-w-100'"
  return `    h.div(
      [h.Class(${wrap})],
      [
    ${calls}
      ],
    )`
}

const emitApplication = (
  fixture: CodeBlockFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  const isStyleX = renderer === 'stylex'
  const base = isStyleX ? 'stylex' : 'ui'
  const stylesBlock = isStyleX
    ? `\n\nconst styles = stylex.create({${
        fixture.blocks.length > 1
          ? "\n  column: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', width: '100%' },"
          : ''
      }\n  block: { width: '100%' },\n})`
    : ''
  return foldkitApplication({
    title: `CodeBlock — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'
${isStyleX ? "import * as stylex from '@stylexjs/stylex'\nimport { className } from '@/stylex/style'\n" : ''}import * as CodeBlock from '@/${base}/code-block'${stylesBlock}

${codeConsts(fixture)}`,
    model: `export const Model = S.Struct({
  codeBlocks: S.Record(S.String, CodeBlock.Model),
})
export type Model = typeof Model.Type`,
    messages: `export const GotCodeBlockMessage = taggedStruct('GotCodeBlockMessage', {
  id: S.String,
  message: CodeBlock.Message,
})
export const Message = S.Union([GotCodeBlockMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    codeBlocks: {
${fixture.blocks
  .map(block => `      '${block.id}': CodeBlock.init(),`)
  .join('\n')}
    },
  },
})`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotCodeBlockMessage': {
      const current = model.codeBlocks[message.id]
      if (current === undefined) {
        return { model }
      }
      const codeBlockOp__ = CodeBlock.update(current, message.message)
      const commands = codeBlockOp__.commands ?? []
      return {
        model: {
          ...model,
          codeBlocks: { ...model.codeBlocks, [message.id]: codeBlockOp__.model },
        },
        commands: Command.mapMessages(commands, next =>
          GotCodeBlockMessage({ id: message.id, message: next })),
      }
    }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'CodeBlock — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
${emitBody(fixture, isStyleX)}
  ]),
})`,
  })
}

export const codeBlockExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  codeBlockFixtures.map(fixture => ({
    title: fixture.title,
    ...(fixture.description === undefined
      ? {}
      : { description: fixture.description }),
    code: emitApplication(fixture, renderer),
  }))
