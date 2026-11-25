import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import { describe, it, vi } from 'vitest'

import * as Banner from '@/lib/banner'
import { banner as pleatBanner } from '@/pleat/banner'
import { banner as stylexBanner } from '@/stylex/banner'
import { banner as tailwindBanner } from '@/ui/banner'

vi.mock('@/lib/disclosure', async importOriginal =>
  (await import('./disclosure-mock')).mockDisclosureMount(importOriginal),
)

// Happy DOM cannot create Pleat's cascade layers. These scenes exercise behavior.
vi.mock('@/pleat/style', () => ({ className: () => 'pleat-test' }))

// This mount emits no messages. Scene requires a result for every mount.
vi.mock('@/lib/banner', async importOriginal => ({
  ...(await importOriginal<typeof Banner>()),
  focusOriginMount: <Msg>(h: HtmlBuilder<Msg>) =>
    h.DataAttribute('observe-focus-origin', ''),
}))

const expand = Scene.role('button', { name: 'Expand' })
const collapse = Scene.role('button', { name: 'Collapse' })
const panel = Scene.selector('[data-slot="banner-content"]')
const root = Scene.selector('[data-slot="banner"]')

for (const [name, banner] of [
  ['Tailwind', tailwindBanner],
  ['StyleX', stylexBanner],
  ['Pleat', pleatBanner],
] as const) {
  describe(`${name} Banner disclosure`, () => {
    const render =
      (isCollapsible: boolean, children: ReadonlyArray<string>) =>
      (model: Banner.Model, h: HtmlBuilder<Banner.Message>) =>
        h.div(
          [],
          [
            banner(
              {
                id: 'notice',
                model,
                toParentMessage: message => message,
                status: 'info',
                title: 'Notice',
                isDismissable: true,
                isCollapsible,
                children,
              },
              h,
            ),
          ],
        )

    it('mounts the linked panel on toggle and removes it on close', () => {
      Scene.scene(
        { update: Banner.update, view: render(true, ['Details']) },
        Scene.given(Banner.init()),
        Scene.expect(expand).toHaveAttr('aria-expanded', 'false'),
        Scene.expect(expand).not.toHaveAttr('aria-controls'),
        Scene.expect(panel).not.toExist(),
        Scene.keydown(expand, 'Enter'),
        Scene.expect(collapse).toHaveAttr('aria-expanded', 'true'),
        Scene.expect(collapse).toHaveAttr('aria-controls', 'notice-panel'),
        Scene.expect(panel).toHaveId('notice-panel'),
        Scene.click(collapse),
        Scene.expect(panel).not.toExist(),
        Scene.click(Scene.role('button', { name: 'Dismiss Notice' })),
        Scene.expect(root).not.toExist(),
      )
    })

    it('renders pinned content without a disclosure toggle', () => {
      Scene.scene(
        { update: Banner.update, view: render(false, ['Details']) },
        Scene.given(Banner.init()),
        Scene.expect(panel).toExist(),
        Scene.expect(expand).not.toExist(),
        Scene.expect(collapse).not.toExist(),
      )
    })

    it('omits the disclosure when there is no content', () => {
      Scene.scene(
        { update: Banner.update, view: render(true, []) },
        Scene.given(Banner.init({ defaultIsOpen: true })),
        Scene.expect(panel).not.toExist(),
        Scene.expect(collapse).not.toExist(),
      )
    })
  })
}
