import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as CodeBlock from '@/lib/code-block'
import * as Markdown from '@/lib/markdown'

describe('Markdown block parser', () => {
  it('parses headings with depth', () => {
    const blocks = Markdown.parseMarkdownBlocks('# One\n\n## Two')
    assert.deepEqual(blocks, [
      { type: 'heading', depth: 1, children: [{ type: 'text', value: 'One' }] },
      { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Two' }] },
    ])
  })

  it('parses fenced code with language', () => {
    const blocks = Markdown.parseMarkdownBlocks('```ts\nconst x = 1;\n```')
    assert.deepEqual(blocks, [
      { type: 'code', lang: 'ts', value: 'const x = 1;' },
    ])
  })

  it('parses task lists with checked state', () => {
    const blocks = Markdown.parseMarkdownBlocks('- [x] Done\n- [ ] Todo')
    const list = blocks[0]
    assert.equal(list?.type, 'list')
    if (list?.type === 'list') {
      assert.equal(list.children[0]?.checked, true)
      assert.equal(list.children[1]?.checked, false)
    }
  })

  it('parses ordered lists with start offset', () => {
    const blocks = Markdown.parseMarkdownBlocks('3. Three\n4. Four')
    const list = blocks[0]
    assert.equal(list?.type, 'list')
    if (list?.type === 'list') {
      assert.equal(list.ordered, true)
      assert.equal(list.start, 3)
      assert.equal(list.children.length, 2)
    }
  })

  it('parses GFM table alignment', () => {
    const blocks = Markdown.parseMarkdownBlocks(
      '| a | b | c |\n| :-- | :-: | --: |\n| 1 | 2 | 3 |',
    )
    const table = blocks[0]
    assert.equal(table?.type, 'table')
    if (table?.type === 'table') {
      assert.deepEqual(table.align, ['left', 'center', 'right'])
      assert.equal(table.children.length, 2)
    }
  })

  it('parses thematic breaks', () => {
    const blocks = Markdown.parseMarkdownBlocks('above\n\n---\n\nbelow')
    assert.ok(blocks.some(block => block.type === 'thematicBreak'))
  })

  it('nests content inside blockquotes', () => {
    const blocks = Markdown.parseMarkdownBlocks('> quoted **bold**')
    const quote = blocks[0]
    assert.equal(quote?.type, 'blockquote')
    if (quote?.type === 'blockquote') {
      const paragraph = quote.children[0]
      assert.equal(paragraph?.type, 'paragraph')
    }
  })
})

describe('Markdown inline parser', () => {
  it('parses strong, emphasis, delete, and inline code', () => {
    const inline = Markdown.parseMarkdownInline('a **b** *c* ~~d~~ `e`')
    const types = inline.map(node => node.type)
    assert.deepEqual(types, [
      'text',
      'strong',
      'text',
      'emphasis',
      'text',
      'delete',
      'text',
      'inlineCode',
    ])
    assert.equal(inline[0]?.type, 'text')
  })

  it('parses links with sanitized urls', () => {
    const inline = Markdown.parseMarkdownInline('[docs](https://a.b/c)')
    assert.deepEqual(inline[0], {
      type: 'link',
      url: 'https://a.b/c',
      children: [{ type: 'text', value: 'docs' }],
    })
  })

  it('renders citations only when the source id is known', () => {
    const withSources = Markdown.parseMarkdownInline('a [src-1]', new Set(['src-1']))
    assert.equal(withSources[1]?.type, 'citation')
    if (withSources[1]?.type === 'citation') {
      assert.equal(withSources[1].sourceId, 'src-1')
    }
    const withoutSources = Markdown.parseMarkdownInline('a [src-9]', new Set(['src-1']))
    assert.ok(withoutSources.every(node => node.type === 'text'))
  })
})

describe('sanitizeMarkdownUrl', () => {
  it('accepts https, mailto, and fragment urls', () => {
    assert.equal(sanitize('https://a.b'), 'https://a.b')
    assert.equal(sanitize('mailto:x@y.z'), 'mailto:x@y.z')
    assert.equal(sanitize('#anchor'), '#anchor')
    assert.equal(sanitize('/path'), '/path')
  })

  it('rejects javascript and data urls', () => {
    assert.equal(sanitize('javascript:alert(1)'), null)
    assert.equal(sanitize('data:text/html,x'), null)
  })

  function sanitize(url: string): string | null {
    return Markdown.sanitizeMarkdownUrl(url)
  }
})

describe('Markdown submodel', () => {
  it('creates per-block CodeBlock models lazily', () => {
    const model = Markdown.init()
    const child = Markdown.codeBlockModel(model, 2)
    assert.deepEqual(child, CodeBlock.init())
  })

  it('delegates child updates into the keyed record', () => {
    const model = Markdown.init()
    const next = Markdown.update(
      model,
      Markdown.Message.GotMarkdownCodeBlockMessage({
        blockIndex: 1,
        message: CodeBlock.Message.ToggledCollapse(),
      }),
    )
    assert.equal(next.model.codeBlocks['1']?.isCollapsed, true)
    assert.equal(next.model.codeBlocks['0'], undefined)
  })

  it('maps child commands back through the parent message', () => {
    const model = Markdown.init()
    const next = Markdown.update(
      model,
      Markdown.Message.GotMarkdownCodeBlockMessage({
        blockIndex: 0,
        message: CodeBlock.Message.ClickedCopyCode({ code: 'a' }),
      }),
    )
    assert.equal(next.commands?.length, 1)
  })
})
