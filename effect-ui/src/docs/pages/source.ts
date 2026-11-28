export const exampleApplicationSource = ({
  imports,
  body,
}: Readonly<{
  imports: string
  body: string
}>): string => `import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'
${imports}

const App = Html.component({
  name: 'DocsExample',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.main.class('mx-auto flex min-h-screen w-full max-w-xl items-center p-8').children(
      ${body},
    ),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing root')
Layer.launch(BrowserHost.mount(App, {}, root)).pipe(Effect.runFork)`
