import type { Component } from '@effect/ui'
import type { Field } from '@effect/ui-kit'

export { Field as FieldBehavior, fieldValidationProps } from '@effect/ui-kit'
export type { FieldProps } from '@effect/ui-kit'
export type FieldParts = Component.Headless.Parts<typeof Field>
