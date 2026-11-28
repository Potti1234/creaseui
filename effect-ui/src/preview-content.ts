import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import dialogImage from '../../brand/illustrations/spot-dialog.png?url'
import listImage from '../../brand/illustrations/spot-list.png?url'
import {
  Badge,
  Button,
  CodeBlock,
  Lightbox,
  Markdown,
  OverflowList,
} from '#components'

export const ContentExamples = Html.component({
  name: 'EffectUiContentExamples',
  message: Schema.Never,
  model: Schema.Null,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.section.class('example').children(
      h.h2.children('Code and media'),
      CodeBlock(h, {
        id: 'preview-code',
        title: 'Project settings',
        language: 'typescript',
        props: {
          code: 'const project = {\n  name: "Sample",\n  status: "ready",\n}',
          defaultCollapsed: true,
        },
        lineNumbers: true,
        highlightLines: [3],
        collapsible: true,
        collapsibleThreshold: 2,
      }),
      Markdown(h, {
        id: 'preview-markdown',
        headingLevelStart: 3,
        source:
          '## Review checklist\n\n- [x] Verify the example\n- [ ] Review the docs\n\nSee [checks] for the full list.',
        sources: { checks: { title: 'Checks', url: '#preview-code' } },
      }),
      OverflowList<never>(h, {
        props: { maxVisibleItems: 3 },
        items: [
          'Accessibility',
          'Layout',
          'Inputs',
          'Navigation',
          'Feedback',
        ].map(label => ({
          key: label,
          content: Badge<never>(h, { variant: 'outline', children: [label] }),
        })),
        overflowRenderer: items => h.span.children(`+${items.length} more`),
      }),
      Lightbox(h, {
        key: 'preview-lightbox',
        trigger: Button(h, { variant: 'outline' }).children(
          'Open illustration gallery',
        ),
        hasZoom: true,
        media: [
          { src: dialogImage, alt: 'Dialog illustration', caption: 'Dialog' },
          { src: listImage, alt: 'List illustration', caption: 'List' },
        ],
      }),
    ),
})
