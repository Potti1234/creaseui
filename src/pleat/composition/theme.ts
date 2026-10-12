import { Theme } from '@pleat/core'
import { css } from '@pleat/foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  comfortableSemanticTheme,
  compactSemanticTheme,
  expressiveSemanticTheme,
} from './semantic-themes'
import type { PrimitiveChildren } from './types'

export const SEMANTIC_THEME_NAMES = [
  'comfortable',
  'compact',
  'expressive',
] as const
export type SemanticThemeName = (typeof SEMANTIC_THEME_NAMES)[number]

export type ThemeScopeProps = Readonly<{
  children: PrimitiveChildren
  theme?: SemanticThemeName | undefined
}>

export const themeScope = <Message>(
  props: ThemeScopeProps,
  h: HtmlBuilder<Message>,
): Html => {
  const theme = {
    comfortable: comfortableSemanticTheme,
    compact: compactSemanticTheme,
    expressive: expressiveSemanticTheme,
  }[props.theme ?? 'comfortable']
  return h.div(
    [
      ...css(...Theme.bindings(theme)),
      h.DataAttribute('semantic-theme', props.theme ?? 'comfortable'),
    ],
    props.children,
  )
}
