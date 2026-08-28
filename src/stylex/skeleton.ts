import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { interactionTokens } from './interaction-tokens.stylex.const'

const styles = stylex.create({
  root: {
    animationDuration: interactionTokens.motionLoopSlow, animationIterationCount: 'infinite', animationName: stylex.keyframes({ '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } }),
    backgroundColor: foundationTokens.muted, borderRadius: foundationTokens.radiusMd,
  },
})

export type SkeletonProps = Readonly<{ layoutStyle?: ComponentLayoutStyle }>
export const skeleton = <Msg>(props: SkeletonProps = {}, h: HtmlBuilder<Msg>): Html =>
  h.div([h.DataAttribute('slot', 'skeleton'), h.Class(className(styles.root, props.layoutStyle))], [])


