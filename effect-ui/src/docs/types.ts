import { UiSchema, type View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { Schema } from 'effect'

export const DocsMessage = UiSchema.TaggedEnum({
  Filtered: { query: Schema.String },
})
export type DocsMessage = typeof DocsMessage.Type

export type DocsGuide = {
  readonly title: string
  readonly description?: string
  readonly view: (h: Html.H<DocsMessage>) => View.Input<DocsMessage>
}

export type DocsExample = {
  readonly description: string
  readonly view: (h: Html.H<DocsMessage>) => View.Input<DocsMessage>
  readonly source?: string
}
