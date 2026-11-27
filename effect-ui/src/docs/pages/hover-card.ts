import type { Html } from '@effect/ui/html'

import { Button, HoverCard } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './hover-card.css'

type Side = 'left' | 'top' | 'bottom' | 'right'

const card = (
  h: Html.H<DocsMessage>,
  key: string,
  label: string,
  content: Parameters<typeof HoverCard<DocsMessage>>[1]['content'],
  side?: Side,
) =>
  HoverCard(h, {
    key,
    props: side === undefined ? {} : { side },
    ariaLabel: `Preview ${label}`,
    trigger: Button(h, { variant: 'link' }).children(label),
    content,
  })

const basicContent = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class('hover-card-docs-content')
    .children(
      h.div.class('hover-card-docs-heading').children('@creaseui'),
      h.div.children(
        'UI components for Foldkit, built with TypeScript and Effect.',
      ),
      h.div
        .class('hover-card-docs-meta')
        .children('Available in Tailwind and StyleX'),
    )

const sideContent = <Msg>(h: Html.H<Msg>, side: Side) =>
  h.div
    .class('hover-card-docs-content')
    .children(
      h.h4.class('hover-card-docs-heading-medium').children('Hover Card'),
      h.p.children(
        `This hover card appears on the ${side} side of the trigger.`,
      ),
    )

const rtlContent = <Msg>(h: Html.H<Msg>) =>
  h.div
    .class('hover-card-docs-content')
    .attr('dir', 'rtl')
    .children(
      h.div.class('hover-card-docs-heading').children('سماعات لاسلكية'),
      h.div.class('hover-card-docs-muted').children('٩٩.٩٩ $'),
    )

const basic: DocsExampleImplementation['view'] = (h, context) =>
  card(h, `${context.idPrefix}-basic`, 'Hover Here', basicContent(h))

const sides: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('hover-card-docs-row')
    .children(
      (['left', 'top', 'bottom', 'right'] as const).map(side =>
        card(
          h,
          `${context.idPrefix}-${side}`,
          side.charAt(0).toUpperCase() + side.slice(1),
          sideContent(h, side),
          side,
        ),
      ),
    )

const rtl: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('hover-card-docs-row', 'hover-card-docs-rtl').children(
    (
      [
        ['left', 'يسار'],
        ['top', 'أعلى'],
        ['bottom', 'أسفل'],
        ['right', 'يمين'],
      ] as const
    ).map(([side, label]) =>
      card(h, `${context.idPrefix}-${side}`, label, rtlContent(h), side),
    ),
  )

const source = exampleApplicationSource({
  imports: `import { Button, HoverCard } from '@/ui/effect/ui'
import './hover-card.css'`,
  body: `HoverCard(h, {
  key: 'preview',
  props: {},
  trigger: Button(h, { variant: 'link' }).children('Hover Here'),
  content: 'Preview content',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { HoverCard } from '@/ui/effect/ui'

HoverCard(h, { key: 'preview', props: {}, trigger, content })`,
  examples: [
    { title: 'Basic', view: basic, source },
    { title: 'Sides', view: sides, source },
    { title: 'RTL', view: rtl, source },
  ],
})
