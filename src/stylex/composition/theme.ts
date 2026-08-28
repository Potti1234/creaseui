import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  comfortableSemanticTheme,
  compactSemanticTheme,
  expressiveSemanticTheme,
} from './semantic-themes'
import type { PrimitiveChildren } from './types'

export const SEMANTIC_THEME_NAMES = ['comfortable', 'compact', 'expressive'] as const
export type SemanticThemeName = typeof SEMANTIC_THEME_NAMES[number]

export type ThemeScopeProps = Readonly<{
  children: PrimitiveChildren
  theme?: SemanticThemeName | undefined
}>

export const themeScope = <Message>(props: ThemeScopeProps, h: HtmlBuilder<Message>): Html => {
  const theme = {
    comfortable: comfortableSemanticTheme,
    compact: compactSemanticTheme,
    expressive: expressiveSemanticTheme,
  }[props.theme ?? 'comfortable']
  return h.div([h.Class(stylex.props(theme).className ?? ''), h.DataAttribute('semantic-theme', props.theme ?? 'comfortable')], props.children)
}

