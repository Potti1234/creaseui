import { Command } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import { Tooltip as TooltipPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import * as Tooltip from '@/lib/tooltip'
import * as StyleXLink from '@/stylex/link'
import * as TailwindLink from '@/ui/link'

type Model = Readonly<{ tip: Tooltip.Model; clicked: boolean }>
type Message =
  | Readonly<{ _tag: 'GotTooltip'; message: Tooltip.Message }>
  | Readonly<{ _tag: 'ClickedLink' }>

const update = (model: Model, message: Message) => {
  if (message._tag === 'ClickedLink')
    return { model: { ...model, clicked: true } }
  const result = Tooltip.update(model.tip, message.message)
  return {
    model: { ...model, tip: result.model },
    commands: Command.mapMessages(result.commands ?? [], next => ({
      _tag: 'GotTooltip' as const,
      message: next,
    })),
  }
}

const initial = (): Model => ({
  tip: Tooltip.init({ id: 'link-tip' }),
  clicked: false,
})
const link = Scene.selector('[data-slot="link"]')
const anchor = { name: TooltipPrimitive.AnchorTooltip.name }
const anchored = (): Message => ({
  _tag: 'GotTooltip',
  message: Tooltip.Message.CompletedTooltipAnchor(),
})

for (const [name, Link] of [
  ['Tailwind', TailwindLink],
  ['StyleX', StyleXLink],
] as const) {
  describe(`${name} Link with Tooltip`, () => {
    const view =
      (options: Partial<TailwindLink.LinkProps<Message>>) =>
      (model: Model, h: HtmlBuilder<Message>) =>
        Link.link(
          {
            children: [
              model.clicked ? 'Clicked documentation' : 'Documentation',
            ],
            href: '/docs',
            ...options,
            tooltip: {
              model: model.tip,
              toParentMessage: message => ({ _tag: 'GotTooltip', message }),
              content: 'Read the documentation',
            },
          },
          h,
        )

    it('preserves anchor navigation attributes and opens on focus', () => {
      Scene.scene(
        {
          update,
          view: view({
            isExternalLink: true,
            rel: 'author',
            download: 'docs.html',
          }),
        },
        Scene.given(initial()),
        Scene.expect(link).toHaveAttr('href', '/docs'),
        Scene.expect(link).toHaveAttr('target', '_blank'),
        Scene.expect(link).toHaveAttr('rel', 'author noopener noreferrer'),
        Scene.expect(link).toHaveAttr('download', 'docs.html'),
        Scene.expect(Scene.selector('button')).toBeAbsent(),
        Scene.focus(link),
        Scene.expectHandled(),
        Scene.expect(Scene.role('tooltip')).toExist(),
        Scene.expect(link).toHaveAttr('aria-describedby', 'link-tip-panel'),
        Scene.Mount.resolve(anchor, anchored()),
      )
    })

    it('keeps action links as buttons with their own click handler', () => {
      Scene.scene(
        {
          update,
          view: view({ href: undefined, onClick: { _tag: 'ClickedLink' } }),
        },
        Scene.given(initial()),
        Scene.expect(Scene.role('button', { name: 'Documentation' })).toExist(),
        Scene.expect(Scene.selector('button button')).toBeAbsent(),
        Scene.click(link),
        Scene.expectHandled(),
        Scene.expect(
          Scene.role('button', { name: 'Clicked documentation' }),
        ).toExist(),
      )
    })

    it('keeps disabled links out of the tab order without navigation', () => {
      Scene.scene(
        { update, view: view({ isDisabled: true }) },
        Scene.given(initial()),
        Scene.expect(link).toHaveAttr('aria-disabled', 'true'),
        Scene.expect(link).toHaveAttr('tabIndex', '-1'),
        Scene.expect(Scene.selector('[data-slot="link"][href]')).toBeAbsent(),
        Scene.expect(Scene.selector('button')).toBeAbsent(),
      )
    })
  })
}
