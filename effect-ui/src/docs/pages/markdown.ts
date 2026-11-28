import type { View } from '@effect/ui'

import { Markdown } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const showcaseContent = `## Formatting

**Bold text** and *italic text* with ~~strikethrough~~.

- First item
- Second item
- Third item

> A quoted passage with an accent border.

[Documentation](https://creaseui.com/docs/components/button)`
const richContent = `# Rich Content

## Inline Formatting

Mix **bold**, *italic*, and \`inline code\` in one paragraph. Links like [CreaseUI](https://creaseui.com/docs/components/button) render inline.

## Code Block

\`\`\`typescript
export function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Task List

- [x] Parse headings
- [x] Parse lists
- [ ] Parse math`
const tableContent = `| CreaseUI feature | Tailwind | StyleX | Notes |
| :-- | :-: | :-: | --: |
| Component examples | Yes | Yes | Shared fixtures |
| Runtime theme | Yes | Yes | Semantic tokens |
| Copyable source | Yes | Yes | TypeScript |`
const compactContent = `## Summary

Here's the install command:

\`\`\`bash
npx creaseui add button
\`\`\`

- Built on Foldkit UI
- Ships StyleX variants
- Typed component APIs

> Everything else is optional.`
const citedContent = `Tokyo is the capital of Japan [src-1]. It blends the ultramodern and the traditional [src-2]. Popular districts include Shibuya, Shinjuku, and Ginza [src-3].

The city hosted the Olympics in 2021 [src-4]. The Shibuya crossing is one of the busiest intersections in the world [src-5].`
const citedSources = {
  'src-1': {
    title: 'Tokyo — Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Tokyo',
  },
  'src-2': {
    title: 'Japan Travel — Tokyo',
    url: 'https://www.japan.travel/en/destinations/kanto/tokyo/',
  },
  'src-3': {
    title: 'Tokyo Neighbourhood Guide',
    url: 'https://www.timeout.com/tokyo',
  },
  'src-4': {
    title: 'Tokyo 2020 Olympics',
    url: 'https://olympics.com/en/olympic-games/tokyo-2020',
  },
  'src-5': {
    title: 'Shibuya Crossing',
    url: 'https://en.wikipedia.org/wiki/Shibuya_Crossing',
  },
} as const

const markdown =
  (
    source: string,
    options: {
      density?: 'default' | 'compact'
      headingLevelStart?: 1 | 2 | 3 | 4 | 5 | 6
      sources?: typeof citedSources
      contentWidth?: number
      contentAlign?: 'center'
    } = {},
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    Markdown(h, {
      id: `${context.idPrefix}-markdown`,
      source,
      ...(options.density === undefined ? {} : { density: options.density }),
      ...(options.headingLevelStart === undefined
        ? {}
        : { headingLevelStart: options.headingLevelStart }),
      ...(options.sources === undefined ? {} : { sources: options.sources }),
      ...(options.contentWidth === undefined
        ? {}
        : { contentWidth: options.contentWidth }),
      ...(options.contentAlign === undefined
        ? {}
        : { contentAlign: options.contentAlign }),
    }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { Markdown } from '@/ui/effect/ui'`,
  body: `Markdown(h, {
  id: 'content',
  source: CONTENT,
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Markdown } from '@/ui/effect/ui'\n\nMarkdown(h, { id, source })`,
  examples: [
    {
      title: 'Markdown',
      view: markdown(showcaseContent, {
        contentWidth: 400,
        contentAlign: 'center',
      }),
      source,
    },
    { title: 'Markdown — Rich Content', view: markdown(richContent), source },
    { title: 'Markdown — Data Table', view: markdown(tableContent), source },
    {
      title: 'Markdown — Compact AI Response',
      view: markdown(compactContent, {
        density: 'compact',
        headingLevelStart: 3,
        contentWidth: 450,
      }),
      source,
    },
    {
      title: 'Markdown — Cited Content',
      view: markdown(citedContent, {
        density: 'compact',
        headingLevelStart: 3,
        sources: citedSources,
      }),
      source,
    },
  ],
})
