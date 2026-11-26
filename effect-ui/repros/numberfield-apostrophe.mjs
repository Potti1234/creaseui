import { Html } from '@effect/ui/html'
import { HtmlScene } from '@effect/ui/html/testing'
import { Locator } from '@effect/ui/testing'
import { NumberField } from '@effect/ui-kit'
import { Effect } from 'effect'

const input = Locator.tag('input')
const value = process.argv.includes('--curly') ? '1’234.25' : "1'234.25"

await Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      const scene = yield* HtmlScene.make(
        NumberField,
        { locale: 'de-CH', value: null },
        { elements: Html, view: (field, h) => field.input(h.input) },
      )
      const mount = scene.get(input).owned.find(layer => layer.mount)?.mount
      if (mount) scene.expectMount(mount)
      scene.type(input, value).emitted({
        _tag: 'Updated',
        value: 1234.25,
        reason: 'input-change',
      })
    }),
  ),
)

console.log(`NumberField accepted ${value} as 1234.25`)
