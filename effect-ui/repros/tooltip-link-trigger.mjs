import assert from 'node:assert/strict'

import { Html } from '@effect/ui/html'
import { HtmlScene } from '@effect/ui/html/testing'
import { Locator } from '@effect/ui/testing'
import { Tooltip } from '@effect/ui-kit'
import { Effect } from 'effect'

const button = process.argv.includes('--button')
const trigger = Locator.tag(button ? 'button' : 'a')
const popup = Locator.attr('data-repro', 'tooltip')

await Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      const scene = yield* HtmlScene.make(
        Tooltip,
        { open: false, describesTrigger: true },
        {
          elements: Html,
          view: (tooltip, h) =>
            h.div(
              tooltip
                .trigger(button ? h.button : h.a.attr('href', '#retention'))
                .children('Retention policy'),
              tooltip
                .positioner(h.div)
                .children(
                  tooltip
                    .popup(h.div.attr('data-repro', 'tooltip'))
                    .children('30 days'),
                ),
            ),
        },
      )
      if (!button) assert.equal(scene.get(trigger).attrs.href, '#retention')
      assert.equal(
        scene.get(trigger).attrs['aria-describedby'],
        scene.get(popup).attrs.id,
      )
      scene
        .fire(trigger, 'focus', { focusVisible: true })
        .emitted({ _tag: 'RequestedOpen' })
    }),
  ),
)

console.log(
  `Tooltip opened on keyboard focus of the ${button ? 'button' : 'link'}`,
)
