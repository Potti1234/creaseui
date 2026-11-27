import { UiSchema } from '@effect/ui'
import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { Schema } from 'effect'

export const DocsMessage = UiSchema.TaggedEnum({
  Filtered: { query: Schema.String },
  SearchFiltered: { query: Schema.String },
  ToggledTheme: {},
  OpenedSearch: {},
  ClosedSearch: {},
})
export type DocsMessage = typeof DocsMessage.Type

export type DocsGuide = {
  readonly title: string
  readonly description?: string
  readonly view: (h: Html.H<DocsMessage>) => View.Input<DocsMessage>
}

export type DocsExampleRenderContext = {
  readonly exampleIndex: number
  readonly instance: 'hero' | 'section'
  readonly idPrefix: string
}

export type DocsExampleImplementation = {
  /** Must match the Foldkit reference title exactly; the docs shell validates
     ordering and completeness against page-metadata.ts. */
  readonly title: string
  readonly view: (
    h: Html.H<DocsMessage>,
    context: DocsExampleRenderContext,
  ) => View.Input<DocsMessage>
  /** Runnable Effect UI application source displayed with the example. */
  readonly source: string
}

export type ComponentDocsModule = {
  readonly examples: ReadonlyArray<DocsExampleImplementation>
  readonly usage?: string
  readonly composition?: string
  readonly apiEntries?: ReadonlyArray<{
    readonly name: string
    readonly kind: string
    readonly signature: string
  }>
}

export const defineComponentDocs = (
  docs: ComponentDocsModule,
): ComponentDocsModule => docs

export type DocsExample = {
  readonly description: string
  readonly view: (h: Html.H<DocsMessage>) => View.Input<DocsMessage>
  readonly source?: string
}
